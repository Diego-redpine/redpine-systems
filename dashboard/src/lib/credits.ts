export const FREE_MONTHLY_CREDITS = 100;
export const FREE_RESET_DAYS = 30;

export interface CreditTier {
  id: string;
  credits: number;
  price: number; // in cents
  priceDisplay: string;
  label: string;
  popular?: boolean;
}

export const CREDIT_TIERS: CreditTier[] = [
  { id: 'starter', credits: 100, price: 500, priceDisplay: '$5', label: 'Starter' },
  { id: 'popular', credits: 200, price: 1000, priceDisplay: '$10', label: 'Popular', popular: true },
  { id: 'pro', credits: 300, price: 1500, priceDisplay: '$15', label: 'Pro' },
];

export interface CreditBalance {
  free_balance: number;
  purchased_balance: number;
  total: number;
  free_reset_at: string;
  next_reset: string;
}

/** Get badge color based on total credits remaining */
export function getCreditBadgeColor(total: number): string {
  if (total >= 50) return '#10B981'; // green
  if (total >= 10) return '#F59E0B'; // yellow
  return '#EF4444'; // red
}
