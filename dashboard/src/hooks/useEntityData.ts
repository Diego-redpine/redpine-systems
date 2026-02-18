'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDataMode } from './useDataMode';
import { componentDummyData, ComponentData } from '@/lib/dummy-data';
import { PipelineStage } from '@/types/config';

export interface UseEntityDataOptions {
  search?: string;
  filters?: Record<string, string>;
  sort?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  dateRange?: { start: string; end: string };
  componentId?: string; // Original component ID for dummy data lookup
  pipelineStages?: PipelineStage[]; // Config pipeline stages for dummy→config stage ID remapping
}

export interface UseEntityDataResult {
  data: Record<string, unknown>[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

// Transform ComponentData to Record<string, unknown>[] for consistent output
function transformDummyData(data: ComponentData, entityType: string, configStages?: PipelineStage[]): Record<string, unknown>[] {
  switch (data.type) {
    case 'table':
      return data.rows.map((row, i) => {
        const record: Record<string, unknown> = { id: `${entityType}_${i}` };
        data.headers.forEach((header, j) => {
          const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          record[key] = row[j];
        });
        return record;
      });

    case 'calendar':
      return data.events.map((event, i) => ({
        ...event,
        id: event.id || `event_${i}`,
      }));

    case 'cards':
      return data.items.map((item, i) => ({
        id: item.id || `item_${i}`,
        name: item.title,
        title: item.title,
        subtitle: item.subtitle,
        meta: item.meta,
        avatar: item.avatar,
        image: item.image,
        status: item.status,
        metric: item.metric,
      }));

    case 'list':
      return data.items.map((item, i) => ({
        id: item.id || `item_${i}`,
        name: item.title,
        title: item.title,
        subtitle: item.subtitle,
        status: item.status,
        meta: item.meta,
      }));

    case 'pipeline':
      const records: Record<string, unknown>[] = [];
      // Build dummy→config stage ID map by matching stage names
      let stageIdMap: Record<string, string> | undefined;
      if (configStages && configStages.length > 0) {
        stageIdMap = {};
        const configByName = new Map(configStages.map(s => [s.name.toLowerCase(), s.id]));
        data.stages.forEach((dummyStage, i) => {
          const nameMatch = configByName.get(dummyStage.name.toLowerCase());
          const posMatch = configStages[i]?.id;
          stageIdMap![dummyStage.id] = nameMatch || posMatch || dummyStage.id;
        });
      }
      data.stages.forEach((stage) => {
        stage.items.forEach((item, i) => {
          records.push({
            id: item.id || `${stage.id}_item_${i}`,
            name: item.title,
            title: item.title,
            subtitle: item.subtitle,
            value: item.value,
            meta: item.meta,
            stage_id: stageIdMap ? (stageIdMap[stage.id] || stage.id) : stage.id,
          });
        });
      });
      return records;

    case 'stats':
      return data.items.map((item, i) => ({
        id: `stat_${i}`,
        label: item.label,
        value: item.value,
        change: item.change,
      }));

    case 'route':
      return data.routes.map((route) => ({
        id: route.id,
        name: route.name,
        title: route.name,
        driver: route.driver,
        status: route.status,
        stops: route.stops.length,
        color: route.color,
        eta: route.eta,
        custom_fields: {
          territory_polygon: route.territory,
          territory_color: route.color,
          stops_ordered: route.stops,
          business_location: data.businessLocation,
          all_customers: data.customers,
        },
      }));

    default:
      return [];
  }
}

// Apply search filter to data (client-side for dummy mode)
function applySearch(data: Record<string, unknown>[], search: string): Record<string, unknown>[] {
  if (!search) return data;
  const searchLower = search.toLowerCase();
  return data.filter((record) => {
    return Object.values(record).some((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (typeof value === 'number') {
        return String(value).includes(search);
      }
      return false;
    });
  });
}

// Apply filters to data (client-side for dummy mode)
function applyFilters(data: Record<string, unknown>[], filters: Record<string, string>): Record<string, unknown>[] {
  if (!filters || Object.keys(filters).length === 0) return data;
  return data.filter((record) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const recordValue = record[key];
      if (recordValue === undefined || recordValue === null) return false;
      return String(recordValue).toLowerCase() === value.toLowerCase();
    });
  });
}

