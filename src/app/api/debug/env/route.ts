import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Presente' : '✗ Mancante',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ Mancante',
    DATABASE_URL: process.env.DATABASE_URL ? '✓ Presente' : '✗ Mancante',
    POSTGRES_URL: process.env.POSTGRES_URL ? '✓ Presente' : '✗ Mancante',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || 'false',
  };

  return NextResponse.json({ 
    status: 'Environment Check',
    environment: env,
    timestamp: new Date().toISOString()
  });
}
