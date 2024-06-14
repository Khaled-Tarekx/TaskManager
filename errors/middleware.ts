import { CustomError } from "../custom-errors/main.js";
import { Request, Response, NextFunction } from "express";

const ErrorHandler = (err: CustomError , req: Request , res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500
  res.status(statusCode)
  .json({ error: err.message });
  next()
};

export default ErrorHandler;
