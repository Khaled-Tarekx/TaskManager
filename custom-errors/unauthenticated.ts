import {StatusCodes} from "http-status-codes";
import CustomError from "./custom-error.js";


class UnAuthenticated extends CustomError {
  statusCodes: number
  constructor(message: string) {
    super(message);
    this.statusCodes = StatusCodes.UNAUTHORIZED;
  }
}

export default UnAuthenticated;
