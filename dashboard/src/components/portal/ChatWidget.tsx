'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// Types
// ============================================================

interface ChatMessage {
  id: string;
  content: string;
  sender_type: string;
  sender_name: string;
  created_at: string;
}

interface BusinessConfig {
  businessName: string;
  userId: string;
  subdomain: string;
  accentColor: string;
  accentTextColor: string;
}

interface PortalSession {
  token: string;
  clientId: string;
  clientName: string;
  loyaltyTier?: string;
}

type WidgetState = 'anonymous' | 'returning' | 'authenticated';

interface ChatWidgetProps {
  businessConfig: BusinessConfig;
  portalSession?: PortalSession | null;
}

// ============================================================
// Cookie Helpers
// ============================================================

const COOKIE_KEY = 'rp_chat_visitor';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface VisitorCookie {
  id: string;
  name: string;
  email: string;
  conversationId?: string;
}

function getVisitorCookie(): VisitorCookie | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Invalid stored data
  }
  return null;
}

function setVisitorCookie(data: VisitorCookie) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_KEY, JSON.stringify(data));
  // Also set an actual cookie for server-side detection
  document.cookie = `${COOKIE_KEY}=${data.id}; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax`;
}

function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ============================================================
// Time formatting
// ============================================================

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================================
// Chat Widget Component
// ============================================================

