'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PortalConfig } from '@/lib/portal-templates';

interface ChatMessage {
  id: string;
  content: string;
  sender_type: string;
  sender_name: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  pinned: boolean;
}

interface PortalMessagesSectionProps {
  clientId: string;
  portalConfig: PortalConfig;
  accentColor: string;
  accentTextColor: string;
  portalToken: string;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function ChatPanel({
  messages,
  accentColor,
  accentTextColor,
  onSend,
  sending,
}: {
  messages: ChatMessage[];
  accentColor: string;
  accentTextColor: string;
  onSend: (content: string) => void;
  sending: boolean;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isVisitor = msg.sender_type === 'visitor';
          const isSystem = msg.sender_type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="text-xs text-gray-400 italic">{msg.content}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isVisitor ? '' : 'bg-gray-100'
                }`}
                style={isVisitor ? { backgroundColor: accentColor, color: accentTextColor } : undefined}
              >
                {!isVisitor && (
                  <p className="text-xs font-medium text-gray-500 mb-0.5">
                    {msg.sender_name}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isVisitor ? 'opacity-70' : 'text-gray-400'
                  }`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 flex-shrink-0"
          style={{ backgroundColor: accentColor, color: accentTextColor }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">No announcements</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {announcements.map(ann => (
        <div
          key={ann.id}
          className={`rounded-xl p-4 ${
            ann.pinned ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{ann.title}</h4>
            {ann.pinned && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 flex-shrink-0">
                Pinned
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{ann.description}</p>
          {ann.date && (
            <p className="text-xs text-gray-400 mt-2">{formatDate(ann.date)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function PortalMessagesSection({
  clientId,
  portalConfig,
  accentColor,
  accentTextColor,
  portalToken,
}: PortalMessagesSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>(
    portalConfig.chatProminence === 'primary' ? 'chat' : 'announcements'
  );
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const [chatRes, annRes] = await Promise.all([
          fetch('/api/portal/chat', {
            headers: { 'x-portal-token': portalToken },
          }),
          fetch('/api/portal/data?type=announcements', {
            headers: { 'x-portal-token': portalToken },
          }),
        ]);

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setMessages(chatData.messages || []);
        }
        if (annRes.ok) {
          const annData = await annRes.json();
          setAnnouncements(annData.announcements || []);
        }
      } catch {
        // Silently fail
      }
      setLoading(false);
    }
    load();
  }, [portalToken]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (activeTab !== 'chat') return;

    pollRef.current = setInterval(async () => {
      try {
        const lastId = messages.length > 0 ? messages[messages.length - 1].id : '';
        const url = lastId
          ? `/api/portal/chat?after=${lastId}`
          : '/api/portal/chat';
        const res = await fetch(url, {
          headers: { 'x-portal-token': portalToken },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            if (lastId) {
              setMessages(prev => [...prev, ...data.messages]);
            } else {
              setMessages(data.messages);
            }
          }
        }
      } catch {
        // Polling failure is non-critical
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeTab, messages, portalToken]);

  const handleSend = useCallback(async (content: string) => {
    setSending(true);
    try {
      const res = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-token': portalToken,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
      }
    } catch {
      // Silently fail
    }
    setSending(false);
  }, [portalToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: activeTab === 'chat' ? accentColor : '#f3f4f6',
            color: activeTab === 'chat' ? accentTextColor : '#6b7280',
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: activeTab === 'announcements' ? accentColor : '#f3f4f6',
            color: activeTab === 'announcements' ? accentTextColor : '#6b7280',
          }}
        >
          Announcements
          {announcements.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
              {announcements.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatPanel
            messages={messages}
            accentColor={accentColor}
            accentTextColor={accentTextColor}
            onSend={handleSend}
            sending={sending}
          />
        ) : (
          <AnnouncementsList announcements={announcements} />
        )}
      </div>
    </div>
  );
}
