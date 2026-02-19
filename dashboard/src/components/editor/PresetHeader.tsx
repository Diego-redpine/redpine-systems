'use client';

/**
 * Preset Header Component
 * Fixed header with navigation for customer-facing site
 * Responsive: shows hamburger menu on mobile/tablet viewports
 * Fully customizable - logo, colors, fonts
 */

import { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/editor-utils';

interface ColorsConfig {
  buttons?: string;
  text?: string;
  background?: string;
  sidebar_bg?: string;
}

interface HeaderConfig {
  showLogo?: boolean;
  logoUrl?: string;
  storeName?: string;
  storeNameColor?: string | null;
  storeNameFont?: string;
  backgroundColor?: string | null;
  linkColor?: string | null;
  linkFont?: string;
  iconColor?: string | null;
  accentColor?: string;
}

interface PresetHeaderProps {
  businessName?: string;
  colors?: ColorsConfig;
  theme?: 'dark' | 'light';
  viewportMode?: 'desktop' | 'mobile' | 'tablet';
  config?: Partial<HeaderConfig>;
  isSelected?: boolean;
  onClick?: () => void;
}

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  showLogo: false,
  logoUrl: '',
  storeName: 'My Business',
  storeNameColor: null,
  storeNameFont: 'Inter',
  backgroundColor: null,
  linkColor: null,
  linkFont: 'Inter',
  iconColor: null,
  accentColor: '#3B82F6',
};

const NAV_LINKS = ['Home', 'Services', 'About', 'Contact'];

export default function PresetHeader({
  businessName = 'My Business',
  colors,
  theme = 'light',
  viewportMode = 'desktop',
  config = {},
  isSelected = false,
  onClick,
}: PresetHeaderProps) {
  const headerConfig: HeaderConfig = { ...DEFAULT_HEADER_CONFIG, storeName: businessName, ...config };
  const isDark = theme === 'dark';
  const isMobile = viewportMode === 'mobile' || viewportMode === 'tablet';
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine colors based on colors prop, config, or theme defaults
  const bgColor =
    headerConfig.backgroundColor ||
    colors?.sidebar_bg ||
    colors?.background ||
    (isDark ? '#1A1A1A' : '#ffffff');
  const linkColor = headerConfig.linkColor || colors?.text || (isDark ? '#9CA3AF' : '#6B7280');
  const iconColor = headerConfig.iconColor || colors?.text || (isDark ? '#9CA3AF' : '#6B7280');
  const storeNameColor = headerConfig.storeNameColor || colors?.text || (isDark ? '#ffffff' : '#1A1A1A');
  const storeNameFont = headerConfig.storeNameFont || 'Inter';
  const accentColor = headerConfig.accentColor || colors?.buttons || '#3B82F6';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  // Mobile/Tablet Header
  if (isMobile) {
    return (
      <header
        onClick={handleClick}
        className={cn(
          'px-4 py-3 border-b transition-colors relative cursor-pointer',
          isSelected && 'ring-2 ring-inset',
        )}
        style={{
          backgroundColor: bgColor,
          borderColor,
          ...(isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
        }}
      >
        <div className="flex items-center justify-between">
          {/* Store Name or Logo */}
          {headerConfig.showLogo && headerConfig.logoUrl ? (
            <img
              src={headerConfig.logoUrl}
              alt={headerConfig.storeName}
              className="h-8 object-contain"
            />
          ) : (
            <span
              className="text-lg font-bold"
              style={{ color: storeNameColor, fontFamily: storeNameFont }}
            >
              {headerConfig.storeName}
            </span>
          )}

          {/* Menu Button */}
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: iconColor }}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div
            className="absolute left-0 right-0 top-full z-50 border-b shadow-lg"
            style={{ backgroundColor: bgColor, borderColor }}
          >
            <nav className="p-4 space-y-2">
              {NAV_LINKS.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block px-4 py-3 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{ color: linkColor, fontFamily: headerConfig.linkFont }}
                >
                  {item}
                </a>
              ))}

              {/* Divider */}
              <div className="my-3 border-t" style={{ borderColor }} />

              {/* Sign In */}
              <div className="flex items-center gap-3 px-4 py-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{ color: iconColor, fontFamily: headerConfig.linkFont }}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    );
  }

  // Desktop Header
  return (
    <header
      onClick={handleClick}
      className={cn(
        'px-6 py-4 border-b transition-colors cursor-pointer',
        isSelected && 'ring-2 ring-inset',
      )}
      style={{
        backgroundColor: bgColor,
        borderColor,
        ...(isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Store Name */}
        <div className="flex items-center gap-3">
          {headerConfig.showLogo && headerConfig.logoUrl ? (
            <img
              src={headerConfig.logoUrl}
              alt={headerConfig.storeName}
              className="h-10 object-contain"
            />
          ) : (
            <span
              className="text-xl font-bold"
              style={{ color: storeNameColor, fontFamily: storeNameFont }}
            >
              {headerConfig.storeName}
            </span>
          )}
        </div>

        {/* Navigation - Desktop */}
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href="#"
              className="transition-colors text-sm hover:opacity-80"
              style={{ color: linkColor, fontFamily: headerConfig.linkFont }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Profile / Login */}
          <button
            className="p-2 transition-colors hover:opacity-80"
            style={{ color: iconColor }}
            aria-label="Account"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export { DEFAULT_HEADER_CONFIG };
export type { PresetHeaderProps, HeaderConfig, ColorsConfig };
