'use client';

import { useState, useRef, useEffect } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { FreelancerMessage } from '@/types/freelancer';

interface OrderChatProps {
  orderId: string;
  messages: FreelancerMessage[];
  currentUserId: string;
  colors: DashboardColors;
  onSendMessage: (content: string) => void;
}

export default function OrderChat({ messages, currentUserId, colors, onSendMessage }: OrderChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col" style={{ height: 280 }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs py-6" style={{ color: textMuted }}>
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] px-3.5 py-2 rounded-2xl text-sm"
                style={{
                  backgroundColor: isMe ? buttonColor : `${borderColor}80`,
                  color: isMe ? buttonText : textMain,
                  borderBottomRightRadius: isMe ? 4 : undefined,
                  borderBottomLeftRadius: !isMe ? 4 : undefined,
                }}
              >
                <p>{msg.content}</p>
                <p className="text-[10px] mt-1 opacity-60">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 p-3 border-t" style={{ borderColor }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-xl border text-sm"
          style={{ borderColor, color: textMain, backgroundColor: cardBg }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: buttonColor, color: buttonText }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
