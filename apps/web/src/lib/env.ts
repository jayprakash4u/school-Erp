import { z } from "zod";

/**
 * Environment variables schema for School ERP Web
 * Ensures all required environment variables are set and properly typed.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().optional().default(""),
  NEXT_PUBLIC_APP_NAME: z.string().default("School ERP"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("1.0.0"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("en"),
  NEXT_PUBLIC_ENABLE_MULTI_BRANCH: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default(false),
  NEXT_PUBLIC_ENABLE_MOCK_API: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default(false),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_ENABLE_MULTI_BRANCH: process.env.NEXT_PUBLIC_ENABLE_MULTI_BRANCH,
    NEXT_PUBLIC_ENABLE_MOCK_API: process.env.NEXT_PUBLIC_ENABLE_MOCK_API,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    // In browser, return fallback defaults to prevent complete unhandled crashes
    return envSchema.parse({
      NEXT_PUBLIC_API_URL: "",
    });
  }

  return parsed.data;
};

export const env = parseEnv();
