import api from "./api";
import { Room } from "./room.service";

/**
 * RoomRaw dùng nội bộ trong bill.service: chỉ liệt kê các field Decimal
 * mà backend gửi về dạng string. Không import từ room.service để tránh
 * vòng lặp phụ thuộc — khai báo lại inline.
 */
interface RoomInBillRaw extends Omit<Room, "price" | "electricityPrice" | "waterPrice" | "internetPrice" | "trashPrice" | "renterDeposit" | "electricityDeposit" | "rentStartElectricity" | "rentStartWater" | "billingDay"> {
  price: string | number;
  electricityPrice: string | number;
  waterPrice: string | number;
  internetPrice: string | number;
  trashPrice: string | number;
  renterDeposit: string | number | null;
  electricityDeposit: string | number;
  rentStartElectricity: string | number;
  rentStartWater: string | number;
  billingDay: string | number;
}

/**
 * BillRaw: kiểu dữ liệu thô từ API.
 * Các field Decimal của Prisma sẽ được JSON serialize thành string.
 */
interface BillRaw extends Omit<Bill, "rentAmount" | "electricityAmount" | "waterAmount" | "internetAmount" | "trashAmount" | "extraAmount" | "totalAmount" | "room"> {
  rentAmount: string | number;
  electricityAmount: string | number;
  waterAmount: string | number;
  internetAmount: string | number;
  trashAmount: string | number;
  extraAmount: string | number;
  totalAmount: string | number;
  room?: RoomInBillRaw;
}

// Định nghĩa Interface Bill tại Frontend khớp với định dạng từ Backend trả về
export interface Bill {
  id: string;
  roomId: string;
  room?: Room;
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
  extraAmount: number;
  extraDescription: string | null;
  totalAmount: number;
  isPaid: boolean;
  paidAt: string | null;
}


export const billService = {
  /**
   * Tạo hóa đơn mới (tính toán tự động từ backend)
   */
  create: async (data: {
    roomId: string;
    month: number;
    year: number;
    oldElectricity: number;
    newElectricity: number;
    oldWater: number;
    newWater: number;
    extraAmount?: number;
    extraDescription?: string;
  }): Promise<Bill> => {
    try {
      const response = await api.post<BillRaw>("/api/bills", data);
      const bill = response.data;
      return {
        ...bill,
        rentAmount: Number(bill.rentAmount),
        electricityAmount: Number(bill.electricityAmount),
        waterAmount: Number(bill.waterAmount),
        internetAmount: Number(bill.internetAmount),
        trashAmount: Number(bill.trashAmount),
        extraAmount: Number(bill.extraAmount),
        totalAmount: Number(bill.totalAmount),
        room: bill.room ? {
          ...bill.room,
          price: Number(bill.room.price),
          electricityPrice: Number(bill.room.electricityPrice),
          waterPrice: Number(bill.room.waterPrice),
          internetPrice: Number(bill.room.internetPrice),
          trashPrice: Number(bill.room.trashPrice),
          renterDeposit: bill.room.renterDeposit ? Number(bill.room.renterDeposit) : null,
          electricityDeposit: Number(bill.room.electricityDeposit),
          rentStartElectricity: Number(bill.room.rentStartElectricity),
          rentStartWater: Number(bill.room.rentStartWater),
          billingDay: Number(bill.room.billingDay),
        } : undefined,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  /**
   * Lấy danh sách hóa đơn theo tháng/năm
   */
  getByPeriod: async (month: number, year: number): Promise<Bill[]> => {
    try {
      const response = await api.get<BillRaw[]>("/api/bills", {
        params: { month, year },
      });
      return response.data.map(bill => ({
        ...bill,
        rentAmount: Number(bill.rentAmount),
        electricityAmount: Number(bill.electricityAmount),
        waterAmount: Number(bill.waterAmount),
        internetAmount: Number(bill.internetAmount),
        trashAmount: Number(bill.trashAmount),
        extraAmount: Number(bill.extraAmount),
        totalAmount: Number(bill.totalAmount),
        room: bill.room ? {
          ...bill.room,
          price: Number(bill.room.price),
          electricityPrice: Number(bill.room.electricityPrice),
          waterPrice: Number(bill.room.waterPrice),
          internetPrice: Number(bill.room.internetPrice),
          trashPrice: Number(bill.room.trashPrice),
          renterDeposit: bill.room.renterDeposit ? Number(bill.room.renterDeposit) : null,
          electricityDeposit: Number(bill.room.electricityDeposit),
          rentStartElectricity: Number(bill.room.rentStartElectricity),
          rentStartWater: Number(bill.room.rentStartWater),
          billingDay: Number(bill.room.billingDay),
        } : undefined,
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  /**
   * Đánh dấu hóa đơn đã thanh toán
   */
  pay: async (id: string): Promise<Bill> => {
    try {
      const response = await api.patch<BillRaw>(`/api/bills/${id}/pay`);
      const bill = response.data;
      return {
        ...bill,
        rentAmount: Number(bill.rentAmount),
        electricityAmount: Number(bill.electricityAmount),
        waterAmount: Number(bill.waterAmount),
        internetAmount: Number(bill.internetAmount),
        trashAmount: Number(bill.trashAmount),
        extraAmount: Number(bill.extraAmount),
        totalAmount: Number(bill.totalAmount),
        room: bill.room ? {
          ...bill.room,
          price: Number(bill.room.price),
          electricityPrice: Number(bill.room.electricityPrice),
          waterPrice: Number(bill.room.waterPrice),
          internetPrice: Number(bill.room.internetPrice),
          trashPrice: Number(bill.room.trashPrice),
          renterDeposit: bill.room.renterDeposit ? Number(bill.room.renterDeposit) : null,
          electricityDeposit: Number(bill.room.electricityDeposit),
          rentStartElectricity: Number(bill.room.rentStartElectricity),
          rentStartWater: Number(bill.room.rentStartWater),
          billingDay: Number(bill.room.billingDay),
        } : undefined,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
