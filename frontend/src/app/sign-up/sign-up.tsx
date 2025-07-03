"use server";

import { z, ZodError } from "zod";
import { User } from "../dal/schema/User";
import { AuthService } from "../dal/services/auth-service";

const newUserSchema = User.pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

type NewUser = z.infer<typeof newUserSchema>;

interface ActionState {
  status: "ok" | "error" | "new";
  errors?: Record<keyof NewUser, string>;
}

export default async function signUp(
  previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    };

    const createdUser = newUserSchema.parse(data);
    await AuthService.insertUser(createdUser);
    return {
      status: "ok",
    };
  } catch (error) {
    let errors: Record<string, string> = {};
    if (error instanceof ZodError) {
      errors = error.errors.reduce((acc: Record<string, string>, curr) => {
        const field = curr.path[0] as string;
        const message = curr.message;
        if (acc[field]) {
          acc[field] += `, ${message}`;
        } else {
          acc[field] = message;
        }
        return acc;
      }, {});
    } else {
      console.log("error", error);
      errors = {
        email: "Email already exists",
      };
    }

    return {
      status: "error",
      errors,
    };
  }
}
