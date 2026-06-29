import { Request, Response } from "express";
import { BillService } from "../services/bill.service";
import { AppError } from "../errors/app-error";
import { asyncHandler } from "../utils/async-handler";

/**
 * Controller to handle billing actions.
 * Delegates errors via asyncHandler to the global error middleware.
 */
export class BillController {
  private billService = new BillService();

  /**
   * HTTP POST /api/bills
   * Creates a new bill automatically based on utility readings.
   */
  createBill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const response = await this.billService.calculateAndCreateBill(req.body);
    res.status(201).json(response);
  });

  /**
   * HTTP GET /api/bills
   * Retrieves bills for a given month and year.
   */
  getBills = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!month || !year) {
      throw new AppError("Thiếu thông tin tháng/năm!", 400);
    }
    const bills = await this.billService.getBillsByPeriod(month, year);
    res.status(200).json(bills);
  });

  /**
   * HTTP PATCH /api/bills/:id/pay
   * Marks a bill as paid.
   */
  payBill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const bill = await this.billService.payBill(id);
    res.status(200).json(bill);
  });

  /**
   * HTTP DELETE /api/bills/:id
   * Deletes a bill.
   */
  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const deletedBill = await this.billService.deleteBill(id);
    res.status(200).json(deletedBill);
  });
}
