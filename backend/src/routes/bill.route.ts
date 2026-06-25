import { Router } from "express";
import { BillController } from "../controllers/bill.controller";
import { validate } from "../middlewares/validation.middleware";
import { createBillSchema } from "../schemas/bill.schema";

const router = Router();
const controller = new BillController();

// POST /api/bills - Tạo hóa đơn mới (Validate qua Zod middleware trước)
router.post(
  "/",
  validate(createBillSchema),
  controller.createBill.bind(controller)
);

// GET /api/bills - Lấy danh sách hóa đơn theo tháng/năm (?month=6&year=2026)
router.get("/", controller.getBills.bind(controller));

// PATCH /api/bills/:id/pay - Đánh dấu hóa đơn đã thanh toán
router.patch("/:id/pay", controller.payBill.bind(controller));

export default router;
