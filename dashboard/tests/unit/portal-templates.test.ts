import { describe, it, expect } from 'vitest';
import { getPortalConfig, getPortalSections } from '@/lib/portal-templates';

describe('getPortalConfig', () => {
  it('returns default config when no business type given', () => {
    const config = getPortalConfig();
    expect(config).toBeTruthy();
    expect(config.primaryAction).toBeTruthy();
    expect(config.bookingMode).toBeTruthy();
    expect(config.reviewPrompt).toBeTruthy();
  });

  it('returns nail_salon config with preference fields', () => {
    const config = getPortalConfig('nail_salon');
    expect(config.preferenceFields.length).toBeGreaterThan(0);
    expect(config.preferenceFields.some(f => f.key === 'nail_shape')).toBe(true);
  });

  it('returns restaurant config with menu booking mode', () => {
    const config = getPortalConfig('restaurant');
    expect(config.bookingMode).toBe('menu');
  });

  it('returns valid config for unknown business type', () => {
    const config = getPortalConfig('space_station');
    expect(config).toBeTruthy();
    expect(config.primaryAction).toBeTruthy();
  });
});

describe('getPortalSections', () => {
  it('returns 8 portal sections', () => {
    expect(getPortalSections()).toHaveLength(8);
  });

  it('includes all required section types', () => {
    const ids = getPortalSections().map(s => s.id);
    expect(ids).toContain('account');
    expect(ids).toContain('history');
    expect(ids).toContain('loyalty');
    expect(ids).toContain('messages');
    expect(ids).toContain('reviews');
    expect(ids).toContain('cards');
    expect(ids).toContain('notifications');
    expect(ids).toContain('book');
  });
});
