import { z } from "zod";
import { Status } from "./wallet.interface";

export const changePinZodSchema = z.object({
  oldPin: z
    .string({ required_error: "Old PIN is required" })
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN must contain only digits"),
  newPin: z
    .string({ required_error: "New PIN is required" })
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN must contain only digits"),
});

export const verifyPinZodSchema = z.object({
  pin: z
    .string({ required_error: "PIN is required" })
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN must contain only digits"),
});

export const updateStatusZodSchema = z.object({
  status: z.enum(Object.values(Status) as [string, ...string[]], {
    required_error: "Status is required",
  }),
});

export const updateLimitsZodSchema = z.object({
  dailyLimit: z
    .number({ invalid_type_error: "Daily limit must be a number" })
    .min(0, "Daily limit cannot be negative")
    .optional(),
  monthlyLimit: z
    .number({ invalid_type_error: "Monthly limit must be a number" })
    .min(0, "Monthly limit cannot be negative")
    .optional(),
});

export const adjustFeesCommissionLimitsZodSchema = z.object({
  cashInFeeRate: z
    .number({ invalid_type_error: "Cash-in fee rate must be a number" })
    .min(0, "Cash-in fee rate cannot be negative")
    .max(1, "Cash-in fee rate cannot exceed 100%")
    .optional(),
  cashOutFeeRate: z
    .number({ invalid_type_error: "Cash-out fee rate must be a number" })
    .min(0, "Cash-out fee rate cannot be negative")
    .max(1, "Cash-out fee rate cannot exceed 100%")
    .optional(),
  commissionRate: z
    .number({ invalid_type_error: "Commission rate must be a number" })
    .min(0, "Commission rate cannot be negative")
    .max(1, "Commission rate cannot exceed 100%")
    .optional(),
  sendMoneyFee: z
    .number({ invalid_type_error: "Send money fee must be a number" })
    .min(0, "Send money fee cannot be negative")
    .optional(),
  dailyLimit: z
    .number({ invalid_type_error: "Daily limit must be a number" })
    .min(0, "Daily limit cannot be negative")
    .optional(),
  monthlyLimit: z
    .number({ invalid_type_error: "Monthly limit must be a number" })
    .min(0, "Monthly limit cannot be negative")
    .optional(),
});
