import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

// Route xử lý việc đăng ký tài khoản mới
router.post("/register", authController.register);

// Route xử lý việc đăng nhập
router.post("/login", authController.login);

export default router;
