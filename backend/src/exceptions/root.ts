export class HttpException extends Error {
  statusCode: number;
  errorCode: ErrorCode;
  errors?: any; // detail error, bisa optional

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    errors?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // agar instanceof tetap bekerja
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export enum ErrorCode {
  // Existing User Errors
  USER_NOT_FOUND = "1001",
  USER_ALREADY_EXISTS = "1002", // Note: Original was number, changed to string for consistency
  INVALID_CREDENTIALS = "1003",

  // Existing General Errors
  UNPROCESSABLE_ENTITY = "201", // Note: Original was number, changed to string for consistency
  INTERNAL_EXCEPTION = "301", // Note: Original was number, changed to string for consistency
  RESOURCE_NOT_FOUND = "404", // Note: Original was number, changed to string for consistency
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "401", // Note: Original was number, changed to string for consistency
  FORBIDDEN = "FORBIDDEN",

  // New Reservation Specific Errors (from reservation_controller_final_revised)
  RESERVATION_CONFLICT = "2001",
  ALREADY_CANCELED = "2002",
  INVALID_STATUS_FOR_ACTION = "2003",
  CANCELLATION_PERIOD_EXPIRED = "2004", // From commented out logic, good to have
}
