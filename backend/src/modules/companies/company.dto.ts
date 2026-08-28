import { z } from 'zod';

/**
 * DTOs for Company endpoints.
 * Extracted from inline validation in companies.ts route handler.
 */

export const companyCreateSchema = z.object({
  name: z.string().min(1, 'Company name is required').trim(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const companyUpdateSchema = companyCreateSchema.partial();

export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
