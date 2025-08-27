import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userServices } from "./user.service";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully!",
      data: user,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const userId = req.params.id;
    const payload = req.body;
    const verifiedToken = req.user as JwtPayload;
    const userId = verifiedToken.userId;

    const user = await userServices.updateUser(userId, payload, verifiedToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully!",
      data: user,
    });
  }
);

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userServices.getAllUser(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userServices.getAllAgents(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agents retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userId = decodedToken.userId;
    const user = await userServices.getMyProfile(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrieved successfully!",
      data: user,
    });
  }
);

const applyForAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userId = decodedToken.userId;
    const user = await userServices.applyForAgent(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User applied for agent successfully!",
      data: user,
    });
  }
);

const approveAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const payload = req.body;

    const user = await userServices.approveAgent(userId, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent managed successfully!",
      data: user,
    });
  }
);

export const UserController = {
  createUser,
  getAllUser,
  updateUser,
  getMyProfile,
  applyForAgent,
  approveAgent,
  getAllAgents,
};
