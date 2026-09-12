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

const dateSchema = z.string().datetime().optional().or(z.date().optional());

export const stockInSchema = z.object({
  productId: productIdSchema.optional(),
  barcode: optionalStringSchema,
  quantity: positiveQuantitySchema,
  batchNo: optionalStringSchema,
  lotNumber: optionalStringSchema,
  expiryDate: z.string().optional().refine((val) => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, { message: 'Invalid expiry date format' }),
  manufactureDate: z.string().optional().refine((val) => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, { message: 'Invalid manufacture date format' }),
  costPrice: z.number().nonnegative().optional(),
  notes: optionalStringSchema,
  referenceId: optionalStringSchema,
  userId: optionalStringSchema,
}).refine((data) => data.productId || data.barcode, {
  message: 'Either productId or barcode is required',
  path: ['productId'],
});

export const stockOutSchema = z.object({
  productId: productIdSchema.optional(),
  barcode: optionalStringSchema,
  batchId: optionalStringSchema,
  quantity: positiveQuantitySchema,
  notes: optionalStringSchema,
  referenceId: optionalStringSchema,
  userId: optionalStringSchema,
}).refine((data) => data.productId || data.barcode, {
  message: 'Either productId or barcode is required',
  path: ['productId'],
});

export const stockAdjustSchema = z.object({
  quantity: nonNegativeQuantitySchema,
  batchNo: optionalStringSchema,
  notes: optionalStringSchema,
  userId: optionalStringSchema,
});

export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;
