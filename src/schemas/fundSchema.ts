import { z } from 'zod';

export const createFundSchema = z.object({
  name: z.string().min(1, 'Fund name is required'),
  description: z.string().min(1, 'Fund description is required'),
  targetAmount: z.number().min(0, 'Target amount cannot be negative'),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export const updateFundSchema = z.object({
  name: z.string().min(1, 'Fund name is required').optional(),
  description: z.string().min(1, 'Fund description is required').optional(),
  targetAmount: z.number().min(0, 'Target amount cannot be negative').optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  status: z.enum(['active', 'completed', 'pending']).optional(),
}); 