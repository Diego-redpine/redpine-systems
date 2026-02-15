'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { DashboardColors } from '@/types/config';
import { toast } from '@/components/ui/Toaster';
import { generateDocumentPDF } from '@/lib/pdf-generator';

interface DocumentEditorProps {
  record: Record<string, unknown>;
  entityType: string;
  configColors: DashboardColors;
  onSave: (updatedRecord: Record<string, unknown>) => void;
  onClose: () => void;
}

const CONTRACT_TEMPLATES: Record<string, { name: string; content: string }[]> = {
  contracts: [
    {
      name: 'Service Agreement',
      content: `<h1>Service Agreement</h1>
<p>This Service Agreement ("Agreement") is entered into as of <strong>{{date}}</strong>.</p>
<h2>1. Services</h2>
<p>The Service Provider agrees to perform the following services:</p>
<ul><li>Service description here</li></ul>
<h2>2. Compensation</h2>
<p>The Client agrees to pay the Service Provider the sum of <strong>$____</strong> for services rendered.</p>
<h2>3. Term</h2>
<p>This Agreement shall commence on the date first written above and continue until the services are completed.</p>
<h2>4. Signatures</h2>
<p><br></p>
<p>___________________________ &nbsp;&nbsp;&nbsp; ___________________________</p>
<p>Service Provider &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Client</p>`,
    },
    {
      name: 'Non-Disclosure Agreement',
      content: `<h1>Non-Disclosure Agreement</h1>
<p>This NDA is entered into as of <strong>{{date}}</strong>.</p>
<h2>1. Definition of Confidential Information</h2>
<p>For purposes of this Agreement, "Confidential Information" shall include all information or data disclosed by either party.</p>
<h2>2. Obligations</h2>
<p>The Receiving Party agrees to:</p>
<ul>
<li>Hold confidential information in strict confidence</li>
<li>Not disclose to any third parties</li>
<li>Use only for the purpose of the business relationship</li>
</ul>
<h2>3. Term</h2>
<p>This Agreement shall remain in effect for a period of <strong>2 years</strong> from the date of execution.</p>`,
    },
  ],
  documents: [
    {
      name: 'Blank Document',
      content: '<h1>Untitled Document</h1><p>Start typing here...</p>',
    },
    {
      name: 'Meeting Notes',
      content: `<h1>Meeting Notes</h1>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>Attendees:</strong></p>
<ul><li>Name 1</li><li>Name 2</li></ul>
<h2>Agenda</h2>
<ol><li>Topic 1</li><li>Topic 2</li></ol>
<h2>Action Items</h2>
<ul><li>[ ] Action item 1</li><li>[ ] Action item 2</li></ul>`,
    },
  ],
};

