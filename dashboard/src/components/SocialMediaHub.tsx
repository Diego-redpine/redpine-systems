'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface SocialMediaHubProps {
  colors: DashboardColors;
}

// Demo scheduled posts
interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'draft';
  imageUrl?: string;
}

const DEMO_POSTS: ScheduledPost[] = [
  { id: 'p1', content: 'Exciting news! We just launched our new spring collection. Check it out now!', platforms: ['instagram', 'facebook'], scheduledDate: '2026-02-14', scheduledTime: '10:00 AM', status: 'scheduled' },
  { id: 'p2', content: 'Behind the scenes at our studio today. Stay tuned for something special coming this weekend!', platforms: ['instagram', 'tiktok'], scheduledDate: '2026-02-14', scheduledTime: '2:00 PM', status: 'scheduled' },
  { id: 'p3', content: '5 tips for small business owners to boost their online presence in 2026. Thread incoming!', platforms: ['twitter', 'linkedin'], scheduledDate: '2026-02-15', scheduledTime: '9:00 AM', status: 'scheduled' },
  { id: 'p4', content: 'Thank you to all our amazing customers! We hit 1,000 orders this month.', platforms: ['instagram', 'facebook', 'twitter'], scheduledDate: '2026-02-13', scheduledTime: '11:00 AM', status: 'published' },
  { id: 'p5', content: 'New blog post: How to build a strong brand identity for your small business.', platforms: ['linkedin', 'twitter'], scheduledDate: '2026-02-16', scheduledTime: '8:00 AM', status: 'scheduled' },
  { id: 'p6', content: 'Happy Valentine\'s Day! Use code LOVE20 for 20% off all services this weekend.', platforms: ['instagram', 'facebook', 'tiktok'], scheduledDate: '2026-02-14', scheduledTime: '8:00 AM', status: 'draft' },
  { id: 'p7', content: 'Meet our team! Introducing Sarah, our lead designer, who brings every project to life.', platforms: ['instagram', 'linkedin'], scheduledDate: '2026-02-17', scheduledTime: '12:00 PM', status: 'scheduled' },
  { id: 'p8', content: 'Weekend special: Free consultation for new clients. DM us to book yours!', platforms: ['instagram', 'facebook'], scheduledDate: '2026-02-15', scheduledTime: '3:00 PM', status: 'scheduled' },
];

// Demo connected accounts
interface ConnectedAccount {
  id: string;
  platform: string;
  handle: string;
  followers: number;
  connected: boolean;
  iconColor: string;
}

const PLATFORM_ACCOUNTS: ConnectedAccount[] = [
  { id: 'a1', platform: 'Instagram', handle: '@mybusiness', followers: 2450, connected: true, iconColor: '#E1306C' },
  { id: 'a2', platform: 'Facebook', handle: 'My Business Page', followers: 1820, connected: true, iconColor: '#1877F2' },
  { id: 'a3', platform: 'Twitter / X', handle: '@mybiz', followers: 890, connected: true, iconColor: '#1DA1F2' },
  { id: 'a4', platform: 'LinkedIn', handle: 'My Business LLC', followers: 560, connected: false, iconColor: '#0A66C2' },
  { id: 'a5', platform: 'TikTok', handle: '@mybusiness', followers: 3200, connected: false, iconColor: '#000000' },
];

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const path = PLATFORM_ICONS[platform.toLowerCase().replace(' / x', '')];
  if (!path) return <div style={{ width: size, height: size }} className="rounded bg-gray-200" />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

