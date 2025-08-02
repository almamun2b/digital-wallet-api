import { model, Schema } from "mongoose";
import { IWallet, Status } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    walletNumber: {
      type: String,
      required: [true, "Wallet number is required"],
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 50, // Initial balance ৳50
      min: [0, "Balance cannot be negative"],
      set: (val: number) => Math.round(val * 100) / 100,
    },
    currency: {
      type: String,
      default: "BDT",
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
    dailyLimit: {
      type: Number,
      default: 50000,
      min: [0, "Daily limit cannot be negative"],
    },
    monthlyLimit: {
      type: Number,
      default: 500000,
      min: [0, "Monthly limit cannot be negative"],
    },
    totalDeposited: {
      type: Number,
      default: 0,
      min: [0, "Total deposited cannot be negative"],
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: [0, "Total withdrawn cannot be negative"],
    },
    totalSent: {
      type: Number,
      default: 0,
      min: [0, "Total sent cannot be negative"],
    },
    totalReceived: {
      type: Number,
      default: 0,
      min: [0, "Total received cannot be negative"],
    },
    pin: {
      type: String,
      required: [true, "PIN is required"],
    },
    pinAttempts: {
      type: Number,
      default: 0,
      min: [0, "PIN attempts cannot be negative"],
      max: [5, "PIN attempts cannot exceed 5"],
    },
    pinLockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
