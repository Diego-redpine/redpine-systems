'use client';

import React from 'react';

interface PortalTopBarProps {
  businessName: string;
  businessLogo?: string | null;
  clientName: string;
  clientAvatar?: string | null;
  accentColor: string;
  accentTextColor: string;
  unreadCount?: number;
  onNotificationClick?: () => void;
  onLogout?: () => void;
}

export function PortalTopBar({
  businessName,
  businessLogo,
  clientName,
  accentColor,
  accentTextColor,
  unreadCount = 0,
  onNotificationClick,
  onLogout,
}: PortalTopBarProps) {
  const initials = clientName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left: Logo + Business Name */}
        <div className="flex items-center gap-3 min-w-0">
          {businessLogo ? (
            <img
              src={businessLogo}
              alt={businessName}
              className="w-8 h-8 object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ backgroundColor: accentColor, color: accentTextColor }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {businessName}
          </h1>
        </div>

        {/* Right: Notifications + Client + Logout */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Client Avatar + Name */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {clientName}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium hidden sm:block"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
