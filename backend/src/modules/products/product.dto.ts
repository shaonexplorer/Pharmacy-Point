import { z } from 'zod';

/**
 * DTOs for Product endpoints.
 * Extracted from inline validation in products.ts route handler.
 */

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  sku: z.string().min(1, 'SKU is required').trim(),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required').trim(),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative number').optional(),
  lowStock: z
    .number()
    .int()
    .nonnegative('Low stock threshold must be a non-negative number')
    .optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  companyId: z.string().optional().nullable(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
