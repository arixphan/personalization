"use server";

import { z } from "zod";

import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@personalization/shared";
import { env } from "@/config/env.server";
import { AuthEndpoint, REFRESH_TOKEN_ENDPOINT } from "@/constants/endpoints";
import { ServerApiHandler } from "@/lib/server-api";
import { FailureApiResponse, isSuccessApiResponse } from "@/lib/base-api";

// Schema definition
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Types
export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterState = {
  success: boolean;
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

type ApiErrorResponse = {
  error: string;
  message?: string;
};

// Helper functions
const extractFormData = (formData: FormData) => ({
  username: formData.get("username") as string,
  password: formData.get("password") as string,
  confirmPassword: formData.get("confirmPassword") as string,
});

const createErrorState = (
  message: string,
  errors?: RegisterState["errors"]
): RegisterState => ({
  success: false,
  message,
  errors,
});

const createSuccessState = (message: string): RegisterState => ({
  success: true,
  message,
});

const handleApiError = async (response: FailureApiResponse<any>): Promise<RegisterState> => {
  try {
    const errorData: ApiErrorResponse =  response.data;

    switch (response.status) {
      case 400:
        return createErrorState(errorData.error || "Invalid request data");
      case 409:
        return createErrorState("Username already exists");
      case 422:
        return createErrorState("Invalid input data");
      case 500:
        return createErrorState("Server error. Please try again later.");
      default:
        return createErrorState(
          errorData.error || `Unexpected error (${response.status})`
        );
    }
  } catch {
    // If JSON parsing fails, return generic error
    return createErrorState(
      `Server error (${response.status}). Please try again.`
    );
  }
};

const makeApiRequest = async (
  username: string,
  password: string
): Promise<RegisterState> => {
  try {
    const { data } = await ServerApiHandler.post(AuthEndpoint.signUp, {
      username,
      password,
    });

    if (data) {
      const cookieStore = await cookies();

      // Store access token
      if (data.access_token) {
        cookieStore.set(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, data.access_token, {
          httpOnly: true,
          secure: env.isProduction,
          sameSite: "strict",
          maxAge: env.jwtAccessExpirationTime,
          path: "/",
        });
      }

      // Store refresh token
      if (data.refresh_token) {
        cookieStore.set(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, data.refresh_token, {
          httpOnly: true,
          secure: env.isProduction,
          sameSite: "strict",
          maxAge: env.jwtRefreshExpirationTime,
          path: REFRESH_TOKEN_ENDPOINT || "/",
        });
      }

      return createSuccessState("Account created successfully!");
    }
    
    return createErrorState("Registration failed");
  } catch (error) {
    // Handle specific network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return createErrorState("Network error. Please check your connection.");
    }

    return createErrorState("An unexpected error occurred. Please try again.");
  }
};

// Main action function
export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const rawFormData = extractFormData(formData);

  // Validate form data
  const validation = registerSchema.safeParse(rawFormData);

  if (!validation.success) {
    return createErrorState(
      "Please fix the errors below",
      validation.error.flatten().fieldErrors
    );
  }

  const { username, password } = validation.data;

  return await makeApiRequest(username, password);
}
