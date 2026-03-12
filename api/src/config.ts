import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  databaseUrl: required('DATABASE_URL'),
  adminPassword: required('ADMIN_PASSWORD'),
  jwtSecret: required('JWT_SECRET'),
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
} as const;
