import { z } from "zod";

export const DataEntity = z
  .object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
  })
  .strict();

export type DataEntity = z.infer<typeof DataEntity>;
