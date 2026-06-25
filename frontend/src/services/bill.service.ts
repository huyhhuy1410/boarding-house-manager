import axios from "axios";
import { Room } from "./room.service";

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
      const response = await axios.post<any>("/api/bills", data);
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
          electricityDeposit: bill.room.electricityDeposit ? Number(bill.room.electricityDeposit) : 0,
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
      const response = await axios.get<any[]>("/api/bills", {
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
          electricityDeposit: bill.room.electricityDeposit ? Number(bill.room.electricityDeposit) : 0,
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
      const response = await axios.patch<any>(`/api/bills/${id}/pay`);
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
          electricityDeposit: bill.room.electricityDeposit ? Number(bill.room.electricityDeposit) : 0,
        } : undefined,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
