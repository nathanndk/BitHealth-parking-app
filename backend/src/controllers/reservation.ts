import { Request, Response, NextFunction } from "express";
import { prismaClient } from "..";
import { BadRequestException } from "../exceptions/bad-requests";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";

// Definisikan interface untuk pengguna yang terautentikasi
// Ini harus cocok dengan apa yang Anda attach ke `req.user` di `authMiddleware`
interface AuthenticatedUser {
  id: number; // Atau tipe ID user Anda (misalnya string)
  role?: string; // Tambahkan role jika Anda menggunakannya untuk RBAC
  // Properti lain yang mungkin ada di objek user Anda
}

// Helper function untuk memastikan req.user ada dan memiliki id
const getAuthenticatedUserId = (req: Request): number => {
  const user = req.user as AuthenticatedUser;
  if (!user || typeof user.id === "undefined") {
    // Ini seharusnya ditangani oleh authMiddleware, tapi sebagai fallback
    throw new UnauthorizedException(
      "User not authenticated or user ID is missing.",
      ErrorCode.UNAUTHORIZED
    );
  }
  return Number(user.id); // Pastikan dikonversi ke Number jika ID di DB adalah integer
};

// Create a new reservation (default paymentMethod = CASH)
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ambil userId dari pengguna yang terautentikasi, bukan dari body request
    const authenticatedUserId = getAuthenticatedUserId(req);

    // Ambil field lain dari body
    const { parkingId, startTime, endTime, paymentMethod } = req.body;

    // Validasi input yang tersisa
    if (parkingId == null || !startTime || !endTime) {
      // userId tidak lagi dicek dari body
      throw new BadRequestException(
        "parkingId, startTime, and endTime are required",
        ErrorCode.BAD_REQUEST
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException(
        "Invalid startTime or endTime. Start time must be before end time.",
        ErrorCode.BAD_REQUEST
      );
    }

    // Ensure parking lot exists
    const parkingLot = await prismaClient.parking.findUnique({
      where: { id: Number(parkingId) },
    });
    if (!parkingLot) {
      throw new NotFoundException(
        "Parking lot not found",
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // Check for overlapping reservations for the specific parking spot
    const conflictingReservation = await prismaClient.reservation.findFirst({
      where: {
        ParkingId: Number(parkingId),
        status: { notIn: ["CANCELED"] }, // Hanya cek konflik dengan reservasi yang tidak dibatalkan
        AND: [
          { startTime: { lt: end } }, // Reservasi yang ada dimulai sebelum waktu akhir baru
          { endTime: { gt: start } }, // dan berakhir setelah waktu mulai baru
        ],
      },
    });

    if (conflictingReservation) {
      throw new BadRequestException(
        "The selected parking spot is already reserved for the chosen time range.",
        ErrorCode.RESERVATION_CONFLICT
      );
    }

    const reservation = await prismaClient.reservation.create({
      data: {
        userId: authenticatedUserId, // Gunakan ID pengguna yang terautentikasi
        ParkingId: Number(parkingId),
        startTime: start,
        endTime: end,
        paymentMethod: paymentMethod || "CASH", // Default ke CASH jika tidak disediakan
        status: "PENDING", // Status awal reservasi
      },
    });

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};

// Get all reservations of the currently logged-in user
export const getMyReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedUserId = getAuthenticatedUserId(req);

    const { status, past } = req.query;
    const whereClause: any = { userId: authenticatedUserId };

    if (status && typeof status === "string") {
      whereClause.status = status.toUpperCase(); // Normalisasi status ke uppercase
    }

    if (past === "true") {
      whereClause.endTime = { lt: new Date() };
    } else if (past === "false") {
      whereClause.endTime = { gte: new Date() };
    }
    // Jika 'past' tidak didefinisikan, tampilkan semua (current dan past)

    const reservations = await prismaClient.reservation.findMany({
      where: whereClause,
      include: {
        Parking: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        startTime: "desc", // Urutkan berdasarkan waktu mulai, terbaru dulu
      },
    });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

// Get a single reservation by ID (accessible by OWNER or OFFICER)
export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedUser = req.user as AuthenticatedUser; // Asumsi authMiddleware menempelkan user
    const reservationId = Number(req.params.id);

    if (isNaN(reservationId)) {
      throw new BadRequestException(
        "Invalid reservation ID format.",
        ErrorCode.BAD_REQUEST
      );
    }

    const reservation = await prismaClient.reservation.findUnique({
      where: { id: reservationId },
      include: {
        // Sertakan detail parkir dan pengguna jika perlu
        Parking: true,
        user: {
          select: { id: true, username: true }, // Hanya pilih field yang aman
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(
        "Reservation not found",
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // Periksa hak akses: pemilik reservasi atau officer
    if (
      reservation.userId !== authenticatedUser.id &&
      authenticatedUser.role !== "OFFICER" // Pastikan 'OFFICER' adalah string yang benar untuk peran
    ) {
      throw new UnauthorizedException(
        "You are not authorized to view this reservation.",
        ErrorCode.UNAUTHORIZED // Atau NotFoundException agar tidak membocorkan keberadaan reservasi
      );
    }

    res.json(reservation);
  } catch (err) {
    next(err);
  }
};

// Cancel a reservation (accessible by OWNER of the reservation)
export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedUserId = getAuthenticatedUserId(req);
    const reservationId = Number(req.params.id);

    if (isNaN(reservationId)) {
      throw new BadRequestException(
        "Invalid reservation ID format.",
        ErrorCode.BAD_REQUEST
      );
    }

    const reservation = await prismaClient.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(
        "Reservation not found",
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // Periksa hak akses: hanya pemilik reservasi yang boleh membatalkan
    // Jika officer juga boleh, tambahkan kondisi: || (req.user as AuthenticatedUser).role === "OFFICER"
    if (reservation.userId !== authenticatedUserId) {
      throw new UnauthorizedException(
        "You are not authorized to cancel this reservation.",
        ErrorCode.UNAUTHORIZED // Atau NotFoundException
      );
    }

    // Logika tambahan: Mungkin ada batasan kapan reservasi bisa dibatalkan
    // Misalnya, tidak bisa dibatalkan jika sudah terlalu dekat dengan startTime
    // Atau jika statusnya bukan PENDING/CONFIRMED
    if (reservation.status === "CANCELED") {
      throw new BadRequestException(
        "Reservation is already canceled.",
        ErrorCode.ALREADY_CANCELED
      );
    }
    if (
      reservation.status !== "PENDING" &&
      reservation.status !== "CONFIRMED"
    ) {
      throw new BadRequestException(
        `Cannot cancel reservation with status: ${reservation.status}.`,
        ErrorCode.INVALID_STATUS_FOR_ACTION
      );
    }
    // Contoh: Tidak bisa cancel jika kurang dari 1 jam sebelum mulai
    // const oneHourBeforeStart = new Date(reservation.startTime.getTime() - (60 * 60 * 1000));
    // if (new Date() > oneHourBeforeStart) {
    //     throw new BadRequestException("Reservation cannot be canceled less than 1 hour before start time.", ErrorCode.CANCELLATION_PERIOD_EXPIRED);
    // }

    const updatedReservation = await prismaClient.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELED" },
    });

    res.json(updatedReservation);
  } catch (err) {
    next(err);
  }
};
