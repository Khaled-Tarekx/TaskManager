import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error';

class ResourceGone extends CustomError {
	constructor(message: string) {
		super(message, StatusCodes.GONE);
	}
}

export default ResourceGone;