export default function DocumentEditor({
  record,
  entityType,
  configColors,
  onSave,
  onClose,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(String(record.title || record.name || 'Untitled'));
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplates, setShowTemplates] = useState(!record.content);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [docLinkUrl, setDocLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: (record.content as string) || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-6',
        style: `color: ${configColors.text || '#111827'}`,
      },
    },
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      const html = editor.getHTML();
      if (html && html !== '<p></p>') {
        onSave({ ...record, title, content: html });
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [editor, title, record, onSave]);

  const handleSave = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    onSave({ ...record, title, content: html });
    setLastSaved(new Date());
    toast.success('Document saved');
  }, [editor, title, record, onSave]);

  const handleDownloadPDF = useCallback(() => {
    if (!editor) return;
    generateDocumentPDF(title, editor.getHTML());
    toast.success('PDF downloaded');
  }, [editor, title]);

  const applyTemplate = (template: { name: string; content: string }) => {
    if (!editor) return;
    const today = new Date().toLocaleDateString();
    const content = template.content.replace(/\{\{date\}\}/g, today);
    editor.commands.setContent(content);
    setTitle(template.name);
    setShowTemplates(false);
  };

  const templates = CONTRACT_TEMPLATES[entityType] || CONTRACT_TEMPLATES['documents'] || [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Full-page editor */}
      <div
        className="fixed inset-4 z-50 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: configColors.cards || '#FFFFFF' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: configColors.borders || '#E5E7EB' }}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:opacity-70 transition-opacity"
              style={{ color: configColors.text || '#6B7280' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-lg font-semibold bg-transparent border-none outline-none"
              style={{ color: configColors.headings || '#111827' }}
              placeholder="Document title..."
            />
          </div>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs" style={{ color: configColors.text || '#9CA3AF' }}>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-md text-sm border transition-opacity hover:opacity-80"
              style={{
                borderColor: configColors.borders || '#E5E7EB',
                color: configColors.text || '#374151',
              }}
            >
              PDF
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: configColors.buttons || '#3B82F6',
                color: '#FFFFFF',
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {editor && (
          <div
            className="flex flex-wrap items-center gap-1 px-4 py-2 border-b"
            style={{ borderColor: configColors.borders || '#E5E7EB' }}
          >
            {[
              { label: 'B', command: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              { label: 'I', command: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
              { label: 'S', command: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
              null,
              { label: 'H1', command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
              { label: 'H2', command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
              { label: 'H3', command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
              null,
              { label: 'List', command: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
              { label: '1.', command: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
              { label: 'Quote', command: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
              null,
            ].map((item, i) =>
              item === null ? (
                <span key={i} className="w-px h-5 mx-1" style={{ backgroundColor: configColors.borders || '#E5E7EB' }} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={item.command}
                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: item.active ? (configColors.buttons || '#3B82F6') : 'transparent',
                    color: item.active ? '#FFFFFF' : (configColors.text || '#6B7280'),
                  }}
                >
                  {item.label}
                </button>
              )
            )}
            {/* Link button with inline URL input */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="px-2 py-1 rounded text-xs font-medium transition-colors"
                style={{
                  backgroundColor: editor.isActive('link') ? (configColors.buttons || '#3B82F6') : 'transparent',
                  color: editor.isActive('link') ? '#FFFFFF' : (configColors.text || '#6B7280'),
                }}
              >
                Link
              </button>
              {showLinkInput && (
                <div
                  className="absolute top-full left-0 mt-1 z-10 flex items-center gap-1 p-1.5 rounded-lg shadow-lg border"
                  style={{ backgroundColor: configColors.cards || '#FFFFFF', borderColor: configColors.borders || '#E5E7EB' }}
                >
                  <input
                    type="url"
                    value={docLinkUrl}
                    onChange={(e) => setDocLinkUrl(e.target.value)}
                    placeholder="https://..."
                    autoFocus
                    className="px-2 py-1 text-xs border rounded w-48 focus:outline-none focus:ring-1"
                    style={{ borderColor: configColors.borders || '#E5E7EB', color: configColors.text || '#111827' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && docLinkUrl) {
                        editor.chain().focus().setLink({ href: docLinkUrl }).run();
                        setDocLinkUrl('');
                        setShowLinkInput(false);
                      }
                      if (e.key === 'Escape') {
                        setDocLinkUrl('');
                        setShowLinkInput(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (docLinkUrl) {
                        editor.chain().focus().setLink({ href: docLinkUrl }).run();
                        setDocLinkUrl('');
                        setShowLinkInput(false);
                      }
                    }}
                    className="px-2 py-1 text-xs font-medium rounded text-white"
                    style={{ backgroundColor: configColors.buttons || '#3B82F6' }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: configColors.text || '#6B7280',
              }}
            >
              ---
            </button>
          </div>
        )}

        {/* Template picker (shown for new documents) */}
        {showTemplates && templates.length > 0 && (
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: configColors.borders || '#E5E7EB' }}
          >
            <p className="text-sm mb-2" style={{ color: configColors.text || '#6B7280' }}>
              Start with a template:
            </p>
            <div className="flex gap-2">
              {templates.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="px-3 py-1.5 rounded-md text-sm border transition-opacity hover:opacity-80"
                  style={{
                    borderColor: configColors.borders || '#E5E7EB',
                    color: configColors.text || '#374151',
                  }}
                >
                  {t.name}
                </button>
              ))}
              <button
                onClick={() => setShowTemplates(false)}
                className="px-3 py-1.5 rounded-md text-sm transition-opacity hover:opacity-80"
                style={{ color: configColors.text || '#9CA3AF' }}
              >
                Blank
              </button>
            </div>
          </div>
        )}

        {/* Editor content */}
        <div className="flex-1 overflow-auto">
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>
    </>
  );
}
