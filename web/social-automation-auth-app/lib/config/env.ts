/**
 * Environment Variable Validation ve Configuration Management
 * Zod ile type-safe environment variable validation
 */

import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI zorunludur'),
  MONGODB_DB: z.string().default('projectdemiray'),
  
  // NextAuth
  AUTH_SECRET: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // Facebook OAuth
  FB_APP_ID: z.string().min(1, 'FB_APP_ID zorunludur'),
  FB_APP_SECRET: z.string().min(1, 'FB_APP_SECRET zorunludur'),
  
  // TikTok OAuth
  TIKTOK_CLIENT_ID: z.string().min(1, 'TIKTOK_CLIENT_ID zorunludur').optional(),
  TIKTOK_CLIENT_SECRET: z.string().min(1, 'TIKTOK_CLIENT_SECRET zorunludur').optional(),
  
  // Ngrok URL (Development için - Server-side only)
  NGROK_URL: z.string().url().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Environment variables'ı parse et
function getEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`❌ Environment variable validation hatası:\n${missingVars}`);
    }
    throw error;
  }
}

// Validated environment variables
export const env = getEnv();

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Auth secret - zorunlu
export const getAuthSecret = (): string => {
  const secret = env.AUTH_SECRET || env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error(
      '❌ AUTH_SECRET veya NEXTAUTH_SECRET tanımlanmamış!\n' +
      'Lütfen .env dosyanıza ekleyin:\n' +
      'AUTH_SECRET=<güvenli-random-string>\n\n' +
      'Güvenli secret oluşturmak için: openssl rand -base64 32'
    );
  }
  
  return secret;
};
