"use server";

import { cookies } from "next/headers";
import setCookieParser from "set-cookie-parser";
import { z } from "zod";
import { AUTH_CONFIG } from "@personalization/shared";
import { env } from "@/config/env.server";
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
      AuthEndpoint.signIn,
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

      // TODO: get from env
      // if (setCookieHeader) {
      //   const cookiesToSet = setCookieParser.parse(setCookieHeader, {
      //     map: false,
      //   });

      //   const refreshTokenCookie = cookiesToSet.find(
      //     (cookie) => cookie.name === AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN
      //   );

      //   if (refreshTokenCookie) {
      //     cookieStore.set(refreshTokenCookie.name, refreshTokenCookie.value, {
      //       httpOnly: refreshTokenCookie.httpOnly,
      //       secure: refreshTokenCookie.secure,
      //       sameSite: refreshTokenCookie.sameSite?.toLowerCase() as
      //         | "lax"
      //         | "strict"
      //         | "none",
      //       maxAge: refreshTokenCookie.maxAge,
      //       expires: refreshTokenCookie.expires,
      //       path: REFRESH_TOKEN_ENDPOINT,
      //     });
      //   }
      // }

      if (data.access_token) {
        (await cookies()).set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, data.access_token, {
          httpOnly: true,
          secure: env.isProduction,
          sameSite: "strict",
          maxAge: env.jwtAccessExpirationTime,
          path: "/",
        });
      }

      return {
        success: true,
      };
    }



    return {
      errors: {
        _form: ["Username or password are incorrect"],
      },
    };
  } catch (error) {
    const err = error as { digest?: string };
    if (err?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      errors: {
        _form: ["Server error, please try again"],
      },
    };
  }
}
