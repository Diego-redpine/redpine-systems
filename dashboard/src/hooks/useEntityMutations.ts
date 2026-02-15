'use client';

import { useState, useCallback } from 'react';
import { useDataMode } from './useDataMode';

export interface UseEntityMutationsOptions {
  onSuccess?: () => void;
}

export interface UseEntityMutationsResult {
  createRecord: (data: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  updateRecord: (id: string, data: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  deleteRecord: (id: string) => Promise<boolean>;
  moveStage: (id: string, stageId: string) => Promise<Record<string, unknown> | null>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isMoving: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for creating, updating, and deleting entity records.
 * Handles all CRUD operations through the API.
 */
export function useEntityMutations(
  entityType: string,
  options: UseEntityMutationsOptions = {}
): UseEntityMutationsResult {
  const { mode } = useDataMode();
  const { onSuccess } = options;

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Create a new record
   */
  const createRecord = useCallback(
    async (data: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
      // Dummy mode - return fake record but DON'T call onSuccess
      // (onSuccess clears optimistic data + refetches, which would lose the new record)
      if (mode === 'dummy') {

        return { id: `temp_${Date.now()}`, ...data };
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch(`/api/data/${entityType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to create ${entityType}`);
        }

        const result = await response.json();
        onSuccess?.();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create record';
        setError(message);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [entityType, mode, onSuccess]
  );

  /**
   * Update an existing record
   */
  const updateRecord = useCallback(
    async (id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
      // Dummy mode - return fake result, keep optimistic data
      if (mode === 'dummy') {

        return { id, ...data };
      }

      setIsUpdating(true);
      setError(null);

      try {
        const response = await fetch(`/api/data/${entityType}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to update ${entityType}`);
        }

        const result = await response.json();
        onSuccess?.();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update record';
        setError(message);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [entityType, mode, onSuccess]
  );

  /**
   * Delete a record
   */
  const deleteRecord = useCallback(
    async (id: string): Promise<boolean> => {
      // Dummy mode - return success, keep optimistic data
      if (mode === 'dummy') {

        return true;
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response = await fetch(`/api/data/${entityType}/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to delete ${entityType}`);
        }

        onSuccess?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete record';
        setError(message);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [entityType, mode, onSuccess]
  );

  /**
   * Move a record to a different pipeline stage
   */
  const moveStage = useCallback(
    async (id: string, stageId: string): Promise<Record<string, unknown> | null> => {
      // Dummy mode - return fake result, keep optimistic data
      if (mode === 'dummy') {

        return { id, stage_id: stageId };
      }

      setIsMoving(true);
      setError(null);

      try {
        const response = await fetch(`/api/data/${entityType}/${id}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ stage_id: stageId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to move ${entityType}`);
        }

        const result = await response.json();
        onSuccess?.();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to move record';
        setError(message);
        return null;
      } finally {
        setIsMoving(false);
      }
    },
    [entityType, mode, onSuccess]
  );

  return {
    createRecord,
    updateRecord,
    deleteRecord,
    moveStage,
    isCreating,
    isUpdating,
    isDeleting,
    isMoving,
    error,
    clearError,
  };
}
