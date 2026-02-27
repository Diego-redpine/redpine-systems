'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'payment' | 'system' | 'review';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  colors: DashboardColors;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'booking', title: 'New Booking', body: 'Sarah Johnson booked a Gel Manicure for tomorrow at 2:00 PM', time: '5 min ago', read: false },
  { id: '2', type: 'payment', title: 'Payment Received', body: '$85.00 from Mike Davis for Full Set Acrylic', time: '1 hour ago', read: false },
  { id: '3', type: 'message', title: 'New Message', body: 'Emily Chen: "Can I reschedule my appointment to Friday?"', time: '2 hours ago', read: false },
  { id: '4', type: 'review', title: 'New Review', body: 'John Smith left a 5-star review: "Amazing service!"', time: '3 hours ago', read: true },
  { id: '5', type: 'booking', title: 'Booking Cancelled', body: 'Alex Wong cancelled their 4:00 PM appointment', time: '5 hours ago', read: true },
  { id: '6', type: 'system', title: 'Weekly Summary', body: 'You had 23 bookings this week, up 15% from last week', time: 'Yesterday', read: true },
  { id: '7', type: 'payment', title: 'Payment Received', body: '$120.00 from Lisa Park for Nail Art + Pedicure', time: 'Yesterday', read: true },
  { id: '8', type: 'message', title: 'New Message', body: 'Rachel Kim: "Do you have availability this Saturday?"', time: '2 days ago', read: true },
];

const TYPE_ICONS: Record<string, { bg: string; icon: ReactNode }> = {
  booking: {
    bg: '#EFF6FF',
    icon: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  payment: {
    bg: '#F0FDF4',
    icon: (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  message: {
    bg: '#FFF7ED',
    icon: (
      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  review: {
    bg: '#FEF9C3',
    icon: (
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  system: {
    bg: '#F3F4F6',
    icon: (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
};

export default function NotificationPanel({ isOpen, onClose, colors }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const cardBg = colors.cards || '#FFFFFF';
  const headingColor = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const buttonColor = colors.buttons || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to catch outside clicks */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={panelRef}
        className="absolute top-full right-0 mt-2 w-96 max-h-[520px] shadow-xl border overflow-hidden flex flex-col z-50"
        style={{ backgroundColor: cardBg, borderColor }}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: headingColor }}>Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium " style={{ backgroundColor: buttonColor, color: getContrastText(buttonColor) }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: buttonColor }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm" style={{ color: textMuted }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => {
            const typeStyle = TYPE_ICONS[n.type] || TYPE_ICONS.system;
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="w-full text-left flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02] border-b last:border-b-0"
                style={{ borderColor, backgroundColor: n.read ? 'transparent' : `${buttonColor}06` }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: typeStyle.bg }}
                >
                  {typeStyle.icon}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`} style={{ color: headingColor }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: buttonColor }} />
                    )}
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: textMuted }}>{n.body}</p>
                  <p className="text-[11px] mt-1" style={{ color: textMuted }}>{n.time}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}

/** Returns unread notification count for badge display */
export function useNotificationCount(): number {
  // In demo mode, return static count. In real mode, this would poll an API.
  return 3;
}
