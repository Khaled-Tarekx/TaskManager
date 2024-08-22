import CustomError from '../custom-errors/custom-error';
import type { Request, Response } from 'express';

const ErrorHandler = (error: CustomError, _req: Request, res: Response) => {
	const statusCode = error.statusCode || 500;
	res.status(statusCode).json({ error: error.message });
};

export default ErrorHandler;
