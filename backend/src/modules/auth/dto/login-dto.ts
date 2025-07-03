import { z } from 'zod';

export const loginSchema = z
  .object({
    username: z.string().max(100),
    password: z.string().max(100),
  })
  .required();

export type LoginUserDTO = z.infer<typeof loginSchema>;
