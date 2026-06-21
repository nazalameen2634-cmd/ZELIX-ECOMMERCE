import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sanitize URL to remove trailing slashes or spaces which cause "Invalid path specified in request URL" errors
const getAdminSupabase = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const sanitizedUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  
  return createClient(
    sanitizedUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
  );
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
