import { Request, Response, NextFunction } from "express";
import { prismaClient } from "..";
import { BadRequestException } from "../exceptions/bad-requests";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

// Create a new parking lot
export const createParking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, location, capacity } = req.body;
    if (!name || !location || capacity == null) {
      throw new BadRequestException(
        "name, location, and capacity are required",
        ErrorCode.BAD_REQUEST
      );
    }
    const lot = await prismaClient.parking.create({
      data: { name, location, capacity: Number(capacity) }
    });
    res.status(201).json(lot);
  } catch (err) {
    next(err);
  }
};

// Get all parking lots
export const getAllParkings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lots = await prismaClient.parking.findMany();
    res.json(lots);
  } catch (err) {
    next(err);
  }
};

// Get available parking lots within a time range
export const getAvailableParking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      throw new BadRequestException(
        "startTime and endTime are required",
        ErrorCode.BAD_REQUEST
      );
    }
    const start = new Date(startTime as string);
    const end = new Date(endTime as string);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        "Invalid date format",
        ErrorCode.BAD_REQUEST
      );
    }
    const reserved = await prismaClient.reservation.findMany({
      where: {
        AND: [
          { startTime: { lt: end } },
          { endTime:   { gt: start } }
        ]
      },
      select: { ParkingId: true }
    });
    const reservedIds = reserved.map(r => r.ParkingId);
    const available = await prismaClient.parking.findMany({
      where: { id: { notIn: reservedIds } }
    });
    res.json(available);
  } catch (err) {
    next(err);
  }
};

// Get a single parking lot by ID
export const getParkingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const lot = await prismaClient.parking.findUnique({ where: { id } });
    if (!lot) {
      throw new NotFoundException(
        "Parking lot not found",
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
    res.json(lot);
  } catch (err) {
    next(err);
  }
};

// Update a parking lot
export const updateParking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { name, location, capacity } = req.body;
    const data: Partial<{ name: string; location: string; capacity: number }> = {};
    if (name)     data.name     = name;
    if (location) data.location = location;
    if (capacity != null) data.capacity = Number(capacity);
    const lot = await prismaClient.parking.update({ where: { id }, data });
    res.json(lot);
  } catch (err) {
    next(err);
  }
};

// Delete a parking lot
export const deleteParking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    await prismaClient.parking.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
