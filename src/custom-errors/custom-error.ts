class CustomError extends Error {
	statusCode: number;
	code?: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
	toJSON() {
		return {
			message: this.message,
			statusCode: this.statusCode,
			name: this.name,
			code: this.code,
		};
	}
}

export default CustomError;
