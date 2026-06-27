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
    const room = await this.roomRepository.findByName(data.name);
    if (room) {
      throw new AppError("Tên phòng trọ đã tồn tại!", 400);
    }
    return this.roomRepository.create(data);
  }

  /**
   * Updates an existing room.
   */
  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    await this.getRoomById(id);
    if (data.name) {
      const existingRoom = await this.roomRepository.findByName(data.name);
      if (existingRoom && existingRoom.id !== id) {
        throw new AppError("Tên phòng trọ đã tồn tại!", 400);
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
