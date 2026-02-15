'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_page?: string;
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

interface ChatInboxViewProps {
  colors: DashboardColors;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', visitor_name: 'Sarah from Google', visitor_email: 'sarah@email.com',
    visitor_page: '/pricing', status: 'active',
    last_message: { content: 'Hi, I have a question about your pricing plans', sender_type: 'visitor', created_at: new Date(Date.now() - 120000).toISOString() },
    unread_count: 2, message_count: 4, started_at: new Date(Date.now() - 600000).toISOString(), updated_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'c2', visitor_name: 'Mike', visitor_page: '/services',
    status: 'active',
    last_message: { content: 'Do you offer weekend appointments?', sender_type: 'visitor', created_at: new Date(Date.now() - 300000).toISOString() },
    unread_count: 1, message_count: 3, started_at: new Date(Date.now() - 900000).toISOString(), updated_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'c3', visitor_name: 'john@company.com', visitor_page: '/booking',
    status: 'ended',
    last_message: { content: 'Great, I\'ll book that. Thanks!', sender_type: 'visitor', created_at: new Date(Date.now() - 3600000).toISOString() },
    unread_count: 0, message_count: 8, started_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'c4', visitor_name: 'Anonymous', visitor_page: '/home',
    status: 'missed',
    last_message: { content: 'Is anyone available?', sender_type: 'visitor', created_at: new Date(Date.now() - 86400000).toISOString() },
    unread_count: 0, message_count: 1, started_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', content: 'Chat started', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 'm2', content: 'Hi there! I\'m looking at your pricing page', sender_type: 'visitor', sender_name: 'Sarah', is_read: true, created_at: new Date(Date.now() - 540000).toISOString() },
    { id: 'm3', content: 'Hello Sarah! Welcome. How can I help you today?', sender_type: 'staff', sender_name: 'Support', is_read: true, created_at: new Date(Date.now() - 480000).toISOString() },
    { id: 'm4', content: 'Hi, I have a question about your pricing plans', sender_type: 'visitor', sender_name: 'Sarah', is_read: false, created_at: new Date(Date.now() - 120000).toISOString() },
  ],
  c2: [
    { id: 'm5', content: 'Chat started', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 900000).toISOString() },
    { id: 'm6', content: 'Hey, quick question', sender_type: 'visitor', sender_name: 'Mike', is_read: true, created_at: new Date(Date.now() - 840000).toISOString() },
    { id: 'm7', content: 'Do you offer weekend appointments?', sender_type: 'visitor', sender_name: 'Mike', is_read: false, created_at: new Date(Date.now() - 300000).toISOString() },
  ],
  c3: [
    { id: 'm8', content: 'Chat started', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'm9', content: 'I\'d like to book a consultation', sender_type: 'visitor', sender_name: 'John', is_read: true, created_at: new Date(Date.now() - 7100000).toISOString() },
    { id: 'm10', content: 'Of course! We have slots available this week. Would Tuesday or Thursday work?', sender_type: 'staff', sender_name: 'Support', is_read: true, created_at: new Date(Date.now() - 7000000).toISOString() },
    { id: 'm11', content: 'Tuesday at 2pm would be perfect', sender_type: 'visitor', sender_name: 'John', is_read: true, created_at: new Date(Date.now() - 6900000).toISOString() },
    { id: 'm12', content: 'Great, I\'ll book that. Thanks!', sender_type: 'visitor', sender_name: 'John', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  c4: [
    { id: 'm13', content: 'Chat started', sender_type: 'system', sender_name: 'System', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm14', content: 'Is anyone available?', sender_type: 'visitor', sender_name: 'Anonymous', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
};

const DEFAULT_CANNED: CannedResponse[] = [
  { id: 'cr1', title: 'Greeting', content: 'Hello! Thanks for reaching out. How can I help you today?', shortcut: '/hi' },
  { id: 'cr2', title: 'Away', content: 'Thanks for your message! We\'re currently away but will get back to you as soon as possible.', shortcut: '/away' },
  { id: 'cr3', title: 'Hours', content: 'Our business hours are Monday–Friday, 9am–6pm. Feel free to leave a message and we\'ll respond during business hours!', shortcut: '/hours' },
  { id: 'cr4', title: 'Thanks', content: 'Thank you for chatting with us! Is there anything else I can help with?', shortcut: '/thanks' },
];

export default function ChatInboxView({ colors }: ChatInboxViewProps) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCanned, setShowCanned] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#6B7280';
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const bgColor = colors.background || '#F5F5F5';
  const hoverBg = `${borderColor}40`;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/data/chat_widget?${params}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setConversations(json.data);
          setIsDemoMode(false);
        } else {
          setConversations(DEMO_CONVERSATIONS);
          setIsDemoMode(true);
        }
      } else {
        setConversations(DEMO_CONVERSATIONS);
        setIsDemoMode(true);
      }
    } catch {
      setConversations(DEMO_CONVERSATIONS);
      setIsDemoMode(true);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (isDemoMode) {
      setMessages(DEMO_MESSAGES[convId] || []);
      return;
    }
    try {
      const res = await fetch(`/api/data/chat_widget/${convId}`);
      const json = await res.json();
      if (json.chat_messages) setMessages(json.chat_messages);
    } catch { /* ignore */ }
  }, [isDemoMode]);

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

    if (isDemoMode) {
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
      return;
    }

    try {
      await fetch(`/api/data/chat_widget/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim(), sender_name: 'Support' }),
      });
      setReplyText('');
      fetchMessages(selectedId);
      toast.success('Reply sent');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  // End conversation
  const handleEndConversation = async (convId: string) => {
    if (isDemoMode) {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, status: 'ended' as const } : c));
      toast.success('Conversation ended');
      return;
    }
    try {
      await fetch(`/api/data/chat_widget/${convId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      });
      fetchConversations();
      toast.success('Conversation ended');
    } catch {
      toast.error('Failed to end conversation');
    }
  };

  const useCannedResponse = (cr: CannedResponse) => {
    setReplyText(cr.content);
    setShowCanned(false);
  };

  const selectedConv = conversations.find(c => c.id === selectedId);

  const filteredConversations = conversations.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.visitor_name.toLowerCase().includes(q) ||
        (c.visitor_email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount = conversations.filter(c => c.status === 'active').length;
  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  const statusColors: Record<string, { backgroundColor: string; color: string }> = {
    active: { backgroundColor: '#10B98120', color: '#10B981' },
    ended: { backgroundColor: '#6B728020', color: '#6B7280' },
    missed: { backgroundColor: '#EF444420', color: '#EF4444' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stat bar */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'Total Chats', value: conversations.length },
          { label: 'Active Now', value: activeCount, featured: true },
          { label: 'Unread', value: unreadTotal },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex-1 rounded-xl p-4"
            style={{
              backgroundColor: stat.featured ? buttonBg : cardBg,
              border: stat.featured ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            <p className="text-2xl font-bold" style={{ color: stat.featured ? buttonText : headingColor }}>
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: stat.featured ? `${buttonText}99` : textColor }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main inbox area */}
      <div className="flex flex-1 rounded-xl overflow-hidden min-h-0" style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg }}>
        {/* Conversation list */}
        <div className="w-80 flex flex-col border-r" style={{ borderColor }}>
          {/* Search + filter */}
          <div className="p-3 space-y-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={textColor} strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: bgColor, color: headingColor, border: `1px solid ${borderColor}` }}
              />
            </div>
            <div className="flex gap-1">
              {['all', 'active', 'ended', 'missed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-2 py-1 rounded-full text-xs capitalize"
                  style={{
                    backgroundColor: statusFilter === s ? buttonBg : 'transparent',
                    color: statusFilter === s ? buttonText : textColor,
                    border: `1px solid ${statusFilter === s ? buttonBg : borderColor}`,
                  }}
                >
                  {s}
                </button>
              ))}
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
                onClick={() => setSelectedId(conv.id)}
                className="w-full text-left px-3 py-3 transition-colors"
                style={{
                  backgroundColor: selectedId === conv.id ? hoverBg : 'transparent',
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `${buttonBg}15`, color: buttonBg }}>
                      {conv.visitor_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: headingColor }}>{conv.visitor_name}</p>
                      <p className="text-xs truncate" style={{ color: textColor }}>
                        {conv.last_message?.content || 'No messages'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs" style={{ color: textColor }}>{formatTime(conv.updated_at)}</span>
                    {conv.unread_count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: buttonBg, color: buttonText }}>
                        {conv.unread_count}
                      </span>
                    )}
                    {conv.unread_count === 0 && (
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

        {/* Message area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke={textColor} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: headingColor }}>Select a conversation</p>
                <p className="text-xs mt-1" style={{ color: textColor }}>Choose a chat from the list to start responding</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${buttonBg}15`, color: buttonBg }}>
                    {selectedConv.visitor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: headingColor }}>{selectedConv.visitor_name}</p>
                    <p className="text-xs" style={{ color: textColor }}>
                      {selectedConv.visitor_page && `On ${selectedConv.visitor_page}`}
                      {selectedConv.visitor_email && ` · ${selectedConv.visitor_email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium" style={statusColors[selectedConv.status]}>
                    {selectedConv.status}
                  </span>
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

              {/* Reply input */}
              {selectedConv.status === 'active' && (
                <div className="px-4 py-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                  {/* Canned responses */}
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
                  <p className="text-xs" style={{ color: textColor }}>This conversation has {selectedConv.status === 'ended' ? 'ended' : 'been missed'}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
