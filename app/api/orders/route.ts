import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zelix-super-secret-jwt-key-change-in-prod'
);

export async function GET(request: Request) {
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
      decodedSession = payload as { id: string; email: string; role: string; name?: string; phone?: string };
    } catch (err) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!decodedSession || !decodedSession.email) {
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 });
    }

    // Fetch orders matching the user's email or phone number
    // Since phone number is not at the root of the `orders` table in the current schema (it's in shipping_address),
    // and the user might have old orders, we'll fetch by email as the primary key.
    // If you ever extract phone to the root of `orders`, you can do `.or(`email.eq.${email},phone.eq.${phone}`)`
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total, payment_status, fulfillment_status, created_at')
      .eq('email', decodedSession.email)
      .neq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
