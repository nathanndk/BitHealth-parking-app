import { ErrorCode, HttpException } from "./root";
export class InternalException extends HttpException {
  constructor(message: string, errors: any, errorCode: ErrorCode) {
    super(message, 500, errorCode, errors);
    // Object.setPrototypeOf(this, new.target.prototype); // agar instanceof tetap bekerja
  }
}
