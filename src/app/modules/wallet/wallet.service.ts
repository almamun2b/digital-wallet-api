import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { Document } from "mongoose";
import { env } from "../../config/env";
import { AppError } from "../../helpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { User } from "../user/user.model";
import { walletSearchableFields } from "./wallet.constants";
import { IWallet, Status } from "./wallet.interface";
import { Wallet } from "./wallet.model";

const getMyWallet = async (decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId).populate<{
    wallet: IWallet & Document;
  }>("wallet");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  const { pin: _pin, ...wallet } = user.wallet.toObject();

  return wallet;
};

const getAllWallets = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Wallet.find().populate("user", "name email phone"),
    query
  );

  const wallet = queryBuilder
    .search(walletSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    wallet.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getWalletByNumber = async (walletNumber: string) => {
  const wallet = await Wallet.findOne({ walletNumber }).populate(
    "user",
    "name email phone"
  );

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  return wallet;
};

const updateWalletStatus = async (walletId: string, status: Status) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  wallet.status = status;
  await wallet.save();

  return wallet;
};

const changePin = async (
  walletId: string,
  oldPin: string,
  newPin: string,
  decodedToken: JwtPayload
) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  // Check if wallet is locked
  if (wallet.pinLockedUntil && wallet.pinLockedUntil > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Wallet is locked until ${wallet.pinLockedUntil}`
    );
  }

  const isPinMatched = await bcrypt.compare(oldPin, wallet.pin);

  if (!isPinMatched) {
    wallet.pinAttempts += 1;

    if (wallet.pinAttempts >= 5) {
      wallet.pinLockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await wallet.save();
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Too many failed attempts. Wallet locked for 24 hours"
      );
    }

    await wallet.save();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Incorrect PIN. ${5 - wallet.pinAttempts} attempts remaining`
    );
  }

  // Reset attempts on successful verification
  wallet.pinAttempts = 0;
  wallet.pinLockedUntil = null;
  wallet.pin = await bcrypt.hash(newPin, Number(env.BCRYPT_SALT_ROUNDS));

  await wallet.save();

  return { message: "PIN changed successfully" };
};

const verifyPin = async (walletId: string, pin: string) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status !== Status.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, `Wallet is ${wallet.status}`);
  }

  // Check if wallet is locked
  if (wallet.pinLockedUntil && wallet.pinLockedUntil > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Wallet is locked until ${wallet.pinLockedUntil}`
    );
  }

  const isPinMatched = await bcrypt.compare(pin, wallet.pin);

  if (!isPinMatched) {
    wallet.pinAttempts += 1;

    if (wallet.pinAttempts >= 5) {
      wallet.pinLockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      wallet.pinAttempts = 0;
      await wallet.save();
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Too many failed attempts. Wallet locked for 24 hours"
      );
    }

    await wallet.save();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Incorrect PIN. ${5 - wallet.pinAttempts} attempts remaining`
    );
  }

  // Reset attempts on successful verification
  wallet.pinAttempts = 0;
  wallet.pinLockedUntil = null;
  await wallet.save();

  return { verified: true };
};

const updateLimits = async (
  walletId: string,
  limits: { dailyLimit?: number; monthlyLimit?: number }
) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (limits.dailyLimit !== undefined) {
    wallet.dailyLimit = limits.dailyLimit;
  }

  if (limits.monthlyLimit !== undefined) {
    wallet.monthlyLimit = limits.monthlyLimit;
  }

  await wallet.save();
  return wallet;
};

const getWalletStats = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  return {
    balance: wallet.balance,
    totalDeposited: wallet.totalDeposited,
    totalWithdrawn: wallet.totalWithdrawn,
    totalSent: wallet.totalSent,
    totalReceived: wallet.totalReceived,
    dailyLimit: wallet.dailyLimit,
    monthlyLimit: wallet.monthlyLimit,
    status: wallet.status,
  };
};

export const WalletService = {
  getMyWallet,
  getAllWallets,
  getWalletByNumber,
  updateWalletStatus,
  changePin,
  verifyPin,
  updateLimits,
  getWalletStats,
};
