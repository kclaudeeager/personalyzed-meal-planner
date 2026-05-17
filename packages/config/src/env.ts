// =============================================================================
// Environment Configuration — Validated with Zod
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// API Environment Schema
// ---------------------------------------------------------------------------

export const apiEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

  // Auth (Clerk)
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  // AI
  OPENAI_API_KEY: z.string().optional(),

  // Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // App
  API_PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

// ---------------------------------------------------------------------------
// Web Environment Schema
// ---------------------------------------------------------------------------

export const webEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

// ---------------------------------------------------------------------------
// Validation Helper
// ---------------------------------------------------------------------------

export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, unknown> = process.env as Record<string, unknown>,
): z.infer<T> {
  const result = schema.safeParse(env);
  if (!result.success) {
    const formatted = result.error.format();
    const message = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, val]) => {
        const errors = (val as { _errors?: string[] })._errors;
        return `  ${key}: ${errors?.join(', ') ?? 'invalid'}`;
      })
      .join('\n');

    throw new Error(`❌ Invalid environment variables:\n${message}`);
  }
  return result.data;
}
