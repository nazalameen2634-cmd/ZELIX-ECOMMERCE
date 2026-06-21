import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { amount, receipt } = await request.json();

    if (!amount || !receipt) {
      return NextResponse.json(
        { message: 'Amount and receipt parameters are required' },
        { status: 400 }
      );
    }

    // Razorpay requires amounts to be represented in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: receipt,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json(razorpayOrder);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
