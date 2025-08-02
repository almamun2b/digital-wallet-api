import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { AppError } from "../helpers/appError";
import { Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { Wallet } from "../modules/wallet/wallet.model";
import { env } from "./env";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        // if (!user) {
        //   return done("User not found");
        // }

        const isGoogleAuthenticated = user.auths.some(
          (auth) => auth.provider === "google"
        );

        if (isGoogleAuthenticated && !user.password) {
          return done(null, false, {
            message: "Please login with google then you could set password",
          });
        }

        if (isGoogleAuthenticated) {
          return done(null, false, {
            message: "Please login with google",
          });
        }

        const isPasswordMatched = await bcrypt.compare(
          password,
          user.password as string
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password is incorrect" });
        }

        return done(null, user, { message: "Logged in successfully" });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "Email not found" });
        }
        let user = await User.findOne({ email });

        if (!user) {
          const walletNumber = `WALLET${Date.now()}${Math.floor(
            Math.random() * 1000
          )}`;

          const wallet = await Wallet.create({
            walletNumber,
            pin: await bcrypt.hash("1234", Number(env.BCRYPT_SALT_ROUNDS)), // Default PIN
          });

          if (!wallet) {
            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              "Wallet creation failed"
            );
          }

          user = await User.create({
            wallet: wallet._id,
            name: profile.displayName,
            email,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, user, { message: "Logged in successfully" });
      } catch (error) {
        console.log("Google Strategy error", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);
