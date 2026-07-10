export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Query orders where shipping_address->phone matches the input
    // The exact JSON path depends on how it was saved, typical is shipping_address->>phone
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, total, payment_status, fulfillment_status, created_at, order_items(title, quantity, unit_price)')
      .eq('shipping_address->>phone', phone)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
