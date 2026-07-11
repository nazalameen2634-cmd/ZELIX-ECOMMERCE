import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ 
    authenticated: true, 
    user: {
      id: session.id,
      email: session.email,
      role: session.role,
      name: session.name,
      phone: session.phone
    } 
  });
}
