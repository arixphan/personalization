import { z } from 'zod';

export const registerUserSchema = z
  .object({
    name: z.string().min(0).max(50),
    username: z.string().min(3).max(30),
    password: z.string().min(6).max(20),
  })
  .required();

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
