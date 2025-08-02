import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { WalletController } from "./wallet.controller";
import {
  changePinZodSchema,
  updateLimitsZodSchema,
  updateStatusZodSchema,
  verifyPinZodSchema,
} from "./wallet.validation";

const router = Router();

// User routes
router.get(
  "/my-wallet",
  checkAuth(...Object.values(Role)),
  WalletController.getMyWallet
);

router.patch(
  "/:walletId/change-pin",
  checkAuth(...Object.values(Role)),
  validateRequest(changePinZodSchema),
  WalletController.changePin
);

router.post(
  "/:walletId/verify-pin",
  checkAuth(...Object.values(Role)),
  validateRequest(verifyPinZodSchema),
  WalletController.verifyPin
);

router.get(
  "/:walletId/stats",
  checkAuth(...Object.values(Role)),
  WalletController.getWalletStats
);

// Admin routes
router.get(
  "/all-wallets",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  WalletController.getAllWallets
);

router.get(
  "/:walletNumber",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT),
  WalletController.getWalletByNumber
);

router.patch(
  "/:walletId/status",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(updateStatusZodSchema),
  WalletController.updateWalletStatus
);

router.patch(
  "/:walletId/limits",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(updateLimitsZodSchema),
  WalletController.updateLimits
);

export const WalletRoutes = router;
