'use client';

/**
 * Preset Footer Component
 * Fixed footer with social icons and Red Pine branding
 * Responsive: simplified layout on mobile/tablet
 * Fully customizable - colors, fonts, logo
 */

import { Instagram, Twitter, Youtube, Facebook, Globe } from 'lucide-react';
import { cn } from '@/lib/editor-utils';

interface ColorsConfig {
  buttons?: string;
  text?: string;
  background?: string;
  sidebar_bg?: string;
}

interface SocialIconConfig {
  enabled: boolean;
  url: string;
}

interface FooterConfig {
  showLogo?: boolean;
  logoUrl?: string;
  storeName?: string;
  showStoreName?: boolean;
  tagline?: string;
  backgroundColor?: string | null;
  textColor?: string | null;
  linkColor?: string | null;
  socialIconColor?: string | null;
  linkFont?: string;
  showTagline?: boolean;
  socialIcons?: {
    instagram?: SocialIconConfig;
    twitter?: SocialIconConfig;
    youtube?: SocialIconConfig;
    facebook?: SocialIconConfig;
    website?: SocialIconConfig;
  };
}

interface PresetFooterProps {
  businessName?: string;
  colors?: ColorsConfig;
  theme?: 'dark' | 'light';
  viewportMode?: 'desktop' | 'mobile' | 'tablet';
  config?: Partial<FooterConfig>;
  isSelected?: boolean;
  onClick?: () => void;
}

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  showLogo: false,
  logoUrl: '',
  storeName: 'My Business',
  showStoreName: true,
  tagline: 'Empowering your business',
  backgroundColor: null,
  textColor: null,
  linkColor: null,
  socialIconColor: null,
  linkFont: 'Inter',
  showTagline: true,
  socialIcons: {
    instagram: { enabled: true, url: '' },
    twitter: { enabled: true, url: '' },
    youtube: { enabled: true, url: '' },
    facebook: { enabled: false, url: '' },
    website: { enabled: false, url: '' },
  },
};

interface IconComponentEntry {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const ICON_COMPONENTS: Record<string, IconComponentEntry> = {
  instagram: { icon: Instagram, label: 'Instagram' },
  twitter: { icon: Twitter, label: 'Twitter / X' },
  youtube: { icon: Youtube, label: 'YouTube' },
  facebook: { icon: Facebook, label: 'Facebook' },
  website: { icon: Globe, label: 'Website' },
};

const FOOTER_NAV_LINKS = ['Home', 'Services', 'About', 'Contact', 'Privacy Policy'];

export default function PresetFooter({
  businessName = 'My Business',
  colors,
  theme = 'light',
  viewportMode = 'desktop',
  config = {},
  isSelected = false,
  onClick,
}: PresetFooterProps) {
  const footerConfig: FooterConfig = { ...DEFAULT_FOOTER_CONFIG, storeName: businessName, ...config };
  const currentYear = new Date().getFullYear();
  const isDark = theme === 'dark';
  const isMobile = viewportMode === 'mobile' || viewportMode === 'tablet';

  // Determine colors based on colors prop, config, or theme defaults
  const bgColor =
    footerConfig.backgroundColor ||
    colors?.sidebar_bg ||
    colors?.background ||
    (isDark ? '#1A1A1A' : '#ffffff');
  const textColor = footerConfig.textColor || colors?.text || (isDark ? '#ffffff' : '#1A1A1A');
  const linkColor = footerConfig.linkColor || colors?.text || (isDark ? '#9CA3AF' : '#6B7280');
  const socialIconColor = footerConfig.socialIconColor || colors?.text || (isDark ? '#9CA3AF' : '#6B7280');
  const accentColor = colors?.buttons || '#3B82F6';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  // Get enabled social icons from config
  const socialIconsConfig = footerConfig.socialIcons || DEFAULT_FOOTER_CONFIG.socialIcons!;
  const enabledSocialIcons = Object.entries(socialIconsConfig)
    .filter(([, iconConfig]) => iconConfig?.enabled)
    .map(([key, iconConfig]) => ({
      ...ICON_COMPONENTS[key],
      url: iconConfig.url || '#',
    }))
    .filter((entry) => entry.icon);

  // Mobile/Tablet Footer
  if (isMobile) {
    return (
      <footer
        onClick={handleClick}
        className={cn(
          'border-t transition-colors cursor-pointer',
          isSelected && 'ring-2 ring-inset',
        )}
        style={{
          backgroundColor: bgColor,
          borderColor,
          ...(isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
        }}
      >
        <div className="px-4 py-6">
          {/* Social icons */}
          {enabledSocialIcons.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-4">
              {enabledSocialIcons.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: socialIconColor }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}

          {/* Copyright - centered */}
          <p
            className="text-xs text-center mb-3"
            style={{ color: linkColor, fontFamily: footerConfig.linkFont }}
          >
            &copy; {currentYear} {footerConfig.storeName}. All rights reserved.
          </p>

          {/* Powered by Red Pine — hardcoded branding, non-editable */}
          <p className="text-center">
            <span
              className="text-xs"
              style={{ color: '#9CA3AF', fontFamily: "'Fira Code', monospace" }}
            >
              powered by{' '}
            </span>
            <span
              className="font-bold text-xs"
              style={{ color: '#CE0707', fontFamily: "'Fira Code', monospace" }}
            >
              Red Pine
            </span>
          </p>
        </div>
      </footer>
    );
  }

  // Desktop Footer
  return (
    <footer
      onClick={handleClick}
      className={cn(
        'border-t transition-colors cursor-pointer',
        isSelected && 'ring-2 ring-inset',
      )}
      style={{
        backgroundColor: bgColor,
        borderColor,
        ...(isSelected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
      }}
    >
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Store info - centered */}
          <div className="text-center">
            {footerConfig.showLogo && footerConfig.logoUrl && (
              <img
                src={footerConfig.logoUrl}
                alt={footerConfig.storeName}
                className="h-10 mx-auto mb-2 object-contain"
              />
            )}
            {footerConfig.showStoreName !== false && (
              <span
                className="text-lg font-bold"
                style={{ color: textColor, fontFamily: footerConfig.linkFont }}
              >
                {footerConfig.storeName}
              </span>
            )}
            {footerConfig.showTagline && (
              <p
                className="text-sm mt-1"
                style={{ color: linkColor, fontFamily: footerConfig.linkFont }}
              >
                {footerConfig.tagline}
              </p>
            )}
          </div>

          {/* Social icons - centered */}
          {enabledSocialIcons.length > 0 && (
            <div className="flex items-center gap-4">
              {enabledSocialIcons.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: socialIconColor }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}

          {/* Quick links - centered */}
          <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
            {FOOTER_NAV_LINKS.map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors hover:opacity-80"
                style={{ color: linkColor, fontFamily: footerConfig.linkFont }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section - centered */}
      <div className="border-t px-6 py-4" style={{ borderColor }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
          {/* Copyright - centered */}
          <p
            className="text-xs"
            style={{ color: linkColor, fontFamily: footerConfig.linkFont }}
          >
            &copy; {currentYear} {footerConfig.storeName}. All rights reserved.
          </p>
          {/* Powered by Red Pine — hardcoded branding, non-editable */}
          <p>
            <span
              className="text-xs"
              style={{ color: '#9CA3AF', fontFamily: "'Fira Code', monospace" }}
            >
              powered by{' '}
            </span>
            <span
              className="font-bold text-xs"
              style={{ color: '#CE0707', fontFamily: "'Fira Code', monospace" }}
            >
              Red Pine
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export { DEFAULT_FOOTER_CONFIG };
export type { PresetFooterProps, FooterConfig };
