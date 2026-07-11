import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name || !phone) {
      return NextResponse.json({ error: 'Email, password, name, and phone are required' }, { status: 400 });
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
        email_verified: false,
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
