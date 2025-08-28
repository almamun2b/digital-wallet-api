import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";

const getMyWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const wallet = await WalletService.getMyWallet(decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet retrieved successfully!",
      data: wallet,
    });
  }
);

const getAllWallets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await WalletService.getAllWallets(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallets retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getWalletByNumber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletNumber } = req.params;
    const wallet = await WalletService.getWalletByNumber(walletNumber);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet retrieved successfully!",
      data: wallet,
    });
  }
);

const changePin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const { oldPin, newPin } = req.body;
    const decodedToken = req.user as JwtPayload;

    const body = req.body;

    const result = await WalletService.changePin(
      walletId,
      oldPin,
      newPin,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "PIN changed successfully!",
      data: result,
    });
  }
);

const verifyPin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const { pin } = req.body;

    const result = await WalletService.verifyPin(walletId, pin);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "PIN verified successfully!",
      data: result,
    });
  }
);

const updateWalletStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const { status } = req.body;

    const wallet = await WalletService.updateWalletStatus(walletId, status);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet status updated successfully!",
      data: wallet,
    });
  }
);

const updateLimits = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;
    const limits = req.body;

    const wallet = await WalletService.updateLimits(walletId, limits);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet limits updated successfully!",
      data: wallet,
    });
  }
);

const getWalletStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletId } = req.params;

    const stats = await WalletService.getWalletStats(walletId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet stats retrieved successfully!",
      data: stats,
    });
  }
);

const adjustFeesCommissionLimits = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const payload = req.body;

    const result = await WalletService.adjustFeesCommissionLimits(
      decodedToken,
      payload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fees and commission limits adjusted successfully!",
      data: result,
    });
  }
);

const getFeesCommissionLimits = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const systemSettings = await WalletService.getFeesCommissionLimits();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "System settings retrieved successfully!",
      data: systemSettings,
    });
  }
);

export const WalletController = {
  getMyWallet,
  getAllWallets,
  getWalletByNumber,
  changePin,
  verifyPin,
  updateWalletStatus,
  updateLimits,
  getWalletStats,
  adjustFeesCommissionLimits,
  getFeesCommissionLimits,
};
