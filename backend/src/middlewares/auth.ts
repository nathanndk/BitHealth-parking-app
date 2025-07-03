import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { prismaClient } from "..";

// 1. Definisikan interface untuk payload JWT Anda
interface JWTPayload {
  userId: number; // Atau string, sesuaikan dengan tipe ID user Anda
  // Tambahkan field lain jika ada (misal: role, iat, exp)
  iat: number;
  exp: number;
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // 1. Cek header: harus ada dan harus dimulai dengan 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new UnauthorizedException(
        "Authorization header missing or malformed", // Pesan lebih jelas
        ErrorCode.UNAUTHORIZED
      )
    );
  }

  // 2. Ekstrak token dengan memisahkan 'Bearer '
  const token = authHeader.split(' ')[1];

  // Pastikan token ada setelah split
  if (!token) {
    return next(
      new UnauthorizedException(
        "Token not found after 'Bearer '",
        ErrorCode.UNAUTHORIZED
      )
    );
  }

  try {
    // 3. Verifikasi token (hanya tokennya)
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // 4. Dapatkan user dari payload
    const user = await prismaClient.user.findFirst({
      where: { id: payload.userId },
    });

    if (!user) {
      return next(
        new UnauthorizedException("User not found", ErrorCode.UNAUTHORIZED)
      );
    }

    // 5. Attach user ke request
    req.user = user;
    next();
  } catch (error) {
    // 6. Tangani error verifikasi (token tidak valid, expired, dll)
    console.error("JWT Verification Error:", error); // Tambah log untuk debug
    return next(
      new UnauthorizedException(
        "Invalid or expired token", // Pesan lebih jelas
        ErrorCode.UNAUTHORIZED
      )
    );
  }
};

export default authMiddleware;