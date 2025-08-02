import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import { env } from "./app/config/env";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app: Application = express();

app.use(
  expressSession({
    secret: env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", async (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "Welcome to the Digital Wallet API!",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;

// app -> router matching -> controller -> service -> model -> database
