import { z } from 'zod';

export const LoginSchema = z
  .object({
    username: z.string().max(100),
    password: z.string().max(100),
  })
  .required();

export type LoginDto = z.infer<typeof LoginSchema>;

