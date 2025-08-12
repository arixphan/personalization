import { z } from 'zod';

export const updateProjectStatusSchema = z.object({
  status: z.string(),
});

export type UpdateProjectStatusDto = z.infer<typeof updateProjectStatusSchema>;
