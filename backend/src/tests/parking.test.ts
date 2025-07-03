// src/controllers/parking.test.ts
import { Request, Response, NextFunction } from "express";
import {
  createParking,
  getAllParkings,
  getAvailableParking,
  getParkingById,
  updateParking,
  deleteParking,
} from "../controllers/parking";
import { prismaClient } from "..";
import { BadRequestException } from "../exceptions/bad-requests";
import { NotFoundException } from "../exceptions/not-found";

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

describe("Parking Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- CREATE PARKING ---
  describe("createParking", () => {
    it("should create a new parking lot", async () => {
      const req = mockRequest({
        name: "Lot A",
        location: "Main Street",
        capacity: "100",
      });
      const res = mockResponse();
      const newLot = {
        id: 1,
        name: "Lot A",
        location: "Main Street",
        capacity: 100,
      };

      prismaMock.parking.create.mockResolvedValue(newLot);

      await createParking(req, res, mockNext);

      expect(prismaMock.parking.create).toHaveBeenCalledWith({
        data: { name: "Lot A", location: "Main Street", capacity: 100 },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newLot);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if required fields are missing", async () => {
      const req = mockRequest({ name: "Lot A" }); // Missing location and capacity
      const res = mockResponse();

      await createParking(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
    });
  });

  // --- GET ALL PARKINGS ---
  describe("getAllParkings", () => {
    it("should return all parking lots", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const lots = [
        { id: 1, name: "Lot A" },
        { id: 2, name: "Lot B" },
      ];

      prismaMock.parking.findMany.mockResolvedValue(lots);

      await getAllParkings(req, res, mockNext);

      expect(prismaMock.parking.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(lots);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // --- GET AVAILABLE PARKING ---
  describe("getAvailableParking", () => {
    const startTime = new Date("2025-06-01T10:00:00Z").toISOString();
    const endTime = new Date("2025-06-01T12:00:00Z").toISOString();

    it("should return available parking lots", async () => {
      const req = mockRequest({}, {}, { startTime, endTime });
      const res = mockResponse();
      const reserved = [{ ParkingId: 1 }];
      const available = [{ id: 2, name: "Lot B" }];

      prismaMock.reservation.findMany.mockResolvedValue(reserved);
      prismaMock.parking.findMany.mockResolvedValue(available);

      await getAvailableParking(req, res, mockNext);

      expect(prismaMock.reservation.findMany).toHaveBeenCalled();
      expect(prismaMock.parking.findMany).toHaveBeenCalledWith({
        where: { id: { notIn: [1] } },
      });
      expect(res.json).toHaveBeenCalledWith(available);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if time params are missing", async () => {
      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await getAvailableParking(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
    });

    it("should throw BadRequestException if time params are invalid", async () => {
      const req = mockRequest(
        {},
        {},
        { startTime: "invalid", endTime: "invalid" }
      );
      const res = mockResponse();

      await getAvailableParking(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestException));
    });
  });

  // --- GET PARKING BY ID ---
  describe("getParkingById", () => {
    it("should return a parking lot by ID", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      const lot = { id: 1, name: "Lot A" };

      prismaMock.parking.findUnique.mockResolvedValue(lot);

      await getParkingById(req, res, mockNext);

      expect(prismaMock.parking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.json).toHaveBeenCalledWith(lot);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if lot not found", async () => {
      const req = mockRequest({}, { id: "99" });
      const res = mockResponse();

      prismaMock.parking.findUnique.mockResolvedValue(null);

      await getParkingById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundException));
    });
  });

  // --- UPDATE PARKING ---
  describe("updateParking", () => {
    it("should update a parking lot", async () => {
      const req = mockRequest({ name: "Lot A Updated" }, { id: "1" });
      const res = mockResponse();
      const updatedLot = { id: 1, name: "Lot A Updated" };

      prismaMock.parking.update.mockResolvedValue(updatedLot);

      await updateParking(req, res, mockNext);

      expect(prismaMock.parking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Lot A Updated" },
      });
      expect(res.json).toHaveBeenCalledWith(updatedLot);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // --- DELETE PARKING ---
  describe("deleteParking", () => {
    it("should delete a parking lot", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      prismaMock.parking.delete.mockResolvedValue({ id: 1 });

      await deleteParking(req, res, mockNext);

      expect(prismaMock.parking.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
