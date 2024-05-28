import {StatusCodes} from "http-status-codes";
import { Request, Response, NextFunction } from "express";

const ErrorHandler = (err: Error , req: Request , res: Response, next: NextFunction) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  res.json({ error: err.message });
  next()
};

export default ErrorHandler;
