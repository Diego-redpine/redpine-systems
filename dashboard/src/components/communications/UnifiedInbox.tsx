'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { MessageChannel, CHANNEL_COLORS, ALL_CHANNELS, getChannelIconPath } from '@/lib/channel-colors';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  visitor_page?: string;
  channel: MessageChannel;
  status: 'active' | 'ended' | 'missed';
  last_message?: { content: string; sender_type: string; created_at: string };
  unread_count: number;
  message_count: number;
  started_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'visitor' | 'staff' | 'system';
  sender_name: string;
  is_read: boolean;
  created_at: string;
}

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
}

interface UnifiedInboxProps {
  colors: DashboardColors;
  onStatsChange?: () => void;
}

// ── Demo Data ──────────────────────────────────────────────────────────

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', visitor_name: 'Maria Lopez', visitor_email: 'maria@email.com',
    visitor_phone: '+1 (555) 234-5678', channel: 'instagram', status: 'active',
    last_message: { content: 'Hey do you have appointments open tomorrow?', sender_type: 'visitor', created_at: new Date(Date.now() - 120000).toISOString() },
    unread_count: 2, message_count: 5, started_at: new Date(Date.now() - 600000).toISOString(), updated_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'c2', visitor_name: 'James Kim', visitor_email: 'james.k@gmail.com',
    visitor_phone: '+1 (555) 876-5432', channel: 'sms', status: 'active',
    last_message: { content: 'Thanks for the appointment reminder!', sender_type: 'visitor', created_at: new Date(Date.now() - 3600000).toISOString() },
    unread_count: 0, message_count: 3, started_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'c3', visitor_name: 'Ana Rodriguez', visitor_email: 'ana.r@outlook.com',
    channel: 'whatsapp', status: 'active',
    last_message: { content: 'Can I reschedule my booking to next week?', sender_type: 'visitor', created_at: new Date(Date.now() - 10800000).toISOString() },
    unread_count: 1, message_count: 4, started_at: new Date(Date.now() - 14400000).toISOString(), updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'c4', visitor_name: 'Sarah from Google', visitor_page: '/pricing',
    channel: 'live_chat', status: 'active',
    last_message: { content: 'I have a question about your pricing plans', sender_type: 'visitor', created_at: new Date(Date.now() - 18000000).toISOString() },
    unread_count: 1, message_count: 4, started_at: new Date(Date.now() - 21600000).toISOString(), updated_at: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'c5', visitor_name: 'Mike Chen', visitor_email: 'mike@company.com',
    channel: 'email', status: 'ended',
    last_message: { content: 'Perfect, see you Thursday at 2pm!', sender_type: 'visitor', created_at: new Date(Date.now() - 86400000).toISOString() },
    unread_count: 0, message_count: 6, started_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'c6', visitor_name: 'TikTok User', channel: 'tiktok', status: 'missed',
    last_message: { content: 'Love your work! Do you take walk-ins?', sender_type: 'visitor', created_at: new Date(Date.now() - 172800000).toISOString() },
    unread_count: 0, message_count: 1, started_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'c7', visitor_name: 'David Park', channel: 'facebook', status: 'active',
    last_message: { content: 'What are your hours on Saturday?', sender_type: 'visitor', created_at: new Date(Date.now() - 5400000).toISOString() },
    unread_count: 1, message_count: 2, started_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 5400000).toISOString(),
  },
];

