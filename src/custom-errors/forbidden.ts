import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error';

class Forbidden extends CustomError {
	constructor(message: string) {
		super(message, StatusCodes.FORBIDDEN);
	}
}

export default Forbidden;
