/**
 * MILESTONE 7 - Admin API: Test Email
 * POST /api/admin/emails/test
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';
import { logEmail } from '@/lib/email-logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ⚠️ SECURITY: Solo ADMIN
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if Resend is configured
    if (!resend) {
      return NextResponse.json({ 
        error: 'Email service not configured. RESEND_API_KEY missing.' 
      }, { status: 500 });
    }

    // Send test email
    const { data, error } = await resend.emails.send({
      from: 'EVENTRY <onboarding@resend.dev>',
      to: session.user.email || 'andre.giuseppe.marketing@gmail.com',
      subject: 'Test Email - EVENTRY Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">Test Email</h1>
          <p>Questa è una email di test dal backoffice amministrativo.</p>
          <p><strong>Orario invio:</strong> ${new Date().toLocaleString('it-IT')}</p>
          <p><strong>Inviata da:</strong> ${session.user.email}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 14px;">
            EVENTRY Admin Panel<br>
            Questa email è stata generata automaticamente dal sistema.
          </p>
        </div>
      `,
    });

    if (error) {
      await logEmail({
        recipient: session.user.email || 'andre.giuseppe.marketing@gmail.com',
        subject: 'Test Email - EVENTRY Admin',
        type: 'test',
        status: 'failed',
        error: error.message,
      });

      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    await logEmail({
      recipient: session.user.email || 'andre.giuseppe.marketing@gmail.com',
      subject: 'Test Email - EVENTRY Admin',
      type: 'test',
      status: 'sent',
      resendId: data?.id || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent',
      resendId: data?.id,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
