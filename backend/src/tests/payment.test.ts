// src/controllers/payment.test.ts
import { Request, Response, NextFunction } from "express";
import { listPendingPayments, confirmPayment } from "../controllers/payment";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-requests";

// Mock Express objects
const mockRequest = (body: any = {}, params: any = {}, query: any = {}) =>
  ({
    body,
    params,
    query,
  } as Request);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

const prismaMock = prismaClient as any;

describe("Payment Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- LIST PENDING PAYMENTS ---
  describe("listPendingPayments", () => {
    it("should return a list of pending cash payments", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const pending = [
        { id: 1, paymentMethod: "CASH", status: "PENDING" },
        { id: 2, paymentMethod: "CASH", status: "PENDING" },
      ];

      prismaMock.reservation.findMany.mockResolvedValue(pending);

      await listPendingPayments(req, res, mockNext);

      expect(prismaMock.reservation.findMany).toHaveBeenCalledWith({
        where: { paymentMethod: "CASH", status: "PENDING" },
      });
      expect(res.json).toHaveBeenCalledWith(pending);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // --- CONFIRM PAYMENT ---
  describe("confirmPayment", () => {
    it("should confirm a cash payment", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      const reservation = { id: 1, paymentMethod: "CASH", status: "PENDING" };
      const updated = { id: 1, paymentMethod: "CASH", status: "CONFIRMED" };

      prismaMock.reservation.findUnique.mockResolvedValue(reservation);
      prismaMock.reservation.update.mockResolvedValue(updated);

      await confirmPayment(req, res, mockNext);

      expect(prismaMock.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: "CONFIRMED" },
      });
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if reservation not found", async () => {
      const req = mockRequest({}, { id: "99" });
      const res = mockResponse();

      prismaMock.reservation.findUnique.mockResolvedValue(null);

      await confirmPayment(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundException));
    });

    it("should throw BadRequestException if reservation is not eligible", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      const reservation = { id: 1, paymentMethod: "CARD", status: "CONFIRMED" };

      prismaMock.reservation.findUnique.mockResolvedValue(reservation);

      await confirmPayment(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
    });
  });
});
