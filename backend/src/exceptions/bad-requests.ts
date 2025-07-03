import { HttpException, ErrorCode } from "./root";

export class BadRequestException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.BAD_REQUEST,
    errors?: any
  ) {
    super(message, 400, errorCode, errors);
  }
}
