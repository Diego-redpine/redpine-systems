'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

interface PortalContentProps {
  colors: DashboardColors;
  businessName?: string;
  businessType?: string;
}

interface PortalPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  sort_order: number;
}

interface PortalProject {
  id: string;
  name: string;
  project_type: string;
}

export default function PortalContent({ colors, businessName, businessType }: PortalContentProps) {
  const [project, setProject] = useState<PortalProject | null>(null);
  const [pages, setPages] = useState<PortalPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const subdomain = (businessName || 'mysite').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const portalUrl = `${subdomain}.redpine.systems/portal`;

  const fetchPortalData = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) return;
      const json = await res.json();
      const projects = json.data || [];
      const portalProject = projects.find((p: PortalProject) => p.project_type === 'portal');

      if (!portalProject) {
        setIsLoading(false);
        return;
      }

      setProject(portalProject);

      // Fetch pages for this project
      const pagesRes = await fetch(`/api/pages?project_id=${portalProject.id}`);
      if (pagesRes.ok) {
        const pagesJson = await pagesRes.json();
        setPages(pagesJson.data || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl p-8 shadow-sm text-center" style={{ backgroundColor: cardBg }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${buttonColor}10` }}>
          <svg className="w-7 h-7" fill="none" stroke={buttonColor} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>Client Portal</h3>
        <p className="text-sm max-w-sm mx-auto mb-4" style={{ color: textMuted }}>
          Create a client portal where your customers can view their schedule, billing, documents, and progress.
        </p>
        <p className="text-xs" style={{ color: textMuted }}>
          Go to the SiteWizard to create a portal project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portal URL */}
      <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
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
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-opacity hover:opacity-80"
              style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
            >
              Copy URL
            </button>
            <a
              href={`https://${portalUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-opacity hover:opacity-80"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              Preview
            </a>
          </div>
        </div>
      </div>

      {/* Portal pages */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: cardBg }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>Portal Pages</p>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
            {pages.length} pages
          </span>
        </div>
        <div className="divide-y" style={{ borderColor }}>
          {pages.map(page => (
            <div
              key={page.id}
              className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-black/[0.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${buttonColor}08` }}>
                  <svg className="w-4 h-4" fill="none" stroke={buttonColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: textMain }}>{page.title}</p>
                  <p className="text-xs" style={{ color: textMuted }}>/{page.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: page.is_published ? '#10B98115' : '#6B728015',
                    color: page.is_published ? '#10B981' : '#6B7280',
                  }}
                >
                  {page.is_published ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={() => window.open(`/editor/${page.slug}?project_id=${project.id}&locked=true`, '_blank')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg transition-opacity hover:opacity-80"
                  style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help text */}
      <div className="rounded-xl p-4" style={{ backgroundColor: `${buttonColor}05`, border: `1px solid ${buttonColor}15` }}>
        <p className="text-xs" style={{ color: textMuted }}>
          Portal pages use template widgets (Schedule, Billing, Progress, Documents, etc.) that automatically display
          your client&apos;s data. You can customize colors and labels in the editor, but the widget layout is fixed
          to ensure a consistent client experience.
        </p>
      </div>
    </div>
  );
}
