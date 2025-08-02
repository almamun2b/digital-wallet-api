import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../helpers/appError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";

const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRATION
  );

  const refreshToken = generateToken(
    jwtPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRATION
  );

  return { accessToken, refreshToken };
};

const createNewAccessTokenUsingRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    env.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const user = await User.findOne({ email: verifiedRefreshToken.email });

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

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRATION
  );

  return accessToken;
};

export { createNewAccessTokenUsingRefreshToken, createUserTokens };
