import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
} from '@/lib/api-helpers';
import { getPaymentProcessor } from '@/lib/payment-providers';

export const dynamic = 'force-dynamic';

// GET /api/integrations/stripe/connect - Redirect to Stripe Connect OAuth
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/integrations/stripe/callback`;

  const processor = await getPaymentProcessor('stripe_connect');
  const authUrl = processor.getConnectUrl(user.id, redirectUri);

  return NextResponse.redirect(authUrl);
}
