import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res
    .status(httpStatus.NOT_FOUND)
    .json({ success: false, message: "Route not found!" });
  next();
};

export { notFound };
