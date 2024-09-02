import type { NextFunction, Request, Response } from 'express';
import { GlobalError } from './types';
import { handleDBErrors, sendErrorForDev, sendErrorForProd } from './helpers';

const ErrorHandler = (
	error: GlobalError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	error.statusCode || 500;

	switch (process.env.NODE_ENV) {
		case 'development':
			sendErrorForDev(error, res);
			break;
		case 'production':
			handleDBErrors(error);
			sendErrorForProd(error, res);
			break;
	}
};

export default ErrorHandler;
