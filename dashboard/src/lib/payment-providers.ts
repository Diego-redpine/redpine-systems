// Payment Provider Abstraction Layer
// Factory + Strategy pattern for multi-processor support

export interface PaymentProcessor {
  /** Get the OAuth authorization URL */
  getConnectUrl(userId: string, redirectUri: string): string;

  /** Handle the OAuth callback, return account details */
  handleCallback(code: string, redirectUri: string): Promise<{
    accountId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
  }>;

  /** Create a payment on the connected account */
  createPayment(params: CreatePaymentParams): Promise<{
    paymentId: string;
    status: string;
    clientSecret?: string;
  }>;

  /** Refund a payment */
  refundPayment(paymentId: string, amount?: number): Promise<{
    refundId: string;
    status: string;
  }>;
}

export interface CreatePaymentParams {
  amount: number; // in cents
  currency: string;
  description: string;
  connectedAccountId: string;
  accessToken?: string;
  metadata?: Record<string, string>;
}

export type PaymentProvider = 'stripe_connect' | 'square';

/**
 * Factory function to get the appropriate payment processor
 */
export async function getPaymentProcessor(provider: PaymentProvider): Promise<PaymentProcessor> {
  switch (provider) {
    case 'stripe_connect': {
      const { StripeConnectProcessor } = await import('./payment-providers/stripe-connect');
      return new StripeConnectProcessor();
    }
    case 'square': {
      const { SquareProcessor } = await import('./payment-providers/square');
      return new SquareProcessor();
    }
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}
