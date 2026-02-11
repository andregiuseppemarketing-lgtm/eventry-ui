import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth';

// Configura NEXTAUTH_URL per Vercel
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.VERCEL_ENV === 'production') {
    process.env.NEXTAUTH_URL = 'https://www.eventry.app';
  }
}

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

export const runtime = 'nodejs';