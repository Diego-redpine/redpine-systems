import Stripe from 'stripe';
import { PaymentProcessor, CreatePaymentParams } from '../payment-providers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID!;

export class StripeConnectProcessor implements PaymentProcessor {
  getConnectUrl(userId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: 'read_write',
      redirect_uri: redirectUri,
      state: userId,
    });
    return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<{
    accountId: string;
    accessToken: string;
    refreshToken?: string;
    metadata?: Record<string, unknown>;
  }> {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    if (!response.stripe_user_id) {
      throw new Error('Failed to connect Stripe account');
    }

    return {
      accountId: response.stripe_user_id,
      accessToken: response.access_token || '',
      refreshToken: response.refresh_token || undefined,
      metadata: {
        livemode: response.livemode,
        token_type: response.token_type,
      },
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<{
    paymentId: string;
    status: string;
    clientSecret?: string;
  }> {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        application_fee_amount: Math.round(params.amount * 0.03), // 3% platform fee
        metadata: params.metadata || {},
      },
      {
        stripeAccount: params.connectedAccountId,
      }
    );

    return {
      paymentId: paymentIntent.id,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<{
    refundId: string;
    status: string;
  }> {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      ...(amount ? { amount } : {}),
    });

    return {
      refundId: refund.id,
      status: refund.status || 'unknown',
    };
  }
}
