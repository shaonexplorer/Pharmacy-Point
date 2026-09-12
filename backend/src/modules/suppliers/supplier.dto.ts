import { z } from 'zod';

export const supplierRepresentativeSchema = z.object({
  name: z.string().min(1, 'Representative name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsappNumber: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactName: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  leadTimeDays: z.number().int().positive().default(7),
  paymentTerms: z.string().optional().default('Net 30'),
  performanceRating: z.number().min(0).max(5).optional().default(5),
  representatives: z.array(supplierRepresentativeSchema).optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type SupplierRepresentativeInput = z.infer<typeof supplierRepresentativeSchema>;
