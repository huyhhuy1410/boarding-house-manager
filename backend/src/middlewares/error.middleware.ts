import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Global Error Handling Middleware for Express.
 * Catches all errors forwarded by next(error) and formats standard JSON responses.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // 1. Handle custom operational errors (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // 2. Handle input validation errors (ZodError)
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Dữ liệu đầu vào không hợp lệ!",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // 3. Handle known Prisma database errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "";
      res.status(400).json({
        error: `Dữ liệu bị trùng lặp: Trường (${target}) đã tồn tại!`,
      });
      return;
    }

    // P2025: Record to update or delete not found
    if (err.code === "P2025") {
      res.status(404).json({
        error: "Không tìm thấy bản ghi yêu cầu trong hệ thống!",
      });
      return;
    }
  }

  // 4. Handle default internal system errors
  console.error("Unhandled Application Error:", err);
  res.status(500).json({
    error: "Đã xảy ra lỗi hệ thống nghiêm trọng!",
  });
};
