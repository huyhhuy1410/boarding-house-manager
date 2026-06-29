import { RoomRepository } from "../repositories/room.repository";
import { Room } from "@prisma/client";
import { AppError } from "../errors/app-error";

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
    status?: "VACANT" | "OCCUPIED" | "MAINTENANCE"
    renterName?: string | null
    renterPhone?: string | null
    renterDeposit?: number | null
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
}
