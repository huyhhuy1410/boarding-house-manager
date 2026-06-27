import { Request, Response } from "express";
import { RoomService } from "../services/room.service";
import { asyncHandler } from "../utils/async-handler";

/**
 * Controller to manage room operations.
 * Uses asyncHandler to capture and forward errors automatically to the global middleware.
 */
export class RoomController {
  private roomService = new RoomService();

  /**
   * HTTP GET /api/rooms
   * Retrieves all rooms.
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rooms = await this.roomService.getAllRooms();
    res.status(200).json(rooms);
  });

  /**
   * HTTP GET /api/rooms/:id
   * Retrieves details of a single room.
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const room = await this.roomService.getRoomById(id);
    res.status(200).json(room);
  });

  /**
   * HTTP POST /api/rooms
   * Creates a new room.
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const newRoom = await this.roomService.createRoom(req.body);
    res.status(201).json(newRoom);
  });

  /**
   * HTTP PUT /api/rooms/:id
   * Updates an existing room's details.
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updatedRoom = await this.roomService.updateRoom(id, req.body);
    res.status(200).json(updatedRoom);
  });

  /**
   * HTTP DELETE /api/rooms/:id
   * Deletes a room.
   */
  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const deletedRoom = await this.roomService.deleteRoom(id);
    res.status(200).json(deletedRoom);
  });
}
