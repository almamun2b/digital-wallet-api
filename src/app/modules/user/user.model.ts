import { model, Schema } from "mongoose";
import {
  AGENT_STATUS,
  IAgent,
  IAuthProvider,
  IsActive,
  IUser,
  Role,
} from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      enum: ["credential", "google", "facebook", "github"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const agentSchema = new Schema<IAgent>(
  {
    status: {
      type: String,
      enum: Object.values(AGENT_STATUS),
      default: AGENT_STATUS.NONE,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
      default: Role.USER,
    },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    auths: [authProviderSchema],
    agent: {
      type: agentSchema,
      default: {
        status: AGENT_STATUS.NONE,
      },
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model<IUser>("User", userSchema);

export { User };
