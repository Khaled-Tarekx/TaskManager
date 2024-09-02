import CustomError from '../custom-errors/custom-error';
import {
	CastError,
	DuplicateFieldError,
	GlobalError,
	ValidationError,
} from './types';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';

const handleDuplicateFieldErrorDB = (err: DuplicateFieldError) => {
	const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)?.[0];
	const message = `Duplicate field value: ${value} please use another value`;
	return new CustomError(message, StatusCodes.BAD_REQUEST);
};

const handleCastErrorDB = (err: CastError) => {
	const message = `Invalid ${err.path} => ${err.value}`;
	return new CustomError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err: ValidationError) => {
	const errors = Object.values(err.errors).map((element) => element.message);
	const message = `Invalid input data ${errors}`;
	return new CustomError(message, StatusCodes.BAD_REQUEST);
};

const sendErrorForDev = (error: CustomError, res: Response) => {
	res.status(error.statusCode).json({
		status: error.statusCode,
		message: error.message,
		error,
		stack: error.stack,
	});
};

const sendErrorForProd = (error: CustomError, res: Response) => {
	res.status(error.statusCode).json({
		status: error.statusCode,
		message: error.message,
	});
};

const handleErrorProps = (err: unknown): err is GlobalError => {
	if (err && typeof err === 'object') {
		return 'code' in err;
	}
	return false;
};

const handleDBErrors = (err: unknown) => {
	if (err instanceof CustomError) {
		if (err.name === 'CastError') {
			const isGlobalError = handleErrorProps(err);
			if (isGlobalError) {
				handleCastErrorDB(err);
			}
		}
		if (err.code === 11000) {
			const isGlobalError = handleErrorProps(err);
			if (isGlobalError) {
				handleDuplicateFieldErrorDB(err);
			}
		}

		if (err.name === 'ValidationError') {
			const isGlobalError = handleErrorProps(err);
			if (isGlobalError) {
				handleValidationErrorDB(err);
			}
		}
	}
};

export { handleDBErrors, sendErrorForProd, sendErrorForDev };
