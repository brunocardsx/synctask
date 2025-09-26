import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables first
dotenv.config();

// Environment variables validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
  
  // Redis
  REDIS_URL: z.string().url('REDIS_URL deve ser uma URL válida').optional(),
  
  // CORS
  FRONTEND_URL: z.string().url('FRONTEND_URL deve ser uma URL válida').default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().optional(),
  
  // Email (for password reset)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment
export const env = parseEnv();

// Security configuration
export const securityConfig = {
  bcryptRounds: env.BCRYPT_ROUNDS,
  jwtSecret: env.JWT_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
};

// CORS configuration
export const corsConfig = {
  origin: env.ALLOWED_ORIGINS 
    ? env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Database configuration
export const dbConfig = {
  url: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
};

// Email configuration
export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.SMTP_FROM,
};

// Logging configuration
export const logConfig = {
  level: env.LOG_LEVEL,
  file: env.LOG_FILE,
};

// Validate required environment variables for production
export const validateProductionEnv = () => {
  if (env.NODE_ENV === 'production') {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET', 
      'DATABASE_URL',
      'FRONTEND_URL'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables for production:');
      missing.forEach(varName => {
        console.error(`  - ${varName}`);
      });
      process.exit(1);
    }
  }
};

// Initialize environment validation
validateProductionEnv();
