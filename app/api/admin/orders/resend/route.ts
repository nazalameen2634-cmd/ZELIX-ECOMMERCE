import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { triggerOrderSuccessFlow, sendShipmentUpdateWhatsApp } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, action } = body;

    if (!order_id || !action) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle();

    if (!order || error) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (action === 'invoice') {
      await triggerOrderSuccessFlow(order.id);
      return NextResponse.json({ success: true, message: 'Invoice regenerated and notifications resent successfully' });
    } else if (action === 'notification') {
      await sendShipmentUpdateWhatsApp(order, order.fulfillment_status, order.fulfillment_status);
      return NextResponse.json({ success: true, message: 'Status notification resent successfully' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Resend handler error:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
