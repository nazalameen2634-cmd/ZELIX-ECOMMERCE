import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. Create Coupon (POST)
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { code, type, value, min_order_amount, usage_limit, per_customer_limit, valid_from, valid_to, is_active } = payload;

    if (!code || !type || value === undefined || !valid_from || !valid_to) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert([
        {
          code: code.trim().toUpperCase(),
          type,
          value,
          min_order_amount: min_order_amount || 0,
          usage_limit: usage_limit || null,
          per_customer_limit: per_customer_limit || 1,
          valid_from,
          valid_to,
          is_active: is_active !== undefined ? is_active : true,
          times_used: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error in coupons POST API:', error);
      return NextResponse.json({ message: 'Failed to create coupon', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Coupons POST API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// 2. Update Coupon (PUT)
export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const { id, code, type, value, min_order_amount, usage_limit, per_customer_limit, valid_from, valid_to, is_active } = payload;

    if (!id) {
      return NextResponse.json({ message: 'Missing coupon ID' }, { status: 400 });
    }

    const updates: any = {};
    if (code !== undefined) updates.code = code.trim().toUpperCase();
    if (type !== undefined) updates.type = type;
    if (value !== undefined) updates.value = value;
    if (min_order_amount !== undefined) updates.min_order_amount = min_order_amount;
    if (usage_limit !== undefined) updates.usage_limit = usage_limit;
    if (per_customer_limit !== undefined) updates.per_customer_limit = per_customer_limit;
    if (valid_from !== undefined) updates.valid_from = valid_from;
    if (valid_to !== undefined) updates.valid_to = valid_to;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error in coupons PUT API:', error);
      return NextResponse.json({ message: 'Failed to update coupon', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Coupons PUT API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

// 3. Delete Coupon (DELETE)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing coupon ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error in coupons DELETE API:', error);
      return NextResponse.json({ message: 'Failed to delete coupon', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Coupons DELETE API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
