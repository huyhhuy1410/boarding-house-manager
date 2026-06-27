import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { validate } from "../middlewares/validation.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../schemas/expense.schema";

const router = Router();
const expenseController = new ExpenseController();

/**
 * Route registry for expense management endpoints.
 */
// TODO: Define routes for:
// - POST / (validation middleware with createExpenseSchema, maps to expenseController.create)
// - GET / (maps to expenseController.getAll)
// - GET /summary (maps to expenseController.getSummary)
// - GET /:id (maps to expenseController.getById)
// - PUT /:id (validation middleware with updateExpenseSchema, maps to expenseController.update)
// - DELETE /:id (maps to expenseController.destroy)
router.post("/", validate(createExpenseSchema), expenseController.create);
router.get("/", expenseController.getAll);
router.get("/summary", expenseController.getSummary);
router.get("/:id", expenseController.getById);
router.put("/:id", validate(updateExpenseSchema), expenseController.update);
router.delete("/:id", expenseController.destroy);

export default router;
