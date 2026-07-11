import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseServer';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// Helper to generate a 6-digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Rate limiting / resend limits check (simple implementation)
    // We check how many OTPs were generated for this email in the last 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: recentOtps, error: checkError } = await supabaseAdmin
      .from('otp')
      .select('id')
      .eq('email', email)
      .gte('created_at', fifteenMinsAgo);

    if (checkError) {
      console.error('Error checking OTPs:', checkError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (recentOtps && recentOtps.length >= 5) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

    // In a real production app without RESEND_API_KEY, you might log the OTP for dev
    console.log(`[DEV OTP for ${email}]: ${otp}`);

    // Save to DB
    const { error: dbError } = await supabaseAdmin
      .from('otp')
      .insert({
        email,
        otp_code: otp,
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error('Error saving OTP:', dbError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Send via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'ZELIX <onboarding@resend.dev>', // Update to your domain in production
          to: email,
          subject: 'Your ZELIX Verification Code',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #000; color: #fff; border-radius: 12px;">
              <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 2px; margin-bottom: 30px;">ZELIX</h1>
              <p style="font-size: 16px; color: #a1a1aa; margin-bottom: 20px;">Welcome to ZELIX. Use the following verification code to access your account.</p>
              <div style="background-color: #18181b; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: 600; letter-spacing: 4px; margin-bottom: 20px;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #71717a; margin-bottom: 10px;">This code will expire in 5 minutes.</p>
              <p style="font-size: 12px; color: #52525b;">Security note: Do not share this code with anyone.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails in dev (so we can read it from console)
      }
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
