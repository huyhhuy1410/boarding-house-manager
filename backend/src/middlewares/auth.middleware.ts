import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";
import { UserRepository } from "../repositories/user.repository";

// Mở rộng kiểu dữ liệu Request của Express để lưu giữ thông tin user sau khi giải mã token
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Lấy chuỗi token từ header Authorization (định dạng chuẩn: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Bạn cần đăng nhập để thực hiện thao tác này!", 401);
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "bi_mat_mac_dinh_sieu_kho_doan_12345";

    // 2. Kiểm tra token có hợp lệ không
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    } catch (err) {
      throw new AppError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ!", 401);
    }

    // 3. (Optional) Kiểm tra xem user này có thực sự còn tồn tại trong DB không
    const userRepository = new UserRepository();
    const userExist = await userRepository.findById(decoded.userId);
    if (!userExist) {
      throw new AppError("Người dùng không còn tồn tại trong hệ thống!", 401);
    }

    // 4. Lưu payload giải mã được vào request object để các controller phía sau sử dụng nếu cần
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next(); // Hợp lệ, cho phép đi tiếp
  } catch (error) {
    next(error);
  }
};
