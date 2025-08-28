import { model, Schema } from "mongoose";
import { ISystemSettings } from "./wallet.interface";

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    cashInFeeRate: {
      type: Number,
      required: [true, "Cash-in fee rate is required"],
      min: [0, "Cash-in fee rate cannot be negative"],
      max: [1, "Cash-in fee rate cannot exceed 100%"],
      default: 0.02, // 2%
    },
    cashOutFeeRate: {
      type: Number,
      required: [true, "Cash-out fee rate is required"],
      min: [0, "Cash-out fee rate cannot be negative"],
      max: [1, "Cash-out fee rate cannot exceed 100%"],
      default: 0.02, // 2%
    },
    commissionRate: {
      type: Number,
      required: [true, "Commission rate is required"],
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
      default: 0.5, // 50% of fee
    },
    sendMoneyFee: {
      type: Number,
      required: [true, "Send money fee is required"],
      min: [0, "Send money fee cannot be negative"],
      default: 5, // 5 BDT fixed fee for money transfers
    },
    defaultDailyLimit: {
      type: Number,
      required: [true, "Default daily limit is required"],
      min: [0, "Default daily limit cannot be negative"],
      default: 50000,
    },
    defaultMonthlyLimit: {
      type: Number,
      required: [true, "Default monthly limit is required"],
      min: [0, "Default monthly limit cannot be negative"],
      default: 500000,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Last updated by is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ensure only one system settings document exists
systemSettingsSchema.index({}, { unique: true });

export const SystemSettings = model<ISystemSettings>(
  "SystemSettings",
  systemSettingsSchema
);
