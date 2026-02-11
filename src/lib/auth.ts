import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { LoginSchema } from '@/lib/validations';
import type { AuthOptions } from 'next-auth';
import '@/lib/env-check';

// Secret hardcoded per Vercel (temporaneo)
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'KW075njmAZlbgqWF7uvf26GOHVSbm4RKU2C+zGE3byY=';
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

export const authConfig: AuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const result = LoginSchema.safeParse(credentials);
          
          if (!result.success) {
            console.log('[Auth] Validation failed:', result.error);
            return null;
          }

          const { email, password } = result.data;
          console.log('[Auth] Attempting login for:', email);

          const user = await prisma.user.findUnique({
            where: { email },
            include: { prProfile: true },
          });

          if (!user) {
            console.log('[Auth] User not found:', email);
            return null;
          }

          if (!user.passwordHash) {
            console.log('[Auth] User has no password hash:', email);
            return null;
          }

          console.log('[Auth] Comparing passwords...');
          const isPasswordValid = await compare(password, user.passwordHash);

          if (!isPasswordValid) {
            console.log('[Auth] Invalid password for:', email);
            return null;
          }

          console.log('[Auth] Login successful for:', email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            username: user.username || null,
            birthDate: user.birthDate || null,
            age: user.age || null,
            ageVerified: user.ageVerified ?? false,
            identityVerified: user.identityVerified ?? false,
            prProfile: user.prProfile ? {
              id: user.prProfile.id,
              displayName: user.prProfile.displayName || undefined,
              referralCode: user.prProfile.referralCode,
            } : null,
          };
        } catch (error) {
          console.error('[Auth] Error during authorization:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // Aggiungi info user al token solo al primo login
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
        token.birthDate = user.birthDate;
        token.age = user.age;
        token.ageVerified = user.ageVerified;
        token.identityVerified = user.identityVerified;
        token.prProfile = user.prProfile;
      } else {
        // Aggiorna il ruolo ad ogni richiesta per evitare stale data
        if (token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { 
              role: true,
              age: true,
              ageVerified: true,
              identityVerified: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.age = dbUser.age || null;
            token.ageVerified = dbUser.ageVerified ?? false;
            token.identityVerified = dbUser.identityVerified ?? false;
          }
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.phone = token.phone;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.username = token.username;
        session.user.birthDate = token.birthDate;
        session.user.age = token.age;
        session.user.ageVerified = token.ageVerified || false;
        session.user.identityVerified = token.identityVerified || false;
        session.user.prProfile = token.prProfile;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};

// Export alias per compatibilità
export const authOptions = authConfig;
