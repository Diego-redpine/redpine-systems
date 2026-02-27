'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OnboardingChatProps {
  onReady: (configPromise: Promise<{ config: any; configId: string }>) => void;
  dimmed?: boolean;
}

const FALLBACK_GREETING =
  "Hey! I'm here to help you build your business platform. Tell me a bit about your business — what do you do?";

export default function OnboardingChat({ onReady, dimmed }: OnboardingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasGreeted = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Fetch greeting on mount
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const fetchGreeting = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/onboarding/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] }),
        });
        const data = await res.json();
        if (data.success && data.response) {
          setMessages([{ role: 'assistant', content: data.response }]);
        } else {
          setMessages([{ role: 'assistant', content: FALLBACK_GREETING }]);
        }
      } catch {
        setMessages([{ role: 'assistant', content: FALLBACK_GREETING }]);
      }
      setIsLoading(false);
    };

    fetchGreeting();
  }, []);

  const triggerConfigure = useCallback(
    (allMessages: ChatMessage[]) => {
      setHasTriggered(true);

      // Show friendly final message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I've got everything I need. Let me build your platform...",
        },
      ]);

      // Concatenate all user messages into a single description
      const description = allMessages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join('\n\n');

      // Fire the configure call after a short delay so user sees the final message
      setTimeout(() => {
        const configPromise = fetch('/api/onboarding/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              throw new Error(data.error || 'Configuration failed');
            }
            return { config: data.config, configId: data.config_id };
          });

        onReady(configPromise);
      }, 1200);
    },
    [onReady],
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || hasTriggered) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (data.success && data.response) {
        // Check for READY_TO_BUILD signal (strict: must be the entire response or start with it)
        if (data.response.trim() === 'READY_TO_BUILD') {
          const allMessages = updatedMessages;
          setIsLoading(false);
          triggerConfigure(allMessages);
          return;
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Could you try that again?' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could you try that again?' },
      ]);
    }

    setIsLoading(false);
  }, [input, isLoading, hasTriggered, messages, triggerConfigure]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const inputDisabled = isLoading || hasTriggered;

  return (
    <div
      className={`h-screen bg-white flex flex-col transition-opacity duration-500 ${
        dimmed ? 'opacity-30 pointer-events-none' : ''
      }`}
      style={{ fontFamily: "'Fira Code', monospace" }}
    >
      {/* Header */}
      <div className="shrink-0 pt-10 pb-6 text-center">
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="Red Pine" width={80} height={80} />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">
          Tell me about your business
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          A few quick questions so we can set up your platform perfectly.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-800 border-2 border-black'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-black px-4 py-3">
                <div className="flex gap-1.5">
                  <div
                    className="w-2 h-2 bg-gray-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t-2 border-black bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3 border-2 border-black px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasTriggered ? 'Building your platform...' : 'Type your message...'
              }
              rows={1}
              disabled={inputDisabled}
              className="flex-1 bg-transparent text-sm text-black placeholder-gray-400 resize-none outline-none max-h-24 disabled:opacity-50"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || inputDisabled}
              className="w-8 h-8 flex items-center justify-center bg-black text-white shrink-0 disabled:opacity-30 hover:bg-[#ce0707] transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
