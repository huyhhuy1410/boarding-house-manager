import { Request, Response } from "express";
import { BillService } from "../services/bill.service";

export class BillController {
  private billService = new BillService();

  /**
   * Tạo hóa đơn mới (tính toán tự động)
   */
  async createBill(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Lấy dữ liệu từ req.body (đã được validate qua Zod ở middleware) và gọi:
      // const bill = await this.billService.calculateAndCreateBill(req.body);
      // Trả về: res.status(210).json(bill); (Lưu ý mã 201 cho Created)
      const response = await this.billService.calculateAndCreateBill(req.body);
      res.status(201).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống!";
      res.status(400).json({ message: errorMessage });
    }
  }

  /**
   * Lấy danh sách hóa đơn theo tháng/năm
   */
  async getBills(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Lấy month và year từ query params (req.query.month và req.query.year)
      // Lưu ý: query params mặc định là string, bạn cần dùng Number() hoặc parseInt() để chuyển thành số!
      // Nếu thiếu month hoặc year, trả về lỗi 400: res.status(400).json({ message: "Thiếu thông tin tháng/năm!" });
      //
      // Gọi: const bills = await this.billService.getBillsByPeriod(month, year);
      // Trả về: res.status(200).json(bills);
      const month = Number(req.query.month);
      const year = Number(req.query.year);
      if (!month || !year) {
        res.status(400).json({ message: "Thiếu thông tin tháng/năm!" });
        return;
      }
      const bills = await this.billService.getBillsByPeriod(month, year);
      res.status(200).json(bills);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống!";
      res.status(500).json({ message: errorMessage });
    }
  }

  /**
   * Đánh dấu hóa đơn đã thanh toán
   */
  async payBill(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Lấy id hóa đơn từ URL param: req.params.id
      // Gọi: const bill = await this.billService.payBill(id);
      // Trả về: res.status(200).json(bill);
      const id = req.params.id;
      const bill = await this.billService.payBill(id);
      res.status(200).json(bill);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống!";
      res.status(400).json({ message: errorMessage });
    }
  }
}
