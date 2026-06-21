import Razorpay from 'razorpay';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_PUBLISHABLE_KEY || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY || '';

if (!keyId || !keySecret) {
  console.warn(
    'Razorpay credentials (NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing. Sandbox preview elements will be activated.'
  );
}

export const razorpay = (keyId && keySecret)
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null as unknown as Razorpay;
