import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVER_BASE_URL: z.string().url().default("http://localhost:3000/api"),
  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRATION_TIME: z.coerce.number().default(1800),
  JWT_REFRESH_EXPIRATION_TIME: z.coerce.number().default(604800),
});

const parsedEnv = serverEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRATION_TIME: process.env.JWT_ACCESS_EXPIRATION_TIME,
  JWT_REFRESH_EXPIRATION_TIME: process.env.JWT_REFRESH_EXPIRATION_TIME,
});

if (!parsedEnv.success) {
  console.error("❌ Invalid server environment variables:", parsedEnv.error.format());
  throw new Error("Invalid server environment variables");
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  serverBaseUrl: parsedEnv.data.SERVER_BASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtAccessExpirationTime: parsedEnv.data.JWT_ACCESS_EXPIRATION_TIME,
  jwtRefreshExpirationTime: parsedEnv.data.JWT_REFRESH_EXPIRATION_TIME,
  isProduction: parsedEnv.data.NODE_ENV === "production",
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
};
