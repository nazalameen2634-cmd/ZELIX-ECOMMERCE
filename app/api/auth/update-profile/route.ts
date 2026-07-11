import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createSession } from '@/lib/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zelix-super-secret-jwt-key-change-in-prod'
);

export async function PUT(request: Request) {
  try {
    const sessionCookie = cookies().get('zelix_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedSession;
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      decodedSession = payload as any;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { name, phone } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update in Database
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ full_name: name, phone: phone || null })
      .eq('id', decodedSession.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Re-issue session with new details
    await createSession({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.full_name,
      phone: updatedUser.phone
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.full_name,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