// Apply sorting to data (client-side for dummy mode)
function applySort(data: Record<string, unknown>[], sort: string, sortDir: 'asc' | 'desc'): Record<string, unknown>[] {
  if (!sort) return data;
  return [...data].sort((a, b) => {
    const aVal = a[sort];
    const bVal = b[sort];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const comparison = aVal < bVal ? -1 : 1;
    return sortDir === 'asc' ? comparison : -comparison;
  });
}

// Apply pagination to data (client-side for dummy mode)
function applyPagination(
  data: Record<string, unknown>[],
  page: number,
  pageSize: number
): { data: Record<string, unknown>[]; totalCount: number; totalPages: number } {
  const totalCount = data.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: data.slice(start, end),
    totalCount,
    totalPages,
  };
}

/**
 * Universal data fetching hook for any entity type.
 * Fetches from dummy data or real API based on data mode.
 */
export function useEntityData(
  entityType: string,
  options: UseEntityDataOptions = {}
): UseEntityDataResult {
  const { mode, isLoading: modeLoading } = useDataMode();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const {
    search = '',
    filters = {},
    sort = '',
    sortDir = 'asc',
    page = 1,
    pageSize = 25,
    dateRange,
    componentId,
  } = options;

  // Use componentId for dummy data lookup if provided, otherwise fall back to entityType
  const dummyDataKey = componentId || entityType;

  // Serialize options for dependency tracking
  const optionsKey = JSON.stringify({ search, filters, sort, sortDir, page, pageSize, dateRange, componentId });

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Wait for data mode to be determined
    if (modeLoading) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    async function fetchData() {
      try {
        if (mode === 'dummy') {
          // Fetch from dummy data using componentId (original ID) or entityType
          const dummyData = componentDummyData[dummyDataKey];
          if (!dummyData) {
            if (mounted) {
              setData([]);
              setTotalCount(0);
              setTotalPages(1);
              setIsLoading(false);
            }
            return;
          }

          // Transform and filter dummy data client-side
          let records = transformDummyData(dummyData, dummyDataKey, options.pipelineStages);
          records = applySearch(records, search);
          records = applyFilters(records, filters);
          records = applySort(records, sort, sortDir);
          const paginated = applyPagination(records, page, pageSize);

          if (mounted) {
            setData(paginated.data);
            setTotalCount(paginated.totalCount);
            setTotalPages(paginated.totalPages);
            setIsLoading(false);
          }
        } else {
          // Fetch from real API
          const params = new URLSearchParams();
          if (search) params.set('search', search);
          if (sort) params.set('sort', sort);
          if (sortDir) params.set('sortDir', sortDir);
          params.set('page', String(page));
          params.set('pageSize', String(pageSize));

          // Add filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
          });

          // Add date range for calendar-type entities
          if (dateRange) {
            params.set('start_date', dateRange.start);
            params.set('end_date', dateRange.end);
          }

          const response = await fetch(`/api/data/${entityType}?${params.toString()}`, {
            credentials: 'include',
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Failed to fetch ${entityType}`);
          }

          const result = await response.json();

          if (mounted) {
            // API returns { data: [...], meta: { totalCount, page, totalPages } }
            if (Array.isArray(result)) {
              // Simple array response
              setData(result);
              setTotalCount(result.length);
              setTotalPages(1);
            } else if (result.data && Array.isArray(result.data)) {
              // Paginated response with meta
              setData(result.data);
              setTotalCount(result.meta?.totalCount || result.data.length);
              setTotalPages(result.meta?.totalPages || 1);
            } else {
              setData([]);
              setTotalCount(0);
              setTotalPages(1);
            }
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setData([]);
          setTotalCount(0);
          setTotalPages(1);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [entityType, mode, modeLoading, optionsKey, fetchTrigger]);

  return {
    data,
    isLoading: isLoading || modeLoading,
    error,
    totalCount,
    page,
    totalPages,
    refetch,
  };
}
