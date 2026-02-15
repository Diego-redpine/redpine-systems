// Hook for fetching custom field definitions for an entity type
import { useState, useEffect, useCallback } from 'react';

export interface CustomFieldDefinition {
  id: string;
  entity_type: string;
  field_key: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'dropdown' | 'checkbox' | 'textarea' | 'currency';
  is_required: boolean;
  options: string[];
  display_order: number;
}

export function useCustomFields(entityType: string | null, isDemoMode = false) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFields = useCallback(async () => {
    if (!entityType || isDemoMode) {
      setFields([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/custom-fields?entity_type=${entityType}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setFields(json.data || []);
      }
    } catch (err) {
      console.warn(`[useCustomFields] Failed to fetch fields for ${entityType}:`, err);
    }
    setIsLoading(false);
  }, [entityType, isDemoMode]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return { fields, isLoading, refetch: fetchFields };
}
