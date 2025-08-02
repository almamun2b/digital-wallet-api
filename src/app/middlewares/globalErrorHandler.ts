import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "../helpers/appError";
import {
  handleCastError,
  handleDuplicateError,
  handleValidationError,
  handleZodError,
} from "../helpers/error.helpers";
import { TErrorSources } from "../interfaces/error.types";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (env.NODE_ENV === "development") {
    console.log(error);
  }
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources[] = [];
  if (error.code === 11000) {
    const simplifiedError = handleDuplicateError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (error.name === "CastError") {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (error.name === "ValidationError") {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources!;
  } else if (error.name === "ZodError") {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources!;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    statusCode = 500;
    message = error.message;
  }

  res.status(statusCode).send({
    success: false,
    message: message,
    errorSources,
    error: env.NODE_ENV === "development" ? error : null,
    stack: env.NODE_ENV === "development" ? error.stack : null,
  });
};

export { globalErrorHandler };
