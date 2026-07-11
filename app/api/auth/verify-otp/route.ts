import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // 1. Verify OTP in DB
    const { data: otpRecords, error: fetchError } = await supabaseAdmin
      .from('otp')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
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

    // Mark as verified
    await supabaseAdmin
      .from('otp')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // 2. Check if user exists or create new one
    let user;
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (userError) {
      return NextResponse.json({ error: 'Database error while checking user' }, { status: 500 });
    }

    if (users && users.length > 0) {
      // User exists
      user = users[0];
      
      // Update last_login
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    } else {
      // User does not exist, create new account automatically
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          email_verified: true,
          role: 'user',
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }
      user = newUser;
    }

    // 3. Create Session
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
