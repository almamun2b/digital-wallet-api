import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";
import {
  cashInZodSchema,
  cashOutZodSchema,
  depositZodSchema,
  refundZodSchema,
  transferZodSchema,
} from "./transaction.validation";

const router = Router();

// User transaction routes
router.post(
  "/transfer",
  checkAuth(Role.USER),
  validateRequest(transferZodSchema),
  TransactionController.transfer
);

router.post(
  "/cash-out",
  checkAuth(Role.USER),
  validateRequest(cashOutZodSchema),
  TransactionController.cashOut
);

router.get(
  "/my-transactions",
  checkAuth(...Object.values(Role)),
  TransactionController.getMyTransactions
);

// Agent transaction routes
router.post(
  "/cash-in",
  checkAuth(Role.AGENT),
  validateRequest(cashInZodSchema),
  TransactionController.cashIn
);

// Admin routes
router.get(
  "/all-transactions",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  TransactionController.getAllTransactions
);

router.post(
  "/deposit",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(depositZodSchema),
  TransactionController.deposit
);

router.get(
  "/:transactionId",
  checkAuth(...Object.values(Role)),
  TransactionController.getTransactionById
);

router.post(
  "/:transactionId/refund",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(refundZodSchema),
  TransactionController.refundTransaction
);

export const TransactionRoutes = router;
