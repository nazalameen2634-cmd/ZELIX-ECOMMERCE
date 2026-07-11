import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, otp } = await request.json();

    if (!email || !password || !name || !phone || !otp) {
      return NextResponse.json({ error: 'All fields including OTP are required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Verify OTP
    const { data: otpRecords, error: fetchError } = await supabaseAdmin
      .from('otp')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('purpose', 'register')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const otpRecord = otpRecords[0];

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from('otp')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash,
        full_name: name,
        phone: phone || null,
        email_verified: true, // Mark as verified since they used OTP
        role: 'user',
        last_login: new Date().toISOString()
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('Registration DB Error:', createError);
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }

    // Create Session
    await createSession({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.full_name,
      phone: newUser.phone
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
