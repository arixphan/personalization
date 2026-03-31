import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SERVER_BASE_URL: z.string().url(),
});

// For Next.js to inline NEXT_PUBLIC_ variables, they must be literal process.env.NEXT_PUBLIC_...
const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_SERVER_BASE_URL: process.env.NEXT_PUBLIC_SERVER_BASE_URL,
});

if (!parsedEnv.success) {
  console.error("❌ Invalid public environment variables:", parsedEnv.error.format());
  throw new Error("Invalid public environment variables");
}

export const env = {
  nextPublicServerBaseUrl: parsedEnv.data.NEXT_PUBLIC_SERVER_BASE_URL,
  serverBaseUrl: parsedEnv.data.NEXT_PUBLIC_SERVER_BASE_URL, // Keep for backward compatibility where public URL is used as fallback
};
