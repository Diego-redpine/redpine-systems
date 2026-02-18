'use client';

import { DashboardColors } from '@/types/config';
import { getTextColor, getCardBorder } from '@/lib/view-colors';
import CustomSelect from '@/components/ui/CustomSelect';

interface FilterConfig {
  field: string;
  label: string;
  options: string[];
}

// Entity-specific filter configurations
const FILTER_CONFIGS: Record<string, FilterConfig[]> = {
  clients: [
    { field: 'status', label: 'Status', options: ['active', 'inactive'] },
    { field: 'type', label: 'Type', options: ['client', 'prospect', 'vip'] },
  ],
  leads: [
    { field: 'status', label: 'Status', options: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] },
    { field: 'source', label: 'Source', options: ['website', 'referral', 'social', 'ads', 'other'] },
  ],
  invoices: [
    { field: 'status', label: 'Status', options: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] },
  ],
  tasks: [
    { field: 'status', label: 'Status', options: ['pending', 'in_progress', 'complete'] },
    { field: 'priority', label: 'Priority', options: ['low', 'medium', 'high', 'urgent'] },
  ],
  staff: [
    { field: 'status', label: 'Status', options: ['active', 'inactive'] },
  ],
  messages: [
    { field: 'is_read', label: 'Read', options: ['true', 'false'] },
  ],
  appointments: [
    { field: 'status', label: 'Status', options: ['pending', 'confirmed', 'cancelled', 'completed'] },
  ],
  products: [
    { field: 'category', label: 'Category', options: ['service', 'product', 'package'] },
  ],
};

interface FilterBarProps {
  entityType: string;
  activeFilters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
  configColors: DashboardColors;
}

export default function FilterBar({
  entityType,
  activeFilters,
  onChange,
  configColors,
}: FilterBarProps) {
  const textColor = getTextColor(configColors);
  const borderColor = getCardBorder(configColors);
  const cardBg = configColors.cards || '#FFFFFF';

  const filters = FILTER_CONFIGS[entityType];

  // If no filter config for this entity, render nothing
  if (!filters || filters.length === 0) {
    return null;
  }

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === '' || value === 'all') {
      delete newFilters[field];
    } else {
      newFilters[field] = value;
    }
    onChange(newFilters);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <CustomSelect
          key={filter.field}
          value={activeFilters[filter.field] || ''}
          onChange={(value) => handleFilterChange(filter.field, value)}
          options={filter.options.map(opt => ({ value: opt, label: formatOptionLabel(opt) }))}
          placeholder={`All ${filter.label}`}
          className="w-36"
          style={{
            backgroundColor: cardBg,
            borderColor: borderColor,
            color: textColor,
          }}
          buttonColor={configColors.buttons}
        />
      ))}

      {/* Clear all filters button */}
      {Object.keys(activeFilters).length > 0 && (
        <button
          onClick={() => onChange({})}
          className="px-2 py-1.5 text-sm rounded-md hover:bg-black/5 transition-colors"
          style={{ color: textColor, opacity: 0.7 }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

// Format option labels for display
function formatOptionLabel(option: string): string {
  // Handle boolean strings
  if (option === 'true') return 'Yes';
  if (option === 'false') return 'No';

  // Capitalize and replace underscores
  return option
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
