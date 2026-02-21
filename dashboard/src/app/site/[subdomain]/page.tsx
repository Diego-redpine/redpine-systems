import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConfigBySubdomain } from '@/lib/subdomain';
import PublicWebsiteRenderer from '@/components/PublicWebsiteRenderer';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const result = await getConfigBySubdomain(subdomain);

  if (!result) {
    return { title: 'Site Not Found' };
  }

  const businessName = result.config.business_name || result.profile.business_name || subdomain;
  const businessType = result.config.business_type || '';

  return {
    title: businessName,
    description: businessType
      ? `${businessName} — ${businessType}`
      : businessName,
    openGraph: {
      title: businessName,
      description: businessType
        ? `${businessName} — ${businessType}`
        : `Welcome to ${businessName}`,
      type: 'website',
    },
  };
}

export default async function SiteHomePage({ params }: PageProps) {
  const { subdomain } = await params;
  const result = await getConfigBySubdomain(subdomain);

  if (!result) {
    notFound();
  }

  const { profile, config } = result;
  const businessName = config.business_name || profile.business_name || subdomain;
  const colors = config.colors || {};
  const websiteData = config.website_data;

  // If website_data exists, render the full public website
  if (websiteData) {
    return (
      <PublicWebsiteRenderer
        websiteData={websiteData}
        businessName={businessName}
        subdomain={subdomain}
        colors={colors}
      />
    );
  }

  // Otherwise show a "Coming Soon" page
  const accent = colors.buttons || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: accent }}
          >
            {businessName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{businessName}</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Our website is currently being built. Check back soon to see what we have in store for you.
          </p>
          <div
            className="inline-block px-6 py-2.5 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            Coming Soon
          </div>
        </div>
      </div>
      <footer className="text-center py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {businessName} &mdash; Powered by{' '}
          <a
            href="https://redpine.systems"
            className="font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Red Pine
          </a>
        </p>
      </footer>
    </div>
  );
}
