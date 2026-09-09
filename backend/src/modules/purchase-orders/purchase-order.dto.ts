import { z } from 'zod';
export const poSchema = z.object({
  supplierId: z.string(),
  poNumber: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({ productId: z.string().optional(), quantity: z.number().int().positive(), unitPrice: z.number() })),
});
export const poApproveSchema = z.object({ approvedBy: z.string().optional() });
export type POInput = z.infer<typeof poSchema>;
