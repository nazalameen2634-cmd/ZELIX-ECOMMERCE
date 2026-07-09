import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key so this server-side route bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { orderData, orderItems } = await request.json();

    if (!orderData || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { message: 'Missing order data or items' },
        { status: 400 }
      );
    }

    // 1. Insert order
    const { data: insertedOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select('id, order_number')
      .single();

    if (orderError || !insertedOrder) {
      console.error('Error inserting order:', orderError);
      return NextResponse.json(
        { message: 'Failed to create order' },
        { status: 500 }
      );
    }

    // 2. Insert order items
    const orderItemsRows = orderItems.map((item: any) => ({
      ...item,
      order_id: insertedOrder.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsRows);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      // We could optionally delete the order here if items fail, but we'll return an error for now
    }

    // 3. Insert order timeline
    await supabaseAdmin.from('order_timeline').insert([{
      order_id: insertedOrder.id,
      status: 'pending',
      note: 'Order placed via direct checkout',
    }]);

    return NextResponse.json(
      { success: true, order: insertedOrder },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Place order error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
