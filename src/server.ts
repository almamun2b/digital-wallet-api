import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { env } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(env.DB_URL);
    console.log("Connected to MongoDB Database");

    server = app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server error:", error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

// Server error handlers
const exitHandler = () => {
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unhandledRejectionError = (error: Error) => {
  console.info(
    "Unhandled rejection detected! Server is shutting down...",
    error
  );
  exitHandler();
};

const uncaughtExceptionError = (error: Error) => {
  console.info(
    "Uncaught exception detected! Server is shutting down...",
    error
  );
  exitHandler();
};

const sigtermReceived = () => {
  console.log("SIGTERM signal received! Server is shutting down...");
  exitHandler();
};

const sigintReceived = () => {
  console.log("SIGINT signal received! Server is shutting down...");
  exitHandler();
};

process.on("unhandledRejection", unhandledRejectionError);
process.on("uncaughtException", uncaughtExceptionError);
process.on("SIGTERM", sigtermReceived);
process.on("SIGINT", sigintReceived);

// Promise.reject(new Error("Promise Rejected"));
// throw new Error("Uncaught Exception in local");
