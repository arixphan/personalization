import { z } from 'zod';

export const registerUserSchema = z
  .object({
    username: z.string().min(3).max(30),
    password: z.string().min(6).max(20),
  })
  .required();

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
