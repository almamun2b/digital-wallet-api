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
