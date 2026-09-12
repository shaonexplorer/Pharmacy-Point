import { z } from 'zod';

/**
 * Line item for a purchase order.
 * `unitPrice` is optional — the service will default to the product's
 * current price when omitted (useful for quick "add to cart" from inventory).
 */
export const purchaseOrderItemSchema = z.object({
  productId: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  notes: z.string().optional(),
});

/**
 * Schema for creating a purchase order.
 * `poNumber` is no longer required on input — the service auto-generates it.
 * `expectedDeliveryDate` and `supplierRepresentativeId` are optional.
 */
export const poSchema = z.object({
  supplierId: z.string(),
  poNumber: z.string().optional(),
  supplierRepresentativeId: z.string().optional().nullable(),
  expectedDeliveryDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? new Date(val) : null)),
  notes: z.string().optional().nullable(),
  createdById: z.string().optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one line item is required'),
});

export const poApproveSchema = z.object({ approvedBy: z.string().optional() });

export type POInput = z.infer<typeof poSchema>;
export type POItemInput = z.infer<typeof purchaseOrderItemSchema>;
