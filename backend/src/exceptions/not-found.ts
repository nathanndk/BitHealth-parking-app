// src/exceptions/BadRequestException.ts
import { HttpException, ErrorCode } from "./root";

export class NotFoundException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.BAD_REQUEST,
    errors?: any
  ) {
    super(message, 404, errorCode, errors);
  }
}
