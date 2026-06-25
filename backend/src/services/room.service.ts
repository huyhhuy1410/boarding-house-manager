import { RoomRepository } from "../repositories/room.repository";
import { Room } from "@prisma/client";

export class RoomService {
  private roomRepository = new RoomRepository();

  /**
   * Nghiệp vụ lấy toàn bộ phòng trọ
   */
  async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }

  /**
   * Nghiệp vụ tìm phòng trọ theo ID
   */
  async getRoomById(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new Error("Không tìm thấy phòng trọ!");
    }
    return room;
  }

  /**
   * Nghiệp vụ tạo phòng trọ mới (Có validate tên phòng)
   */
  async createRoom(data: {
    name: string;
    boardingHouseId: string;
    price: number;
    electricityPrice?: number;
    waterPrice?: number;
    internetPrice?: number;
    trashPrice?: number;
    electricityDeposit?: number;
    isElectricityIncluded?: boolean;
    rentStartDate?: Date;
    rentStartElectricity?: number;
    rentStartWater?: number;
  }): Promise<Room> {
    const room = await this.roomRepository.findByName(data.name);
    if (room) {
      throw new Error("Tên phòng trọ đã tồn tại!");
    }
    return this.roomRepository.create(data);
  }

  /**
   * Nghiệp vụ cập nhật phòng trọ
   */
  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    // TODO:
    // 1. Kiểm tra phòng có tồn tại không bằng cách gọi `this.getRoomById(id)`
    // 2. Nếu cập nhật tên phòng (`data.name`), cần kiểm tra tên mới đó có bị trùng với phòng khác không
    // 3. Gọi `roomRepository.update(id, data)` để cập nhật
    await this.getRoomById(id);
    if (data.name) {
      const existingRoom = await this.roomRepository.findByName(data.name);
      if (existingRoom && existingRoom.id !== id) {
        throw new Error("Tên phòng trọ đã tồn tại!");
      }
    }
    return this.roomRepository.update(id, data);
  }

  /**
   * Nghiệp vụ xóa phòng trọ
   */
  async deleteRoom(id: string): Promise<Room> {
    // TODO:
    // 1. Kiểm tra phòng có tồn tại không bằng cách gọi `this.getRoomById(id)`
    // 2. Gọi `roomRepository.delete(id)` để xóa
    await this.getRoomById(id);
    return this.roomRepository.delete(id);
  }
}
