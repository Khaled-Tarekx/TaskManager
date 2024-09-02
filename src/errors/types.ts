import CustomError from '../custom-errors/custom-error';

interface CastError extends CustomError {
	path: string;
	value: string;
}

interface DuplicateFieldError extends CustomError {
	errmsg: string;
}

interface ValidationError extends CustomError {
	errors: {
		[key: string]: {
			message: string;
		};
	};
}

interface GlobalError extends CustomError {
	path: string;
	value: string;
	code: number;
	errors: {
		[key: string]: {
			message: string;
		};
	};
	errmsg: string;
}

export type { CastError, DuplicateFieldError, ValidationError, GlobalError };
