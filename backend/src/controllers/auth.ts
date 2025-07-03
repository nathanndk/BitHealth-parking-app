import { NextFunction, Request, Response } from "express";
import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntity } from "../exceptions/validation";
import { SignUpSchema } from "../schema/user";
import { NotFoundException } from "../exceptions/not-found";
import { Role } from "../generated/prisma";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validasi body
    SignUpSchema.parse(req.body);
    const { username, password, role } = req.body;

    // cek duplikasi username
    const exists = await prismaClient.user.findUnique({
      where: { username },
    });
    if (exists) {
      return next(
        new BadRequestException(
          "User already exists",
          ErrorCode.USER_ALREADY_EXISTS
        )
      );
    }

    // buat user baru dengan role
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashSync(password, 10),
        role: (role as Role) ?? Role.USER,
      },
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return next(
        new UnprocessableEntity(
          err.issues,
          "Validation failed",
          ErrorCode.UNPROCESSABLE_ENTITY
        )
      );
    }
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    const user = await prismaClient.user.findFirst({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!compareSync(password, user.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// /me -> return logged in user
export const me = async (req: Request, res: Response) => {
  res.json(req.user);
};
