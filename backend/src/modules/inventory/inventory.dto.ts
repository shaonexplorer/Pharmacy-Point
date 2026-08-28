import { z } from 'zod';

/**
 * DTOs for Inventory endpoints.
 * Extracted from inline validation in inventory.ts route handler.
 */

const productIdSchema = z.string().min(1, 'Product ID is required').trim();
const positiveQuantitySchema = z
  .number({ invalid_type_error: 'Quantity must be a number' })
  .positive('Quantity must be a positive number');
const nonNegativeQuantitySchema = z
  .number({ invalid_type_error: 'Quantity must be a number' })
  .nonnegative('Quantity must be a non-negative number');
const optionalStringSchema = z.string().optional();

export const stockInSchema = z.object({
  productId: productIdSchema,
  quantity: positiveQuantitySchema,
  notes: optionalStringSchema,
  referenceId: optionalStringSchema,
});

export const stockOutSchema = z.object({
  productId: productIdSchema,
  quantity: positiveQuantitySchema,
  notes: optionalStringSchema,
  referenceId: optionalStringSchema,
});

export const stockAdjustSchema = z.object({
  quantity: nonNegativeQuantitySchema,
  notes: optionalStringSchema,
});

export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;
