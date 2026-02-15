'use client';

import { useContext } from 'react';
import { DataModeContext } from '@/providers/DataModeProvider';

export type DataMode = 'dummy' | 'real';

export interface DataModeState {
  mode: DataMode;
  isLoading: boolean;
}

/**
 * Hook to access the current data mode from the DataModeProvider context.
 * Returns { mode: 'dummy' | 'real', isLoading: boolean }
 */
export function useDataMode(): DataModeState {
  const context = useContext(DataModeContext);

  if (!context) {
    // Fallback if used outside provider - default to dummy mode
    return { mode: 'dummy', isLoading: false };
  }

  return context;
}
