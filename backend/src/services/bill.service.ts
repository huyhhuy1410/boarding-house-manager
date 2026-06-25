import { BillRepository } from "../repositories/bill.repository";
import { RoomRepository } from "../repositories/room.repository";
import { Bill } from "@prisma/client";

export class BillService {
  private billRepository = new BillRepository();
  private roomRepository = new RoomRepository();

  /**
   * Tính toán hóa đơn tự động và tạo mới
   */
  async calculateAndCreateBill(input: {
    roomId: string;
    month: number;
    year: number;
    newElectricity: number;
    newWater: number;
    // Chỉ số điện cũ và nước cũ sẽ lấy từ hóa đơn gần nhất hoặc giá trị mặc định lúc nhận phòng
    oldElectricity: number;
    oldWater: number;
    extraAmount?: number;
    extraDescription?: string;
  }): Promise<Bill> {
    // 1. Kiểm tra phòng trọ có tồn tại không
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      throw new Error("Phòng trọ không tồn tại!");
    }

    // 2. Chỉ xuất hóa đơn cho phòng đang có khách thuê (status === 'OCCUPIED')
    if (room.status !== "OCCUPIED") {
      throw new Error(
        "Không thể xuất hóa đơn cho phòng trống hoặc đang bảo trì!",
      );
    }

    // 3. Kiểm tra xem phòng này đã có hóa đơn cho tháng/năm này chưa
    const existingBill = await this.billRepository.findByRoomAndPeriod(
      input.roomId,
      input.month,
      input.year,
    );
    if (existingBill) {
      throw new Error(
        `Phòng này đã được lập hóa đơn cho tháng ${input.month}/${input.year} rồi!`,
      );
    }

    // 4. Validate chỉ số mới không được nhỏ hơn chỉ số cũ
    if (input.newElectricity < input.oldElectricity) {
      throw new Error("Số điện mới không được nhỏ hơn số điện cũ!");
    }
    if (input.newWater < input.oldWater) {
      throw new Error("Số nước mới không được nhỏ hơn số nước cũ!");
    }

    // TODO: 5. Tính toán các khoản tiền dựa theo công thức:
    // - rentAmount = room.price
    // - electricityAmount = (newElectricity - oldElectricity) * room.electricityPrice
    // - waterAmount = (newWater - oldWater) * room.waterPrice
    // - internetAmount = room.internetPrice
    // - trashAmount = room.trashPrice
    // - extraAmount = input.extraAmount || 0
    // - totalAmount = rentAmount + electricityAmount + waterAmount + internetAmount + trashAmount + extraAmount
    // Gợi ý: Hãy chuyển đổi các trường kiểu Decimal của Prisma sang kiểu number bằng cách gọi .toNumber() trước khi cộng trừ nhân chia!
    // Ví dụ: const rentAmount = room.price.toNumber();
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

    // TODO: 6. Gọi hàm this.billRepository.create(...) để lưu hóa đơn vào cơ sở dữ liệu và trả về kết quả
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
   * Lấy danh sách hóa đơn theo tháng/năm
   */
  async getBillsByPeriod(month: number, year: number): Promise<Bill[]> {
    return this.billRepository.findByPeriod(month, year);
  }

  /**
   * Đóng tiền phòng (cập nhật trạng thái thanh toán)
   */
  async payBill(id: string): Promise<Bill> {
    const bill = await this.billRepository.findById(id);
    if (!bill) {
      throw new Error("Hóa đơn không tồn tại!");
    }
    return this.billRepository.updatePaymentStatus(id, true);
  }
}
