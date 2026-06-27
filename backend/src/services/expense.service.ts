import { ExpenseRepository } from "../repositories/expense.repository";
import { Expense } from "@prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../errors/app-error";

/**
 * Service to handle business logic for expense management and dashboard reporting.
 */
export class ExpenseService {
  private expenseRepository = new ExpenseRepository();

  /**
   * Creates a new expense.
   */
  async createExpense(data: {
    title: string;
    amount: number;
    description?: string | null;
    date?: string | null;
    roomId?: string | null;
  }): Promise<Expense> {
    const dateObject = data.date ? new Date(data.date) : new Date();
    return this.expenseRepository.create({
      ...data,
      date: dateObject,
    });
  }

  /**
   * Fetches all expenses, optionally filtered by room.
   */
  async getAllExpenses(filter?: { roomId?: string }): Promise<Expense[]> {
    return this.expenseRepository.findAll(filter);
  }

  /**
   * Fetches an expense by ID.
   */
  async getExpenseById(id: string): Promise<Expense> {
    const response = await this.expenseRepository.findById(id);
    if (!response) {
      throw new AppError("Không tìm thấy chi phí yêu cầu!", 404);
    }
    return response;
  }

  /**
   * Updates an existing expense.
   */
  async updateExpense(
    id: string,
    data: {
      title?: string;
      amount?: number;
      description?: string | null;
      date?: string | null;
      roomId?: string | null;
    },
  ): Promise<Expense> {
    // Validate existence
    await this.getExpenseById(id);

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.expenseRepository.update(id, updateData);
  }

  /**
   * Deletes an expense by ID.
   */
  async deleteExpense(id: string): Promise<Expense> {
    // Validate existence
    await this.getExpenseById(id);
    return this.expenseRepository.delete(id);
  }

  /**
   * Generates a monthly financial summary (Income, Expenses, Net Profit) for the dashboard charts.
   * Typically aggregates data for the last 6 months.
   */
  async getDashboardSummary(): Promise<any[]> {
    const summary: any[] = [];
    const now = new Date();

    // Generate the last 6 periods chronologically (oldest to newest)
    const periods: { month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      });
    }

    const promises = periods.map(async (period) => {
      const { month, year } = period;
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Trigger aggregations concurrently
      const [billAggregation, expenseAggregation] = await Promise.all([
        prisma.bill.aggregate({
          _sum: { totalAmount: true },
          where: { month, year },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      const income = billAggregation._sum.totalAmount
        ? billAggregation._sum.totalAmount.toNumber()
        : 0;

      const expense = expenseAggregation._sum.amount
        ? expenseAggregation._sum.amount.toNumber()
        : 0;

      const profit = income - expense;

      return {
        month: `${month.toString().padStart(2, "0")}/${year}`,
        income,
        expense,
        profit,
      };
    });

    return Promise.all(promises);
  }
}
