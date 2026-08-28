import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

export const isRazorpayConfigured = !!(keyId && keySecret && !keyId.includes('your_key'));

export const razorpayClient = isRazorpayConfigured
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

export async function createRazorpayOrder(params: {
  amountInInr: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const amountInPaise = params.amountInInr * 100;

  if (isRazorpayConfigured && razorpayClient) {
    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes,
    });
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      isMock: false,
    };
  }

  // Seamless test/mock order fallback when credentials are empty
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    orderId: mockOrderId,
    amount: amountInPaise,
    currency: 'INR',
    keyId: keyId || 'rzp_test_mock_mode',
    isMock: true,
  };
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  // Mock mode ONLY permitted during local development when credentials are intentionally unconfigured
  if (process.env.NODE_ENV !== 'production' && params.orderId.startsWith('order_mock_')) {
    return true;
  }

  if (!keySecret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  return generatedSignature === params.signature;
}
