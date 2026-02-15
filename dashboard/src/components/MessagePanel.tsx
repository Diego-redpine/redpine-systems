'use client';

import { useState, useEffect, ReactNode } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface Message {
  id: string;
  from: string;
  avatar: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
}

interface MessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  colors: DashboardColors;
}

const DEMO_MESSAGES: Message[] = [
  { id: '1', from: 'Sarah Johnson', avatar: 'SJ', subject: 'Rescheduling request', preview: 'Hi, can I move my appointment from Tuesday to Thursday at 3 PM?', time: '10 min ago', read: false },
  { id: '2', from: 'Mike Davis', avatar: 'MD', subject: 'Invoice question', preview: 'I noticed a charge on my last invoice that I wanted to ask about...', time: '45 min ago', read: false },
  { id: '3', from: 'Emily Chen', avatar: 'EC', subject: 'Great service!', preview: 'Just wanted to say thanks for the amazing experience yesterday!', time: '2 hours ago', read: false },
  { id: '4', from: 'Alex Wong', avatar: 'AW', subject: 'Product inquiry', preview: 'Do you carry the new line of products we discussed last time?', time: '5 hours ago', read: true },
  { id: '5', from: 'Lisa Park', avatar: 'LP', subject: 'Booking for next week', preview: 'I\'d like to book the same service as last time. Is next Wednesday open?', time: 'Yesterday', read: true },
  { id: '6', from: 'Rachel Kim', avatar: 'RK', subject: 'Referral', preview: 'I referred my friend to you! Her name is Anna, she might reach out soon.', time: '2 days ago', read: true },
];

export default function MessagePanel({ isOpen, onClose, colors }: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);

  const cardBg = colors.cards || '#FFFFFF';
  const headingColor = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const buttonColor = colors.buttons || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';

  const unreadCount = messages.filter(m => !m.read).length;

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
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const markRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to catch outside clicks */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute top-full right-0 mt-2 w-96 max-h-[520px] rounded-2xl shadow-xl border overflow-hidden flex flex-col z-50"
        style={{ backgroundColor: cardBg, borderColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: headingColor }}>Messages</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: buttonColor, color: getContrastText(buttonColor) }}>
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

        {/* Message list */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="text-sm" style={{ color: textMuted }}>No messages yet</p>
            </div>
          ) : (
            messages.map(m => (
              <button
                key={m.id}
                onClick={() => markRead(m.id)}
                className="w-full text-left flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02] border-b last:border-b-0"
                style={{ borderColor, backgroundColor: m.read ? 'transparent' : `${buttonColor}06` }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${buttonColor}15`, color: buttonColor }}
                >
                  {m.avatar}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${m.read ? 'font-normal' : 'font-semibold'}`} style={{ color: headingColor }}>
                      {m.from}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px]" style={{ color: '#9CA3AF' }}>{m.time}</span>
                      {!m.read && (
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: buttonColor }} />
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-0.5 ${m.read ? 'font-normal' : 'font-medium'}`} style={{ color: headingColor }}>
                    {m.subject}
                  </p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: textMuted }}>{m.preview}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/** Returns unread message count for badge display */
export function useMessageCount(): number {
  // In demo mode, return static count. In real mode, this would poll an API.
  return 3;
}
