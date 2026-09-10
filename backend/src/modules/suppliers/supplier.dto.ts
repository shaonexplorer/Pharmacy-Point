import { z } from 'zod';
export const supplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  leadTimeDays: z.number().int().default(7),
  paymentTerms: z.string().optional().default('Net 30'),
  performanceRating: z.number().min(0).max(5).optional().default(5),
});
export type SupplierInput = z.infer<typeof supplierSchema>;
