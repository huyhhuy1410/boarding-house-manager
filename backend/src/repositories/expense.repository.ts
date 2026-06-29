import prisma from "../config/prisma";
import { Expense, Prisma } from "@prisma/client";

/**
 * Repository to perform database CRUD operations for the Expense model.
 */
export class ExpenseRepository {
  /**
   * Creates a new expense in the database.
   */
  async create(data: {
    title: string;
    amount: number;
    description?: string | null;
    date?: Date;
    roomId?: string | null;
  }): Promise<Expense> {
    // TODO: Use prisma.expense.create() to store the expense.
    // Convert 'amount' to Prisma.Decimal before inserting.
    return await prisma.expense.create({
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount),
      },
    });
  }

  /**
   * Finds all expenses, optionally filtered by roomId.
   */
  async findAll(filter?: { roomId?: string }): Promise<Expense[]> {
    // TODO: Use prisma.expense.findMany() with optional filtering, ordered by date desc.
    const response = await prisma.expense.findMany({
      where: {
        roomId: filter?.roomId,
      },
      include: {
        room: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return response;
  }

  /**
   * Finds an expense by its unique ID.
   */
  async findById(id: string): Promise<Expense | null> {
    // TODO: Use prisma.expense.findUnique().
    const response = await prisma.expense.findUnique({
      where: {
        id,
      },
      include: {
        room: true,
      },
    });
    return response;
  }

  /**
   * Updates an existing expense in the database.
   */
  async update(id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
    return await prisma.expense.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Deletes an expense by its unique ID.
   */
  async delete(id: string): Promise<Expense> {
    return await prisma.expense.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Retrieves all expenses within a specific date range.
   */
  async findExpensesInDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return expenses;
  }
}
