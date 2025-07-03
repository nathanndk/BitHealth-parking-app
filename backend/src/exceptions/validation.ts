import { ErrorCode, HttpException } from "./root";

export class UnprocessableEntity extends HttpException {
  constructor(error: any, message: string, errorCode: ErrorCode) {
    super(message, 404, errorCode, error);
  }
}
