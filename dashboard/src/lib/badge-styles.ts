// Shared status badge styling — used by CardView, ListView, TableView
// Single source of truth for status → color mapping

export function getStatusBadgeStyle(value: string): { bg: string; text: string } {
  const lower = value.toLowerCase();
  if (['active', 'paid', 'complete', 'completed', 'shipped', 'published', 'success', 'done', 'won'].includes(lower)) {
    return { bg: '#ECFDF5', text: '#059669' };
  }
  if (['overdue', 'failed', 'cancelled', 'rejected', 'lost', 'inactive'].includes(lower)) {
    return { bg: '#FEF2F2', text: '#DC2626' };
  }
  if (['pending', 'in_progress', 'in progress', 'draft', 'new', 'open'].includes(lower)) {
    return { bg: '#F3F4F6', text: '#4B5563' };
  }
  if (['qualified', 'approved', 'confirmed'].includes(lower)) {
    return { bg: '#EFF6FF', text: '#2563EB' };
  }
  return { bg: '#F3F4F6', text: '#4B5563' };
}

export function isStatusValue(value: string): boolean {
  const lower = value.toLowerCase();
  return ['active', 'inactive', 'paid', 'pending', 'overdue', 'complete', 'completed', 'done',
    'in_progress', 'in progress', 'draft', 'new', 'open', 'qualified', 'approved', 'confirmed',
    'shipped', 'published', 'failed', 'cancelled', 'rejected', 'lost', 'won', 'success'].includes(lower);
}
