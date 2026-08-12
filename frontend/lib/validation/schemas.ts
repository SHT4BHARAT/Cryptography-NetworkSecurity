// frontend/lib/validation/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(1),
});

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().finite(),
  description: z.string().trim().min(1).max(200),
  accountId: z.string().uuid().optional(),
});

export const budgetSchema = z.object({
  category: z.string().trim().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().positive(),
});

export const goalSchema = z.object({
  name: z.string().trim().min(1).max(100),
  targetAmount: z.number().positive(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  monthlyIncome: z.number().nonnegative().optional(),
});

export async function parseJsonBody<T>(schema: z.ZodType<T>, body: unknown) {
  return schema.safeParse(body);
}