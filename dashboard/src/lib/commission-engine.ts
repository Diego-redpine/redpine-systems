export interface CommissionConfig {
  type: 'flat' | 'percentage' | 'tiered' | 'product';
  flat_amount_cents?: number;
  percentage?: number;
  tiers?: { min_cents: number; max_cents: number; percentage: number }[];
  product_percentage?: number;
}

export interface CommissionTransaction {
  amount_cents: number;
  type: 'service' | 'product' | 'invoice' | 'tip';
}

export function calculateCommission(
  config: CommissionConfig,
  transaction: CommissionTransaction
): number {
  if (!config || !transaction) return 0;

  switch (config.type) {
    case 'flat': {
      return config.flat_amount_cents ?? 0;
    }

    case 'percentage': {
      if (config.percentage == null) return 0;
      return Math.round(transaction.amount_cents * (config.percentage / 100));
    }

    case 'tiered': {
      if (!config.tiers || config.tiers.length === 0) return 0;
      const amount = transaction.amount_cents;
      const matchedTier = config.tiers.find(
        (t) => amount >= t.min_cents && amount <= t.max_cents
      );
      if (matchedTier) {
        return Math.round(amount * (matchedTier.percentage / 100));
      }
      const highestTier = config.tiers.reduce((prev, curr) =>
        curr.max_cents > prev.max_cents ? curr : prev
      );
      if (amount > highestTier.max_cents) {
        return Math.round(amount * (highestTier.percentage / 100));
      }
      return 0;
    }

    case 'product': {
      if (transaction.type === 'product') {
        if (config.product_percentage == null) return 0;
        return Math.round(
          transaction.amount_cents * (config.product_percentage / 100)
        );
      }
      if (config.percentage == null) return 0;
      return Math.round(transaction.amount_cents * (config.percentage / 100));
    }

    default:
      return 0;
  }
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
