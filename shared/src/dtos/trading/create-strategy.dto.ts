import { z } from 'zod';

export const CreateStrategySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

export type CreateStrategyDto = z.infer<typeof CreateStrategySchema>;
