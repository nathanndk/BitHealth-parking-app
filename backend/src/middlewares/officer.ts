import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

const officerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user.role == "OFFICER") {
    next();
  } else {
    next(
      new UnauthorizedException(
        "You are not authorized to access this resource",
        ErrorCode.UNAUTHORIZED
      )
    );
  }
};
export default officerMiddleware;
