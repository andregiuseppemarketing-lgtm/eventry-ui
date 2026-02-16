import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth';

// Force NEXTAUTH_URL in production to avoid domain mismatch
// Production custom domain must take precedence over preview URLs
if (process.env.VERCEL_ENV === 'production') {
  // Override even if already set, to ensure correct custom domain
  process.env.NEXTAUTH_URL = 'https://www.eventry.app';
  console.log('[NextAuth] Production URL forced to:', process.env.NEXTAUTH_URL);
} else if (process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
  // Preview deployments: use auto-generated Vercel URL
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  console.log('[NextAuth] Preview URL set to:', process.env.NEXTAUTH_URL);
}

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

export const runtime = 'nodejs';