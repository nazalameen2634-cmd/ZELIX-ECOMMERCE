import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { triggerOrderSuccessFlow } from '@/lib/whatsapp';
import { triggerOrderEmailFlow } from '@/lib/email';

// Create a direct admin client to update statuses bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const order_id = url.searchParams.get('order_id');

    // Parse the form data posted by Razorpay redirect
    const formData = await request.formData();
    const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
    const razorpay_order_id = formData.get('razorpay_order_id') as string;
    const razorpay_signature = formData.get('razorpay_signature') as string;

    console.log(`verify-payment-redirect received: order_id=${order_id}, payment_id=${razorpay_payment_id}`);

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing signature verification fields in Razorpay redirect payload');
      return NextResponse.redirect(`${url.origin}/checkout?error=payment_failed`, 303);
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.redirect(`${url.origin}/checkout?error=config_error`, 303);
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Razorpay signature verification failed on redirect');
      return NextResponse.redirect(`${url.origin}/checkout?error=signature_failed`, 303);
    }

    // Fetch the order
    const { data: orderData, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_number', order_id)
      .single();

    if (fetchError || !orderData) {
      console.error('Order not found on redirect verification:', fetchError);
      return NextResponse.redirect(`${url.origin}/checkout?error=order_not_found`, 303);
    }

    // Try updating orders with razorpay_order_id first
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
      console.error('Failed to update order status on redirect:', updateError);
      return NextResponse.redirect(`${url.origin}/checkout?error=db_update_failed`, 303);
    }

    // Insert order timeline log
    await supabaseAdmin.from('order_timeline').insert([
      {
        order_id: orderData.id,
        status: 'processing',
        note: `Payment successfully captured via redirect. Payment ID: ${razorpay_payment_id}`,
      },
    ]);

    // Trigger WhatsApp notification & invoice PDF generation
    try {
      await triggerOrderSuccessFlow(order_id);
    } catch (flowErr) {
      console.error('Failed to trigger order success flow:', flowErr);
    }

    // Trigger Email notification with PDF invoice attachment
    try {
      await triggerOrderEmailFlow(order_id);
    } catch (emailErr) {
      console.error('Failed to trigger order success email flow:', emailErr);
    }

    // Redirect to storefront checkout success screen
    return NextResponse.redirect(`${url.origin}/checkout/success?orderNumber=${order_id}`, 303);
  } catch (error: any) {
    console.error('Unexpected exception during redirect payment verification:', error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/checkout?error=exception`, 303);
  }
}
