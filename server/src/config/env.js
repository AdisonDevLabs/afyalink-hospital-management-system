// src/config/env.js

const { z } = require('zod');

// Schema for env
const envSchema = z.object({
  // General
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive().default(5006)
  ),

  // Security
  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at leaset 32 characters long." }),

  // Database
  // Uses a conditional check for DATABASE_URL for Vercel/Heroku style env
  DATABSE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.preprocess(
    (a) => (a ? parseInt(z.string().parse(a), 10) : undefined),
    z.number().positive().optional()
  ),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_DATABASE: z.string().optional(),
}).refine((data) => {
  // If DATABASE_URL is not present, all DB_* MUST be present.
  if (!data.DATABSE_URL) {
    return data.DB_HOST && data.DB_PORT && data.DB_USER && data.DB_PASSWORD && data.DB_DATABASE;
  }
  return true;
}, {
  message: "Missing environment variables. Id DATABASE_URL is not set, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE must be set.",
  path: ["DB_CONFIG_MISSING"]
});

let env;

try {
  // Validates and parses the env
  env = envSchema.parse(process.env);
  console.log(`Environment loaded: ${env.NODE_ENV}`);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Invalid environment variables:');
    error.issues.forEach(issue => {
      console.error(` - [${issue.path.join('.') || 'Root'}]: ${issue.message}`);
    });
    process.exit(1);
  }
  console.error('An unknown error occured during environment validation:', error);
  process.exit(1);
}

module.exports = env;