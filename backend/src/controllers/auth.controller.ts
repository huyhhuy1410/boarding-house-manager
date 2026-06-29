import { Request, Response } from "express";      // ← bỏ NextFunction
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler"; // ← thêm dòng này

export class AuthController {
  private authService = new AuthService();

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const user = await this.authService.register({ email, password, name });
    res.status(201).json({ success: true, message: "Đăng ký thành công!", data: user });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login({ email, password });
    res.status(200).json({ success: true, message: "Đăng nhập thành công!", data: result });
  });
}