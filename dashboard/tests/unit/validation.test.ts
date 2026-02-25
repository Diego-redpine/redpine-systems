import { describe, it, expect } from 'vitest';
import {
  consolidateCalendars,
  enforceTabLimit,
  ensureGallery,
  stripLockedFlags,
  type RawConfig,
} from '@/lib/onboarding/validation';

describe('consolidateCalendars', () => {
  it('clears Dashboard tab components', () => {
    const config: RawConfig = {
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [{ id: 'calendar', label: 'Cal', view: 'calendar' }] },
      ],
    };
    const result = consolidateCalendars(config);
    expect(result.tabs![0].components).toHaveLength(0);
  });

  it('keeps only one calendar view across all tabs', () => {
    const config: RawConfig = {
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [] },
        { id: 'tab_2', label: 'Scheduling', components: [
          { id: 'appointments', label: 'Appointments' },
          { id: 'classes', label: 'Classes' },
        ]},
      ],
    };
    const result = consolidateCalendars(config);
    const schedulingTab = result.tabs![1];
    const calendarComps = schedulingTab.components.filter((c: any) => c.view === 'calendar');
    expect(calendarComps.length).toBeLessThanOrEqual(1);
  });
});

describe('enforceTabLimit', () => {
  it('keeps config unchanged when under limit', () => {
    const config: RawConfig = {
      tabs: Array.from({ length: 5 }, (_, i) => ({
        id: `tab_${i}`, label: `Tab ${i}`, components: [],
      })),
    };
    expect(enforceTabLimit(config).tabs!.length).toBe(5);
  });

  it('truncates to 8 tabs when over limit', () => {
    const config: RawConfig = {
      tabs: Array.from({ length: 12 }, (_, i) => ({
        id: `tab_${i}`, label: `Tab ${i}`, components: [],
      })),
    };
    expect(enforceTabLimit(config).tabs!.length).toBe(8);
  });
});

describe('ensureGallery', () => {
  it('adds gallery to visual industry missing one', () => {
    const config: RawConfig = {
      business_type: 'nail_salon',
      tabs: [
        { id: 'tab_1', label: 'Dashboard', components: [] },
        { id: 'tab_2', label: 'Services', components: [{ id: 'services', label: 'Services' }] },
      ],
    };
    const result = ensureGallery(config);
    const allComps = result.tabs!.flatMap(t => t.components);
    expect(allComps.some((c: any) => c.id === 'galleries')).toBe(true);
  });

  it('does not add gallery to non-visual industry', () => {
    const config: RawConfig = {
      business_type: 'accountant',
      tabs: [{ id: 'tab_1', label: 'Dashboard', components: [] }],
    };
    const result = ensureGallery(config);
    const allComps = result.tabs!.flatMap(t => t.components);
    expect(allComps.some((c: any) => c.id === 'galleries')).toBe(false);
  });
});

describe('stripLockedFlags', () => {
  it('removes _locked and _removable', () => {
    const config: RawConfig = {
      tabs: [{
        id: 'tab_1', label: 'Test', _removable: false,
        components: [{ id: 'c1', label: 'C1', _locked: true }],
      }],
    };
    const result = stripLockedFlags(config);
    expect((result.tabs![0] as any)._removable).toBeUndefined();
    expect((result.tabs![0].components[0] as any)._locked).toBeUndefined();
  });
});
