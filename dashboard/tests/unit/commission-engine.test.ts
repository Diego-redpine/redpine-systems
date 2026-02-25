import { describe, it, expect } from 'vitest';
import { calculateCommission, formatCents, CommissionConfig, CommissionTransaction } from '@/lib/commission-engine';

describe('calculateCommission', () => {
  describe('flat commission', () => {
    const config: CommissionConfig = { type: 'flat', flat_amount_cents: 500 };

    it('returns flat amount regardless of transaction', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(500);
    });

    it('returns 0 when flat_amount_cents is missing', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission({ type: 'flat' }, tx)).toBe(0);
    });
  });

  describe('percentage commission', () => {
    const config: CommissionConfig = { type: 'percentage', percentage: 15 };

    it('calculates percentage of transaction amount', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(1500);
    });

    it('rounds to nearest cent', () => {
      const cfg: CommissionConfig = { type: 'percentage', percentage: 33 };
      const tx: CommissionTransaction = { amount_cents: 1001, type: 'service' };
      expect(calculateCommission(cfg, tx)).toBe(330);
    });

    it('returns 0 for zero amount', () => {
      const tx: CommissionTransaction = { amount_cents: 0, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(0);
    });

    it('returns 0 when percentage is null', () => {
      const tx: CommissionTransaction = { amount_cents: 10000, type: 'service' };
      expect(calculateCommission({ type: 'percentage' }, tx)).toBe(0);
    });
  });

  describe('tiered commission', () => {
    const config: CommissionConfig = {
      type: 'tiered',
      tiers: [
        { min_cents: 0, max_cents: 5000, percentage: 10 },
        { min_cents: 5001, max_cents: 10000, percentage: 15 },
        { min_cents: 10001, max_cents: 50000, percentage: 20 },
      ],
    };

    it('matches correct tier for low amount', () => {
      const tx: CommissionTransaction = { amount_cents: 3000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(300);
    });

    it('matches correct tier for mid amount', () => {
      const tx: CommissionTransaction = { amount_cents: 8000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(1200);
    });

    it('matches correct tier for high amount', () => {
      const tx: CommissionTransaction = { amount_cents: 20000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(4000);
    });

    it('uses highest tier for amounts above all tiers', () => {
      const tx: CommissionTransaction = { amount_cents: 100000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(20000);
    });

    it('returns 0 for empty tiers', () => {
      const tx: CommissionTransaction = { amount_cents: 5000, type: 'service' };
      expect(calculateCommission({ type: 'tiered', tiers: [] }, tx)).toBe(0);
    });
  });

  describe('product commission', () => {
    const config: CommissionConfig = {
      type: 'product',
      percentage: 15,
      product_percentage: 10,
    };

    it('uses product_percentage for product transactions', () => {
      const tx: CommissionTransaction = { amount_cents: 5000, type: 'product' };
      expect(calculateCommission(config, tx)).toBe(500);
    });

    it('uses percentage for non-product transactions', () => {
      const tx: CommissionTransaction = { amount_cents: 5000, type: 'service' };
      expect(calculateCommission(config, tx)).toBe(750);
    });

    it('uses percentage for tip transactions', () => {
      const tx: CommissionTransaction = { amount_cents: 2000, type: 'tip' };
      expect(calculateCommission(config, tx)).toBe(300);
    });
  });

  describe('edge cases', () => {
    it('returns 0 for null config', () => {
      expect(calculateCommission(null as any, { amount_cents: 100, type: 'service' })).toBe(0);
    });

    it('returns 0 for null transaction', () => {
      expect(calculateCommission({ type: 'flat', flat_amount_cents: 100 }, null as any)).toBe(0);
    });

    it('returns 0 for unknown commission type', () => {
      expect(calculateCommission({ type: 'unknown' as any }, { amount_cents: 100, type: 'service' })).toBe(0);
    });
  });
});

describe('formatCents', () => {
  it('formats cents to dollar string', () => {
    expect(formatCents(1500)).toBe('$15.00');
    expect(formatCents(0)).toBe('$0.00');
    expect(formatCents(99)).toBe('$0.99');
    expect(formatCents(10050)).toBe('$100.50');
  });
});
