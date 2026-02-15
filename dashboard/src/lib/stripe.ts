import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

// Stripe Product/Price IDs
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;
export const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID!;

// Plan types
export type PlanStatus = 'free' | 'trialing' | 'active' | 'cancelled';

// Check user's plan status
export function checkPlan(plan: string | null | undefined): PlanStatus {
  if (plan === 'active') return 'active';
  if (plan === 'trialing') return 'trialing';
  if (plan === 'cancelled') return 'cancelled';
  return 'free';
}

// Plan feature checks
export function canAccessFullFeatures(plan: PlanStatus): boolean {
  return plan === 'active' || plan === 'trialing';
}

export function isAccountFrozen(plan: PlanStatus): boolean {
  return plan === 'cancelled';
}

export function needsUpgrade(plan: PlanStatus): boolean {
  return plan === 'free' || plan === 'cancelled';
}
