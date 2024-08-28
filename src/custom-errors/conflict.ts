import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error';

class Conflict extends CustomError {
	constructor(message: string) {
		super(message, StatusCodes.CONFLICT);
	}
}

export default Conflict;
