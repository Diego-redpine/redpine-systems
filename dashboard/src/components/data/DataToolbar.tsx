'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardColors } from '@/types/config';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import { singularize } from '@/lib/entity-utils';

interface DataToolbarProps {
  entityType: string;
  configColors: DashboardColors;
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: Record<string, string>) => void;
  searchValue: string;
  activeFilters: Record<string, string>;
}

/**
 * Combined SearchBar + FilterBar component with debounced search.
 * Sits between the component header and the view content.
 */
export default function DataToolbar({
  entityType,
  configColors,
  onSearchChange,
  onFilterChange,
  searchValue,
  activeFilters,
}: DataToolbarProps) {
  // Local state for responsive input
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when external value changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Handle search input with 500ms debounce
  const handleSearchChange = (value: string) => {
    // Update local state immediately for responsive typing
    setLocalSearch(value);

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced API call
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Get entity label for placeholder
  const entityLabel = singularize(entityType);
  const pluralLabel = entityLabel.endsWith('s') || entityLabel.endsWith('sh') || entityLabel.endsWith('ch') || entityLabel.endsWith('x')
    ? `${entityLabel}es` : `${entityLabel}s`;
  const placeholder = `Search ${pluralLabel}...`;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search bar takes available width */}
      <div className="flex-1 min-w-[200px]">
        <SearchBar
          value={localSearch}
          onChange={handleSearchChange}
          placeholder={placeholder}
          configColors={configColors}
        />
      </div>

      {/* Filter dropdowns */}
      <FilterBar
        entityType={entityType}
        activeFilters={activeFilters}
        onChange={onFilterChange}
        configColors={configColors}
      />
    </div>
  );
}
