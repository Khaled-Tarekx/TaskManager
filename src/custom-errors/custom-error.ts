class CustomError extends Error {
	statusCode: number;
	code?: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
	}
}
export default CustomError;
