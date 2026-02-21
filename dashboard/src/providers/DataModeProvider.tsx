'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { DataMode, DataModeState } from '@/hooks/useDataMode';

// Module-level cache to prevent re-fetching across component mounts
let cachedMode: DataMode | null = null;
let fetchPromise: Promise<DataMode> | null = null;

/**
 * Clears the module-level cache so the next mount re-fetches data mode.
 * Call this when auth state changes (login/logout).
 */
export function resetDataModeCache() {
  cachedMode = null;
  fetchPromise = null;
}

export const DataModeContext = createContext<DataModeState | null>(null);

interface DataModeProviderProps {
  children: ReactNode;
}

/**
 * Fetches the data mode from the API, with caching to prevent redundant requests.
 */
async function fetchDataMode(): Promise<DataMode> {
  // Return cached value if available
  if (cachedMode !== null) {
    return cachedMode;
  }

  // If a fetch is already in progress, wait for it
  if (fetchPromise !== null) {
    return fetchPromise;
  }

  // Start a new fetch
  fetchPromise = (async () => {
    try {
      const response = await fetch('/api/data/mode', {
        credentials: 'include',
      });

      if (!response.ok) {
        // Default to dummy mode on error
        cachedMode = 'dummy';
        return 'dummy';
      }

      const json = await response.json();
      const mode = json.data?.mode || json.mode;
      cachedMode = mode === 'real' ? 'real' : 'dummy';
      return cachedMode;
    } catch {
      // Default to dummy mode on network error
      cachedMode = 'dummy';
      return 'dummy';
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Provider component that wraps the dashboard and provides the data mode to all children.
 * Fetches the mode once on mount and caches it for all children.
 */
export function DataModeProvider({ children }: DataModeProviderProps) {
  const [mode, setMode] = useState<DataMode>(cachedMode || 'dummy');
  const [isLoading, setIsLoading] = useState(cachedMode === null);

  useEffect(() => {
    // If we already have a cached mode, use it immediately
    if (cachedMode !== null) {
      setMode(cachedMode);
      setIsLoading(false);
      return;
    }

    // Fetch the data mode
    let mounted = true;

    fetchDataMode().then((fetchedMode) => {
      if (mounted) {
        setMode(fetchedMode);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DataModeContext.Provider value={{ mode, isLoading }}>
      {children}
    </DataModeContext.Provider>
  );
}
