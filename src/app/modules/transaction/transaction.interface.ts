import { Types } from "mongoose";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  COMMISSION = "COMMISSION",
  FEE = "FEE",
  REFUND = "REFUND",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface ITransaction {
  _id?: Types.ObjectId;
  transactionId: string;
  type: TransactionType;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  senderWallet: Types.ObjectId;
  receiverWallet: Types.ObjectId;
  agent?: Types.ObjectId;
  agentWallet?: Types.ObjectId;
  amount: number;
  fee: number;
  commission: number;
  status: TransactionStatus;
  reference?: string;
  description?: string;
  senderBalanceBefore?: number;
  senderBalanceAfter?: number;
  receiverBalanceBefore?: number;
  receiverBalanceAfter?: number;
}