export default function SocialMediaHub({ colors }: SocialMediaHubProps) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);

  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showComposer, setShowComposer] = useState(false);

  // Stats
  const postsThisWeek = DEMO_POSTS.filter(p => p.status !== 'draft').length;
  const publishedCount = DEMO_POSTS.filter(p => p.status === 'published').length;
  const scheduledCount = DEMO_POSTS.filter(p => p.status === 'scheduled').length;
  const connectedCount = PLATFORM_ACCOUNTS.filter(a => a.connected).length;

  // Group posts by date for calendar view
  const postsByDate: Record<string, ScheduledPost[]> = {};
  DEMO_POSTS.forEach(post => {
    if (!postsByDate[post.scheduledDate]) postsByDate[post.scheduledDate] = [];
    postsByDate[post.scheduledDate].push(post);
  });

  // Generate calendar week dates
  const today = new Date('2026-02-13');
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  const calendarDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700' },
    published: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Posts This Week', value: postsThisWeek.toString() },
          { label: 'Published', value: publishedCount.toString() },
          { label: 'Scheduled', value: scheduledCount.toString() },
          { label: 'Connected', value: `${connectedCount}/${PLATFORM_ACCOUNTS.length}` },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: cardBg }}>
            <p className="text-xl font-bold" style={{ color: textMain }}>{stat.value}</p>
            <p className="text-xs" style={{ color: textMuted }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main content area */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['calendar', 'list'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize"
                  style={{
                    backgroundColor: view === v ? buttonColor : 'transparent',
                    color: view === v ? buttonText : textMuted,
                    border: view === v ? 'none' : `1px solid ${borderColor}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              + Create Post
            </button>
          </div>

          {/* Calendar view */}
          {view === 'calendar' && (
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: cardBg }}>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b" style={{ borderColor }}>
                {calendarDates.map((date, i) => {
                  const isToday = formatDate(date) === formatDate(today);
                  return (
                    <div key={i} className="px-2 py-3 text-center border-r last:border-r-0" style={{ borderColor }}>
                      <p className="text-[10px] font-medium" style={{ color: textMuted }}>{DAYS[i]}</p>
                      <p
                        className={`text-sm font-bold mt-0.5 ${isToday ? 'w-7 h-7 rounded-full flex items-center justify-center mx-auto' : ''}`}
                        style={{
                          color: isToday ? buttonText : textMain,
                          backgroundColor: isToday ? buttonColor : 'transparent',
                        }}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 min-h-[300px]">
                {calendarDates.map((date, i) => {
                  const dateStr = formatDate(date);
                  const dayPosts = postsByDate[dateStr] || [];
                  return (
                    <div key={i} className="border-r last:border-r-0 p-1.5 space-y-1" style={{ borderColor }}>
                      {dayPosts.map(post => {
                        const sc = STATUS_COLORS[post.status];
                        return (
                          <div
                            key={post.id}
                            className={`px-2 py-1.5 rounded-lg text-[10px] cursor-pointer transition-opacity hover:opacity-80 ${sc.bg}`}
                          >
                            <p className={`font-medium ${sc.text}`}>{post.scheduledTime}</p>
                            <p className="line-clamp-2 mt-0.5" style={{ color: textMain }}>{post.content}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {post.platforms.map(p => (
                                <PlatformIcon key={p} platform={p} size={10} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* List view */}
          {view === 'list' && (
            <div className="space-y-2">
              {DEMO_POSTS.map(post => {
                const sc = STATUS_COLORS[post.status];
                return (
                  <div key={post.id} className="rounded-xl p-4 shadow-sm flex items-start gap-3" style={{ backgroundColor: cardBg }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2" style={{ color: textMain }}>{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs" style={{ color: textMuted }}>{post.scheduledDate} at {post.scheduledTime}</span>
                        <div className="flex items-center gap-1">
                          {post.platforms.map(p => (
                            <PlatformIcon key={p} platform={p} size={12} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize shrink-0 ${sc.bg} ${sc.text}`}>
                      {post.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Post composer */}
          {showComposer && (
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold" style={{ color: textMain }}>Create Post</h4>
                <button onClick={() => setShowComposer(false)} className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <textarea
                placeholder="What do you want to share?"
                rows={4}
                className="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none resize-none mb-3"
                style={{ borderColor, color: textMain }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs" style={{ color: textMuted }}>Platforms:</p>
                  {PLATFORM_ACCOUNTS.filter(a => a.connected).map(account => (
                    <button
                      key={account.id}
                      className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors hover:bg-gray-50"
                      style={{ borderColor, color: account.iconColor }}
                      title={account.platform}
                    >
                      <PlatformIcon platform={account.platform} size={14} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border"
                    style={{ borderColor, color: textMuted }}
                  >
                    Schedule
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: buttonColor, color: buttonText }}
                  >
                    Post Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Connected accounts */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: cardBg }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: textMuted }}>Connected Accounts</h4>
            <div className="space-y-2">
              {PLATFORM_ACCOUNTS.map(account => (
                <div key={account.id} className="flex items-center gap-2.5 py-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: account.connected ? `${account.iconColor}15` : '#F3F4F6', color: account.connected ? account.iconColor : '#9CA3AF' }}
                  >
                    <PlatformIcon platform={account.platform} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: textMain }}>{account.platform}</p>
                    <p className="text-[10px] truncate" style={{ color: textMuted }}>
                      {account.connected ? `${account.followers.toLocaleString()} followers` : 'Not connected'}
                    </p>
                  </div>
                  {account.connected ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <button
                      className="px-2 py-1 text-[10px] font-medium rounded-md transition-colors"
                      style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
