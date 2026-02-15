'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PortalStudent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface PortalSessionData {
  token: string;
  clientId: string;
  clientName: string;
  userId: string;
  configId: string;
  subdomain: string;
  students: PortalStudent[];
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
}

const PortalContext = createContext<PortalSessionData | null>(null);

export function usePortalSession(): PortalSessionData | null {
  return useContext(PortalContext);
}

interface PortalProviderProps {
  token: string;
  clientId: string;
  clientName: string;
  userId: string;
  configId: string;
  subdomain: string;
  students: PortalStudent[];
  children: React.ReactNode;
}

export function PortalProvider({
  token,
  clientId,
  clientName,
  userId,
  configId,
  subdomain,
  students,
  children,
}: PortalProviderProps) {
  const [activeStudentId, setActiveStudentId] = useState(
    students.length > 0 ? students[0].id : clientId
  );

  const handleSetActiveStudent = useCallback((id: string) => {
    setActiveStudentId(id);
  }, []);

  return (
    <PortalContext.Provider
      value={{
        token,
        clientId,
        clientName,
        userId,
        configId,
        subdomain,
        students,
        activeStudentId,
        setActiveStudentId: handleSetActiveStudent,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}
