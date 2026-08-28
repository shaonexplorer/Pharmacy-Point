import { z } from 'zod';

/**
 * DTOs for Category endpoints.
 * Extracted from inline validation in categories.ts route handler.
 */

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  slug: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  description: z.string().optional(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
