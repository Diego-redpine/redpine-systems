'use client';

import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

const TRAFFIC_DATA = [
  { name: 'Mon', views: 120 },
  { name: 'Tue', views: 185 },
  { name: 'Wed', views: 210 },
  { name: 'Thu', views: 165 },
  { name: 'Fri', views: 240 },
  { name: 'Sat', views: 310 },
  { name: 'Sun', views: 275 },
];

const VISITORS_DATA = [
  { name: 'Jan', visitors: 420 },
  { name: 'Feb', visitors: 580 },
  { name: 'Mar', visitors: 690 },
  { name: 'Apr', visitors: 750 },
  { name: 'May', visitors: 820 },
  { name: 'Jun', visitors: 910 },
];

const TOP_PAGES = [
  { page: '/home', views: 1240, bounce: '32%' },
  { page: '/services', views: 890, bounce: '41%' },
  { page: '/about', views: 620, bounce: '28%' },
  { page: '/contact', views: 410, bounce: '45%' },
  { page: '/blog', views: 280, bounce: '38%' },
];

const SOURCES = [
  { source: 'Google', visits: 580, pct: '42%' },
  { source: 'Direct', visits: 340, pct: '25%' },
  { source: 'Instagram', visits: 210, pct: '15%' },
  { source: 'Facebook', visits: 140, pct: '10%' },
  { source: 'Other', visits: 110, pct: '8%' },
];

export default function SiteAnalytics({ colors }: { colors: DashboardColors }) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';

  const stats = [
    { label: 'Total Visits', value: '3,840', change: '+18%' },
    { label: 'Unique Visitors', value: '2,150', change: '+12%' },
    { label: 'Bounce Rate', value: '36%', change: '-4%' },
    { label: 'Avg. Session', value: '2m 45s', change: '+8%' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <p className="text-xs font-medium mb-1" style={{ color: textMuted }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: textMain }}>{s.value}</p>
            <p className={`text-xs font-medium mt-1 ${s.change.startsWith('+') ? 'text-emerald-600' : s.change.startsWith('-') ? 'text-red-500' : ''}`}>
              {s.change} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly traffic */}
        <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: textMain }}>Weekly Traffic</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TRAFFIC_DATA}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="views" fill={buttonColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visitor growth */}
        <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: textMain }}>Visitor Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={VISITORS_DATA}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: textMuted }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="visitors" stroke={buttonColor} fill={buttonColor} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="shadow-sm overflow-hidden" style={{ backgroundColor: cardBg }}>
          <div className="px-6 py-4 border-b" style={{ borderColor }}>
            <h3 className="text-sm font-semibold" style={{ color: textMain }}>Top Pages</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor }}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: textMuted }}>Page</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide" style={{ color: textMuted }}>Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide" style={{ color: textMuted }}>Bounce</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PAGES.map(p => (
                <tr key={p.page} className="border-b last:border-b-0" style={{ borderColor }}>
                  <td className="px-6 py-3 text-sm font-medium" style={{ color: textMain }}>{p.page}</td>
                  <td className="px-6 py-3 text-sm text-right" style={{ color: textMuted }}>{p.views.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-right" style={{ color: textMuted }}>{p.bounce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic sources */}
        <div className="shadow-sm overflow-hidden" style={{ backgroundColor: cardBg }}>
          <div className="px-6 py-4 border-b" style={{ borderColor }}>
            <h3 className="text-sm font-semibold" style={{ color: textMain }}>Traffic Sources</h3>
          </div>
          <div className="p-6 space-y-4">
            {SOURCES.map(s => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-sm font-medium w-20" style={{ color: textMain }}>{s.source}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: borderColor }}>
                  <div
                    className="h-full "
                    style={{ width: s.pct, backgroundColor: buttonColor }}
                  />
                </div>
                <span className="text-xs font-medium w-12 text-right" style={{ color: textMuted }}>{s.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
