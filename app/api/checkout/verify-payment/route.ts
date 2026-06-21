import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_SECRET_KEY || process.env.Razorpay_SECRET_KEY || '';

    // Verify signature cryptographically
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // Update Order in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        fulfillment_status: 'processing',
        razorpay_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', order_id);

    if (updateError) {
      console.error('Database update error during payment verification:', updateError);
      return NextResponse.json(
        { message: 'Payment verified but order database update failed' },
        { status: 500 }
      );
    }

    // Create Order Timeline update entry
    try {
      // Find the order record ID
      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', order_id)
        .single();

      if (orderData) {
        await supabase.from('order_timeline').insert([
          {
            order_id: orderData.id,
            status: 'processing',
            note: `Payment successfully captured. ID: ${razorpay_payment_id}`,
          },
        ]);
      }
    } catch (timelineErr) {
      console.error('Error logging order timeline:', timelineErr);
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
