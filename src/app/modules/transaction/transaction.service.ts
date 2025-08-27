import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { AppError } from "../../helpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { User } from "../user/user.model";
import { IWallet, Status } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import {
  CASH_IN_OUT_FEE_RATE,
  COMMISSION_RATE,
  transactionSearchableFields,
} from "./transaction.constants";
import { TransactionStatus, TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";

const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
};

const validateWallet = async (
  walletId: string,
  requiredStatus = Status.ACTIVE
) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status !== requiredStatus) {
    throw new AppError(httpStatus.FORBIDDEN, `Wallet is ${wallet.status}`);
  }

  return wallet;
};

const checkDailyLimit = async (walletId: string, amount: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTransactions = await Transaction.aggregate([
    {
      $match: {
        $or: [{ senderWallet: new mongoose.Types.ObjectId(walletId) }],
        status: TransactionStatus.COMPLETED,
        createdAt: { $gte: today },
        type: {
          $in: [
            TransactionType.TRANSFER,
            TransactionType.CASH_OUT,
            TransactionType.WITHDRAWAL,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const todayTotal = todayTransactions[0]?.totalAmount || 0;
  const wallet = await Wallet.findById(walletId);

  if (todayTotal + amount > wallet!.dailyLimit) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Daily limit exceeded. Available: ${wallet!.dailyLimit - todayTotal}`
    );
  }
};

const checkMonthlyLimit = async (walletId: string, amount: number) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyTransactions = await Transaction.aggregate([
    {
      $match: {
        $or: [{ senderWallet: new mongoose.Types.ObjectId(walletId) }],
        status: TransactionStatus.COMPLETED,
        createdAt: { $gte: startOfMonth },
        type: {
          $in: [
            TransactionType.TRANSFER,
            TransactionType.CASH_OUT,
            TransactionType.WITHDRAWAL,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const monthlyTotal = monthlyTransactions[0]?.totalAmount || 0;
  const wallet = await Wallet.findById(walletId);

  if (monthlyTotal + amount > wallet!.monthlyLimit) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Monthly limit exceeded. Available: ${
        wallet!.monthlyLimit - monthlyTotal
      }`
    );
  }
};

const calculateFee = (amount: number, type: TransactionType): number => {
  switch (type) {
    case TransactionType.CASH_IN:
    case TransactionType.CASH_OUT:
      return amount * CASH_IN_OUT_FEE_RATE; // 2% fee for cash-in and cash-out
    default:
      return 0; // No fees for other transactions
  }
};

const calculateCommission = (fee: number): number => {
  return fee * COMMISSION_RATE; // 50% of fee as commission
};

const transfer = async (
  payload: {
    senderWalletId: string;
    receiverWalletId: string;
    amount: number;
    pin: string;
    reference?: string;
    description?: string;
  },
  decodedToken: JwtPayload
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Validate sender wallet
    const senderWallet = await validateWallet(payload.senderWalletId);

    // Verify PIN
    const bcrypt = require("bcryptjs");
    const isPinValid = await bcrypt.compare(payload.pin, senderWallet.pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid PIN");
    }

    // Find receiver wallet
    const receiverWallet = await validateWallet(payload.receiverWalletId);

    if (!receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
    }

    if (receiverWallet.status !== Status.ACTIVE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Receiver wallet is ${receiverWallet.status}`
      );
    }

    // Check if sender and receiver are different
    if (senderWallet._id.equals(receiverWallet._id)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot transfer to same wallet"
      );
    }

    // No fees for transfers
    const fee = 0;
    const totalAmount = payload.amount;

    // Check balance
    if (senderWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    // Check limits
    await checkDailyLimit(payload.senderWalletId, totalAmount);
    await checkMonthlyLimit(payload.senderWalletId, totalAmount);

    // Get users
    const sender = await User.findOne({ wallet: senderWallet._id }).session(
      session
    );
    const receiver = await User.findOne({ wallet: receiverWallet._id }).session(
      session
    );

    if (!sender || !receiver) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Associated user accounts not found"
      );
    }

    // Create transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      type: TransactionType.TRANSFER,
      sender: sender!._id,
      receiver: receiver!._id,
      senderWallet: senderWallet._id,
      receiverWallet: receiverWallet._id,
      amount: payload.amount,
      fee,
      status: TransactionStatus.PENDING,
      reference: payload.reference,
      description: payload.description,
      senderBalanceBefore: senderWallet.balance,
      receiverBalanceBefore: receiverWallet.balance,
    });

    // Update balances
    senderWallet.balance -= totalAmount;
    senderWallet.totalSent += payload.amount;
    receiverWallet.balance += payload.amount;
    receiverWallet.totalReceived += payload.amount;

    transaction.senderBalanceAfter = senderWallet.balance;
    transaction.receiverBalanceAfter = receiverWallet.balance;
    transaction.status = TransactionStatus.COMPLETED;

    // Save all changes
    await transaction.save({ session });
    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cashIn = async (
  payload: {
    agentWalletId: string;
    customerWalletId: string;
    amount: number;
    pin: string;
    reference?: string;
  },
  decodedToken: JwtPayload
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Validate agent wallet
    const agentWallet = await validateWallet(payload.agentWalletId);

    // Verify PIN
    const bcrypt = require("bcryptjs");
    const isPinValid = await bcrypt.compare(payload.pin, agentWallet.pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid PIN");
    }

    // // Find customer wallet
    // const customerWallet = await Wallet.findOne({
    //   walletNumber: payload.customerWalletNumber,
    // }).session(session);

    const customerWallet = await validateWallet(payload.customerWalletId);

    if (!customerWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Customer wallet not found");
    }

    if (customerWallet.status !== Status.ACTIVE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Customer wallet is ${customerWallet.status}`
      );
    }

    // Calculate fee and commission for cash-in
    const fee = calculateFee(payload.amount, TransactionType.CASH_IN);
    const commission = calculateCommission(fee);
    const totalAmountNeeded = payload.amount + fee;

    // Check agent balance (agent needs amount + fee)
    if (agentWallet.balance < totalAmountNeeded) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient agent balance");
    }

    // Get users
    const agent = await User.findOne({ wallet: agentWallet._id }).session(
      session
    );
    const customer = await User.findOne({ wallet: customerWallet._id }).session(
      session
    );

    if (!agent || !customer) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Associated user accounts not found"
      );
    }

    // Create transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      type: TransactionType.CASH_IN,
      sender: agent!._id,
      receiver: customer!._id,
      senderWallet: agentWallet._id,
      receiverWallet: customerWallet._id,
      agent: agent!._id,
      agentWallet: agentWallet._id,
      amount: payload.amount,
      fee,
      commission,
      status: TransactionStatus.PENDING,
      reference: payload.reference,
      senderBalanceBefore: agentWallet.balance,
      receiverBalanceBefore: customerWallet.balance,
    });

    // Update balances
    // Agent pays amount + fee, but gets commission back
    agentWallet.balance -= payload.amount + fee;
    agentWallet.balance += commission; // Agent gets commission (50% of fee)
    customerWallet.balance += payload.amount; // Customer receives the full amount
    customerWallet.totalReceived += payload.amount;

    transaction.senderBalanceAfter = agentWallet.balance;
    transaction.receiverBalanceAfter = customerWallet.balance;
    transaction.status = TransactionStatus.COMPLETED;

    // Save all changes
    await transaction.save({ session });
    await agentWallet.save({ session });
    await customerWallet.save({ session });

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cashOut = async (
  payload: {
    customerWalletId: string;
    agentWalletId: string;
    amount: number;
    pin: string;
    reference?: string;
  },
  decodedToken: JwtPayload
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Validate customer wallet
    const customerWallet = await validateWallet(payload.customerWalletId);

    // Verify PIN
    const bcrypt = require("bcryptjs");
    const isPinValid = await bcrypt.compare(payload.pin, customerWallet.pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid PIN");
    }

    // Find agent wallet
    // const agentWallet = await Wallet.findOne({
    //   walletNumber: payload.agentWalletNumber,
    // }).session(session);

    const agentWallet = await validateWallet(payload.agentWalletId);

    if (!agentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }

    if (agentWallet.status !== Status.ACTIVE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Agent wallet is ${agentWallet.status}`
      );
    }

    // Calculate fee and commission for cash-out
    const fee = calculateFee(payload.amount, TransactionType.CASH_OUT);
    const commission = calculateCommission(fee);
    const totalAmount = payload.amount + fee;

    // Check customer balance
    if (customerWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    // Check limits
    await checkDailyLimit(payload.customerWalletId, totalAmount);
    await checkMonthlyLimit(payload.customerWalletId, totalAmount);

    // Get users
    const customer = await User.findOne({ wallet: customerWallet._id }).session(
      session
    );
    const agent = await User.findOne({ wallet: agentWallet._id }).session(
      session
    );

    if (!customer || !agent) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Associated user accounts not found"
      );
    }

    // Create transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      type: TransactionType.CASH_OUT,
      sender: customer!._id,
      receiver: agent!._id,
      senderWallet: customerWallet._id,
      receiverWallet: agentWallet._id,
      agent: agent!._id,
      agentWallet: agentWallet._id,
      amount: payload.amount,
      fee,
      commission,
      status: TransactionStatus.PENDING,
      reference: payload.reference,
      senderBalanceBefore: customerWallet.balance,
      receiverBalanceBefore: agentWallet.balance,
    });

    // Update balances
    customerWallet.balance -= totalAmount;
    customerWallet.totalSent += payload.amount;
    agentWallet.balance += payload.amount;
    agentWallet.balance += commission; // Agent gets commission
    agentWallet.totalReceived += payload.amount;

    transaction.senderBalanceAfter = customerWallet.balance;
    transaction.receiverBalanceAfter = agentWallet.balance;
    transaction.status = TransactionStatus.COMPLETED;

    // Save all changes
    await transaction.save({ session });
    await customerWallet.save({ session });
    await agentWallet.save({ session });

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deposit = async (payload: {
  walletId: string;
  amount: number;
  reference?: string;
  description?: string;
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const wallet = await validateWallet(payload.walletId);
    const user = await User.findOne({ wallet: wallet._id }).session(session);

    // Create transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      type: TransactionType.DEPOSIT,
      sender: user!._id,
      receiver: user!._id,
      senderWallet: wallet._id,
      receiverWallet: wallet._id,
      amount: payload.amount,
      status: TransactionStatus.PENDING,
      reference: payload.reference,
      description: payload.description,
      senderBalanceBefore: wallet.balance,
      receiverBalanceBefore: wallet.balance,
    });

    // Update balance
    wallet.balance += payload.amount;
    wallet.totalDeposited += payload.amount;

    transaction.senderBalanceAfter = wallet.balance;
    transaction.receiverBalanceAfter = wallet.balance;
    transaction.status = TransactionStatus.COMPLETED;

    // Save changes
    await transaction.save({ session });
    await wallet.save({ session });

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const withdrawal = async (
  payload: {
    customerWalletId: string;
    agentWalletNumber: string;
    amount: number;
    pin: string;
    reference?: string;
    description?: string;
  },
  decodedToken: JwtPayload
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Validate customer wallet
    const customerWallet = await validateWallet(payload.customerWalletId);

    // Verify PIN
    const bcrypt = require("bcryptjs");
    const isPinValid = await bcrypt.compare(payload.pin, customerWallet.pin);
    if (!isPinValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid PIN");
    }

    // Find agent wallet
    const agentWallet = await Wallet.findOne({
      walletNumber: payload.agentWalletNumber,
    }).session(session);

    if (!agentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }

    if (agentWallet.status !== Status.ACTIVE) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Agent wallet is ${agentWallet.status}`
      );
    }

    // No fees for withdrawals
    const fee = 0;
    const commission = 0;
    const totalAmount = payload.amount;

    // Check customer balance
    if (customerWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    // Check agent has enough cash
    if (agentWallet.balance < payload.amount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient agent balance");
    }

    // Check limits
    await checkDailyLimit(payload.customerWalletId, totalAmount);
    await checkMonthlyLimit(payload.customerWalletId, totalAmount);

    // Get users
    const customer = await User.findOne({ wallet: customerWallet._id }).session(
      session
    );
    const agent = await User.findOne({ wallet: agentWallet._id }).session(
      session
    );

    // Create transaction
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      type: TransactionType.WITHDRAWAL,
      sender: customer!._id,
      receiver: agent!._id,
      senderWallet: customerWallet._id,
      receiverWallet: agentWallet._id,
      agent: agent!._id,
      agentWallet: agentWallet._id,
      amount: payload.amount,
      fee,
      commission,
      status: TransactionStatus.PENDING,
      reference: payload.reference,
      description: payload.description,
      senderBalanceBefore: customerWallet.balance,
      receiverBalanceBefore: agentWallet.balance,
    });

    // Update balances
    customerWallet.balance -= totalAmount;
    customerWallet.totalWithdrawn += payload.amount;
    agentWallet.balance -= payload.amount;
    // No commission for withdrawals

    transaction.senderBalanceAfter = customerWallet.balance;
    transaction.receiverBalanceAfter = agentWallet.balance;
    transaction.status = TransactionStatus.COMPLETED;

    // Save changes
    await transaction.save({ session });
    await customerWallet.save({ session });
    await agentWallet.save({ session });

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Transaction.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("agent", "name email")
      .populate("senderWallet", "walletNumber")
      .populate("receiverWallet", "walletNumber"),
    query
  );

  const transactions = queryBuilder
    .search(transactionSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactions.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getMyTransactions = async (
  decodedToken: JwtPayload,
  query: Record<string, string>
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const queryBuilder = new QueryBuilder(
    Transaction.find({
      $or: [{ sender: user._id }, { receiver: user._id }, { agent: user._id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("agent", "name email")
      .populate("senderWallet", "walletNumber")
      .populate("receiverWallet", "walletNumber"),
    query
  );

  const transactions = queryBuilder
    .search(transactionSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactions.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getTransactionById = async (transactionId: string) => {
  const transaction = await Transaction.findOne({ transactionId })
    .populate("sender", "name email phone")
    .populate("receiver", "name email phone")
    .populate("agent", "name email phone")
    .populate("senderWallet", "walletNumber balance")
    .populate("receiverWallet", "walletNumber balance");

  if (!transaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  return transaction;
};

const refundTransaction = async (transactionId: string, reason?: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const originalTransaction = await Transaction.findOne({
      transactionId,
    }).session(session);

    if (!originalTransaction) {
      throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
    }

    if (originalTransaction.status !== TransactionStatus.COMPLETED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only completed transactions can be refunded"
      );
    }

    // Get wallets
    const senderWallet = await Wallet.findById(
      originalTransaction.senderWallet
    ).session(session);
    const receiverWallet = await Wallet.findById(
      originalTransaction.receiverWallet
    ).session(session);

    if (!senderWallet || !receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    // Create refund transaction
    const refundTransaction = new Transaction({
      transactionId: generateTransactionId(),
      type: TransactionType.REFUND,
      sender: originalTransaction.receiver,
      receiver: originalTransaction.sender,
      senderWallet: originalTransaction.receiverWallet,
      receiverWallet: originalTransaction.senderWallet,
      amount: originalTransaction.amount,
      fee: originalTransaction.fee,
      status: TransactionStatus.PENDING,
      reference: `REFUND-${originalTransaction.transactionId}`,
      description: reason || "Transaction refund",
      senderBalanceBefore: receiverWallet.balance,
      receiverBalanceBefore: senderWallet.balance,
    });

    // Update balances (reverse the original transaction)
    receiverWallet.balance -= originalTransaction.amount;
    senderWallet.balance +=
      originalTransaction.amount + originalTransaction.fee;

    refundTransaction.senderBalanceAfter = receiverWallet.balance;
    refundTransaction.receiverBalanceAfter = senderWallet.balance;
    refundTransaction.status = TransactionStatus.COMPLETED;

    // Update original transaction status
    originalTransaction.status = TransactionStatus.REFUNDED;

    // Save all changes
    await refundTransaction.save({ session });
    await originalTransaction.save({ session });
    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();

    return refundTransaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAgentTransactionOverview = async (decodedToken: JwtPayload) => {
  const agent = await User.findById(decodedToken.userId).populate<{
    wallet: IWallet & Document;
  }>("wallet");

  if (!agent || !agent.wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  // Get cash-in and cash-out transaction statistics
  const transactionStats = await Transaction.aggregate([
    {
      $match: {
        agent: agent._id,
        status: TransactionStatus.COMPLETED,
        type: { $in: [TransactionType.CASH_IN, TransactionType.CASH_OUT] },
      },
    },
    {
      $group: {
        _id: "$type",
        totalCount: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        totalCommission: { $sum: "$commission" },
      },
    },
  ]);

  // Initialize default values
  let cashInCount = 0;
  let cashOutCount = 0;
  let cashInAmount = 0;
  let cashOutAmount = 0;
  let totalCommission = 0;

  // Process aggregation results
  transactionStats.forEach((stat) => {
    if (stat._id === TransactionType.CASH_IN) {
      cashInCount = stat.totalCount;
      cashInAmount = stat.totalAmount;
      totalCommission += stat.totalCommission;
    } else if (stat._id === TransactionType.CASH_OUT) {
      cashOutCount = stat.totalCount;
      cashOutAmount = stat.totalAmount;
      totalCommission += stat.totalCommission;
    }
  });

  return {
    cashIn: {
      totalCount: cashInCount,
      totalAmount: cashInAmount,
    },
    cashOut: {
      totalCount: cashOutCount,
      totalAmount: cashOutAmount,
    },
    totalCommission,
    commissionRate: COMMISSION_RATE, // 50% of fee as commission
  };
};

export const TransactionService = {
  transfer,
  cashIn,
  cashOut,
  deposit,
  withdrawal,
  getAllTransactions,
  getMyTransactions,
  getTransactionById,
  refundTransaction,
  getAgentTransactionOverview,
};
