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

const handleErrorProps = (err: Partial<GlobalError>): GlobalError => {
	return {
		...err,
		path: err.path || '',
		value: err.value || '',
		name: err.name || '',
		code: err.code || 500,
		errors: err.errors || {},
		statusCode: err.statusCode || 500,
		message: err.message || 'An unknown error occurred',
		errmsg: err.errmsg || 'db error msg',
	};
};

const handleDBErrors = (err: GlobalError) => {
	if (err.name === 'CastError') {
		err = handleErrorProps(err);
		handleCastErrorDB(err);
	}
	if (err.code === 11000) {
		err = handleErrorProps(err);
		handleDuplicateFieldErrorDB(err);
	}

	if (err.name === 'ValidationError') {
		err = handleErrorProps(err);
		handleValidationErrorDB(err);
	}
};

export { handleDBErrors, sendErrorForProd, sendErrorForDev };
