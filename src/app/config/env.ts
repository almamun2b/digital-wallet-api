import dotenv from "dotenv";

interface Env {
  NODE_ENV: "development" | "production";
  PORT: string;
  DB_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;
  BCRYPT_SALT_ROUNDS: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  PASSPORT_SECRET: string;
  EXPRESS_SESSION_SECRET: string;
  FRONTEND_URL: string;
}

dotenv.config();

const getEnvVar = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} is required but was not provided`
    );
  }
  return value;
};

const env: Env = {
  NODE_ENV: getEnvVar("NODE_ENV") as "development" | "production",
  PORT: getEnvVar("PORT"),
  DB_URL: getEnvVar("DB_URL"),
  JWT_ACCESS_SECRET: getEnvVar("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRATION: getEnvVar("JWT_ACCESS_EXPIRATION"),
  JWT_REFRESH_SECRET: getEnvVar("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRATION: getEnvVar("JWT_REFRESH_EXPIRATION"),
  BCRYPT_SALT_ROUNDS: getEnvVar("BCRYPT_SALT_ROUNDS"),
  SUPER_ADMIN_EMAIL: getEnvVar("SUPER_ADMIN_EMAIL"),
  SUPER_ADMIN_PASSWORD: getEnvVar("SUPER_ADMIN_PASSWORD"),
  GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnvVar("GOOGLE_CALLBACK_URL"),
  PASSPORT_SECRET: getEnvVar("PASSPORT_SECRET"),
  EXPRESS_SESSION_SECRET: getEnvVar("EXPRESS_SESSION_SECRET"),
  FRONTEND_URL: getEnvVar("FRONTEND_URL"),
};

export { env };
