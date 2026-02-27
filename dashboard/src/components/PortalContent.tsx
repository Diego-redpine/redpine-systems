'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { getPortalConfig, getPortalSections } from '@/lib/portal-templates';
import { toast } from '@/components/ui/Toaster';

interface PortalContentProps {
  colors: DashboardColors;
  businessName?: string;
  businessType?: string;
}

// Section icons (matching PortalNav)
const SECTION_ICONS: Record<string, string> = {
  account: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
  history: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  loyalty: 'M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z',
  messages: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
  reviews: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
  cards: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
  notifications: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
  book: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z',
};

export default function PortalContent({ colors, businessName, businessType }: PortalContentProps) {
  const [portalExists, setPortalExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const subdomain = (businessName || 'mysite').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const portalUrl = `${subdomain}.redpine.systems/portal/${subdomain}`;

  const portalConfig = useMemo(() => getPortalConfig(businessType), [businessType]);
  const sections = useMemo(() => getPortalSections(), []);

  // Check if portal project exists
  const checkPortal = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) return;
      const json = await res.json();
      const projects = json.data || [];
      const hasPortal = projects.some((p: { project_type: string }) => p.project_type === 'portal');
      setPortalExists(hasPortal);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPortal();
  }, [checkPortal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!portalExists) {
    return (
      <div className="p-8 shadow-sm text-center" style={{ backgroundColor: cardBg }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${buttonColor}10` }}>
          <svg className="w-7 h-7" fill="none" stroke={buttonColor} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>Client Portal</h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: textMuted }}>
          Your client portal is being set up. It will be available once your platform launches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portal URL */}
      <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: textMuted }}>Portal URL</p>
            <p className="text-sm font-medium" style={{ color: textMain }}>{portalUrl}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://${portalUrl}`);
                toast.success('Portal URL copied');
              }}
              className="px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
            >
              Copy URL
            </button>
            <a
              href={`/portal/${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              Preview
            </a>
          </div>
        </div>
      </div>

      {/* Portal Sections — Universal Skeleton */}
      <div className="shadow-sm overflow-hidden" style={{ backgroundColor: cardBg }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Portal Sections</p>
          <span className="text-xs font-medium px-2 py-0.5 " style={{ backgroundColor: '#10B98115', color: '#10B981' }}>
            {sections.length} active
          </span>
        </div>
        <div className="divide-y" style={{ borderColor }}>
          {sections.map(section => (
            <div
              key={section.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: `${buttonColor}08` }}>
                  <svg className="w-4 h-4" fill="none" stroke={buttonColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={SECTION_ICONS[section.id] || SECTION_ICONS.account} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>{section.title}</p>
                  <p className="text-xs" style={{ color: textMuted }}>{section.description}</p>
                </div>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 "
                style={{ backgroundColor: '#10B98115', color: '#10B981' }}
              >
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Config Preview */}
      <div className="shadow-sm overflow-hidden" style={{ backgroundColor: cardBg }}>
        <div className="px-5 py-3 border-b" style={{ borderColor }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Industry Config</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: textMuted }}>Primary Action</span>
            <span className="text-xs font-medium px-2 py-0.5 " style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
              {portalConfig.primaryActionLabel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: textMuted }}>Booking Mode</span>
            <span className="text-xs font-medium capitalize" style={{ color: textMain }}>{portalConfig.bookingMode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: textMuted }}>Chat Style</span>
            <span className="text-xs font-medium capitalize" style={{ color: textMain }}>{portalConfig.chatProminence}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: textMuted }}>Review Prompt</span>
            <span className="text-xs font-medium" style={{ color: textMain }}>&ldquo;{portalConfig.reviewPrompt}&rdquo;</span>
          </div>
          {portalConfig.preferenceFields.length > 0 && (
            <div>
              <span className="text-xs block mb-1.5" style={{ color: textMuted }}>Client Preference Fields</span>
              <div className="flex flex-wrap gap-1.5">
                {portalConfig.preferenceFields.map(field => (
                  <span
                    key={field.key}
                    className="text-xs px-2 py-0.5 "
                    style={{ backgroundColor: `${buttonColor}08`, color: textMain }}
                  >
                    {field.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help text */}
      <div className="p-4" style={{ backgroundColor: `${buttonColor}05`, border: `1px solid ${buttonColor}15` }}>
        <p className="text-xs" style={{ color: textMuted }}>
          Your portal uses the <strong>universal skeleton</strong> — all 8 sections are included for every business.
          Colors come from your Brand Board. Industry-specific preferences (like nail shape or dietary needs)
          are auto-configured based on your business type.
        </p>
      </div>
    </div>
  );
}
