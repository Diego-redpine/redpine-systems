import { PaymentProcessor, CreatePaymentParams } from '../payment-providers';

const APP_ID = process.env.SQUARE_APPLICATION_ID!;
const APP_SECRET = process.env.SQUARE_APPLICATION_SECRET!;
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

export class SquareProcessor implements PaymentProcessor {
  getConnectUrl(userId: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: APP_ID,
      scope: 'PAYMENTS_WRITE PAYMENTS_READ MERCHANT_PROFILE_READ',
      session: 'false',
      state: userId,
      redirect_uri: redirectUri,
    });
    return `${BASE_URL}/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, redirectUri: string): Promise<{
    accountId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
  }> {
    const response = await fetch(`${BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(data.message || 'Failed to connect Square account');
    }

    return {
      accountId: data.merchant_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || undefined,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      metadata: {
        token_type: data.token_type,
        short_lived: data.short_lived,
      },
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<{
    paymentId: string;
    status: string;
  }> {
    const response = await fetch(`${API_URL}/v2/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.accessToken}`,
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        source_id: 'EXTERNAL',
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount: params.amount,
          currency: params.currency.toUpperCase(),
        },
        note: params.description,
        external_details: {
          type: 'OTHER',
          source: 'Red Pine',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Payment failed');
    }

    return {
      paymentId: data.payment.id,
      status: data.payment.status,
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<{
    refundId: string;
    status: string;
  }> {
    // For Square refunds, we need the access token passed separately
    // This is a simplified version — in production, fetch the token from DB
    throw new Error(`Square refund for ${paymentId} (${amount}) requires access token — use integration route`);
  }

  /**
   * Refresh Square OAuth token (tokens expire every 30 days)
   * Call this when token is within 5 days of expiry
   */
  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const response = await fetch(`${BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error('Failed to refresh Square token');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at),
    };
  }
}