export function ChatWidget({ businessConfig, portalSession }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetState, setWidgetState] = useState<WidgetState>('anonymous');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  // Anonymous form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Visitor cookie
  const [visitor, setVisitor] = useState<VisitorCookie | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { accentColor, accentTextColor } = businessConfig;

  // Determine widget state
  useEffect(() => {
    if (portalSession) {
      setWidgetState('authenticated');
      return;
    }

    const existing = getVisitorCookie();
    if (existing) {
      setVisitor(existing);
      setVisitorName(existing.name);
      setVisitorEmail(existing.email);
      setConversationId(existing.conversationId || null);
      setWidgetState('returning');
      setFormSubmitted(true);
    } else {
      setWidgetState('anonymous');
    }
  }, [portalSession]);

  // Load messages when opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadMessages() {
      setLoading(true);

      if (widgetState === 'authenticated' && portalSession) {
        // Authenticated: load via portal chat API
        try {
          const res = await fetch('/api/portal/chat', {
            headers: { 'x-portal-token': portalSession.token },
          });
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
            if (data.conversation) {
              setConversationId(data.conversation.id);
            }
          }
        } catch {
          // Silently fail
        }
      } else if (conversationId) {
        // Returning visitor: load via widget API
        try {
          const res = await fetch(
            `/api/portal/chat/widget?conversation_id=${conversationId}&subdomain=${businessConfig.subdomain}`
          );
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
          }
        } catch {
          // Silently fail
        }
      }

      setLoading(false);
    }

    loadMessages();
  }, [isOpen, widgetState, portalSession, conversationId, businessConfig.subdomain]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    pollRef.current = setInterval(async () => {
      try {
        const lastId = messages.length > 0 ? messages[messages.length - 1].id : '';
        let url: string;

        if (widgetState === 'authenticated' && portalSession) {
          url = lastId ? `/api/portal/chat?after=${lastId}` : '/api/portal/chat';
          const res = await fetch(url, {
            headers: { 'x-portal-token': portalSession.token },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.messages?.length > 0) {
              setMessages(prev => lastId ? [...prev, ...data.messages] : data.messages);
            }
          }
        } else {
          url = `/api/portal/chat/widget?conversation_id=${conversationId}&subdomain=${businessConfig.subdomain}`;
          if (lastId) url += `&after=${lastId}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.messages?.length > 0) {
              setMessages(prev => lastId ? [...prev, ...data.messages] : data.messages);
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
  }, [isOpen, conversationId, messages, widgetState, portalSession, businessConfig.subdomain]);

  // Handle anonymous form submission
  const handleAnonymousSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim()) return;

    const visitorId = generateVisitorId();
    const cookieData: VisitorCookie = {
      id: visitorId,
      name: visitorName.trim(),
      email: visitorEmail.trim(),
    };

    setVisitor(cookieData);
    setVisitorCookie(cookieData);
    setFormSubmitted(true);
    setWidgetState('returning');
  }, [visitorName, visitorEmail]);

  // Send a message
  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      content,
      sender_type: 'visitor',
      sender_name: portalSession?.clientName || visitor?.name || 'Visitor',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      if (widgetState === 'authenticated' && portalSession) {
        // Authenticated send
        const res = await fetch('/api/portal/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-portal-token': portalSession.token,
          },
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          const data = await res.json();
          // Replace optimistic message with real one
          setMessages(prev =>
            prev.map(m => m.id === optimisticMsg.id ? data.message : m)
          );
        }
      } else {
        // Widget send (anonymous/returning)
        const res = await fetch('/api/portal/chat/widget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            subdomain: businessConfig.subdomain,
            visitor_id: visitor?.id,
            visitor_name: visitor?.name || 'Visitor',
            visitor_email: visitor?.email,
            conversation_id: conversationId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            setMessages(prev =>
              prev.map(m => m.id === optimisticMsg.id ? data.message : m)
            );
          }
          if (data.conversation_id && !conversationId) {
            setConversationId(data.conversation_id);
            // Update cookie with conversation ID
            if (visitor) {
              const updated = { ...visitor, conversationId: data.conversation_id };
              setVisitor(updated);
              setVisitorCookie(updated);
            }
          }
        }
      }
    } catch {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }

    setSending(false);
  }, [input, sending, widgetState, portalSession, visitor, conversationId, businessConfig.subdomain]);

  // Greeting based on state
  const greeting = widgetState === 'authenticated' && portalSession
    ? `Hey ${portalSession.clientName.split(' ')[0]}!`
    : widgetState === 'returning' && visitor
      ? `Welcome back, ${visitor.name.split(' ')[0]}!`
      : `Hi! How can we help?`;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: accentColor }}
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke={accentTextColor} viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px] font-bold bg-red-500 text-white px-1">
              {unreadCount}
            </span>
          )}

          {/* Tooltip for authenticated users */}
          {widgetState === 'authenticated' && portalSession && (
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-900 text-white whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {greeting}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <div>
              <h3 className="text-sm font-bold" style={{ color: accentTextColor }}>
                {businessConfig.businessName}
              </h3>
              <p className="text-xs opacity-80" style={{ color: accentTextColor }}>
                {greeting}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke={accentTextColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {widgetState === 'anonymous' && !formSubmitted ? (
            // Anonymous: show name/email form
            <div className="flex-1 flex items-center justify-center p-6">
              <form onSubmit={handleAnonymousSubmit} className="w-full space-y-4">
                <div className="text-center mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke={accentColor} viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {greeting}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tell us who you are to start chatting
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={e => setVisitorEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: accentColor, color: accentTextColor }}
                >
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            // Chat view (returning or authenticated)
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
                  </div>
                )}

                {!loading && messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">
                      Send a message to start the conversation
                    </p>
                  </div>
                )}

                {messages.map(msg => {
                  const isVisitor = msg.sender_type === 'visitor';
                  const isSystem = msg.sender_type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="text-[11px] text-gray-400 italic">{msg.content}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                          isVisitor ? '' : 'bg-gray-100'
                        }`}
                        style={isVisitor ? { backgroundColor: accentColor, color: accentTextColor } : undefined}
                      >
                        {!isVisitor && (
                          <p className="text-[10px] font-medium text-gray-500 mb-0.5">
                            {msg.sender_name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            isVisitor ? 'opacity-60' : 'text-gray-400'
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
              <div className="border-t border-gray-200 p-3 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="p-2 rounded-xl transition-opacity disabled:opacity-50 flex-shrink-0"
                  style={{ backgroundColor: accentColor, color: accentTextColor }}
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center" style={{ fontFamily: 'var(--font-fira-code), monospace' }}>
              Powered by <span className="font-semibold text-red-600">Red Pine</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
