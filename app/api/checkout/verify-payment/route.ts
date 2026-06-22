import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { triggerOrderSuccessFlow } from '@/lib/whatsapp';

// Use service role key so this server-side route bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_items, // array of cart items to persist
    } = await request.json();

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // ── 1. Verify Razorpay signature ────────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json(
        { message: 'Server configuration error: missing Razorpay secret' },
        { status: 500 }
      );
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // ── 2. Fetch the internal order record ─────────────────────────────────
    const { data: orderData, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_number', order_id)
      .single();

    if (fetchError || !orderData) {
      console.error('Order not found:', fetchError);
      return NextResponse.json(
        { message: 'Order not found in database' },
        { status: 404 }
      );
    }

    // ── 3. Update order payment status ─────────────────────────────────────
    let { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        fulfillment_status: 'processing',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderData.id);

    // Fallback if razorpay_order_id column is missing in the database table
    if (updateError && (updateError.message.includes('column') || updateError.message.includes('razorpay_order_id'))) {
      console.warn('razorpay_order_id column missing. Falling back to updating razorpay_payment_id only.');
      const { error: fallbackError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          fulfillment_status: 'processing',
          razorpay_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderData.id);
      updateError = fallbackError;
    }

    if (updateError) {
      console.error('Database update error during payment verification:', updateError);
      return NextResponse.json(
        { message: 'Payment verified but order update failed', error: updateError.message },
        { status: 500 }
      );
    }

    // ── 4. Insert order items ───────────────────────────────────────────────
    if (order_items && Array.isArray(order_items) && order_items.length > 0) {
      const orderItemsRows = order_items.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.product_id || null,
        variant_id: item.variant_id || null,
        title: item.title,
        variant_info: item.variant_info || {},
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItemsRows);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        // Non-fatal — order is paid, items can be reconciled manually
      }
    }

    // ── 5. Log to order timeline ────────────────────────────────────────────
    await supabaseAdmin.from('order_timeline').insert([
      {
        order_id: orderData.id,
        status: 'processing',
        note: `Payment successfully captured via Razorpay. Payment ID: ${razorpay_payment_id}`,
      },
    ]);

    // Trigger WhatsApp notification & invoice PDF generation
    try {
      await triggerOrderSuccessFlow(order_id);
    } catch (flowErr) {
      console.error('Failed to trigger order success flow:', flowErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
