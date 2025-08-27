import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../helpers/appError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assessToken = req.headers.authorization || req.cookies.accessToken;
      if (!assessToken) {
        throw new AppError(403, "No token provided");
      }

      const verifiedToken = verifyToken(
        assessToken,
        env.JWT_ACCESS_SECRET
      ) as JwtPayload;

      if (!verifiedToken) {
        throw new AppError(403, "Invalid token");
      }

      const user = await User.findOne({ email: verifiedToken.email });

      if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exists");
      }

      if (
        user.isActive === IsActive.BLOCKED ||
        user.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.isActive}`);
      }
      if (user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (authRoles.length > 0 && !authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };

export { checkAuth };
