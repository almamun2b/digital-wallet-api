import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env";
import { IAuthProvider, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { Wallet } from "../modules/wallet/wallet.model";

const seedSuperAdmin = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const IsSuperAdminExist = await User.findOne({
      email: env.SUPER_ADMIN_EMAIL,
    });

    if (IsSuperAdminExist) {
      console.log("Super Admin already exists");
      return;
    }
    console.log("Creating Super Admin...");

    const hashedPassword = await bcrypt.hash(
      env.SUPER_ADMIN_PASSWORD,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    const authProvider: IAuthProvider = {
      provider: "credential",
      providerId: env.SUPER_ADMIN_EMAIL,
    };

    // Create super admin first
    const [superAdmin] = await User.create(
      [
        {
          name: "Super Admin",
          email: env.SUPER_ADMIN_EMAIL,
          password: hashedPassword,
          auths: [authProvider],
          role: Role.SUPER_ADMIN,
          isVerified: true,
        },
      ],
      { session }
    );

    const walletNumber = `WALLET${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;

    // Create wallet with super admin reference
    const [wallet] = await Wallet.create(
      [
        {
          walletNumber,
          user: superAdmin._id,
          pin: await bcrypt.hash("1234", Number(env.BCRYPT_SALT_ROUNDS)),
        },
      ],
      { session }
    );

    // Update super admin with wallet reference
    await User.findByIdAndUpdate(
      superAdmin._id,
      { wallet: wallet._id },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Failed to create Super Admin:", error);
  } finally {
    session.endSession();
  }
};
export { seedSuperAdmin };
