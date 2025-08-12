import { z } from "zod";

export const BaseProjectSchema = z.object({
  title: z.string().nonempty().min(3).max(100),
  description: z.string().max(500).nullish(),
  version: z.string().default("1.0"),
  type: z.string().nonempty(),
  columns: z.array(z.string().nonempty().max(100)).default([]),
  tags: z.array(z.string().nonempty().max(100)).default([]),
});

export type BaseProjectDto = z.infer<typeof BaseProjectSchema>;
