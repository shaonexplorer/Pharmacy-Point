import { z } from 'zod';

export const receiptEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});
