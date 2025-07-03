import { Router } from "express";
import { errorHandler } from "../error-handler";
import { listPendingPayments, confirmPayment } from "../controllers/payment";
import authMiddleware from "../middlewares/auth";
import officerMiddleware from "../middlewares/officer";

const paymentRoutes = Router();

// List all pending "Pay by Cash" payments (OFFICER only)
paymentRoutes.get(
  "/",
  authMiddleware,
  officerMiddleware,
  errorHandler(listPendingPayments)
);

// Confirm a cash payment (OFFICER only)
paymentRoutes.patch(
  "/:id/confirm",
  authMiddleware,
  officerMiddleware,
  errorHandler(confirmPayment)
);

export default paymentRoutes;
