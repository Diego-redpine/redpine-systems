import { describe, it, expect } from 'vitest';
import {
  FREE_MONTHLY_CREDITS,
  FREE_RESET_DAYS,
  CREDIT_TIERS,
  getCreditBadgeColor,
} from '@/lib/credits';

describe('Credit Constants', () => {
  it('FREE_MONTHLY_CREDITS is 100', () => {
    expect(FREE_MONTHLY_CREDITS).toBe(100);
  });

  it('FREE_RESET_DAYS is 30', () => {
    expect(FREE_RESET_DAYS).toBe(30);
  });

  it('CREDIT_TIERS has 3 tiers', () => {
    expect(CREDIT_TIERS).toHaveLength(3);
  });

  it('starter tier is $5 for 100 credits', () => {
    const starter = CREDIT_TIERS.find(t => t.id === 'starter');
    expect(starter).toBeTruthy();
    expect(starter!.price).toBe(500);
    expect(starter!.credits).toBe(100);
  });

  it('popular tier is $10 for 200 credits and marked popular', () => {
    const popular = CREDIT_TIERS.find(t => t.id === 'popular');
    expect(popular).toBeTruthy();
    expect(popular!.price).toBe(1000);
    expect(popular!.credits).toBe(200);
    expect(popular!.popular).toBe(true);
  });

  it('pro tier is $15 for 300 credits', () => {
    const pro = CREDIT_TIERS.find(t => t.id === 'pro');
    expect(pro).toBeTruthy();
    expect(pro!.price).toBe(1500);
    expect(pro!.credits).toBe(300);
  });
});

describe('getCreditBadgeColor', () => {
  it('returns green for 50+ credits', () => {
    expect(getCreditBadgeColor(50)).toBe('#10B981');
    expect(getCreditBadgeColor(100)).toBe('#10B981');
    expect(getCreditBadgeColor(999)).toBe('#10B981');
  });

  it('returns yellow for 10-49 credits', () => {
    expect(getCreditBadgeColor(10)).toBe('#F59E0B');
    expect(getCreditBadgeColor(25)).toBe('#F59E0B');
    expect(getCreditBadgeColor(49)).toBe('#F59E0B');
  });

  it('returns red for less than 10 credits', () => {
    expect(getCreditBadgeColor(9)).toBe('#EF4444');
    expect(getCreditBadgeColor(0)).toBe('#EF4444');
    expect(getCreditBadgeColor(1)).toBe('#EF4444');
  });
});
