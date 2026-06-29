import api from "./api";
import { Room } from "./room.service";

/**
 * ExpenseRaw: kiểu dữ liệu thô từ API.
 * Field amount là Decimal của Prisma → JSON serialize thành string.
 * Field room giữ nguyên kiểu Room (không đệ quy) vì đã được xử lý ở room.service.
 */
interface ExpenseRaw extends Omit<Expense, "amount"> {
  amount: string | number;
}

/**
 * FinancialSummaryRaw: tương tự cho summary chart data.
 */
interface FinancialSummaryRaw extends Omit<FinancialSummary, "income" | "expense" | "profit"> {
  income: string | number;
  expense: string | number;
  profit: string | number;
}

/**
 * Interface representing an Expense record on the Frontend.
 */
export interface Expense {
  id: string;
  title: string;
  amount: number;
  description: string | null;
  date: string;
  roomId: string | null;
  room?: Room;
}

/**
 * Interface representing the monthly financial summary for dashboard charts.
 */
export interface FinancialSummary {
  month: string;
  income: number;
  expense: number;
  profit: number;
}


export const expenseService = {
  /**
   * Fetches all expenses, optionally filtered by room ID.
   */
  getAll: async (filter?: { roomId?: string }): Promise<Expense[]> => {
    try {
      const response = await api.get<ExpenseRaw[]>("/api/expenses", { params: filter });
      return response.data.map((exp) => ({
        ...exp,
        amount: Number(exp.amount),
      }));
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  /**
   * Creates a new expense.
   */
  create: async (data: {
    title: string;
    amount: number;
    description?: string | null;
    date?: string | null;
    roomId?: string | null;
  }): Promise<Expense> => {
    try {
      const response = await api.post<ExpenseRaw>("/api/expenses", data);
      const exp = response.data;
      return {
        ...exp,
        amount: Number(exp.amount),
      };
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  /**
   * Updates an existing expense.
   */
  update: async (
    id: string,
    data: Partial<{
      title: string;
      amount: number;
      description: string | null;
      date: string | null;
      roomId: string | null;
    }>,
  ): Promise<Expense> => {
    try {
      const response = await api.put<ExpenseRaw>(`/api/expenses/${id}`, data);
      const exp = response.data;
      return {
        ...exp,
        amount: Number(exp.amount),
      };
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  /**
   * Deletes an expense by ID.
   */
  delete: async (id: string): Promise<Expense> => {
    try {
      const response = await api.delete<ExpenseRaw>(`/api/expenses/${id}`);
      const exp = response.data;
      return {
        ...exp,
        amount: Number(exp.amount),
      };
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  /**
   * Fetches the last 6 months financial summary for the Recharts dashboard.
   */
  getSummary: async (): Promise<FinancialSummary[]> => {
    try {
      const response = await api.get<FinancialSummaryRaw[]>("/api/expenses/summary");
      return response.data.map((item) => ({
        month: item.month,
        income: Number(item.income),
        expense: Number(item.expense),
        profit: Number(item.profit),
      }));
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw error;
    }
  },
};
