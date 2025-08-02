import { Types } from "mongoose";

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IWallet {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  walletNumber: string;
  balance: number;
  currency: string;
  status: Status;
  dailyLimit: number;
  monthlyLimit: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalSent: number;
  totalReceived: number;
  pin: string;
  pinAttempts: number;
  pinLockedUntil: Date | null;
}
