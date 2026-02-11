import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      birthDate?: Date | null;
      age?: number | null;
      ageVerified: boolean;
      identityVerified: boolean;
      prProfile?: {
        id: string;
        displayName?: string;
        referralCode: string;
      } | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    birthDate?: Date | null;
    age?: number | null;
    ageVerified: boolean;
    identityVerified: boolean;
    prProfile?: {
      id: string;
      displayName?: string;
      referralCode: string;
    } | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    birthDate?: Date | null;
    age?: number | null;
    ageVerified: boolean;
    identityVerified: boolean;
    prProfile?: {
      id: string;
      displayName?: string;
      referralCode: string;
    } | null;
  }
}