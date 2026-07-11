import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseServer';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    // To prevent email enumeration, we will return a success message even if the email doesn't exist.
    // However, we won't generate an OTP or send an email.
    if (userError || !user) {
       return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }

    // Rate limiting check
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentOtps } = await supabaseAdmin
      .from('otp')
      .select('id')
      .eq('email', email)
      .eq('purpose', 'password_reset')
      .gte('created_at', fifteenMinsAgo);

    if (recentOtps && recentOtps.length >= 5) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    console.log(`[DEV Password Reset OTP for ${email}]: ${otp}`);

    // Save to DB
    const { error: dbError } = await supabaseAdmin
      .from('otp')
      .insert({
        email,
        otp_code: otp,
        purpose: 'password_reset',
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error('Error saving OTP:', dbError);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    // Send via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'ZELIX <onboarding@resend.dev>', // Update to your domain in production
          to: email,
          subject: 'ZELIX Password Reset Code',
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #000; color: #fff; border-radius: 12px;">
              <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 2px; margin-bottom: 30px;">ZELIX</h1>
              <p style="font-size: 16px; color: #a1a1aa; margin-bottom: 20px;">You requested a password reset. Use the following code to set a new password.</p>
              <div style="background-color: #18181b; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: 600; letter-spacing: 4px; margin-bottom: 20px;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #71717a; margin-bottom: 10px;">This code will expire in 10 minutes.</p>
              <p style="font-size: 12px; color: #52525b;">If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    return NextResponse.json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
