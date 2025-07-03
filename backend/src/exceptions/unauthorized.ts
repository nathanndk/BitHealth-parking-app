import { ErrorCode, HttpException } from "./root";

export class UnauthorizedException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.BAD_REQUEST,
    errors?: any
  ) {
    super(message, 404, errorCode, errors);
  }
}
