import mongoose from "mongoose";
import {
  TErrorSources,
  TGenericErrorResponse,
} from "../interfaces/error.types";

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const matchedArray = error.message?.match(/"([^"]*)"/) || [];

  return {
    statusCode: 400,
    message: `${matchedArray[1]} already exists!`,
  };
};

const handleCastError = (
  error: mongoose.Error.CastError
): TGenericErrorResponse => {
  console.log(error);
  return {
    statusCode: 400,
    message: "Invalid mongoose ID!",
  };
};

const handleValidationError = (
  error: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];
  const errors = Object.values(error.errors);

  errors.forEach((errorObj: any) => {
    errorSources.push({
      path: errorObj.path,
      message: errorObj.message,
    });
  });
  return {
    statusCode: 400,
    message: "Validation Error!",
    errorSources,
  };
};

const handleZodError = (error: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];
  error.issues.forEach((issue: any) => {
    errorSources.push({
      path: issue.path[issue.path.length - 1],
      // path:
      //   issue.path.length > 1
      //     ? issue.path.reverse().join(" inside ")
      //     : issue.path[0],
      message: issue.message,
    });
  });
  return {
    statusCode: 400,
    message: "Zod Error!",
    errorSources,
  };
};

export {
  handleCastError,
  handleDuplicateError,
  handleValidationError,
  handleZodError,
};
