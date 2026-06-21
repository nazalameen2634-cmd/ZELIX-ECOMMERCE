import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.Razorpay_WEBHOOK_SECRET || '';

    // Verify webhook signature if secret is configured
    if (secret) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(bodyText);
      const expectedSignature = hmac.digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { message: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    } else {
      console.warn('Razorpay_WEBHOOK_SECRET not defined. Bypassing webhook verification.');
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    // Handle payment capture events
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // Locate corresponding order in database
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (orderData) {
        // Update payment and fulfillment states
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            fulfillment_status: 'processing',
            razorpay_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderData.id);

        // Add timeline updates log
        await supabase.from('order_timeline').insert([
          {
            order_id: orderData.id,
            status: 'processing',
            note: `Payment captured via webhook: ${event}. Payment ID: ${razorpayPaymentId}`,
          },
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
