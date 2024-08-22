import CustomError from '../custom-errors/custom-error';
import type { NextFunction, Request, Response } from 'express';

const ErrorHandler = (
	error: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const statusCode = error.statusCode || 500;
	res.status(statusCode).json({ error: error.message });
};

export default ErrorHandler;
