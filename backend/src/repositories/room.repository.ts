import prisma from "../config/prisma";
import { Room, Prisma } from "@prisma/client";

export class RoomRepository {
  /**
   * Lấy danh sách tất cả phòng trọ (Nạp kèm thông tin Dãy trọ)
   */
  async findAll(): Promise<Room[]> {
    const response = await prisma.room.findMany({
      include: {
        boardingHouse: true,
        bills: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });
    return response;
  }

  /**
   * Tìm phòng trọ theo ID (Nạp kèm thông tin Dãy trọ)
   */
  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
      include: {
        boardingHouse: true,
        bills: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 1,
        },
      },
    });
  }

  /**
   * Tìm phòng trọ theo tên (dùng để check trùng tên)
   */
  async findByNameAndHouse(boardingHouseId: string, name: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: {
        boardingHouseId_name: {
          boardingHouseId,
          name,
        },
      },
    });
  }

  /**
   * Tạo một phòng trọ mới
   */
  async create(data: {
    name: string;
    boardingHouseId: string;
    price: number;
    status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
    renterName?: string | null;
    renterPhone?: string | null;
    renterDeposit?: number | null;
    electricityPrice?: number;
    waterPrice?: number;
    internetPrice?: number;
    trashPrice?: number;
    electricityDeposit?: number;
    isElectricityIncluded?: boolean;
    rentStartDate?: Date;
    rentStartElectricity?: number;
    rentStartWater?: number;
    billingDay?: number;
  }): Promise<Room> {
    return prisma.room.create({
      data: {
        name: data.name,
        boardingHouseId: data.boardingHouseId,
        price: new Prisma.Decimal(data.price),
        status: data.status,
        renterName: data.renterName,
        renterPhone: data.renterPhone,
        renterDeposit: data.renterDeposit
          ? new Prisma.Decimal(data.renterDeposit)
          : undefined,
        electricityPrice: data.electricityPrice
          ? new Prisma.Decimal(data.electricityPrice)
          : undefined,
        waterPrice: data.waterPrice
          ? new Prisma.Decimal(data.waterPrice)
          : undefined,
        internetPrice: data.internetPrice
          ? new Prisma.Decimal(data.internetPrice)
          : undefined,
        trashPrice: data.trashPrice
          ? new Prisma.Decimal(data.trashPrice)
          : undefined,
        electricityDeposit: data.electricityDeposit
          ? new Prisma.Decimal(data.electricityDeposit)
          : undefined,
        isElectricityIncluded: data.isElectricityIncluded,
        rentStartDate: data.rentStartDate,
        rentStartElectricity: data.rentStartElectricity,
        rentStartWater: data.rentStartWater,
        billingDay: data.billingDay,
      },
    });
  }

  /**
   * Cập nhật thông tin phòng trọ
   */
  async update(id: string, data: Prisma.RoomUpdateInput): Promise<Room> {
    // TODO: Sử dụng `prisma.room.update()` để cập nhật dữ liệu của phòng theo ID
    return prisma.room.update({
      where: { id },
      data, // Prisma sẽ tự động xử lý ép kiểu từ number sang Decimal cho bạn!
    });
    // throw new Error('Method not implemented.');
  }

  /**
   * Xóa phòng trọ
   */
  async delete(id: string): Promise<Room> {
    // TODO: Sử dụng `prisma.room.delete()` để xóa phòng theo ID khỏi database
    return prisma.room.delete({
      where: { id },
    });
    // throw new Error('Method not implemented.');
  }
}
