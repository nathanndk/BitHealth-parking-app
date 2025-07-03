// src/controllers/reservation.test.ts
import { Request, Response, NextFunction } from "express";
import {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
} from "../controllers/reservation";
import { prismaClient } from "..";
import { BadRequestException } from "../exceptions/bad-requests";
import { NotFoundException } from "../exceptions/not-found";
import { UnauthorizedException } from "../exceptions/unauthorized";

// Mock Express objects with user
const mockRequest = (
  body: any = {},
  params: any = {},
  query: any = {},
  user: any = { id: 1, role: "USER" }
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

const prismaMock = prismaClient as any;

describe("Reservation Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const startTime = new Date("2025-07-01T14:00:00Z");
  const endTime = new Date("2025-07-01T16:00:00Z");

  // --- CREATE RESERVATION ---
  describe("createReservation", () => {
    it("should create a new reservation successfully", async () => {
      const req = mockRequest({
        parkingId: 1,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      const res = mockResponse();
      const parkingLot = { id: 1, name: "Lot A" };
      const newReservation = {
        id: 101,
        userId: 1,
        ParkingId: 1,
        startTime,
        endTime,
        status: "PENDING",
        paymentMethod: "CASH",
      };

      prismaMock.parking.findUnique.mockResolvedValue(parkingLot);
      prismaMock.reservation.findFirst.mockResolvedValue(null); // No conflicts
      prismaMock.reservation.create.mockResolvedValue(newReservation);

      await createReservation(req, res, mockNext);

      expect(prismaMock.parking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.reservation.findFirst).toHaveBeenCalled();
      expect(prismaMock.reservation.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          ParkingId: 1,
          startTime,
          endTime,
          paymentMethod: "CASH",
          status: "PENDING",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newReservation);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException for missing data", async () => {
      const req = mockRequest({ startTime: startTime.toISOString() }); // Missing parkingId, endTime
      const res = mockResponse();
      await createReservation(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it("should throw BadRequestException for invalid time", async () => {
      const req = mockRequest({
        parkingId: 1,
        startTime: endTime.toISOString(),
        endTime: startTime.toISOString(),
      }); // Start > End
      const res = mockResponse();
      await createReservation(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it("should throw NotFoundException if parking lot not found", async () => {
      const req = mockRequest({
        parkingId: 99,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      const res = mockResponse();
      prismaMock.parking.findUnique.mockResolvedValue(null);
      await createReservation(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundException));
    });

    it("should throw BadRequestException on reservation conflict", async () => {
      const req = mockRequest({
        parkingId: 1,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      const res = mockResponse();
      prismaMock.parking.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.reservation.findFirst.mockResolvedValue({ id: 100 }); // Conflict
      await createReservation(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            "The selected parking spot is already reserved for the chosen time range.",
        })
      );
    });
  });

  // --- GET MY RESERVATIONS ---
  describe("getMyReservations", () => {
    it("should return reservations for the logged-in user", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const reservations = [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 },
      ];

      prismaMock.reservation.findMany.mockResolvedValue(reservations);

      await getMyReservations(req, res, mockNext);

      expect(prismaMock.reservation.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(res.json).toHaveBeenCalledWith(reservations);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should filter reservations by status", async () => {
      const req = mockRequest({}, {}, { status: "PENDING" });
      const res = mockResponse();
      await getMyReservations(req, res, mockNext);
      expect(prismaMock.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1, status: "PENDING" } })
      );
    });

    it("should filter past reservations", async () => {
      const req = mockRequest({}, {}, { past: "true" });
      const res = mockResponse();
      await getMyReservations(req, res, mockNext);
      expect(prismaMock.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1, endTime: { lt: expect.any(Date) } },
        })
      );
    });
  });

  // --- GET RESERVATION BY ID ---
  describe("getReservationById", () => {
    const reservation = { id: 101, userId: 1 };

    it("should return a reservation if user is owner", async () => {
      const req = mockRequest({}, { id: "101" }, {}, { id: 1, role: "USER" });
      const res = mockResponse();

      prismaMock.reservation.findUnique.mockResolvedValue(reservation);

      await getReservationById(req, res, mockNext);

      expect(prismaMock.reservation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 101 } })
      );
      expect(res.json).toHaveBeenCalledWith(reservation);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return a reservation if user is officer", async () => {
      const req = mockRequest(
        {},
        { id: "101" },
        {},
        { id: 2, role: "OFFICER" }
      ); // Different user, but officer
      const res = mockResponse();

      prismaMock.reservation.findUnique.mockResolvedValue(reservation);

      await getReservationById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(reservation);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if user is not owner or officer", async () => {
      const req = mockRequest({}, { id: "101" }, {}, { id: 3, role: "USER" }); // Different user, not officer
      const res = mockResponse();

      prismaMock.reservation.findUnique.mockResolvedValue(reservation);

      await getReservationById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
    });

    it("should throw NotFoundException if reservation not found", async () => {
      const req = mockRequest({}, { id: "999" });
      const res = mockResponse();
      prismaMock.reservation.findUnique.mockResolvedValue(null);
      await getReservationById(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundException));
    });
  });

  // --- CANCEL RESERVATION ---
  describe("cancelReservation", () => {
    const reservation = {
      id: 101,
      userId: 1,
      status: "PENDING",
      startTime: new Date("2025-10-01T10:00:00Z"),
    };

    it("should cancel a reservation successfully by owner", async () => {
      const req = mockRequest({}, { id: "101" }, {}, { id: 1, role: "USER" });
      const res = mockResponse();
      const canceledReservation = { ...reservation, status: "CANCELED" };

      prismaMock.reservation.findUnique.mockResolvedValue(reservation);
      prismaMock.reservation.update.mockResolvedValue(canceledReservation);

      await cancelReservation(req, res, mockNext);

      expect(prismaMock.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 101 },
      });
      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: 101 },
        data: { status: "CANCELED" },
      });
      expect(res.json).toHaveBeenCalledWith(canceledReservation);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if user is not owner", async () => {
      const req = mockRequest({}, { id: "101" }, {}, { id: 2, role: "USER" }); // Different user
      const res = mockResponse();
      prismaMock.reservation.findUnique.mockResolvedValue(reservation);
      await cancelReservation(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
    });

    it("should throw BadRequestException if already canceled", async () => {
      const req = mockRequest({}, { id: "101" }, {}, { id: 1, role: "USER" });
      const res = mockResponse();
      prismaMock.reservation.findUnique.mockResolvedValue({
        ...reservation,
        status: "CANCELED",
      });
      await cancelReservation(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Reservation is already canceled." })
      );
    });
  });
});
