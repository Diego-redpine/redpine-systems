'use client';

import { useState, useEffect } from 'react';

interface UserRole {
  role: 'owner' | 'staff';
  businessOwnerId: string;
  isOwner: boolean;
  isStaff: boolean;
  userId: string;
  configId?: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserRole(): UserRole {
  const [state, setState] = useState<UserRole>({
    role: 'owner',
    businessOwnerId: '',
    isOwner: true,
    isStaff: false,
    userId: '',
    configId: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch('/api/auth/role');
        if (!res.ok) {
          // Not authenticated — default to owner (preview/demo will handle separately)
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const data = await res.json();
        if (data.success) {
          setState({
            role: data.role,
            businessOwnerId: data.businessOwnerId,
            isOwner: data.isOwner,
            isStaff: data.isStaff,
            userId: data.userId,
            configId: data.configId || null,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false, error: data.error }));
        }
      } catch (err) {
        console.warn('[useUserRole] Failed to fetch role:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchRole();
  }, []);

  return state;
}
