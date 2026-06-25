import axios from "axios";

export interface BoardingHouse {
  id: string;
  name: string;
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
  isPaidThisMonth?: boolean; // Thuộc tính giả lập ở frontend để tính toán trạng thái đóng tiền
  bills?: any[];
}

export const roomService = {
  getAll: async (): Promise<Room[]> => {
    try {
      const response = await axios.get<any[]>("/api/rooms");
      return response.data.map(room => ({
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: room.electricityDeposit ? Number(room.electricityDeposit) : 0,
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
      const response = await axios.get<any>(`/api/rooms/${id}`);
      const room = response.data;
      return {
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: room.electricityDeposit ? Number(room.electricityDeposit) : 0,
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
      const response = await axios.post<any>("/api/rooms", data);
      const room = response.data;
      return {
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: room.electricityDeposit ? Number(room.electricityDeposit) : 0,
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
      const response = await axios.put<any>(`/api/rooms/${id}`, data);
      const room = response.data;
      return {
        ...room,
        price: Number(room.price),
        electricityPrice: Number(room.electricityPrice),
        waterPrice: Number(room.waterPrice),
        internetPrice: Number(room.internetPrice),
        trashPrice: Number(room.trashPrice),
        renterDeposit: room.renterDeposit ? Number(room.renterDeposit) : null,
        electricityDeposit: room.electricityDeposit ? Number(room.electricityDeposit) : 0,
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
      await axios.delete<void>(`/api/rooms/${id}`);
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  },
};
