'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import CenterModal from '@/components/ui/CenterModal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  status: 'draft' | 'published' | 'scheduled';
  tags: string[];
  author_name: string;
  published_at?: string;
  scheduled_at?: string;
}

interface BlogEditorProps {
  colors: DashboardColors;
  post?: BlogPost;
  onSave: (post: Partial<BlogPost>) => void;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogEditor({ colors, post, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [autoSlug, setAutoSlug] = useState(!post);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const bgColor = colors.background || '#F5F5F5';

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setSlug(slugify(value));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSaveDraft = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt: excerpt.trim(),
      content,
      status: 'draft',
      tags,
    });
  };

  const handlePublish = () => {
    if (!title.trim()) return;
    const payload: Partial<BlogPost> = {
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt: excerpt.trim(),
      content,
      tags,
    };
    if (publishMode === 'now') {
      payload.status = 'published';
      payload.published_at = new Date().toISOString();
    } else {
      payload.status = 'scheduled';
      payload.scheduled_at = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }
    onSave(payload);
    setShowPublishModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: textMuted }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to posts
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium border transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ borderColor, color: textMain }}
          >
            Save Draft
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            {post ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="w-full text-xl font-bold border-none outline-none bg-transparent"
              style={{ color: textMain }}
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: textMuted }}>/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="post-slug"
                className="flex-1 text-xs border-none outline-none bg-transparent font-mono"
                style={{ color: textMuted }}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary that appears in blog listings and search results..."
              rows={2}
              className="w-full text-sm border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor, color: textMain, backgroundColor: bgColor }}
            />
          </div>

          {/* Content editor */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here... (HTML supported)"
              rows={16}
              className="w-full text-sm border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-20 font-mono"
              style={{ borderColor, color: textMain, backgroundColor: bgColor }}
            />
            <p className="text-xs mt-2" style={{ color: textMuted }}>Supports HTML formatting. A rich editor is coming soon.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tags */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-3" style={{ color: textMuted }}>Tags</label>
            <div className="flex gap-1 flex-wrap mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs"
                  style={{ backgroundColor: `${buttonBg}10`, color: textMain }}
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:opacity-70">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag..."
                className="flex-1 px-2 py-1.5 text-xs border"
                style={{ borderColor, color: textMain }}
              />
              <button
                onClick={addTag}
                className="px-2 py-1.5 text-xs"
                style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
              >
                Add
              </button>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-3" style={{ color: textMuted }}>Search Preview</label>
            <div className="p-3" style={{ backgroundColor: bgColor }}>
              <p className="text-sm font-medium truncate" style={{ color: '#1a0dab' }}>
                {title || 'Post Title'}
              </p>
              <p className="text-xs truncate" style={{ color: '#006621' }}>
                yoursite.redpine.systems/blog/{slug || 'post-slug'}
              </p>
              <p className="text-xs line-clamp-2 mt-0.5" style={{ color: '#545454' }}>
                {excerpt || 'Post excerpt will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <CenterModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Publish Post" maxWidth="max-w-md">
        <div className="space-y-4">
          {/* Post Now card */}
          <button
            onClick={() => setPublishMode('now')}
            className="w-full text-left p-4 border-2 transition-colors"
            style={{
              borderColor: publishMode === 'now' ? buttonBg : borderColor,
              backgroundColor: publishMode === 'now' ? `${buttonBg}08` : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${buttonBg}10` }}>
                <svg className="w-5 h-5" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: textMain }}>Post Now</p>
                <p className="text-xs" style={{ color: textMuted }}>Publish immediately</p>
              </div>
            </div>
          </button>

          {/* Schedule card */}
          <button
            onClick={() => setPublishMode('schedule')}
            className="w-full text-left p-4 border-2 transition-colors"
            style={{
              borderColor: publishMode === 'schedule' ? buttonBg : borderColor,
              backgroundColor: publishMode === 'schedule' ? `${buttonBg}08` : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${buttonBg}10` }}>
                <svg className="w-5 h-5" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: textMain }}>Schedule</p>
                <p className="text-xs" style={{ color: textMuted }}>Pick a date and time</p>
              </div>
            </div>
          </button>

          {/* Schedule date/time fields */}
          {publishMode === 'schedule' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor, color: textMain }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: textMuted }}>Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
                  style={{ borderColor, color: textMain }}
                />
              </div>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handlePublish}
            disabled={publishMode === 'schedule' && !scheduleDate}
            className="w-full px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            {publishMode === 'now' ? 'Publish Now' : 'Schedule Post'}
          </button>
        </div>
      </CenterModal>
    </div>
  );
}
