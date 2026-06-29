import { BillRepository } from "../repositories/bill.repository";
import { RoomRepository } from "../repositories/room.repository";
import { Bill } from "@prisma/client";
import { AppError } from "../errors/app-error";

/**
 * Service to handle billing logic and calculations.
 */
export class BillService {
  private billRepository = new BillRepository();
  private roomRepository = new RoomRepository();

  /**
   * Automatically calculates and persists a monthly bill.
   */
  async calculateAndCreateBill(input: {
    roomId: string;
    month: number;
    year: number;
    newElectricity: number;
    newWater: number;
    oldElectricity: number;
    oldWater: number;
    extraAmount?: number;
    extraDescription?: string;
  }): Promise<Bill> {
    // 1. Verify room exists
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      throw new AppError("Phòng trọ không tồn tại!", 404);
    }

    // 2. Only issue bills for occupied rooms
    if (room.status !== "OCCUPIED") {
      throw new AppError(
        "Không thể xuất hóa đơn cho phòng trống hoặc đang bảo trì!",
        400
      );
    }

    // 3. Prevent duplicate monthly billing for the same room
    const existingBill = await this.billRepository.findByRoomAndPeriod(
      input.roomId,
      input.month,
      input.year
    );
    if (existingBill) {
      throw new AppError(
        `Phòng này đã được lập hóa đơn cho tháng ${input.month}/${input.year} rồi!`,
        400
      );
    }

    // 4. Validate utility readings
    if (input.newElectricity < input.oldElectricity) {
      throw new AppError("Số điện mới không được nhỏ hơn số điện cũ!", 400);
    }
    if (input.newWater < input.oldWater) {
      throw new AppError("Số nước mới không được nhỏ hơn số nước cũ!", 400);
    }

    // 5. Calculate line items
    const rentAmount = room.price.toNumber();
    const electricityAmount = room.isElectricityIncluded
      ? 0
      : (input.newElectricity - input.oldElectricity) *
        room.electricityPrice.toNumber();
    const waterAmount =
      (input.newWater - input.oldWater) * room.waterPrice.toNumber();
    const internetAmount = room.internetPrice.toNumber();
    const trashAmount = room.trashPrice.toNumber();
    const extraAmount = input.extraAmount || 0;
    const totalAmount =
      rentAmount +
      electricityAmount +
      waterAmount +
      internetAmount +
      trashAmount +
      extraAmount;

    // 6. Persist to database
    return this.billRepository.create({
      roomId: input.roomId,
      month: input.month,
      year: input.year,
      rentAmount: rentAmount,
      electricityAmount: electricityAmount,
      waterAmount: waterAmount,
      internetAmount: internetAmount,
      trashAmount: trashAmount,
      extraAmount: extraAmount,
      totalAmount: totalAmount,
      oldElectricity: input.oldElectricity,
      oldWater: input.oldWater,
      newElectricity: input.newElectricity,
      newWater: input.newWater,
    });
  }

  /**
   * Retrieves bills for a specific period.
   */
  async getBillsByPeriod(month: number, year: number): Promise<Bill[]> {
    return this.billRepository.findByPeriod(month, year);
  }

  /**
   * Marks a bill as paid.
   */
  async payBill(id: string): Promise<Bill> {
    const bill = await this.billRepository.findById(id);
    if (!bill) {
      throw new AppError("Hóa đơn không tồn tại!", 404);
    }
    return this.billRepository.updatePaymentStatus(id, true);
  }

  /**
   * Hủy/Xóa hóa đơn chưa thanh toán
   */
  async deleteBill(id: string): Promise<Bill> {
    const bill = await this.billRepository.findById(id);
    if (!bill) {
      throw new AppError("Hóa đơn không tồn tại!", 404);
    }
    if (bill.isPaid) {
      throw new AppError("Không thể hủy hóa đơn đã thanh toán!", 400);
    }
    return this.billRepository.delete(id);
  }
}
