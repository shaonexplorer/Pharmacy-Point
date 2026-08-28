import { z } from 'zod';

/**
 * DTOs for Customer endpoints.
 * Extracted from inline validation in customers.ts route handler.
 */

const emailSchema = z
  .string()
  .email('Email must be a valid email address')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const customerCreateSchema = z.object({
  name: z.string().min(1, 'Customer name is required').trim(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dueAmount: z.number().nonnegative('Due amount must be a non-negative number').optional(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
