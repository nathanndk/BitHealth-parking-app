import { Router } from "express";
import { errorHandler } from "../error-handler";
import {
  createParking,
  getAllParkings,
  getAvailableParking,
  getParkingById,
  updateParking,
  deleteParking,
} from "../controllers/parking";
import authMiddleware from "../middlewares/auth";
import officerMiddleware from "../middlewares/officer";

const parkingRoutes = Router();

// Publicly authenticated endpoints: list and availability
parkingRoutes.get("/", authMiddleware, errorHandler(getAllParkings));
parkingRoutes.get(
  "/available",
  authMiddleware,
  errorHandler(getAvailableParking)
);
parkingRoutes.get("/:id", authMiddleware, errorHandler(getParkingById));

// Officer-only endpoints: create, update, delete
parkingRoutes.post(
  "/",
  authMiddleware,
  officerMiddleware,
  errorHandler(createParking)
);
parkingRoutes.put(
  "/:id",
  authMiddleware,
  officerMiddleware,
  errorHandler(updateParking)
);
parkingRoutes.delete(
  "/:id",
  authMiddleware,
  officerMiddleware,
  errorHandler(deleteParking)
);

export default parkingRoutes;
