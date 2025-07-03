import { Router } from "express";
import { errorHandler } from "../error-handler";
import {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation
} from "../controllers/reservation";
import authMiddleware from "../middlewares/auth";
import officerMiddleware from "../middlewares/officer";

const reservationRoutes = Router();

// Create a reservation (USER)
reservationRoutes.post(
  "/",
  authMiddleware,
  errorHandler(createReservation)
);

// Get all my reservations (USER)
reservationRoutes.get(
  "/",
  authMiddleware,
  errorHandler(getMyReservations)
);

// Get a reservation by ID (OWNER or OFFICER)
reservationRoutes.get(
  "/:id",
  authMiddleware,
  officerMiddleware,
  errorHandler(getReservationById)
);

// Cancel a reservation (OWNER)
reservationRoutes.patch(
  "/:id/cancel",
  authMiddleware,
  errorHandler(cancelReservation)
);

export default reservationRoutes;
