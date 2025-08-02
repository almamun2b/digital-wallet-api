import { Types } from "mongoose";

enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

enum AGENT_STATUS {
  NONE = "NONE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

type AuthProviderName = "credential" | "google" | "facebook" | "github";

interface IAuthProvider {
  provider: AuthProviderName;
  providerId: string;
}

interface IAgent {
  status: AGENT_STATUS;
}

interface IUser {
  _id: Types.ObjectId;
  wallet: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isActive?: IsActive;
  isVerified?: boolean;
  isDeleted?: boolean;
  role: Role;
  agent?: IAgent;
  auths: IAuthProvider[];
}

export {
  AGENT_STATUS,
  AuthProviderName,
  IAgent,
  IAuthProvider,
  IsActive,
  IUser,
  Role,
};
