import express from "express";
import cors from "cors";
import rootRouter from "./routes";
import { PORT } from "./secrets";
import { PrismaClient } from "./generated/prisma";
import { errorMiddleware } from "./middlewares/errors";
import ParkingRoutes from "./routes/parking";
import reservationRoutes from "./routes/reservation";
import paymentRoutes from "./routes/payment";

const app = express();

app.use(
  cors({
    origin: "https://localhost:3001/",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// app.get("/", (req: Request, res: Response) => {
//   res.send("Working");
// });

app.use(express.json());

export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.use("/api", rootRouter);
app.use("/api/parking", ParkingRoutes);

app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log("App Working!");
});

module.exports = app;
