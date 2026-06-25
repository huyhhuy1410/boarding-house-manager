import { Request, Response } from "express";
import { RoomService } from "../services/room.service";

export class RoomController {
  private roomService = new RoomService();
  // Hàm helper để xử lý lỗi tập trung và trả về đúng HTTP code
  private handleError = (
    res: Response,
    error: unknown,
    defaultStatus = 400,
  ): void => {
    const message =
      error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";

    // Nếu thông báo lỗi là không tìm thấy phòng, trả về 404 Not Found
    if (message.includes("Không tìm thấy phòng trọ")) {
      res.status(404).json({ error: message });
      return;
    }

    res.status(defaultStatus).json({ error: message });
  };
  /**
   * HTTP GET /api/rooms
   * Lấy tất cả phòng trọ
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Gọi `this.roomService.getAllRooms()`, sau đó trả về dữ liệu với mã status 200: res.status(200).json(rooms);
      const rooms = await this.roomService.getAllRooms();
      res.status(200).json(rooms);
    } catch (error: any) {
      this.handleError(res, error, 500);
    }
  };

  /**
   * HTTP GET /api/rooms/:id
   * Lấy chi tiết một phòng trọ
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Lấy `id` từ `req.params.id`, gọi `this.roomService.getRoomById(id)` và trả về kết quả
      const { id } = req.params;
      const room = await this.roomService.getRoomById(id);
      res.status(200).json(room);
    } catch (error: any) {
      this.handleError(res, error, 400);
    }
  };

  /**
   * HTTP POST /api/rooms
   * Tạo phòng trọ mới
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Lấy dữ liệu phòng từ `req.body`, gọi `this.roomService.createRoom(req.body)`
      // Trả kết quả về với status 201 (Created)
      const newRoom = await this.roomService.createRoom(req.body);
      res.status(201).json(newRoom);
    } catch (error: any) {
      this.handleError(res, error, 400);
    }
  };

  /**
   * HTTP PUT /api/rooms/:id
   * Cập nhật thông tin phòng trọ
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Lấy `id` từ `req.params.id` và dữ liệu cần update từ `req.body`
      // Gọi `this.roomService.updateRoom(id, req.body)` và trả về kết quả 200
      const { id } = req.params;
      const updatedRoom = await this.roomService.updateRoom(id, req.body);
      res.status(200).json(updatedRoom);
    } catch (error: any) {
      this.handleError(res, error, 400);
    }
  };

  /**
   * HTTP DELETE /api/rooms/:id
   * Xóa phòng trọ
   */
  destroy = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Lấy `id` từ `req.params.id`, gọi `this.roomService.deleteRoom(id)`
      // Trả về kết quả xóa thành công kèm status 200
      const { id } = req.params;
      const deletedRoom = await this.roomService.deleteRoom(id);
      res.status(200).json(deletedRoom);
    } catch (error: any) {
      this.handleError(res, error, 400);
    }
  };
}
