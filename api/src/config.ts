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
  redashBaseUrl: process.env['REDASH_BASE_URL'] ?? 'https://reports.eldorado.io',
  redashApiKey: process.env['REDASH_API_KEY'] ?? '',
  redashUserQueryId: process.env['REDASH_USER_QUERY_ID'] ?? '1464',
  resendApiKey: process.env['RESEND_API_KEY'] ?? '',
  emailFrom: process.env['EMAIL_FROM'] ?? 'Guillermo - El Dorado <onboarding@resend.dev>',
} as const;
