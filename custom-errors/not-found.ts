import {StatusCodes} from "http-status-codes";
import CustomError from "./custom-error.js";

class NotFound extends CustomError {
  statusCodes: number
  
  constructor(message: string) {
    super(message);
    this.statusCodes = StatusCodes.NOT_FOUND;
  }
}

export default NotFound;
