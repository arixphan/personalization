import { z } from "zod";
import { DataEntity } from "./DataEntity";

export const User = DataEntity.extend({
  username: z.string().nonempty().max(50).trim(),
  email: z.string().email().min(5).max(100).trim().toLowerCase(),
  password: z.string().min(8).max(20),
  firstName: z.string().max(50).nonempty().trim(),
  lastName: z.string().max(50).nonempty().trim(),
});

export type User = z.infer<typeof User>;
export type UserWithoutPassword = Omit<User, "password">;
