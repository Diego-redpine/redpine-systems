'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { DashboardColors } from '@/types/config';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  configColors: DashboardColors;
  placeholder?: string;
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
  configColors,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  configColors: DashboardColors;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-2 py-1 rounded text-xs font-medium transition-colors"
      style={{
        backgroundColor: active ? (configColors.buttons || '#3B82F6') : 'transparent',
        color: active ? '#FFFFFF' : (configColors.text || '#6B7280'),
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  configColors,
  placeholder = 'Start typing...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'underline' },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3',
        style: `color: ${configColors.text || '#111827'}`,
      },
    },
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  return (
    <div
      className="rounded-md border overflow-hidden"
      style={{
        borderColor: configColors.borders || '#E5E7EB',
        backgroundColor: configColors.background || '#F9FAFB',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 p-2 border-b"
        style={{ borderColor: configColors.borders || '#E5E7EB' }}
      >
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          configColors={configColors}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          configColors={configColors}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          configColors={configColors}
        >
          S
        </ToolbarButton>

        <span className="w-px h-5 mx-1 self-center" style={{ backgroundColor: configColors.borders || '#E5E7EB' }} />

        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
          configColors={configColors}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
          configColors={configColors}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
          configColors={configColors}
        >
          H3
        </ToolbarButton>

        <span className="w-px h-5 mx-1 self-center" style={{ backgroundColor: configColors.borders || '#E5E7EB' }} />

        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          configColors={configColors}
        >
          &bull; List
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          configColors={configColors}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
          configColors={configColors}
        >
          &ldquo; Quote
        </ToolbarButton>

        <span className="w-px h-5 mx-1 self-center" style={{ backgroundColor: configColors.borders || '#E5E7EB' }} />

        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive('link')}
            title="Add Link"
            configColors={configColors}
          >
            Link
          </ToolbarButton>
          {showLinkInput && (
            <div
              className="absolute top-full left-0 mt-1 z-10 flex items-center gap-1 p-1.5 rounded-lg shadow-lg border"
              style={{ backgroundColor: configColors.cards || '#FFFFFF', borderColor: configColors.borders || '#E5E7EB' }}
            >
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                autoFocus
                className="px-2 py-1 text-xs border rounded w-48 focus:outline-none focus:ring-1"
                style={{ borderColor: configColors.borders || '#E5E7EB', color: configColors.text || '#111827' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkUrl) {
                    editor.chain().focus().setLink({ href: linkUrl }).run();
                    setLinkUrl('');
                    setShowLinkInput(false);
                  }
                  if (e.key === 'Escape') {
                    setLinkUrl('');
                    setShowLinkInput(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (linkUrl) {
                    editor.chain().focus().setLink({ href: linkUrl }).run();
                    setLinkUrl('');
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
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
          configColors={configColors}
        >
          ---
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
