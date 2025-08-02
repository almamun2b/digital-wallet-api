import { model, Schema } from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, "Transaction type is required"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    senderWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: [true, "Sender wallet is required"],
    },
    receiverWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: [true, "Receiver wallet is required"],
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    agentWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least 0.01"],
      set: (val: number) => Math.round(val * 100) / 100,
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, "Fee cannot be negative"],
      set: (val: number) => Math.round(val * 100) / 100,
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, "Commission cannot be negative"],
      set: (val: number) => Math.round(val * 100) / 100,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [100, "Reference cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    senderBalanceBefore: {
      type: Number,
      min: [0, "Sender balance before cannot be negative"],
    },
    senderBalanceAfter: {
      type: Number,
      min: [0, "Sender balance after cannot be negative"],
    },
    receiverBalanceBefore: {
      type: Number,
      min: [0, "Receiver balance before cannot be negative"],
    },
    receiverBalanceAfter: {
      type: Number,
      min: [0, "Receiver balance after cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
