import { Router } from "express";
import { BillController } from "../controllers/bill.controller";
import { validate } from "../middlewares/validation.middleware";
import { createBillSchema } from "../schemas/bill.schema";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new BillController();

// Áp dụng authMiddleware bảo vệ toàn bộ các endpoint bên dưới
router.use(authMiddleware);

router.post("/", validate(createBillSchema), controller.createBill);
router.get("/", controller.getBills);
router.patch("/:id/pay", controller.payBill);

export default router;
