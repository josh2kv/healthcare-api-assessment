import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().min(1, 'VITE_API_URL is required'),
  VITE_API_URL_PREFIX: z.string().min(1, 'VITE_API_URL_PREFIX is required'),
  VITE_API_KEY: z.string().min(1, 'VITE_API_KEY is required'),
});

export const env = envSchema.parse(import.meta.env);
