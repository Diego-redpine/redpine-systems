'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import CenterModal from '@/components/ui/CenterModal';
import SiteContent from './SiteContent';
import SiteAnalytics from './SiteAnalytics';
import PortalContent from './PortalContent';
import GalleryManager from './views/GalleryManager';
import { shouldHavePortal } from '@/lib/portal-templates';

interface SiteViewProps {
  colors: DashboardColors;
  businessName?: string;
  businessType?: string;
  websiteData?: any;
}

const BASE_SUB_TABS = [
  { id: 'pages', label: 'Pages' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'portal', label: 'Portal' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'seo', label: 'SEO' },
  { id: 'settings', label: 'Settings' },
];

export default function SiteView({ colors, businessName, businessType, websiteData }: SiteViewProps) {
  const [activeSubTab, setActiveSubTab] = useState('pages');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  // Settings state
  const [siteTitle, setSiteTitle] = useState(businessName || '');
  const [customDomain, setCustomDomain] = useState('');
  const [domainInput, setDomainInput] = useState('');

  const subdomain = (businessName || 'mysite').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textColor = colors.text || '#374151';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const showPortal = shouldHavePortal(businessType);
  const SUB_TABS = showPortal
    ? BASE_SUB_TABS
    : BASE_SUB_TABS.filter(t => t.id !== 'portal');

  // Auto-create default project if none exists
  const ensureProject = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        const hasWebsite = data.some((p: { project_type: string }) => p.project_type === 'website');
        const hasPortal = data.some((p: { project_type: string }) => p.project_type === 'portal');

        if (!hasWebsite) {
          // Auto-create a default website project
          await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: businessName ? `${businessName} Website` : 'My Website',
              project_type: 'website',
              metadata: { businessName, businessType },
            }),
          });
        }

        // Auto-create portal if business type warrants it
        if (!hasPortal && shouldHavePortal(businessType)) {
          await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: businessName ? `${businessName} Portal` : 'Client Portal',
              project_type: 'portal',
              metadata: { businessName, businessType },
            }),
          });
        }
      } else if (res.status === 401) {
        setIsDemoMode(true);
      }
    } catch {
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [businessName, businessType]);

  useEffect(() => {
    ensureProject();
  }, [ensureProject]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {SUB_TABS.map(sub => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id)}
              className="px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive ? buttonColor : 'transparent',
                color: isActive ? getContrastText(buttonColor) : textColor,
                border: isActive ? 'none' : `1px solid ${borderColor}`,
              }}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Domain box with "Your Site" label */}
      <div
        className="rounded-2xl p-5 shadow-sm cursor-pointer transition-colors hover:bg-black/[0.02]"
        style={{ backgroundColor: cardBg }}
        onClick={() => setShowDomainModal(true)}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: textMuted }}>Your Site</p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${buttonColor}10` }}>
            <svg className="w-4 h-4" fill="none" stroke={buttonColor} viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: textMain }}>
              {customDomain || `${subdomain}.redpine.systems`}
            </p>
            {customDomain && (
              <p className="text-xs truncate" style={{ color: textMuted }}>
                {subdomain}.redpine.systems
              </p>
            )}
          </div>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={textMuted} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </div>
      </div>

      {/* Tab content */}
      {activeSubTab === 'pages' && <SiteContent colors={colors} isDemoMode={isDemoMode} businessName={businessName} websiteData={websiteData} />}
      {activeSubTab === 'gallery' && <GalleryManager configColors={colors} entityType="galleries" />}
      {activeSubTab === 'portal' && <PortalContent colors={colors} businessName={businessName} businessType={businessType} />}
      {activeSubTab === 'analytics' && <SiteAnalytics colors={colors} />}
      {activeSubTab === 'seo' && <SiteSEO cardBg={cardBg} textMain={textMain} textMuted={textMuted} borderColor={borderColor} buttonColor={buttonColor} />}
      {activeSubTab === 'settings' && (
        <SiteSettings
          colors={colors}
          siteTitle={siteTitle}
          setSiteTitle={setSiteTitle}
          customDomain={customDomain}
          onOpenDomainModal={() => setShowDomainModal(true)}
        />
      )}

      {/* Domain Edit Modal */}
      <DomainEditModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        colors={colors}
        subdomain={subdomain}
        customDomain={customDomain}
        domainInput={domainInput}
        setDomainInput={setDomainInput}
        onSave={(domain) => {
          setCustomDomain(domain);
          setShowDomainModal(false);
        }}
      />
    </div>
  );
}

// --- SEO Placeholder ---
function SiteSEO({ cardBg, textMain, textMuted, borderColor, buttonColor }: {
  cardBg: string; textMain: string; textMuted: string; borderColor: string; buttonColor: string;
}) {
  return (
    <div className="rounded-2xl p-8 shadow-sm text-center" style={{ backgroundColor: cardBg }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${buttonColor}10` }}>
        <svg className="w-7 h-7" fill="none" stroke={buttonColor} viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>SEO Management</h3>
      <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: textMuted }}>
        Meta tags, sitemap generation, social previews, and search engine optimization tools are coming soon.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {['Meta Tags', 'Sitemap', 'Open Graph', 'Analytics'].map(tag => (
          <span
            key={tag}
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: `${buttonColor}08`, color: buttonColor, border: `1px solid ${borderColor}` }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Site Settings ---
function SiteSettings({ colors, siteTitle, setSiteTitle, customDomain, onOpenDomainModal }: {
  colors: DashboardColors;
  siteTitle: string;
  setSiteTitle: (v: string) => void;
  customDomain: string;
  onOpenDomainModal: () => void;
}) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  return (
    <div className="space-y-4">
      {/* Site Title */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
        <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Site Title</label>
        <input
          type="text"
          value={siteTitle}
          onChange={(e) => setSiteTitle(e.target.value)}
          placeholder="Your site name"
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20"
          style={{ borderColor, color: textMain }}
        />
        <p className="text-xs mt-1.5" style={{ color: textMuted }}>
          Displayed in the browser tab and search results.
        </p>
      </div>

      {/* Favicon */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
        <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Favicon</label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-black/[0.02]"
          style={{ borderColor }}
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: textMain }}>Upload favicon</p>
            <p className="text-xs" style={{ color: textMuted }}>32x32px recommended, PNG or ICO</p>
          </div>
        </div>
      </div>

      {/* Custom Domain */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
        <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Custom Domain</label>
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: textMain }}>
            {customDomain || 'No custom domain connected'}
          </p>
          <button
            onClick={onOpenDomainModal}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
          >
            {customDomain ? 'Change' : 'Connect Domain'}
          </button>
        </div>
      </div>

    </div>
  );
}

