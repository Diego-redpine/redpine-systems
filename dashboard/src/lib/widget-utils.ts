/**
 * Shared utilities for website editor widgets.
 * Extracted from BookingWidget, GalleryWidget, booking page, and order page
 * to eliminate duplication.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface SlotInfo {
  time: string;
  available: boolean;
}

export interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  duration_minutes?: number;
  buffer_minutes?: number;
  category?: string;
}

// ─── Subdomain Detection ────────────────────────────────────────

/**
 * Extract the business subdomain from the current hostname.
 * Returns empty string for app/www/localhost (demo/preview contexts).
 */
export function getSubdomain(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const sub = parts.length >= 3 ? parts[0] : '';
  if (!sub || sub === 'app' || sub === 'www' || sub === 'localhost') return '';
  return sub;
}

// ─── Time Slot Generation ───────────────────────────────────────

/**
 * Generate time slots from business hours and service duration.
 * Marks slots as unavailable if they appear in takenSlots.
 *
 * @param startTime - Business hours start in "HH:MM" 24h format (e.g., "09:00")
 * @param endTime - Business hours end in "HH:MM" 24h format (e.g., "17:00")
 * @param durationMinutes - Service duration in minutes
 * @param takenSlots - Array of already-booked time labels (e.g., ["9:00 AM", "2:00 PM"])
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  takenSlots: string[]
): SlotInfo[] {
  const slots: SlotInfo[] = [];
  const takenSet = new Set(takenSlots);

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let mins = startMinutes; mins + durationMinutes <= endMinutes; mins += durationMinutes) {
    const hour = Math.floor(mins / 60);
    const minute = mins % 60;
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const m = minute.toString().padStart(2, '0');
    const label = `${h}:${m} ${ampm}`;
    slots.push({ time: label, available: !takenSet.has(label) });
  }

  return slots;
}

/**
 * Generate fallback slots (9am–5pm, 30min intervals, all available).
 * Used when no real business hours are configured.
 */
export function generateFallbackSlots(): SlotInfo[] {
  return generateTimeSlots('09:00', '17:00', 30, []);
}

// ─── Formatting ─────────────────────────────────────────────────

/**
 * Format cents to dollar string (e.g., 3500 → "$35.00")
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Determine if a hex color is light (for contrast text color decisions).
 * Returns true if the color is light (use dark text on it).
 */
export function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

// ─── Date Helpers ───────────────────────────────────────────────

/**
 * Format a Date to YYYY-MM-DD string for API calls.
 */
export function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Format a Date to a display string (e.g., "Feb 20, 2026")
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
