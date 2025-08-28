import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env";
import { IAuthProvider, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { SystemSettings } from "../modules/wallet/systemSettings.model";
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

    // Create wallet with super admin reference (using default limits since system settings will be created after)
    const [wallet] = await Wallet.create(
      [
        {
          walletNumber,
          user: superAdmin._id,
          pin: await bcrypt.hash("1234", Number(env.BCRYPT_SALT_ROUNDS)),
          dailyLimit: 50000, // Default values that will match system settings
          monthlyLimit: 500000,
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

    // Initialize system settings if they don't exist
    const existingSettings = await SystemSettings.findOne().session(session);
    if (!existingSettings) {
      await SystemSettings.create(
        [
          {
            cashInFeeRate: 0.02, // 2%
            cashOutFeeRate: 0.02, // 2%
            commissionRate: 0.5, // 50%
            sendMoneyFee: 5, // 5 BDT fixed fee
            defaultDailyLimit: 50000,
            defaultMonthlyLimit: 500000,
            lastUpdatedBy: superAdmin._id,
          },
        ],
        { session }
      );
      console.log("System settings initialized");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Failed to create Super Admin:", error);
  } finally {
    session.endSession();
  }
};
export { seedSuperAdmin };
