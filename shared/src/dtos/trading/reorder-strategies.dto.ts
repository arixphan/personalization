import { z } from 'zod';

export const ReorderStrategiesSchema = z.object({
  ids: z.array(z.number().int()),
});

export type ReorderStrategiesDto = z.infer<typeof ReorderStrategiesSchema>;
