'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardTab, DashboardColors } from '@/types/config';
import { ColorItem } from '@/components/editors/ColorsEditor';
import { mergeWithDefaults, applyColorsToDocument } from '@/lib/default-colors';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  configId?: string | null;
  businessType?: string;
  businessName?: string;
  tabs?: DashboardTab[];
  colors?: DashboardColors;
  onTabsChange?: (tabs: DashboardTab[]) => void;
  onColorsChange?: (colors: ColorItem[]) => void;
  side?: 'left' | 'right';
}

// Convert DashboardColors object to ColorItem array
function colorsObjectToArray(colors: DashboardColors): ColorItem[] {
  const result: ColorItem[] = [];
  const allTargets = [
    'sidebar_bg', 'sidebar_icons', 'sidebar_buttons', 'sidebar_text',
    'background', 'buttons', 'cards', 'text', 'headings', 'borders'
  ] as const;

  allTargets.forEach(target => {
    const value = colors[target];
    if (value) {
      result.push({ color: value, target });
    }
  });

  return result;
}

export default function ChatOverlay({
  isOpen,
  onClose,
  configId,
  businessType,
  businessName,
  tabs,
  colors,
  onTabsChange,
  onColorsChange,
  side = 'left',
}: ChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save config changes to Supabase
  const saveConfig = async (changes: { tabs?: DashboardTab[]; colors?: DashboardColors }) => {
    if (!configId) return;
    try {
      await fetch(`/api/config?id=${configId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: configId, ...changes }),
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          config: {
            tabs: tabs || [],
            colors: colors || {},
          },
          history: messages,
        }),
      });

      const data = await res.json();
      const result = data.data || data;

      // Add assistant response
      if (result.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      }

      // Apply changes if the AI made updates
      if (result.action === 'update' && result.changes) {
        const changes = result.changes;

        // Apply tab changes
        if (changes.tabs && onTabsChange) {
          onTabsChange(changes.tabs);
        }

        // Apply color changes
        if (changes.colors && onColorsChange) {
          const mergedColors = mergeWithDefaults(changes.colors);
          const colorItems = colorsObjectToArray(mergedColors);
          onColorsChange(colorItems);
          applyColorsToDocument(mergedColors);
        }

        // Save to Supabase
        saveConfig(changes);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  const positionStyle = side === 'left'
    ? { left: '56px' }
    : { right: '56px' };

  const borderSide = side === 'left'
    ? 'border-r border-gray-200'
    : 'border-l border-gray-200';

  const slideFrom = side === 'left' ? 'slideInLeft' : 'slideInRight';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl ${borderSide} animate-slidePanel`}
        style={{ ...positionStyle, width: '380px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900">Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {businessName ? `How can I help with ${businessName}?` : 'How can I help?'}
              </p>
              <p className="text-xs text-gray-400">
                Ask me to change colors, add tabs, rename sections, or customize your dashboard.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-200 p-3">
          <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-900 text-white shrink-0 disabled:opacity-30 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slidePanel {
          animation: ${slideFrom} 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
