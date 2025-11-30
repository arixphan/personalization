import { z } from 'zod';

export const CreateProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).nullish(),
  version: z.string().default('1.0'),
  type: z.string().min(1),
  columns: z.array(z.string().min(1).max(100)).default([]),
  tags: z.array(z.string().min(1).max(100)).default([]),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

