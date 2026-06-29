import api from "./api";
import type { Bill } from "./bill.service";

export interface BoardingHouse {
  id: string;
  name: string;
}

/**
 * RoomRaw: kiểu dữ liệu thô từ API.
 * Các field Decimal của Prisma sẽ được JSON serialize thành string,
 * nên ta khai báo chúng là `string | number` để TypeScript chấp nhận.
 * Các field còn lại giữ nguyên kiểu từ Room.
 */
interface RoomRaw extends Omit<Room, "price" | "electricityPrice" | "waterPrice" | "internetPrice" | "trashPrice" | "renterDeposit" | "electricityDeposit" | "rentStartElectricity" | "rentStartWater" | "billingDay"> {
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

// Định nghĩa Interface Room tại Frontend khớp với định dạng trả về từ Backend
export interface Room {
  id: string;
  name: string;
  status: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  boardingHouseId: string;
  boardingHouse?: BoardingHouse;
  price: number;
  electricityPrice: number;
  waterPrice: number;
  internetPrice: number;
  trashPrice: number;
  renterName: string | null;
  renterPhone: string | null;
  renterDeposit: number | null;
  electricityDeposit: number;
  isElectricityIncluded: boolean;
  rentStartDate: string | null;
  rentStartElectricity: number;
  rentStartWater: number;
  billingDay: number;
  isPaidThisMonth?: boolean; // Thuộc tính giả lập ở frontend để tính toán trạng thái đóng tiền
  bills?: Bill[];
}


export const roomService = {
  getAll: async (): Promise<Room[]> => {
    try {
      const response = await api.get<RoomRaw[]>("/api/rooms");
      return response.data.map(room => ({
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: Number(room.electricityDeposit),
        rentStartElectricity: Number(room.rentStartElectricity),
        rentStartWater: Number(room.rentStartWater),
        billingDay: Number(room.billingDay),
      }));
    } catch (error) {
      console.error("Error fetching all rooms:", error);
      throw error;
    }
  },

  /**
   * Gọi API lấy chi tiết một phòng trọ
   */
  getById: async (id: string): Promise<Room> => {
    try {
      const response = await api.get<RoomRaw>(`/api/rooms/${id}`);
      const room = response.data;
      return {
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: Number(room.electricityDeposit),
        rentStartElectricity: Number(room.rentStartElectricity),
        rentStartWater: Number(room.rentStartWater),
        billingDay: Number(room.billingDay),
      };
    } catch (error) {
      console.error("Error fetching room by ID:", error);
      throw error;
    }
  },

  /**
   * Gọi API tạo phòng trọ mới
   */
  create: async (data: Omit<Room, "id" | "boardingHouse">): Promise<Room> => {
    try {
      const response = await api.post<RoomRaw>("/api/rooms", data);
      const room = response.data;
      return {
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: Number(room.electricityDeposit),
        rentStartElectricity: Number(room.rentStartElectricity),
        rentStartWater: Number(room.rentStartWater),
        billingDay: Number(room.billingDay),
      };
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  },

  /**
   * Gọi API cập nhật thông tin phòng trọ
   */
  update: async (id: string, data: Partial<Room>): Promise<Room> => {
    try {
      const response = await api.put<RoomRaw>(`/api/rooms/${id}`, data);
      const room = response.data;
      return {
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: Number(room.electricityDeposit),
        rentStartElectricity: Number(room.rentStartElectricity),
        rentStartWater: Number(room.rentStartWater),
        billingDay: Number(room.billingDay),
      };
    } catch (error) {
      console.error("Error updating room:", error);
      throw error;
    }
  },

  /**
   * Gọi API xóa phòng trọ
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete<void>(`/api/rooms/${id}`);
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  },
};
