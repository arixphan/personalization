"use server";

import { AuthEndpoint, REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { Fetcher } from "@/lib/fetcher";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import setCookieParser from "set-cookie-parser";

// Define the validation schema
const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

interface SignInState {
  errors?: {
    username?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
}

export async function signInAction(
  prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  // Extract form data
  const rawFormData = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  // Validate form data
  const validatedFields = signInSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  try {
    const response = await Fetcher.post(AuthEndpoint.singUp, {
      username,
      password,
    });

    if (response.ok) {
      // Get cookies from NestJS response and forward them
      const setCookieHeader = response.headers.get("set-cookie");
      const data = await response.json();
      const cookieStore = await cookies();

      // Store access token in httpOnly cookie

      if (setCookieHeader) {
        const cookiesToSet = setCookieParser.parse(setCookieHeader, {
          map: false,
        });

        const refreshTokenCookie = cookiesToSet.find(
          (cookie) => cookie.name === "refresh_token"
        );

        if (refreshTokenCookie) {
          cookieStore.set(refreshTokenCookie.name, refreshTokenCookie.value, {
            httpOnly: refreshTokenCookie.httpOnly,
            secure: refreshTokenCookie.secure,
            sameSite: refreshTokenCookie.sameSite?.toLowerCase() as
              | "lax"
              | "strict"
              | "none",
            maxAge: refreshTokenCookie.maxAge,
            expires: refreshTokenCookie.expires,
            path: REFRESH_TOKEN_ENDPOINT,
          });
        }
      }

      if (data.access_token) {
        cookieStore.set("access_token", data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 30,
          path: "/",
        });
      }

      redirect("/");
    }

    const data = await response.json();

    return {
      errors: {
        _form: [
          "error" in data ? data.error : "Server error, please try again",
        ],
      },
    };
  } catch (error) {
    if (error?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      errors: {
        _form: ["Server error, please try again"],
      },
    };
  }
}