// --- Domain Edit Modal ---
function DomainEditModal({ isOpen, onClose, colors, subdomain, customDomain, domainInput, setDomainInput, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  colors: DashboardColors;
  subdomain: string;
  customDomain: string;
  domainInput: string;
  setDomainInput: (v: string) => void;
  onSave: (domain: string) => void;
}) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Domain Settings"
      subtitle="Connect a custom domain to your site"
      maxWidth="max-w-lg"
      configColors={colors}
    >
      {/* Current domain */}
      <div className="mb-5">
        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>
          Default Domain
        </label>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border" style={{ borderColor, backgroundColor: '#F9FAFB' }}>
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium" style={{ color: textMain }}>{subdomain}.redpine.systems</span>
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">Active</span>
        </div>
      </div>

      {/* Custom domain input */}
      <div className="mb-5">
        <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>
          Custom Domain
        </label>
        <input
          type="text"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          placeholder="www.yourdomain.com"
          className="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20"
          style={{ borderColor, color: textMain }}
        />
      </div>

      {/* DNS Instructions */}
      <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#F9FAFB', border: `1px solid ${borderColor}` }}>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: textMuted }}>DNS Configuration</h4>
        <div className="space-y-3">
          <DnsRow label="Step 1" type="CNAME" name="www" value={`${subdomain}.redpine.systems`} textMain={textMain} textMuted={textMuted} borderColor={borderColor} />
          <DnsRow label="Step 2" type="A" name="@" value="76.76.21.21" textMain={textMain} textMuted={textMuted} borderColor={borderColor} />
        </div>
        <p className="text-xs mt-3" style={{ color: textMuted }}>
          Add these records in your domain registrar&apos;s DNS settings. Changes may take up to 48 hours to propagate.
        </p>
      </div>

      {/* Verification status */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border mb-5" style={{ borderColor }}>
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-xs font-medium" style={{ color: textMuted }}>Verification pending — DNS not yet detected</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor }}>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-70"
          style={{ color: textMuted }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(domainInput.trim())}
          disabled={!domainInput.trim()}
          className="px-5 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: buttonColor, color: buttonText }}
        >
          Save Domain
        </button>
      </div>
    </CenterModal>
  );
}

function DnsRow({ label, type, name, value, textMain, textMuted, borderColor }: {
  label: string; type: string; name: string; value: string;
  textMain: string; textMuted: string; borderColor: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>{label}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="px-2 py-1.5 rounded-md border" style={{ borderColor }}>
          <span style={{ color: textMuted }}>Type: </span>
          <span className="font-mono font-medium" style={{ color: textMain }}>{type}</span>
        </div>
        <div className="px-2 py-1.5 rounded-md border" style={{ borderColor }}>
          <span style={{ color: textMuted }}>Name: </span>
          <span className="font-mono font-medium" style={{ color: textMain }}>{name}</span>
        </div>
        <div className="px-2 py-1.5 rounded-md border" style={{ borderColor }}>
          <span style={{ color: textMuted }}>Value: </span>
          <span className="font-mono font-medium text-[10px]" style={{ color: textMain }}>{value}</span>
        </div>
      </div>
    </div>
  );
}
