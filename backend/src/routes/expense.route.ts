import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../schemas/expense.schema";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const expenseController = new ExpenseController();

// Áp dụng authMiddleware bảo vệ toàn bộ các endpoint bên dưới
router.use(authMiddleware);

/**
 * Route registry for expense management endpoints.
 */

router.post("/", validate(createExpenseSchema), expenseController.create);
router.get("/", expenseController.getAll);
router.get("/summary", expenseController.getSummary);
router.get("/:id", expenseController.getById);
router.put("/:id", validate(updateExpenseSchema), expenseController.update);
router.delete("/:id", expenseController.destroy);

export default router;
