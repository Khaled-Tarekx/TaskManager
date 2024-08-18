import { CustomError } from '../custom-errors/main.js';
import type { Request, Response } from 'express';

const ErrorHandler = (error: CustomError, req: Request, res: Response) => {
	const statusCode = error.statusCode || 500;
	res.status(statusCode).json({ error: error.message });
};

export default ErrorHandler;
