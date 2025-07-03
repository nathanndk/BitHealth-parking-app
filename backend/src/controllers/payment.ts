import { Request, Response, NextFunction } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";

// List all pending "Pay by Cash" reservations
export const listPendingPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pending = await prismaClient.reservation.findMany({
      where: {
        paymentMethod: "CASH",
        status: "PENDING"
      }
    });
    res.json(pending);
  } catch (err) {
    next(err);
  }
};

// Confirm a cash payment (set status to CONFIRMED)
export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const reservation = await prismaClient.reservation.findUnique({
      where: { id }
    });
    if (!reservation) {
      throw new NotFoundException(
        "Reservation not found",
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }
    if (reservation.paymentMethod !== "CASH" || reservation.status !== "PENDING") {
      throw new BadRequestException(
        "Reservation not eligible for confirmation",
        ErrorCode.BAD_REQUEST
      );
    }
    const updated = await prismaClient.reservation.update({
      where: { id },
      data: { status: "CONFIRMED" }
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
