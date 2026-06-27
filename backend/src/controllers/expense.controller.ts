import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { asyncHandler } from "../utils/async-handler";

/**
 * Controller to handle incoming HTTP requests for expenses and financial reporting.
 * Forwards errors automatically via asyncHandler.
 */
export class ExpenseController {
  private expenseService = new ExpenseService();

  /**
   * HTTP POST /api/expenses
   * Creates a new expense record.
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, amount, description, date, roomId } = req.body;
    const expense = await this.expenseService.createExpense({
      title,
      amount,
      description,
      date,
      roomId,
    });
    res.status(201).json(expense);
  });

  /**
   * HTTP GET /api/expenses
   * Retrieves all expenses, with optional roomId filter query.
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const roomId = req.query.roomId as string | undefined;
    const expenses = await this.expenseService.getAllExpenses({ roomId });
    res.status(200).json(expenses);
  });

  /**
   * HTTP GET /api/expenses/summary
   * Fetches the monthly income, expense, and profit data for charts.
   */
  getSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const summary = await this.expenseService.getDashboardSummary();
    res.status(200).json(summary);
  });

  /**
   * HTTP GET /api/expenses/:id
   * Retrieves details of a single expense.
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const expense = await this.expenseService.getExpenseById(id);
    res.status(200).json(expense);
  });

  /**
   * HTTP PUT /api/expenses/:id
   * Updates an existing expense record.
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, amount, description, date, roomId } = req.body;
    const expense = await this.expenseService.updateExpense(id, {
      title,
      amount,
      description,
      date,
      roomId,
    });
    res.status(200).json(expense);
  });

  /**
   * HTTP DELETE /api/expenses/:id
   * Deletes an expense record.
   */
  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const expense = await this.expenseService.deleteExpense(id);
    res.status(200).json(expense);
  });
}
