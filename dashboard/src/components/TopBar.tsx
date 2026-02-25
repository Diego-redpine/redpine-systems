'use client';

import { useRef, useState, useEffect } from 'react';
import { DashboardTab, DashboardColors } from '@/types/config';
import { NavIcon, inferIconFromLabel } from '@/lib/nav-icons';
import { getContrastText } from '@/lib/view-colors';
import NotificationPanel, { useNotificationCount } from './NotificationPanel';
import MessagePanel, { useMessageCount } from './MessagePanel';
import CreditBadge, { useCreditBalance } from './CreditBadge';
import CreditPurchaseModal from './CreditPurchaseModal';

interface TopBarProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  colors: DashboardColors;
  logo?: string | null;
  onLogoChange?: (logo: string) => void;
  businessName?: string;
  configId?: string | null;
}

export default function TopBar({
  tabs,
  activeTab,
  onTabChange,
  colors,
  logo,
  onLogoChange,
  businessName,
  configId,
}: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const unreadCount = useNotificationCount();
  const messageCount = useMessageCount();
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const { balance: creditBalance, refetch: refetchCredits } = useCreditBalance();

  const headerBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const headingColor = colors.headings || '#1A1A1A';
  const textColor = colors.text || '#6B7280';
  const buttonColor = colors.buttons || '#1A1A1A';

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onLogoChange?.(result);
    };
    reader.readAsDataURL(file);

    if (configId) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('configId', configId);
        const res = await fetch('/api/logo', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          onLogoChange?.(data.url);
        }
      } catch (err) {
        console.error('Logo upload failed:', err);
      }
      setIsUploading(false);
    }
  };

  const hasOverflow = tabs.length > 5;
  const mobileTabs = hasOverflow ? tabs.slice(0, 4) : tabs.slice(0, 5);

  // Desktop overflow: show max 7 inline tabs, rest go in "More" dropdown
  const MAX_DESKTOP_TABS = 8;
  const hasDesktopOverflow = tabs.length > MAX_DESKTOP_TABS;
  const desktopInlineTabs = hasDesktopOverflow ? tabs.slice(0, MAX_DESKTOP_TABS) : tabs;
  const desktopOverflowTabs = hasDesktopOverflow ? tabs.slice(MAX_DESKTOP_TABS) : [];
  const [isDesktopMoreOpen, setIsDesktopMoreOpen] = useState(false);
  const desktopMoreRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close desktop More dropdown on outside click
  useEffect(() => {
    if (!isDesktopMoreOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (desktopMoreRef.current && !desktopMoreRef.current.contains(e.target as Node)) {
        setIsDesktopMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDesktopMoreOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProfileOpen]);

  return (
    <>
      {/* Desktop top bar */}
      <header
        className="shrink-0 hidden lg:flex items-center h-14 px-6 border-b"
        style={{ backgroundColor: headerBg, borderColor }}
      >
        {/* Logo + business name — left */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: buttonColor }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-xs font-bold" style={{ color: getContrastText(buttonColor) }}>
                {businessName ? businessName.charAt(0).toUpperCase() : 'R'}
              </span>
            </div>
          )}
          {businessName && (
            <span
              className="font-semibold text-sm hidden xl:block max-w-[160px] truncate"
              style={{ color: headingColor }}
            >
              {businessName}
            </span>
          )}
        </div>

        {/* Tab navigation — centered */}
        <nav data-tour-id="topbar" className="flex-1 flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
          {desktopInlineTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tour-id={`topbar-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: isActive ? buttonColor : 'transparent',
                  color: isActive ? getContrastText(buttonColor) : textColor,
                }}
              >
                <NavIcon
                  name={tab.icon}
                  label={tab.label}
                  className="w-4 h-4"
                  style={{
                    color: isActive ? getContrastText(buttonColor) : textColor,
                  }}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop "More" dropdown — outside nav to avoid overflow-x-auto pointer interception */}
        {hasDesktopOverflow && (
          <div ref={desktopMoreRef} className="relative shrink-0">
            <button
              onClick={() => setIsDesktopMoreOpen(!isDesktopMoreOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
              style={{
                backgroundColor: desktopOverflowTabs.some(t => t.id === activeTab) ? buttonColor : 'transparent',
                color: desktopOverflowTabs.some(t => t.id === activeTab) ? getContrastText(buttonColor) : textColor,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              More
            </button>
            {isDesktopMoreOpen && (
              <div
                className="absolute top-full right-0 mt-1 min-w-[180px] rounded-xl border shadow-lg py-1 z-50"
                style={{ backgroundColor: headerBg, borderColor }}
              >
                {desktopOverflowTabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsDesktopMoreOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                      style={{
                        backgroundColor: isActive ? buttonColor : 'transparent',
                        color: isActive ? getContrastText(buttonColor) : textColor,
                      }}
                    >
                      <NavIcon
                        name={tab.icon}
                        label={tab.label}
                        className="w-4 h-4"
                        style={{
                          color: isActive ? getContrastText(buttonColor) : textColor,
                        }}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Right side: notifications, messages, profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Bell — Notifications */}
          <div className="relative">
            <button
              onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsMessagesOpen(false); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              title="Notifications"
              style={{ color: textColor }}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              colors={colors}
            />
          </div>
          {/* Envelope — Messages */}
          <div className="relative">
            <button
              onClick={() => { setIsMessagesOpen(!isMessagesOpen); setIsNotificationsOpen(false); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
              title="Messages"
              style={{ color: textColor }}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {messageCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
                >
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
              )}
            </button>
            <MessagePanel
              isOpen={isMessagesOpen}
              onClose={() => setIsMessagesOpen(false)}
              colors={colors}
            />
          </div>
          {/* Credits badge */}
          <CreditBadge onClick={() => setIsCreditModalOpen(true)} />
          {/* Profile dropdown */}
          <div ref={profileRef} className="relative ml-1">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); setIsMessagesOpen(false); }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:ring-2 hover:ring-gray-200"
              style={{ backgroundColor: (activeTab === 'settings' || activeTab === 'profile') ? buttonColor : '#F3F4F6' }}
            >
              <svg className="w-4 h-4" style={{ color: (activeTab === 'settings' || activeTab === 'profile') ? getContrastText(buttonColor) : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
            {isProfileOpen && (
              <div
                className="absolute top-full right-0 mt-1 min-w-[180px] rounded-xl border shadow-lg py-1 z-50"
                style={{ backgroundColor: headerBg, borderColor }}
              >
                <button
                  onClick={() => { onTabChange('profile'); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{
                    backgroundColor: activeTab === 'profile' ? buttonColor : 'transparent',
                    color: activeTab === 'profile' ? getContrastText(buttonColor) : textColor,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Profile
                </button>
                <button
                  onClick={() => { onTabChange('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{
                    backgroundColor: activeTab === 'settings' ? buttonColor : 'transparent',
                    color: activeTab === 'settings' ? getContrastText(buttonColor) : textColor,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile: slim header with logo only */}
      <header
        className="shrink-0 flex lg:hidden items-center h-12 px-3 border-b"
        style={{ backgroundColor: headerBg, borderColor }}
      >
        <div className="flex items-center gap-2 flex-1">
          {logo ? (
            <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
          ) : (
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: buttonColor }}
            >
              <span className="text-xs font-bold" style={{ color: getContrastText(buttonColor) }}>
                {businessName ? businessName.charAt(0).toUpperCase() : 'R'}
              </span>
            </div>
          )}
          {businessName && (
            <span className="font-semibold text-sm truncate max-w-[200px]" style={{ color: headingColor }}>
              {businessName}
            </span>
          )}
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </header>

      {/* Credit purchase modal */}
      <CreditPurchaseModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        colors={colors}
        balance={creditBalance}
        onPurchaseComplete={refetchCredits}
      />

      {/* Mobile bottom tab bar */}
      <MobileBottomBar
        tabs={mobileTabs}
        allTabs={tabs}
        hasOverflow={hasOverflow}
        activeTab={activeTab}
        onTabChange={onTabChange}
        buttonColor={buttonColor}
        textColor={textColor}
        headerBg={headerBg}
        borderColor={borderColor}
      />
    </>
  );
}

// ── MOBILE BOTTOM TAB BAR ──
function MobileBottomBar({
  tabs,
  allTabs,
  hasOverflow,
  activeTab,
  onTabChange,
  buttonColor,
  textColor,
  headerBg,
  borderColor,
}: {
  tabs: DashboardTab[];
  allTabs: DashboardTab[];
  hasOverflow: boolean;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  buttonColor: string;
  textColor: string;
  headerBg: string;
  borderColor: string;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Check if active tab is in the overflow section
  const isOverflowActive = hasOverflow && allTabs.slice(4).some(t => t.id === activeTab);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 lg:hidden flex items-stretch border-t z-30"
        style={{
          backgroundColor: headerBg,
          borderColor,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
              style={{ color: isActive ? buttonColor : textColor }}
            >
              <NavIcon
                name={tab.icon}
                label={tab.label}
                className="w-5 h-5"
                style={{ color: isActive ? buttonColor : textColor }}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* "More" button when there are overflow tabs */}
        {hasOverflow && (
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            style={{ color: isOverflowActive ? buttonColor : textColor }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span className={`text-[10px] font-medium ${isOverflowActive ? 'font-semibold' : ''}`}>
              More
            </span>
          </button>
        )}
      </nav>

      {/* Bottom sheet overlay for overflow tabs */}
      {isMoreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-fadeIn"
            onClick={() => setIsMoreOpen(false)}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl animate-scaleIn"
            style={{
              backgroundColor: headerBg,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-4 pb-4 space-y-1">
              {allTabs.slice(4).map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: isActive ? buttonColor : 'transparent',
                      color: isActive ? getContrastText(buttonColor) : textColor,
                    }}
                  >
                    <NavIcon
                      name={tab.icon}
                      label={tab.label}
                      className="w-5 h-5"
                      style={{
                        color: isActive ? getContrastText(buttonColor) : textColor,
                      }}
                    />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
