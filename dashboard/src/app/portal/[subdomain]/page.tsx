'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PortalProvider, PortalStudent } from '@/components/widgets/PortalContext';
import { PortalHeader } from '@/components/widgets/PortalHeader';
import { PortalSchedule } from '@/components/widgets/PortalSchedule';
import { PortalBilling } from '@/components/widgets/PortalBilling';
import { PortalProgress } from '@/components/widgets/PortalProgress';
import { PortalDocuments } from '@/components/widgets/PortalDocuments';
import { PortalAccount } from '@/components/widgets/PortalAccount';
import { PortalAnnouncements } from '@/components/widgets/PortalAnnouncements';
import { PortalShop } from '@/components/widgets/PortalShop';

interface BusinessConfig {
  businessName: string;
  businessType: string;
  colors: Record<string, string>;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  location?: string;
  description?: string;
}

interface Invoice {
  id: string;
  invoice_number?: string;
  amount_cents: number;
  status: string;
  due_date?: string;
  paid_at?: string;
  line_items?: { description: string; quantity: number; unit_price_cents: number }[];
  created_at: string;
}

interface PortalMessage {
  id: string;
  subject?: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function isColorLight(hex: string): boolean {
  const color = hex.replace('#', '');
  if (color.length < 6) return true;
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Map ChaiBuilder block types to portal widget components
const BLOCK_COMPONENTS: Record<string, React.FC<Record<string, unknown>>> = {
  PortalHeader: PortalHeader as React.FC<Record<string, unknown>>,
  PortalSchedule: PortalSchedule as React.FC<Record<string, unknown>>,
  PortalBilling: PortalBilling as React.FC<Record<string, unknown>>,
  PortalProgress: PortalProgress as React.FC<Record<string, unknown>>,
  PortalDocuments: PortalDocuments as React.FC<Record<string, unknown>>,
  PortalAccount: PortalAccount as React.FC<Record<string, unknown>>,
  PortalAnnouncements: PortalAnnouncements as React.FC<Record<string, unknown>>,
  PortalShop: PortalShop as React.FC<Record<string, unknown>>,
};

interface PortalPage {
  id: string;
  title: string;
  slug: string;
  blocks: Array<{ _id: string; _type: string; [key: string]: unknown }>;
}

type PortalTab = 'appointments' | 'invoices' | 'messages';

export default function CustomerPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const tokenFromUrl = searchParams.get('token');

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Portal data
  const [activeTab, setActiveTab] = useState<PortalTab>('appointments');
  const [appointments, setAppointments] = useState<{ upcoming: Appointment[]; past: Appointment[] }>({ upcoming: [], past: [] });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ChaiBuilder portal pages
  const [portalPages, setPortalPages] = useState<PortalPage[]>([]);
  const [activePageSlug, setActivePageSlug] = useState('home');
  const [students, setStudents] = useState<PortalStudent[]>([]);
  const [configId, setConfigId] = useState('');
  const [userId, setUserId] = useState('');

  // Colors
  const primaryColor = config?.colors?.buttons || config?.colors?.sidebar_bg || '#1a1a1a';
  const primaryText = isColorLight(primaryColor) ? '#1a1a1a' : '#ffffff';

  // Load business config
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/subdomain?subdomain=${subdomain}`);
        if (res.ok) {
          const data = await res.json();
          setConfig({
            businessName: data.businessName || 'Business',
            businessType: data.businessType || '',
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

  // Check for stored token or URL token
  useEffect(() => {
    const stored = localStorage.getItem(`portal_token_${subdomain}`);
    if (tokenFromUrl) {
      setPortalToken(tokenFromUrl);
      localStorage.setItem(`portal_token_${subdomain}`, tokenFromUrl);
      // Clean URL
      window.history.replaceState({}, '', `/portal/${subdomain}`);
    } else if (stored) {
      setPortalToken(stored);
    }
  }, [subdomain, tokenFromUrl]);

  // Verify token and load data
  useEffect(() => {
    if (!portalToken) return;

    async function verifyAndLoad() {
      setDataLoading(true);
      try {
        // Verify token
        const verifyRes = await fetch('/api/portal/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: portalToken }),
        });

        if (!verifyRes.ok) {
          // Token invalid/expired
          localStorage.removeItem(`portal_token_${subdomain}`);
          setPortalToken(null);
          setError('Your session has expired. Please sign in again.');
          setDataLoading(false);
          return;
        }

        const verifyData = await verifyRes.json();
        setClient(verifyData.client);
        setError(null);

        // Try to fetch ChaiBuilder portal pages first
        const portalPagesRes = await fetch(`/api/public/portal?subdomain=${subdomain}`);
        if (portalPagesRes.ok) {
          const portalData = await portalPagesRes.json();
          if (portalData.pages && portalData.pages.length > 0) {
            setPortalPages(portalData.pages);
            setConfigId(portalData.config_id || '');
            setUserId(portalData.user_id || '');
          }
        }

        // Fetch students list
        const studentsRes = await fetch(`/api/portal/data?type=students`, {
          headers: { 'x-portal-token': portalToken! },
        });
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          if (studentsData.students) setStudents(studentsData.students);
        }

        // Load legacy portal data (fallback)
        const dataRes = await fetch('/api/portal/data', {
          headers: { 'x-portal-token': portalToken! },
        });

        if (dataRes.ok) {
          const data = await dataRes.json();
          setAppointments(data.appointments);
          setInvoices(data.invoices);
          setMessages(data.messages);
          if (data.students) setStudents(data.students);
        }
      } catch {
        setError('Failed to load portal data');
      }
      setDataLoading(false);
    }

    verifyAndLoad();
  }, [portalToken, subdomain]);

  // Handle login
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

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem(`portal_token_${subdomain}`);
    setPortalToken(null);
    setClient(null);
    setLoginSent(false);
    setLoginEmail('');
  }, [subdomain]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const businessName = config?.businessName || 'Business';

  // LOGIN SCREEN
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

  // If ChaiBuilder portal pages exist, render the widget-based portal
  if (portalPages.length > 0) {
    const activePage = portalPages.find(p => p.slug === activePageSlug) || portalPages[0];

    return (
      <PortalProvider
        token={portalToken!}
        clientId={client.id}
        clientName={client.name}
        userId={userId}
        configId={configId}
        subdomain={subdomain}
        students={students}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{businessName}</h1>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Page navigation */}
          {portalPages.length > 1 && (
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6">
              <div className="max-w-3xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide">
                {portalPages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => setActivePageSlug(page.slug)}
                    className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
                    style={{
                      borderColor: activePageSlug === page.slug ? primaryColor : 'transparent',
                      color: activePageSlug === page.slug ? primaryColor : '#6b7280',
                    }}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portal blocks */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-pulse text-gray-400">Loading your portal...</div>
              </div>
            ) : (
              activePage?.blocks?.map((block) => {
                const Component = BLOCK_COMPONENTS[block._type];
                if (!Component) return null;

                // Extract props from block, removing ChaiBuilder internal fields
                const { _id, _type, _name, ...blockProps } = block;
                return (
                  <Component
                    key={_id}
                    blockProps={{}}
                    inBuilder={false}
                    {...blockProps}
                  />
                );
              })
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white mt-auto px-6 py-4">
            <p className="text-xs text-gray-400 text-center">
              Powered by <span className="font-semibold text-red-600">Red Pine</span>
            </p>
          </footer>
        </div>
      </PortalProvider>
    );
  }

  // LEGACY PORTAL DASHBOARD (fallback when no ChaiBuilder pages)
  const tabs: { id: PortalTab; label: string; count: number }[] = [
    { id: 'appointments', label: 'Appointments', count: appointments.upcoming.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'messages', label: 'Messages', count: messages.filter(m => !m.is_read).length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{businessName}</h1>
            <p className="text-sm text-gray-500">Welcome, {client.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab.id ? primaryColor : 'transparent',
                color: activeTab === tab.id ? primaryColor : '#6b7280',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    backgroundColor: activeTab === tab.id ? `${primaryColor}15` : '#f3f4f6',
                    color: activeTab === tab.id ? primaryColor : '#6b7280',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-gray-400">Loading your data...</div>
          </div>
        ) : (
          <>
            {activeTab === 'appointments' && (
              <AppointmentsTab
                upcoming={appointments.upcoming}
                past={appointments.past}
                primaryColor={primaryColor}
              />
            )}
            {activeTab === 'invoices' && (
              <InvoicesTab invoices={invoices} primaryColor={primaryColor} />
            )}
            {activeTab === 'messages' && (
              <MessagesTab messages={messages} />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto px-6 py-4">
        <p className="text-xs text-gray-400 text-center">
          Powered by <span className="font-semibold text-red-600">Red Pine</span>
        </p>
      </footer>
    </div>
  );
}

// --- Appointments Tab ---
function AppointmentsTab({
  upcoming,
  past,
  primaryColor,
}: {
  upcoming: Appointment[];
  past: Appointment[];
  primaryColor: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(apt => (
              <div key={apt.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{apt.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(apt.start_time)} at {formatTime(apt.start_time)}
                    </p>
                    {apt.location && (
                      <p className="text-sm text-gray-400 mt-0.5">{apt.location}</p>
                    )}
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={{
                      backgroundColor: apt.status === 'scheduled' ? `${primaryColor}15` : '#f3f4f6',
                      color: apt.status === 'scheduled' ? primaryColor : '#6b7280',
                    }}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Past Appointments</h2>
          <div className="space-y-2">
            {past.map(apt => (
              <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-4 opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700 text-sm">{apt.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(apt.start_time)}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 capitalize">
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Invoices Tab ---
function InvoicesTab({
  invoices,
  primaryColor,
}: {
  invoices: Invoice[];
  primaryColor: string;
}) {
  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534' };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b' };
      case 'sent': case 'pending': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const totalOwed = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'void')
    .reduce((sum, inv) => sum + inv.amount_cents, 0);

  return (
    <div className="space-y-4">
      {/* Balance card */}
      {totalOwed > 0 && (
        <div
          className="rounded-2xl p-6 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <p className="text-sm opacity-80">Outstanding Balance</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalOwed)}</p>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const sc = statusColor(inv.status);
            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {inv.invoice_number || `Invoice`}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {inv.due_date ? `Due ${formatDate(inv.due_date)}` : formatDate(inv.created_at)}
                    </p>
                    {inv.line_items && inv.line_items.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {inv.line_items.map(li => li.description).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(inv.amount_cents)}</p>
                    <span
                      className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Messages Tab ---
function MessagesTab({ messages }: { messages: PortalMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No messages</p>
        </div>
      ) : (
        messages.map(msg => (
          <div
            key={msg.id}
            className={`bg-white rounded-2xl border p-5 ${
              msg.is_read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {msg.subject && (
                  <h3 className={`font-semibold text-gray-900 truncate ${!msg.is_read ? 'font-bold' : ''}`}>
                    {msg.subject}
                  </h3>
                )}
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.content}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(msg.created_at)}</p>
              </div>
              {!msg.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-3 flex-shrink-0" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
