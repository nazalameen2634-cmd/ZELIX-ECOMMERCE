import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    // 1. Verify OTP
    const { data: otpRecords, error: fetchError } = await supabaseAdmin
      .from('otp')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('purpose', 'password_reset')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const otpRecord = otpRecords[0];

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from('otp')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // 3. Update User's password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash })
      .eq('email', email);

    if (updateError) {
      console.error('Password reset DB error:', updateError);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
