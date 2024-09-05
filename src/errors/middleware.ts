import type { NextFunction, Request, Response } from 'express';
import { GlobalError } from './types';
import { handleDBErrors, sendErrorForDev, sendErrorForProd } from './helpers';
import CustomError from '../custom-errors/custom-error';

const ErrorHandler = (
	error: GlobalError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	error.statusCode || 500;

	res.status(error.statuscodes).json({
		message: error.message,
		statusCode: error.statuscodes,
	});

	// if (process.env.NODE_ENV === 'development') {
	// 	return sendErrorForDev(error, res);
	// } else if (process.env.NODE_ENV === 'production') {
	// 	handleDBErrors(error);
	// 	return sendErrorForProd(error, res);
	// }
};

export default ErrorHandler;
