import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";

const transfer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const transaction = await TransactionService.transfer(
      req.body,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Transfer completed successfully!",
      data: transaction,
    });
  }
);

const cashIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const transaction = await TransactionService.cashIn(req.body, decodedToken);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Cash in completed successfully!",
      data: transaction,
    });
  }
);

const cashOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const transaction = await TransactionService.cashOut(
      req.body,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Cash out completed successfully!",
      data: transaction,
    });
  }
);

const deposit = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await TransactionService.deposit(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Deposit completed successfully!",
      data: transaction,
    });
  }
);

const withdrawal = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const transaction = await TransactionService.withdrawal(
      req.body,
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Withdrawal completed successfully!",
      data: transaction,
    });
  }
);

const getAllTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await TransactionService.getAllTransactions(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getMyTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const query = req.query;
    const result = await TransactionService.getMyTransactions(
      decodedToken,
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My transactions retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getTransactionById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;
    const transaction = await TransactionService.getTransactionById(
      transactionId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction retrieved successfully!",
      data: transaction,
    });
  }
);

const refundTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const transaction = await TransactionService.refundTransaction(
      transactionId,
      reason
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction refunded successfully!",
      data: transaction,
    });
  }
);

const getAgentTransactionOverview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await TransactionService.getAgentTransactionOverview(
      decodedToken
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent transaction overview retrieved successfully!",
      data: result,
    });
  }
);

export const TransactionController = {
  transfer,
  cashIn,
  cashOut,
  deposit,
  withdrawal,
  getAllTransactions,
  getMyTransactions,
  getTransactionById,
  refundTransaction,
  getAgentTransactionOverview,
};
