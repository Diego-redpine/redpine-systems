'use client';

/**
 * Optimistic update utilities for instant UI feedback.
 *
 * The dashboard should feel instant — when a user creates a record, it appears immediately.
 * When they delete one, it disappears immediately. If the API call fails, the change rolls back.
 */

export type DataSetter = (data: Record<string, unknown>[]) => void;

/**
 * Generate a temporary ID for optimistic creates
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if an ID is a temporary optimistic ID
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

/**
 * Create optimistic data for a new record.
 * Prepends the new record with a temporary ID.
 */
export function optimisticCreate(
  currentData: Record<string, unknown>[],
  newRecord: Record<string, unknown>
): Record<string, unknown>[] {
  const tempId = newRecord.id || generateTempId();
  const recordWithId = { ...newRecord, id: tempId, _isOptimistic: true };
  return [recordWithId, ...currentData];
}

/**
 * Create optimistic data for deleting a record.
 * Removes the record with the matching ID.
 */
export function optimisticDelete(
  currentData: Record<string, unknown>[],
  recordId: string
): Record<string, unknown>[] {
  return currentData.filter((record) => record.id !== recordId);
}

/**
 * Create optimistic data for updating a record.
 * Merges the updates into the matching record.
 */
export function optimisticUpdateRecord(
  currentData: Record<string, unknown>[],
  recordId: string,
  updates: Record<string, unknown>
): Record<string, unknown>[] {
  return currentData.map((record) => {
    if (record.id === recordId) {
      return { ...record, ...updates, _isOptimistic: true };
    }
    return record;
  });
}

/**
 * Create optimistic data for moving a record to a new stage.
 * Updates the stage_id of the matching record.
 */
export function optimisticMoveStage(
  currentData: Record<string, unknown>[],
  recordId: string,
  newStageId: string
): Record<string, unknown>[] {
  return currentData.map((record) => {
    if (record.id === recordId) {
      return { ...record, stage_id: newStageId, _isOptimistic: true };
    }
    return record;
  });
}

/**
 * Wrapper for optimistic updates that handles the instant-update-then-confirm-or-rollback flow.
 *
 * @param setData - Function to set the data state
 * @param currentData - Current array of records
 * @param optimisticData - What the data should look like immediately
 * @param mutation - The async API call
 * @param rollbackData - Data to restore on failure (usually same as currentData)
 * @param onSuccess - Optional callback on success (typically triggers refetch)
 * @param onError - Optional callback on error
 */
export async function performOptimisticUpdate<T>(
  setData: DataSetter,
  currentData: Record<string, unknown>[],
  optimisticData: Record<string, unknown>[],
  mutation: () => Promise<T>,
  rollbackData: Record<string, unknown>[],
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<{ success: boolean; result?: T; error?: string }> {
  // Step 1: Immediately set the optimistic data
  setData(optimisticData);

  try {
    // Step 2: Await the mutation
    const result = await mutation();

    // Step 3: On success, trigger refetch for server-confirmed data
    onSuccess?.();

    return { success: true, result };
  } catch (err) {
    // Step 4: On failure, rollback to original data
    setData(rollbackData);

    const errorMessage = err instanceof Error ? err.message : 'Operation failed';
    onError?.(errorMessage);

    return { success: false, error: errorMessage };
  }
}

/**
 * Higher-order function that creates a wrapped mutation with optimistic behavior.
 *
 * Usage:
 * const optimisticDelete = createOptimisticMutation({
 *   setData,
 *   getCurrentData: () => data,
 *   getOptimisticData: (id) => optimisticDelete(data, id),
 *   mutation: (id) => deleteRecord(id),
 *   onSuccess: refetch,
 *   onError: (err) => console.error(err),
 * });
 *
 * // Then call:
 * await optimisticDelete(recordId);
 */
export function createOptimisticMutation<TArgs extends unknown[], TResult>({
  setData,
  getCurrentData,
  getOptimisticData,
  mutation,
  onSuccess,
  onError,
}: {
  setData: DataSetter;
  getCurrentData: () => Record<string, unknown>[];
  getOptimisticData: (...args: TArgs) => Record<string, unknown>[];
  mutation: (...args: TArgs) => Promise<TResult>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}): (...args: TArgs) => Promise<{ success: boolean; result?: TResult; error?: string }> {
  return async (...args: TArgs) => {
    const currentData = getCurrentData();
    const optimisticData = getOptimisticData(...args);

    return performOptimisticUpdate(
      setData,
      currentData,
      optimisticData,
      () => mutation(...args),
      currentData,
      onSuccess,
      onError
    );
  };
}

/**
 * Clear the optimistic flag from records after successful API confirmation.
 * This is useful when you want to mark records as confirmed.
 */
export function clearOptimisticFlags(
  data: Record<string, unknown>[]
): Record<string, unknown>[] {
  return data.map((record) => {
    if (record._isOptimistic) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _isOptimistic, ...rest } = record;
      return rest;
    }
    return record;
  });
}
