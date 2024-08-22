import {StatusCodes} from "http-status-codes";
import CustomError from "./custom-error.js";


class UnAuthenticated extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
   
  }
}

export default UnAuthenticated;
