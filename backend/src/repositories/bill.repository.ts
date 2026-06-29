import prisma from "../config/prisma";
import { Bill, Prisma } from "@prisma/client";

export class BillRepository {
  /**
   * Tạo hóa đơn mới
   */
  async create(data: {
    roomId: string;
    month: number;
    year: number;
    oldElectricity: number;
    newElectricity: number;
    oldWater: number;
    newWater: number;
    rentAmount: number;
    electricityAmount: number;
    waterAmount: number;
    internetAmount: number;
    trashAmount: number;
    extraAmount?: number;
    extraDescription?: string;
    totalAmount: number;
  }): Promise<Bill> {
    // TODO: Sử dụng prisma.bill.create() để tạo hóa đơn mới
    // Gợi ý: Hãy chuyển các giá trị số tiền (rentAmount, electricityAmount, waterAmount, internetAmount, trashAmount, extraAmount, totalAmount) thành Prisma.Decimal
    const response = await prisma.bill.create({
      data: {
        roomId: data.roomId,
        month: data.month,
        year: data.year,
        oldElectricity: data.oldElectricity,
        newElectricity: data.newElectricity,
        oldWater: data.oldWater,
        newWater: data.newWater,
        rentAmount: new Prisma.Decimal(data.rentAmount),
        electricityAmount: new Prisma.Decimal(data.electricityAmount),
        waterAmount: new Prisma.Decimal(data.waterAmount),
        internetAmount: new Prisma.Decimal(data.internetAmount),
        trashAmount: new Prisma.Decimal(data.trashAmount),
        extraAmount: data.extraAmount
          ? new Prisma.Decimal(data.extraAmount)
          : undefined,
        extraDescription: data.extraDescription,
        totalAmount: new Prisma.Decimal(data.totalAmount),
      },
      include: { room: { include: { boardingHouse: true } } },
    });
    return response;
  }
  /**
   * Tìm hóa đơn theo roomId, month, và year (kiểm tra trùng lặp)
   */
  async findByRoomAndPeriod(
    roomId: string,
    month: number,
    year: number,
  ): Promise<Bill | null> {
    // TODO: Sử dụng prisma.bill.findUnique() dựa trên điều kiện unique composite: [roomId, month, year]
    // Gợi ý: where: { roomId_month_year: { roomId, month, year } }
    const response = await prisma.bill.findUnique({
      where: { roomId_month_year: { roomId, month, year } },
    });
    return response;
  }

  /**
   * Tìm hóa đơn theo ID
   */
  async findById(id: string): Promise<Bill | null> {
    // TODO: Sử dụng prisma.bill.findUnique() tìm theo khóa chính ID, có thể dùng include để lấy thêm thông tin Room liên quan
    const response = await prisma.bill.findUnique({
      where: { id },
      include: { room: { include: { boardingHouse: true } } },
    });
    return response;
  }

  /**
   * Lấy danh sách hóa đơn theo tháng/năm
   */
  async findByPeriod(month: number, year: number): Promise<Bill[]> {
    // TODO: Sử dụng prisma.bill.findMany() lọc theo month và year, sắp xếp theo createdAt giảm dần

    const response = await prisma.bill.findMany({
      where: { month, year },
      include: { room: { include: { boardingHouse: true } } },
      orderBy: { createdAt: "desc" },
    });
    return response;
  }

  /**
   * Cập nhật trạng thái thanh toán hóa đơn
   */
  async updatePaymentStatus(id: string, isPaid: boolean): Promise<Bill> {
    // TODO: Sử dụng prisma.bill.update() để cập nhật trường isPaid và paidAt
    // Gợi ý: Nếu isPaid là true, set paidAt = new Date(), ngược lại set paidAt = null
    const response = await prisma.bill.update({
      where: { id },
      data: { isPaid, paidAt: isPaid ? new Date() : null },
      include: { room: { include: { boardingHouse: true } } },
    });
    return response;
  }

  /**
   * Xóa hóa đơn
   */
  async delete(id: string): Promise<Bill> {
    const response = await prisma.bill.delete({
      where: { id },
      include: { room: { include: { boardingHouse: true } } },
    });
    return response;
  }
}
