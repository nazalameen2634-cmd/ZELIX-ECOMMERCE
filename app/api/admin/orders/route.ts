import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { order_id, fulfillment_status, tracking_number, tracking_carrier, admin_note } = body;

    if (!order_id) {
      return NextResponse.json({ message: 'Missing order_id' }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (fulfillment_status) {
      updates.fulfillment_status = fulfillment_status;
    }
    if (tracking_number !== undefined) {
      updates.tracking_number = tracking_number;
    }
    if (tracking_carrier !== undefined) {
      updates.tracking_carrier = tracking_carrier;
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', order_id);

    if (updateError) {
      console.error('Database update error in admin orders API:', updateError);
      return NextResponse.json({ message: 'Update failed', error: updateError.message }, { status: 500 });
    }

    // Insert to timeline if fulfillment status changed
    if (fulfillment_status) {
      await supabaseAdmin.from('order_timeline').insert([
        {
          order_id: order_id,
          status: fulfillment_status,
          note: `Fulfillment status changed to: ${fulfillment_status.toUpperCase()}`,
        },
      ]);
    }

    // Insert to timeline if tracking number was updated
    if (tracking_number) {
      await supabaseAdmin.from('order_timeline').insert([
        {
          order_id: order_id,
          status: fulfillment_status || 'processing',
          note: `Shipment tracking added: ${tracking_carrier || 'BLUE DART'} // ID: ${tracking_number}`,
        },
      ]);
    }

    // Insert to timeline if custom admin note added
    if (admin_note) {
      await supabaseAdmin.from('order_timeline').insert([
        {
          order_id: order_id,
          status: fulfillment_status || 'processing',
          note: `Admin note: ${admin_note}`,
        },
      ]);
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('Admin order update route error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
