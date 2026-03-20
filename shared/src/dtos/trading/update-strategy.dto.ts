import { z } from 'zod';

export const UpdateStrategySchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  position: z.number().int().optional(),
});

export type UpdateStrategyDto = z.infer<typeof UpdateStrategySchema>;