const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', content: 'Conversation started via Instagram', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 'm2', content: 'Hi! I saw your post about the new spring collection', sender_type: 'visitor', sender_name: 'Maria', is_read: true, created_at: new Date(Date.now() - 540000).toISOString() },
    { id: 'm3', content: 'Hey Maria! Yes, we just launched it this week 🌸', sender_type: 'staff', sender_name: 'You', is_read: true, created_at: new Date(Date.now() - 480000).toISOString() },
    { id: 'm4', content: 'Do you have appointments open tomorrow?', sender_type: 'visitor', sender_name: 'Maria', is_read: false, created_at: new Date(Date.now() - 300000).toISOString() },
    { id: 'm5', content: 'I really want to try the new treatment you posted about', sender_type: 'visitor', sender_name: 'Maria', is_read: false, created_at: new Date(Date.now() - 120000).toISOString() },
  ],
  c2: [
    { id: 'm6', content: 'Conversation started via SMS', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm7', content: 'Hi James! Just a reminder about your appointment tomorrow at 3pm.', sender_type: 'staff', sender_name: 'You', is_read: true, created_at: new Date(Date.now() - 7100000).toISOString() },
    { id: 'm8', content: 'Thanks for the appointment reminder!', sender_type: 'visitor', sender_name: 'James', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  c3: [
    { id: 'm9', content: 'Conversation started via WhatsApp', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: 'm10', content: 'Hi! I booked for this Friday but something came up', sender_type: 'visitor', sender_name: 'Ana', is_read: true, created_at: new Date(Date.now() - 14000000).toISOString() },
    { id: 'm11', content: 'No problem! When would work better for you?', sender_type: 'staff', sender_name: 'You', is_read: true, created_at: new Date(Date.now() - 13000000).toISOString() },
    { id: 'm12', content: 'Can I reschedule my booking to next week?', sender_type: 'visitor', sender_name: 'Ana', is_read: false, created_at: new Date(Date.now() - 10800000).toISOString() },
  ],
  c4: [
    { id: 'm13', content: 'Chat started from /pricing', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 21600000).toISOString() },
    { id: 'm14', content: 'Hi there! I\'m looking at your pricing page', sender_type: 'visitor', sender_name: 'Sarah', is_read: true, created_at: new Date(Date.now() - 21000000).toISOString() },
    { id: 'm15', content: 'Hello Sarah! Welcome. How can I help you today?', sender_type: 'staff', sender_name: 'You', is_read: true, created_at: new Date(Date.now() - 20000000).toISOString() },
    { id: 'm16', content: 'I have a question about your pricing plans', sender_type: 'visitor', sender_name: 'Sarah', is_read: false, created_at: new Date(Date.now() - 18000000).toISOString() },
  ],
  c5: [
    { id: 'm17', content: 'Conversation started via Email', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 'm18', content: 'Hi, I\'d like to schedule a consultation', sender_type: 'visitor', sender_name: 'Mike', is_read: true, created_at: new Date(Date.now() - 172000000).toISOString() },
    { id: 'm19', content: 'Of course! We have Thursday at 2pm or Friday at 10am available.', sender_type: 'staff', sender_name: 'You', is_read: true, created_at: new Date(Date.now() - 170000000).toISOString() },
    { id: 'm20', content: 'Thursday at 2pm works great', sender_type: 'visitor', sender_name: 'Mike', is_read: true, created_at: new Date(Date.now() - 160000000).toISOString() },
    { id: 'm21', content: 'Booked! You\'ll receive a confirmation email shortly.', sender_type: 'staff', sender_name: 'You', is_read: true, created_at: new Date(Date.now() - 150000000).toISOString() },
    { id: 'm22', content: 'Perfect, see you Thursday at 2pm!', sender_type: 'visitor', sender_name: 'Mike', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  c6: [
    { id: 'm23', content: 'Conversation started via TikTok', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 'm24', content: 'Love your work! Do you take walk-ins?', sender_type: 'visitor', sender_name: 'TikTok User', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  c7: [
    { id: 'm25', content: 'Conversation started via Facebook', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm26', content: 'What are your hours on Saturday?', sender_type: 'visitor', sender_name: 'David', is_read: false, created_at: new Date(Date.now() - 5400000).toISOString() },
  ],
};

const DEFAULT_CANNED: CannedResponse[] = [
  { id: 'cr1', title: 'Greeting', content: 'Hello! Thanks for reaching out. How can I help you today?', shortcut: '/hi' },
  { id: 'cr2', title: 'Away', content: "Thanks for your message! We're currently away but will get back to you as soon as possible.", shortcut: '/away' },
  { id: 'cr3', title: 'Hours', content: 'Our business hours are Monday–Friday, 9am–6pm. Feel free to leave a message and we\'ll respond during business hours!', shortcut: '/hours' },
  { id: 'cr4', title: 'Thanks', content: 'Thank you for chatting with us! Is there anything else I can help with?', shortcut: '/thanks' },
  { id: 'cr5', title: 'Booking', content: 'You can book an appointment directly on our website! Would you like me to send you the link?', shortcut: '/book' },
];

// ── Component ──────────────────────────────────────────────────────────

export default function UnifiedInbox({ colors, onStatsChange }: UnifiedInboxProps) {
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [channelFilter, setChannelFilter] = useState<MessageChannel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCanned, setShowCanned] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobileThreadView, setIsMobileThreadView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#6B7280';
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const bgColor = colors.background || '#F5F5F5';
  const hoverBg = `${borderColor}40`;

  // Fetch messages for selected conversation
  const fetchMessages = useCallback((convId: string) => {
    setMessages(DEMO_MESSAGES[convId] || []);
  }, []);

  useEffect(() => {
    if (selectedId) fetchMessages(selectedId);
    else setMessages([]);
  }, [selectedId, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setIsSending(true);

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      content: replyText.trim(),
      sender_type: 'staff',
      sender_name: 'You',
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
    setReplyText('');
    setIsSending(false);
    toast.success('Reply sent');
  };

  // End conversation
  const handleEndConversation = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, status: 'ended' as const } : c));
    toast.success('Conversation ended');
  };

  const useCannedResponse = (cr: CannedResponse) => {
    setReplyText(cr.content);
    setShowCanned(false);
  };

  const selectedConv = conversations.find(c => c.id === selectedId);

  const filteredConversations = conversations.filter(c => {
    if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.visitor_name.toLowerCase().includes(q) ||
        (c.visitor_email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const statusColors: Record<string, { backgroundColor: string; color: string }> = {
    active: { backgroundColor: '#10B98120', color: '#10B981' },
    ended: { backgroundColor: '#6B728020', color: '#6B7280' },
    missed: { backgroundColor: '#EF444420', color: '#EF4444' },
  };

  // Channel icon component
  const ChannelDot = ({ channel, size = 10 }: { channel: MessageChannel; size?: number }) => {
    const config = CHANNEL_COLORS[channel];
    return (
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{ width: size, height: size, backgroundColor: config.color }}
        title={config.label}
      />
    );
  };

  const ChannelBadge = ({ channel }: { channel: MessageChannel }) => {
    const config = CHANNEL_COLORS[channel];
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d={getChannelIconPath(channel)} />
        </svg>
        {config.shortLabel}
      </span>
    );
  };

  // Handle selecting a conversation (mobile: switch to thread view)
  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setIsMobileThreadView(true);
    setShowContactDrawer(false);
  };

  // Mobile back button
  const handleMobileBack = () => {
    setIsMobileThreadView(false);
    setSelectedId(null);
  };

  return (
    <div className="flex rounded-2xl overflow-hidden" style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, height: 'calc(100vh - 340px)', minHeight: '500px' }}>
      {/* ── Left Panel: Conversation List ─────────────────────────── */}
      <div
        className={`w-80 flex flex-col border-r flex-shrink-0 ${isMobileThreadView ? 'hidden md:flex' : 'flex'}`}
        style={{ borderColor }}
      >
        {/* Search */}
        <div className="p-3 space-y-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={textColor} strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs"
              style={{ backgroundColor: bgColor, color: headingColor, border: `1px solid ${borderColor}` }}
            />
          </div>
          {/* Channel filter chips */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setChannelFilter('all')}
              className="px-2 py-1 rounded-full text-xs"
              style={{
                backgroundColor: channelFilter === 'all' ? buttonBg : 'transparent',
                color: channelFilter === 'all' ? buttonText : textColor,
                border: `1px solid ${channelFilter === 'all' ? buttonBg : borderColor}`,
              }}
            >
              All
            </button>
            {ALL_CHANNELS.map(ch => {
              const config = CHANNEL_COLORS[ch];
              const isActive = channelFilter === ch;
              return (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  style={{
                    backgroundColor: isActive ? `${config.color}20` : 'transparent',
                    color: isActive ? config.color : textColor,
                    border: `1px solid ${isActive ? config.color : borderColor}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                  {config.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: textColor }}>No conversations</p>
          )}
          {filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className="w-full text-left px-3 py-3 transition-colors"
              style={{
                backgroundColor: selectedId === conv.id ? hoverBg : 'transparent',
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${CHANNEL_COLORS[conv.channel].color}15`, color: CHANNEL_COLORS[conv.channel].color }}>
                      {conv.visitor_name.charAt(0).toUpperCase()}
                    </div>
                    <ChannelDot channel={conv.channel} size={12} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate" style={{ color: headingColor }}>{conv.visitor_name}</p>
                    </div>
                    <p className="text-xs truncate" style={{ color: textColor }}>
                      {conv.last_message?.content || 'No messages'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs whitespace-nowrap" style={{ color: textColor }}>
                    {formatTime(conv.updated_at)}
                  </span>
                  {conv.unread_count > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: CHANNEL_COLORS[conv.channel].color, color: '#FFFFFF' }}>
                      {conv.unread_count}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-xs" style={statusColors[conv.status]}>
                      {conv.status}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Center Panel: Message Thread ─────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isMobileThreadView && !selectedConv ? '' : ''} ${isMobileThreadView ? 'flex' : 'hidden md:flex'}`}>
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke={textColor} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: headingColor }}>Select a conversation</p>
              <p className="text-xs mt-1" style={{ color: textColor }}>Choose from the list to start responding</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <button
                  onClick={handleMobileBack}
                  className="md:hidden p-1 rounded-lg"
                  style={{ color: headingColor }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${CHANNEL_COLORS[selectedConv.channel].color}15`, color: CHANNEL_COLORS[selectedConv.channel].color }}>
                  {selectedConv.visitor_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: headingColor }}>{selectedConv.visitor_name}</p>
                    <ChannelBadge channel={selectedConv.channel} />
                  </div>
                  <p className="text-xs" style={{ color: textColor }}>
                    {selectedConv.visitor_email || selectedConv.visitor_page || CHANNEL_COLORS[selectedConv.channel].label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={statusColors[selectedConv.status]}>
                  {selectedConv.status}
                </span>
                <button
                  onClick={() => setShowContactDrawer(!showContactDrawer)}
                  className="p-1.5 rounded-lg transition-opacity hover:opacity-70 hidden md:block"
                  style={{ border: `1px solid ${borderColor}`, color: textColor }}
                  title="Contact info"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {selectedConv.status === 'active' && (
                  <button
                    onClick={() => handleEndConversation(selectedConv.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ border: `1px solid ${borderColor}`, color: textColor }}
                  >
                    End Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => {
                if (msg.sender_type === 'system') {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${borderColor}80`, color: textColor }}>
                        {msg.content} · {formatTime(msg.created_at)}
                      </span>
                    </div>
                  );
                }
                const isStaff = msg.sender_type === 'staff';
                const channelColor = selectedConv ? CHANNEL_COLORS[selectedConv.channel].color : '#6B7280';
                return (
                  <div key={msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%]">
                      <div
                        className="px-3 py-2 rounded-xl text-sm"
                        style={{
                          backgroundColor: isStaff ? buttonBg : `${borderColor}60`,
                          color: isStaff ? buttonText : headingColor,
                          borderBottomRightRadius: isStaff ? 4 : undefined,
                          borderBottomLeftRadius: !isStaff ? 4 : undefined,
                          borderLeft: !isStaff ? `3px solid ${channelColor}` : undefined,
                        }}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-xs mt-1 ${isStaff ? 'text-right' : ''}`} style={{ color: textColor }}>
                        {msg.sender_name} · {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply bar */}
            {selectedConv.status === 'active' && (
              <div className="px-4 py-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                {showCanned && (
                  <div className="mb-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
                    {DEFAULT_CANNED.map(cr => (
                      <button
                        key={cr.id}
                        onClick={() => useCannedResponse(cr)}
                        className="w-full text-left px-3 py-2 text-xs transition-colors hover:opacity-80"
                        style={{ borderBottom: `1px solid ${borderColor}` }}
                      >
                        <span className="font-semibold" style={{ color: headingColor }}>{cr.title}</span>
                        {cr.shortcut && <span className="ml-2 opacity-50" style={{ color: textColor }}>{cr.shortcut}</span>}
                        <p className="truncate mt-0.5" style={{ color: textColor }}>{cr.content}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCanned(!showCanned)}
                    className="px-2 py-2 rounded-lg transition-opacity hover:opacity-70 flex-shrink-0"
                    style={{ border: `1px solid ${borderColor}`, color: showCanned ? buttonBg : textColor }}
                    title="Canned responses"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                    placeholder="Type a reply..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm"
                    style={{ border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: headingColor }}
                  />
                  <button
                    className="px-2 py-2 rounded-lg transition-opacity hover:opacity-70 flex-shrink-0"
                    style={{ border: `1px solid ${borderColor}`, color: textColor }}
                    title="Attach file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isSending}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    {isSending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}

            {selectedConv.status !== 'active' && (
              <div className="px-4 py-3 text-center" style={{ borderTop: `1px solid ${borderColor}` }}>
                <p className="text-xs" style={{ color: textColor }}>
                  This conversation has {selectedConv.status === 'ended' ? 'ended' : 'been missed'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right Panel: Contact Drawer ──────────────────────────── */}
      {showContactDrawer && selectedConv && (
        <div className="w-72 flex-shrink-0 border-l overflow-y-auto hidden md:block" style={{ borderColor }}>
          <div className="p-4 space-y-4">
            {/* Close button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowContactDrawer(false)}
                className="p-1 rounded-lg hover:opacity-70"
                style={{ color: textColor }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contact avatar and name */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3"
                style={{ backgroundColor: `${CHANNEL_COLORS[selectedConv.channel].color}15`, color: CHANNEL_COLORS[selectedConv.channel].color }}>
                {selectedConv.visitor_name.charAt(0).toUpperCase()}
              </div>
              <p className="text-base font-semibold" style={{ color: headingColor }}>{selectedConv.visitor_name}</p>
              <ChannelBadge channel={selectedConv.channel} />
            </div>

            {/* Contact details */}
            <div className="space-y-2 rounded-xl p-3" style={{ backgroundColor: bgColor }}>
              {selectedConv.visitor_email && (
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: textColor }}>Email</p>
                  <p className="text-sm" style={{ color: headingColor }}>{selectedConv.visitor_email}</p>
                </div>
              )}
              {selectedConv.visitor_phone && (
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: textColor }}>Phone</p>
                  <p className="text-sm" style={{ color: headingColor }}>{selectedConv.visitor_phone}</p>
                </div>
              )}
              {selectedConv.visitor_page && (
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: textColor }}>Page</p>
                  <p className="text-sm" style={{ color: headingColor }}>{selectedConv.visitor_page}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: textColor }}>Channel</p>
                <p className="text-sm" style={{ color: headingColor }}>{CHANNEL_COLORS[selectedConv.channel].label}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: textColor }}>First contact</p>
                <p className="text-sm" style={{ color: headingColor }}>{new Date(selectedConv.started_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: textColor }}>Messages</p>
                <p className="text-sm" style={{ color: headingColor }}>{selectedConv.message_count}</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: headingColor }}>Quick Actions</p>
              <button
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:opacity-80"
                style={{ border: `1px solid ${borderColor}`, color: headingColor }}
              >
                View full profile
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:opacity-80"
                style={{ border: `1px solid ${borderColor}`, color: headingColor }}
              >
                Create appointment
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:opacity-80"
                style={{ border: `1px solid ${borderColor}`, color: headingColor }}
              >
                Add note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
