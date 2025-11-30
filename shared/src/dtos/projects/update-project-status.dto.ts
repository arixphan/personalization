import { z } from 'zod';

export const UpdateProjectStatusSchema = z.object({
  status: z.string(),
});

export type UpdateProjectStatusDto = z.infer<typeof UpdateProjectStatusSchema>;

