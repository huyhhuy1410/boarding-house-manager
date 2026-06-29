import prisma from "../config/prisma";
import { User } from "@prisma/client";

export class UserRepository {
  /**
   * Tìm người dùng theo Email (dùng cho Đăng nhập & Check trùng khi Đăng ký)
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Tìm người dùng theo ID (dùng cho verify Token)
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Tạo tài khoản người dùng mới
   */
  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}
