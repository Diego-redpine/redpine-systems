'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  PortalShell,
  type PortalBusinessConfig,
  type PortalClientData,
  PortalAccountSection,
  PortalHistorySection,
  PortalLoyaltySection,
  PortalMessagesSection,
  PortalReviewsSection,
  PortalCardsSection,
  PortalNotificationsSection,
  PortalBookingSection,
  ChatWidget,
} from '@/components/portal';
import type { PortalSectionId } from '@/components/portal';
import { getPortalConfig } from '@/lib/portal-templates';

// ─── Helpers ──────────────────────────────────────────────────

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  if (color.length < 6) return true;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

// ─── Types ────────────────────────────────────────────────────

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
}

// ─── Page Component ───────────────────────────────────────────

export default function CustomerPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const tokenFromUrl = searchParams.get('token');

  const [config, setConfig] = useState<PortalBusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Data loading flag (for verify phase)
  const [verifying, setVerifying] = useState(false);

  // Colors (for login screen, before PortalShell takes over)
  const primaryColor = config?.colors?.buttons || config?.colors?.sidebar_bg || '#1a1a1a';
  const primaryText = isColorLight(primaryColor) ? '#1a1a1a' : '#ffffff';

  // Industry-aware portal config
  const portalConfig = useMemo(
    () => getPortalConfig(config?.businessType),
    [config?.businessType]
  );

  // ── Load business config ──────────────────────────────────
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/subdomain?subdomain=${subdomain}`);
        if (res.ok) {
          const data = await res.json();
          setConfig({
            businessName: data.businessName || 'Business',
            businessType: data.businessType || '',
            businessLogo: data.businessLogo || null,
            colors: data.colors || {},
          });
        }
      } catch {
        // Non-critical — use defaults
      }
      setIsLoading(false);
    }
    loadConfig();
  }, [subdomain]);

  // ── Check for stored token or URL token ───────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`portal_token_${subdomain}`);
    if (tokenFromUrl) {
      setPortalToken(tokenFromUrl);
      localStorage.setItem(`portal_token_${subdomain}`, tokenFromUrl);
      window.history.replaceState({}, '', `/portal/${subdomain}`);
    } else if (stored) {
      setPortalToken(stored);
    }
  }, [subdomain, tokenFromUrl]);

  // ── Verify token ──────────────────────────────────────────
  useEffect(() => {
    if (!portalToken) return;

    async function verify() {
      setVerifying(true);
      try {
        const res = await fetch('/api/portal/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: portalToken }),
        });

        if (!res.ok) {
          localStorage.removeItem(`portal_token_${subdomain}`);
          setPortalToken(null);
          setError('Your session has expired. Please sign in again.');
          setVerifying(false);
          return;
        }

        const data = await res.json();
        setClient(data.client);
        setError(null);
      } catch {
        setError('Failed to verify session');
      }
      setVerifying(false);
    }

    verify();
  }, [portalToken, subdomain]);

  // ── Handle login ──────────────────────────────────────────
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, email: loginEmail }),
      });

      if (res.ok) {
        setLoginSent(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Failed to send login link');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    }
    setLoginLoading(false);
  }, [loginEmail, subdomain]);

  // ── Handle logout ─────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem(`portal_token_${subdomain}`);
    setPortalToken(null);
    setClient(null);
    setLoginSent(false);
    setLoginEmail('');
  }, [subdomain]);

  // ── Loading state ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const businessName = config?.businessName || 'Business';

  // ══════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════════════
  if (!portalToken || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-lg mx-auto">
            <h1 className="text-xl font-bold text-gray-900">{businessName}</h1>
            <p className="text-sm text-gray-500">Client Portal</p>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {!loginSent ? (
                <>
                  <div className="text-center mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg className="w-7 h-7" fill="none" stroke={primaryText} viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your email to access your portal
                    </p>
                  </div>

                  {(error || loginError) && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                      {error || loginError}
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ focusRingColor: primaryColor } as React.CSSProperties}
                      required
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={loginLoading || !loginEmail}
                      className="w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: primaryColor, color: primaryText }}
                    >
                      {loginLoading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                  </form>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    We&apos;ll send a secure sign-in link to your email
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
                  <p className="text-sm text-gray-500">
                    We sent a sign-in link to <strong>{loginEmail}</strong>. Click the link to access your portal.
                  </p>
                  <button
                    onClick={() => { setLoginSent(false); setLoginEmail(''); }}
                    className="mt-6 text-sm font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              Powered by <span className="font-semibold text-red-600">Red Pine</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VERIFYING TOKEN
  // ══════════════════════════════════════════════════════════
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading your portal...</div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // AUTHENTICATED PORTAL — Universal Skeleton
  // ══════════════════════════════════════════════════════════
  const shellConfig: PortalBusinessConfig = config || {
    businessName: 'Business',
    businessType: '',
    colors: {},
  };

  const clientData: PortalClientData = {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    avatar: client.avatar,
  };

  return (
    <>
      <PortalShell
        config={shellConfig}
        portalConfig={portalConfig}
        clientData={clientData}
        onLogout={handleLogout}
        defaultSection="account"
      >
        {(activeSection: PortalSectionId, accentColor: string, accentTextColor: string) => {
          switch (activeSection) {
            case 'account':
              return (
                <PortalAccountSection
                  clientData={{
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    phone: client.phone,
                  }}
                  portalConfig={portalConfig}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                  subdomain={subdomain}
                />
              );
            case 'history':
              return (
                <PortalHistorySection
                  portalConfig={portalConfig}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            case 'loyalty':
              return (
                <PortalLoyaltySection
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            case 'messages':
              return (
                <PortalMessagesSection
                  clientId={client.id}
                  portalConfig={portalConfig}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            case 'reviews':
              return (
                <PortalReviewsSection
                  clientId={client.id}
                  portalConfig={portalConfig}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            case 'cards':
              return (
                <PortalCardsSection
                  clientId={client.id}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            case 'notifications':
              return (
                <PortalNotificationsSection
                  clientId={client.id}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            case 'book':
              return (
                <PortalBookingSection
                  clientId={client.id}
                  portalConfig={portalConfig}
                  accentColor={accentColor}
                  accentTextColor={accentTextColor}
                  portalToken={portalToken!}
                />
              );
            default:
              return null;
          }
        }}
      </PortalShell>

      {/* Adaptive Chat Widget — floating on portal pages */}
      <ChatWidget
        businessConfig={{
          businessName: shellConfig.businessName,
          userId: '', // Resolved server-side from portal token
          subdomain,
          accentColor: primaryColor,
          accentTextColor: primaryText,
        }}
        portalSession={{
          token: portalToken!,
          clientId: client.id,
          clientName: client.name,
        }}
      />
    </>
  );
}
