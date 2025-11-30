"use server";

import { cookies } from "next/headers";
import setCookieParser from "set-cookie-parser";
import { z } from "zod";

import { AuthEndpoint, REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { ServerApiHandler } from "@/lib/server-api";

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
  token?: string;
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
    const { data, responseHeaders } = await ServerApiHandler.post(
      AuthEndpoint.singUp,
      {
        username,
        password,
      }
    );


    if (data) {
      // Get cookies from NestJS response and forward them
      const setCookieHeader = responseHeaders?.get("set-cookie");
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

      return {
        success: true,
        token: data.access_token,
      };
    }



    return {
      errors: {
        _form: ["Username or password are incorrect"],
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
