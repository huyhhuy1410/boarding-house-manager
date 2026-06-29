import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { User } from "@prisma/client";
import { AppError } from "../errors/app-error";

export class AuthService {
  private userRepository = new UserRepository();
  private jwtSecret = process.env.JWT_SECRET || "bi_mat_mac_dinh_sieu_kho_doan_12345";

  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<Omit<User, "password">> {
    // 1. Kiểm tra định dạng email và dữ liệu đầu vào cơ bản
    if (!data.email || !data.password || !data.name) {
      throw new AppError("Vui lòng nhập đầy đủ thông tin đăng ký!", 400);
    }

    // 2. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email này đã được đăng ký trong hệ thống!", 400);
    }

    // 3. Hash mật khẩu sử dụng bcrypt (salt round = 10 là tiêu chuẩn hiệu năng/bảo mật tốt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 4. Lưu người dùng mới vào cơ sở dữ liệu
    const newUser = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // 5. Loại bỏ password khỏi object trả về để bảo mật dữ liệu
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Đăng nhập và tạo JWT Token
   */
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: Omit<User, "password">; token: string }> {
    if (!credentials.email || !credentials.password) {
      throw new AppError("Vui lòng nhập đầy đủ Email và Mật khẩu!", 400);
    }

    // 1. Tìm user theo Email
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError("Email hoặc Mật khẩu không chính xác!", 401);
    }

    // 2. So sánh mật khẩu người dùng gửi lên với hash trong DB
    const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordMatch) {
      throw new AppError("Email hoặc Mật khẩu không chính xác!", 401);
    }

    // 3. Tạo JWT Token
    // Payload chỉ nên chứa các thông tin không nhạy cảm (như ID, Email)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: "7d" } // Token hết hạn sau 7 ngày để tránh phải đăng nhập lại liên tục
    );

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }
}
