import { z } from "zod";

/**
 * Validation schema for creating a new expense.
 */
export const createExpenseSchema = z.object({
  body: z.object({
    title: z
      .string({
        message: "Expense title is required",
      })
      .min(2, "Title must be at least 2 characters long"),
    amount: z
      .number({
        message: "Expense amount is required",
      })
      .positive("Amount must be a positive number"),
    description: z.string().optional().nullable(),
    date: z.string().optional().nullable(), // ISO string from frontend
    roomId: z.string().optional().nullable(), // Associated room if applicable
  }),
});

/**
 * Validation schema for updating an existing expense.
 */
export const updateExpenseSchema = z.object({
  body: createExpenseSchema.shape.body.partial(),
});
