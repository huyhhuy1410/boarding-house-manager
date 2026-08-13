import { RoomRepository } from "../repositories/room.repository";
import { Room } from "@prisma/client";
import { AppError } from "../errors/app-error";
import prisma from "../config/prisma";

/**
 * Service to handle business logic for rooms.
 */
export class RoomService {
  private roomRepository = new RoomRepository();

  /**
   * Retrieves all rooms.
   */
  async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }

  /**
   * Finds a room by ID, throws AppError 404 if not found.
   */
  async getRoomById(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new AppError("Không tìm thấy phòng trọ!", 404);
    }
    return room;
  }

  /**
   * Creates a new room. Throws AppError 400 if room name exists.
   */
  async createRoom(data: {
    name: string;
    boardingHouseId: string;
    price: number;
    status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
    renterName?: string | null;
    renterPhone?: string | null;
    renterCccdNumber?: string | null;
    renterCccdDate?: Date | string | null;
    renterCccdPlace?: string | null;
    renterAddress?: string | null;
    renterDob?: Date | string | null;
    renterMemberCount?: number | null;
    renterVehiclePlates?: string | null;
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
    const room = await this.roomRepository.findByNameAndHouse(data.boardingHouseId, data.name);
    if (room) {
      throw new AppError("Tên phòng trọ đã tồn tại trong dãy trọ này!", 400);
    }
    return this.roomRepository.create(data);
  }

  /**
   * Updates an existing room.
   */
  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    if (data.name) {
      // Khi cập nhật phòng, ta cần biết phòng đó thuộc dãy trọ nào.
      // Lấy thông tin phòng hiện tại từ database trước:
      const currentRoom = await this.getRoomById(id);
      const houseId = data.boardingHouseId || currentRoom.boardingHouseId;

      const existingRoom = await this.roomRepository.findByNameAndHouse(houseId, data.name);
      if (existingRoom && existingRoom.id !== id) {
        throw new AppError("Tên phòng trọ đã tồn tại trong dãy trọ này!", 400);
      }
    }
    return this.roomRepository.update(id, data);
  }

  /**
   * Deletes a room.
   */
  async deleteRoom(id: string): Promise<Room> {
    await this.getRoomById(id);
    return this.roomRepository.delete(id);
  }

  /**
   * Chuyển khách thuê từ phòng cũ sang phòng mới (Database Transaction)
   */
  async relocateTenant(data: {
    oldRoomId: string;
    newRoomId: string;
    lastElectricity: number;
    lastWater: number;
    newRoomStartElectricity: number;
    newRoomStartWater: number;
    rentAmount?: number;
    internetAmount?: number;
    trashAmount?: number;
    extraAmount?: number;
    extraDescription?: string;
  }): Promise<{ oldRoom: Room; newRoom: Room; bill: any }> {
    // 1. Lấy thông tin phòng cũ và phòng mới
    const oldRoom = await this.getRoomById(data.oldRoomId);
    const newRoom = await this.getRoomById(data.newRoomId);

    if (oldRoom.status !== "OCCUPIED") {
      throw new AppError("Phòng cũ không có khách thuê hoạt động!", 400);
    }
    if (newRoom.status === "OCCUPIED") {
      throw new AppError("Phòng mới đã có người ở, vui lòng chọn phòng khác!", 400);
    }

    // 2. Xác định số điện nước cũ từ hóa đơn gần nhất hoặc từ chỉ số bắt đầu thuê
    const lastBill = (oldRoom as any).bills && (oldRoom as any).bills.length > 0 ? (oldRoom as any).bills[0] : null;
    const startElectricity = lastBill ? lastBill.newElectricity : oldRoom.rentStartElectricity;
    const startWater = lastBill ? lastBill.newWater : oldRoom.rentStartWater;

    if (data.lastElectricity < startElectricity) {
      throw new AppError(`Số điện cuối (${data.lastElectricity}) không được nhỏ hơn số điện chốt gần nhất (${startElectricity})!`, 400);
    }
    if (data.lastWater < startWater) {
      throw new AppError(`Số nước cuối (${data.lastWater}) không được nhỏ hơn số nước chốt gần nhất (${startWater})!`, 400);
    }

    // 3. Tính toán hóa đơn chốt phòng cũ
    const rentAmount = data.rentAmount !== undefined ? data.rentAmount : oldRoom.price.toNumber();
    const electricityAmount = oldRoom.isElectricityIncluded
      ? 0
      : (data.lastElectricity - startElectricity) * oldRoom.electricityPrice.toNumber();
    const waterAmount = (data.lastWater - startWater) * oldRoom.waterPrice.toNumber();
    const internetAmount = data.internetAmount !== undefined ? data.internetAmount : oldRoom.internetPrice.toNumber();
    const trashAmount = data.trashAmount !== undefined ? data.trashAmount : oldRoom.trashPrice.toNumber();
    const extraAmount = data.extraAmount || 0;
    const totalAmount = rentAmount + electricityAmount + waterAmount + internetAmount + trashAmount + extraAmount;

    // Lấy tháng năm hiện tại để lập hóa đơn chốt
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 4. Thực thi transaction chốt phòng và di chuyển cọc/CCCD
    const result = await prisma.$transaction(async (tx) => {
      // 4.1. Lập hóa đơn chốt phòng cũ (Nếu đã có hóa đơn trong tháng này, cập nhật đè)
      const existingBill = await tx.bill.findUnique({
        where: {
          roomId_month_year: {
            roomId: data.oldRoomId,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      let bill;
      const billData = {
        rentAmount,
        electricityAmount,
        waterAmount,
        internetAmount,
        trashAmount,
        extraAmount: extraAmount + (existingBill ? existingBill.extraAmount.toNumber() : 0),
        extraDescription: data.extraDescription 
          ? `${existingBill?.extraDescription ? `${existingBill.extraDescription}; ` : ""}Chốt phòng chuyển đi: ${data.extraDescription}`
          : existingBill?.extraDescription || "Chốt số chuyển phòng",
        totalAmount: totalAmount + (existingBill ? existingBill.totalAmount.toNumber() : 0),
        oldElectricity: startElectricity,
        oldWater: startWater,
        newElectricity: data.lastElectricity,
        newWater: data.lastWater,
        isPaid: false,
      };

      if (existingBill) {
        bill = await tx.bill.update({
          where: { id: existingBill.id },
          data: billData,
        });
      } else {
        bill = await tx.bill.create({
          data: {
            roomId: data.oldRoomId,
            month: currentMonth,
            year: currentYear,
            ...billData,
          },
        });
      }

      // 4.2. Di chuyển toàn bộ hồ sơ khách thuê & đặt cọc sang phòng mới
      const updatedNewRoom = await tx.room.update({
        where: { id: data.newRoomId },
        data: {
          status: "OCCUPIED",
          renterName: oldRoom.renterName,
          renterPhone: oldRoom.renterPhone,
          renterCccdNumber: oldRoom.renterCccdNumber,
          renterCccdDate: oldRoom.renterCccdDate,
          renterCccdPlace: oldRoom.renterCccdPlace,
          renterAddress: oldRoom.renterAddress,
          renterDob: oldRoom.renterDob,
          renterMemberCount: oldRoom.renterMemberCount,
          renterVehiclePlates: oldRoom.renterVehiclePlates,
          renterDeposit: oldRoom.renterDeposit,
          electricityDeposit: oldRoom.electricityDeposit,
          rentStartDate: now,
          rentStartElectricity: data.newRoomStartElectricity,
          rentStartWater: data.newRoomStartWater,
        },
      });

      // 4.3. Làm sạch (reset) phòng cũ về trống
      const updatedOldRoom = await tx.room.update({
        where: { id: data.oldRoomId },
        data: {
          status: "VACANT",
          renterName: null,
          renterPhone: null,
          renterCccdNumber: null,
          renterCccdDate: null,
          renterCccdPlace: null,
          renterAddress: null,
          renterDob: null,
          renterMemberCount: 1,
          renterVehiclePlates: null,
          renterDeposit: 0,
          electricityDeposit: 0,
          rentStartDate: null,
          rentStartElectricity: data.lastElectricity, // Số cuối phòng cũ làm số đầu cho người sau
          rentStartWater: data.lastWater,
        },
      });

      return { oldRoom: updatedOldRoom, newRoom: updatedNewRoom, bill };
    });

    return result;
  }
}
