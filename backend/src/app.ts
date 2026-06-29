import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Tải biến môi trường
dotenv.config();

const app: Application = express();

import path from "path";
import roomRouter from "./routes/room.route";
import billRouter from "./routes/bill.route";
import telegramRouter from "./routes/telegram.route";
import expenseRouter from "./routes/expense.route";
import authRouter from "./routes/auth.route";
import boardingHouseRouter from "./routes/boardingHouse.route";

import { errorHandler } from "./middlewares/error.middleware";
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký Router
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bills", billRouter);
app.use("/api/telegram", telegramRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/boarding-houses", boardingHouseRouter);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Boarding House Manager API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Phục vụ các file tĩnh của React App
const frontendDistPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDistPath));

// Fallback route phục vụ React Router (phải đặt ở cuối cùng)
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Global Error Handler Middleware (Must be placed at the very bottom of the stack)
app.use(errorHandler);

export default app;
