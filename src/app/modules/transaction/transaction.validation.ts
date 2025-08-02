import { z } from "zod";

export const transferZodSchema = z.object({
  senderWalletId: z.string({
    required_error: "Sender wallet ID is required",
  }),
  receiverWalletNumber: z.string({
    required_error: "Receiver wallet number is required",
  }),
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least 0.01"),
  pin: z
    .string({ required_error: "PIN is required" })
    .length(4, "PIN must be exactly 4 digits"),
  reference: z
    .string()
    .max(100, "Reference cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export const cashInZodSchema = z.object({
  agentWalletId: z.string({ required_error: "Agent wallet ID is required" }),
  customerWalletNumber: z.string({
    required_error: "Customer wallet number is required",
  }),
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least 0.01"),
  pin: z
    .string({ required_error: "PIN is required" })
    .length(4, "PIN must be exactly 4 digits"),
  reference: z
    .string()
    .max(100, "Reference cannot exceed 100 characters")
    .optional(),
});

export const cashOutZodSchema = z.object({
  customerWalletId: z.string({
    required_error: "Customer wallet ID is required",
  }),
  agentWalletNumber: z.string({
    required_error: "Agent wallet number is required",
  }),
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least 0.01"),
  pin: z
    .string({ required_error: "PIN is required" })
    .length(4, "PIN must be exactly 4 digits"),
  reference: z
    .string()
    .max(100, "Reference cannot exceed 100 characters")
    .optional(),
});

export const depositZodSchema = z.object({
  walletId: z.string({ required_error: "Wallet ID is required" }),
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least 0.01"),
  reference: z
    .string()
    .max(100, "Reference cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export const withdrawalZodSchema = z.object({
  customerWalletId: z.string({
    required_error: "Customer wallet ID is required",
  }),
  agentWalletNumber: z.string({
    required_error: "Agent wallet number is required",
  }),
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least 0.01"),
  pin: z
    .string({ required_error: "PIN is required" })
    .length(4, "PIN must be exactly 4 digits"),
  reference: z
    .string()
    .max(100, "Reference cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export const refundZodSchema = z.object({
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});
