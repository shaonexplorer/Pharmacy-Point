import { z } from 'zod';

export const loyaltyTierSchema = z.object({
  tier: z.string(),
  minSpend: z.number(),
  maxSpend: z.number().optional(),
  benefits: z.string(),
});

export const adjustPointsSchema = z.object({
  amount: z.number().int(), // positive = earn, negative = redeem
  notes: z.string().optional(),
});
