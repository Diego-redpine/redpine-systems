'use client';

import React, { useState, useCallback } from 'react';
import { PortalTopBar } from './PortalTopBar';
import { PortalNav, type PortalSectionId } from './PortalNav';
import type { PortalConfig } from '@/lib/portal-templates';

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  if (color.length < 6) return true;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export interface PortalBusinessConfig {
  businessName: string;
  businessType: string;
  businessLogo?: string | null;
  colors: Record<string, string>;
}

export interface PortalClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
}

interface PortalShellProps {
  config: PortalBusinessConfig;
  portalConfig: PortalConfig;
  clientData: PortalClientData;
  children: (activeSection: PortalSectionId, accentColor: string, accentTextColor: string) => React.ReactNode;
  onLogout: () => void;
  defaultSection?: PortalSectionId;
}

/**
 * Universal portal shell. Composes PortalTopBar + PortalNav + content area.
 * All colors read from config.colors (Brand Board). Never hardcoded.
 */
export function PortalShell({
  config,
  portalConfig,
  clientData,
  children,
  onLogout,
  defaultSection = 'account',
}: PortalShellProps) {
  const [activeSection, setActiveSection] = useState<PortalSectionId>(defaultSection);

  // Resolve colors from Brand Board config
  const accentColor = config.colors?.buttons || config.colors?.sidebar_bg || '#1a1a1a';
  const accentTextColor = isColorLight(accentColor) ? '#1a1a1a' : '#ffffff';
  const bgColor = config.colors?.background || '#f5f5f5';

  const handleNavigate = useCallback((section: PortalSectionId) => {
    setActiveSection(section);
  }, []);

  const handleNotificationClick = useCallback(() => {
    setActiveSection('notifications');
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor }}>
      {/* Top Bar */}
      <PortalTopBar
        businessName={config.businessName}
        businessLogo={config.businessLogo}
        clientName={clientData.name}
        clientAvatar={clientData.avatar}
        accentColor={accentColor}
        accentTextColor={accentTextColor}
        onNotificationClick={handleNotificationClick}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Side Nav */}
        <PortalNav
          activeSection={activeSection}
          onNavigate={handleNavigate}
          accentColor={accentColor}
          accentTextColor={accentTextColor}
          portalConfig={portalConfig}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            {children(activeSection, accentColor, accentTextColor)}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="hidden md:block border-t border-gray-200 bg-white px-6 py-3">
        <p className="text-xs text-gray-400 text-center" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
          Powered by <span className="font-semibold text-red-600">Red Pine</span>
        </p>
      </footer>
    </div>
  );
}
