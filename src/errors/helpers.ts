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
	return res.status(error.statusCode).json({
		status: error.statusCode,
		message: error.message,
		error,
		stack: error.stack,
	});
};

const sendErrorForProd = (error: CustomError, res: Response) => {
	return res.status(error.statusCode).json({
		status: error.statusCode,
		message: error.message,
	});
};

export const isDBError = (err: GlobalError): boolean => {
	return (
		err.name === 'CastError' ||
		err.code === 11000 ||
		err.name === 'ValidationError'
	);
};

const handleDBErrors = (err: GlobalError) => {
	if (err.name === 'CastError') {
		return handleCastErrorDB(err);
	} else if (err.code === 11000) {
		return handleDuplicateFieldErrorDB(err);
	} else if (err.name === 'ValidationError') {
		return handleValidationErrorDB(err);
	} else {
		return null;
	}
};

export { handleDBErrors, sendErrorForProd, sendErrorForDev };
