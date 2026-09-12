import { z } from 'zod';

export const supplierRepresentativeSchema = z.object({
  name: z.string().min(1, 'Representative name is required'),
  email: z.string().email('Invalid email address').nullish().or(z.literal('')),
  phone: z.string().nullish(),
  whatsappNumber: z.string().nullish(),
  designation: z.string().nullish(),
  address: z.string().nullish(),
  notes: z.string().nullish(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactName: z.string().nullish(),
  email: z.string().email('Invalid email address').nullish().or(z.literal('')),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  leadTimeDays: z.number().int().positive().default(7),
  paymentTerms: z.string().optional().default('Net 30'),
  performanceRating: z.number().min(0).max(5).optional().default(5),
  representatives: z.array(supplierRepresentativeSchema).optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type SupplierRepresentativeInput = z.infer<typeof supplierRepresentativeSchema>;
