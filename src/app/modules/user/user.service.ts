import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../../config/env";
import { AppError } from "../../helpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Wallet } from "../wallet/wallet.model";
import { userSearchableFields } from "./user.constants";
import { AGENT_STATUS, IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  if (!email || !password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email or password is missing");
  }

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(env.BCRYPT_SALT_ROUNDS)
  );

  const authProvider: IAuthProvider = {
    provider: "credential",
    providerId: email,
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const walletNumber = `WALLET${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;

    const [user] = await User.create(
      [
        {
          email,
          password: hashedPassword,
          auths: [authProvider],
          ...rest,
        },
      ],
      { session }
    );

    const [wallet] = await Wallet.create(
      [
        {
          walletNumber,
          user: user._id,
          pin: await bcrypt.hash("1234", Number(env.BCRYPT_SALT_ROUNDS)),
        },
      ],
      { session }
    );

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        wallet: wallet._id,
        agent: {
          status:
            payload.role === Role.AGENT
              ? AGENT_STATUS.PENDING
              : AGENT_STATUS.NONE,
        },
      },
      { session, new: true }
    ).lean();

    await session.commitTransaction();

    if (!updatedUser) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "User update failed"
      );
    }

    const { password: _password, ...restUser } = updatedUser;
    return restUser;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User creation failed"
    );
  } finally {
    session.endSession();
  }
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not permitted to update role"
      );
    }
    if (
      payload.role === Role.SUPER_ADMIN &&
      decodedToken.role !== Role.SUPER_ADMIN
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not permitted to update role"
      );
    }
  }
  if (payload.wallet) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not permitted to update wallet"
    );
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not permitted to update status"
      );
    }
  }

  if (payload.password) {
    const hashedPassword = await bcrypt.hash(
      payload.password,
      Number(env.BCRYPT_SALT_ROUNDS)
    );
    payload.password = hashedPassword;
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  const { password: _password, ...restUser } = newUpdatedUser!.toObject();

  return restUser;
};

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const tours = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getAllAgents = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({ role: Role.AGENT }), query);

  const tours = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const { password: _password, ...restUser } = user.toObject();

  return restUser;
};

const applyForAgent = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      agent: {
        status: AGENT_STATUS.PENDING,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const { password: _password, ...restUser } = user.toObject();

  return restUser;
};

const approveAgent = async (
  userId: string,
  payload: { status: AGENT_STATUS }
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      role: payload.status === AGENT_STATUS.APPROVED ? Role.AGENT : Role.USER,
      agent: {
        ...payload,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const { password: _password, ...restUser } = user.toObject();

  return restUser;
};

export const userServices = {
  createUser,
  getAllUser,
  updateUser,
  getMyProfile,
  applyForAgent,
  approveAgent,
  getAllAgents,
};
