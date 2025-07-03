// src/controllers/auth.test.ts
import { Request, Response, NextFunction } from "express";
import { signup, login, me } from "../controllers/auth";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { BadRequestException } from "../exceptions/bad-requests";
import { UnprocessableEntity } from "../exceptions/validation";
import { SignUpSchema } from "../schema/user";
import { Role } from "../generated/prisma";

// Mock Express objects
const mockRequest = (
  body: any = {},
  params: any = {},
  query: any = {},
  user: any = undefined
) =>
  ({
    body,
    params,
    query,
    user,
  } as Request);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

// Mock PrismaClient (DeepMockProxy akan menangani ini)
const prismaMock = prismaClient as any;

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Hapus mock sebelum setiap tes
    SignUpSchema.parse = jest.fn().mockImplementation((data) => data); // Mock Zod
  });

  // --- SIGNUP ---
  describe("signup", () => {
    it("should create a new user successfully", async () => {
      const req = mockRequest({
        username: "testuser",
        password: "password123",
        role: "USER",
      });
      const res = mockResponse();
      const newUser = {
        id: 1,
        username: "testuser",
        password: "hashed_password123",
        role: Role.USER,
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(newUser);
      (hashSync as jest.Mock).mockReturnValue("hashed_password123");

      await signup(req, res, mockNext);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          username: "testuser",
          password: "hashed_password123",
          role: "USER",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return BadRequestException if user already exists", async () => {
      const req = mockRequest({
        username: "existinguser",
        password: "password123",
      });
      const res = mockResponse();

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        username: "existinguser",
      });

      await signup(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: "User already exists" })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return UnprocessableEntity on Zod validation error", async () => {
      const req = mockRequest({ username: "test" }); // Missing password
      const res = mockResponse();
      const zodError = {
        name: "ZodError",
        issues: [{ message: "Password is required" }],
      };
      (SignUpSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });

      await signup(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnprocessableEntity));
    });
  });

  // --- LOGIN ---
  describe("login", () => {
    it("should login a user and return a token", async () => {
      const req = mockRequest({
        username: "testuser",
        password: "password123",
      });
      const res = mockResponse();
      const user = {
        id: 1,
        username: "testuser",
        password: "hashed_password123",
        role: Role.USER,
      };

      prismaMock.user.findFirst.mockResolvedValue(user);
      (compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("test_token");

      await login(req, res, mockNext);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
      expect(compareSync).toHaveBeenCalledWith("password123", user.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id },
        expect.any(String)
      ); // Assuming JWT_SECRET is defined
      expect(res.json).toHaveBeenCalledWith({
        user: { id: user.id, username: user.username, role: user.role },
        token: "test_token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 404 if user not found", async () => {
      const req = mockRequest({ username: "nouser", password: "password123" });
      const res = mockResponse();

      prismaMock.user.findFirst.mockResolvedValue(null);

      await login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if password is a invalid", async () => {
      const req = mockRequest({
        username: "testuser",
        password: "wrongpassword",
      });
      const res = mockResponse();
      const user = {
        id: 1,
        username: "testuser",
        password: "hashed_password123",
        role: Role.USER,
      };

      prismaMock.user.findFirst.mockResolvedValue(user);
      (compareSync as jest.Mock).mockReturnValue(false);

      await login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // --- ME ---
  describe("me", () => {
    it("should return the logged in user", async () => {
      const user = { id: 1, username: "testuser", role: "USER" };
      const req = mockRequest({}, {}, {}, user);
      const res = mockResponse();

      await me(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
    });
  });
});
