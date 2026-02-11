import { NextRequest, NextResponse } from 'next/server';
import { authRequired } from '@/lib/middleware/auth-required';
import { SendOTPSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/phone/send-otp
 * Step 3a: Send OTP to phone number
 * Mock implementation - logs OTP to console instead of SMS
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authData = await authRequired(req);
    if ('status' in authData) return authData; // Error response

    const { userId } = authData;

    // Validate input
    const body = await req.json();
    const validated = SendOTPSchema.parse(body);
    const { phoneNumber } = validated;

    // Check if phone already verified by another user
    const existingPhone = await prisma.userPhone.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone && existingPhone.userId !== userId && existingPhone.phoneVerified) {
      return NextResponse.json(
        { error: 'Numero di telefono già associato a un altro account' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // OTP expires in 5 minutes
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create or update UserPhone record
    await prisma.userPhone.upsert({
      where: { userId },
      create: {
        userId,
        phoneNumber,
        phoneVerified: false,
        otpCode,
        otpExpiresAt,
        otpAttempts: 0,
      },
      update: {
        phoneNumber, // Allow updating phone number
        otpCode,
        otpExpiresAt,
        otpAttempts: 0, // Reset attempts on new OTP request
      },
    });

    // MOCK: Log OTP to console (in production, send via SMS provider)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 OTP MOCK - DEVELOPMENT ONLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Phone: ${phoneNumber}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`Expires: ${otpExpiresAt.toLocaleString('it-IT')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      data: {
        message: 'Codice OTP inviato con successo',
        phoneNumber,
        expiresIn: 300, // seconds
        // DEVELOPMENT ONLY: return OTP in response for testing
        ...(process.env.NODE_ENV === 'development' && { otpCode }),
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Numero di telefono non valido', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante l\'invio del codice OTP' },
      { status: 500 }
    );
  }
}
