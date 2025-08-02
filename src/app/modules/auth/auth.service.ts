import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../helpers/appError";
import {
  createNewAccessTokenUsingRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email or password is missing");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does't exists");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password is incorrect");
  }

  const userTokens = createUserTokens(user);

  const { password: _password, ...rest } = user.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};
const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenUsingRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
    refreshToken: refreshToken,
  };
};
const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exists");
  }

  const isOldPasswordMatched = await bcrypt.compare(
    oldPassword,
    user!.password as string
  );

  if (!isOldPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old password is incorrect");
  }

  user.password = await bcrypt.hash(
    newPassword,
    Number(env.BCRYPT_SALT_ROUNDS)
  );

  await user.save();

  // const updatedPassword = await bcrypt.hash(
  //   newPassword,
  //   Number(env.BCRYPT_SALT_ROUNDS)
  // );

  // await User.findByIdAndUpdate(
  //   decodedToken.userId,
  //   {
  //     password: updatedPassword,
  //   },
  //   { runValidators: true }
  // );

  return true;
};

export const authServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
