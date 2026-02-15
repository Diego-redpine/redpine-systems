'use client';

import { useCallback, useState, useEffect, useRef, Component, ReactNode } from 'react';
import { ChaiBuilderEditor } from '@chaibuilder/sdk';
import { loadWebBlocks } from '@chaibuilder/sdk/web-blocks';
import '@chaibuilder/sdk/styles';
import { registerCustomBlocks } from '@/lib/chai-blocks-register';

interface SiteEditorProps {
  pageSlug: string;
  pageTitle: string;
  initialBlocks: unknown[];
  onSave: (blocks: unknown[]) => Promise<void>;
  onClose: () => void;
  lockedMode?: boolean; // Portal mode: no drag/drop, no add block — only prop editing
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Error boundary to catch ChaiBuilder crashes
class EditorErrorBoundary extends Component<{ children: ReactNode; onClose: () => void }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">Editor failed to load</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">{this.state.error}</p>
          <button onClick={this.props.onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white">
            Close Editor
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SiteEditor({ pageSlug, pageTitle, initialBlocks, onSave, onClose, lockedMode = false }: SiteEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [ready, setReady] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Load web blocks + custom widgets on mount
  useEffect(() => {
    loadWebBlocks();
    registerCustomBlocks();
    // Small delay to let ChaiBuilder initialize
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus chat input when opened
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const handleSave = useCallback(async ({ blocks }: { blocks: unknown[]; autoSave?: boolean }) => {
    setSaveStatus('saving');
    try {
      await onSave(blocks);
      setSaveStatus('saved');
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('unsaved');
      return false;
    }
  }, [onSave]);

  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: 'website_edit',
          pageSlug,
          pageTitle,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const responseText = json.data?.response || json.response || json.message || 'I can help you edit your website. Try describing what changes you want.';
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: responseText,
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I couldn\'t process that request. Please try again.',
        }]);
      }
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
      }]);
    } finally {
      setIsSending(false);
    }
  };

  // Pass undefined for empty blocks so ChaiBuilder uses its default blank canvas
  const editorBlocks = initialBlocks.length > 0 ? initialBlocks : undefined;

  const SUGGESTIONS = [
    'Add a hero section with a headline',
    'Change the color scheme to blue',
    'Add a testimonials section',
    'Create a contact form',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close editor"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-900">{pageTitle}</p>
            <p className="text-xs text-gray-500">/{pageSlug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lockedMode && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
              Template Mode
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-700' :
            saveStatus === 'saving' ? 'bg-blue-50 text-blue-700' :
            'bg-amber-50 text-amber-700'
          }`}>
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>
        </div>
      </div>

      {/* Hide add-block panel in locked mode */}
      {lockedMode && (
        <style>{`
          [data-panel="add-blocks"],
          [data-testid="add-block-panel"],
          button[title="Add block"],
          .chai-builder-add-block-btn {
            display: none !important;
          }
        `}</style>
      )}

      {/* ChaiBuilder Editor */}
      <div className="flex-1 overflow-hidden relative">
        {!ready ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Loading editor...</p>
            </div>
          </div>
        ) : (
          <EditorErrorBoundary onClose={onClose}>
            <ChaiBuilderEditor
              blocks={editorBlocks as never}
              onSave={handleSave as never}
              autoSave={true}
              autoSaveActionsCount={5}
              onSaveStateChange={(status: string) => {
                setSaveStatus(status.toLowerCase() as 'saved' | 'saving' | 'unsaved');
              }}
              flags={{
                darkMode: false,
                importHtml: !lockedMode,
                dragAndDrop: !lockedMode,
              }}
            />
          </EditorErrorBoundary>
        )}

        {/* Floating AI Chat Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            title="AI Assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </button>
        )}

        {/* AI Chat Panel — slides in from right */}
        {isChatOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">AI Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <p className="text-xs text-gray-500 mb-4">Describe changes you want to make to this page</p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => { setChatInput(s); chatInputRef.current?.focus(); }}
                        className="block w-full text-left px-3 py-2 text-xs text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-gray-900 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe a change..."
                  rows={1}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isSending}
                  className="p-2 rounded-lg bg-gray-900 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
