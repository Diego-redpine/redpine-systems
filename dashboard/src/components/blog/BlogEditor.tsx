'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  status: 'draft' | 'published';
  tags: string[];
  author_name: string;
  published_at?: string;
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
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [autoSlug, setAutoSlug] = useState(!post);

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
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

  const handleSubmit = () => {
    if (!title.trim()) return;
    const payload: Partial<BlogPost> = {
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt: excerpt.trim(),
      content,
      status,
      tags,
    };
    if (status === 'published' && !post?.published_at) {
      payload.published_at = new Date().toISOString();
    }
    onSave(payload);
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
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: buttonBg, color: buttonText }}
          >
            {post ? 'Update' : 'Create'} Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
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
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary that appears in blog listings and search results..."
              rows={2}
              className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor, color: textMain, backgroundColor: bgColor }}
            />
          </div>

          {/* Content editor */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: textMuted }}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here... (HTML supported)"
              rows={16}
              className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-opacity-20 font-mono"
              style={{ borderColor, color: textMain, backgroundColor: bgColor }}
            />
            <p className="text-xs mt-2" style={{ color: textMuted }}>Supports HTML formatting. A rich editor is coming soon.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status card */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-3" style={{ color: textMuted }}>Status</label>
            <div className="flex gap-2">
              {(['draft', 'published'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors"
                  style={{
                    backgroundColor: status === s ? (s === 'published' ? '#10B98120' : '#F59E0B20') : 'transparent',
                    color: status === s ? (s === 'published' ? '#10B981' : '#F59E0B') : textMuted,
                    border: `1px solid ${status === s ? (s === 'published' ? '#10B981' : '#F59E0B') : borderColor}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-3" style={{ color: textMuted }}>Tags</label>
            <div className="flex gap-1 flex-wrap mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
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
                className="flex-1 px-2 py-1.5 text-xs border rounded-lg"
                style={{ borderColor, color: textMain }}
              />
              <button
                onClick={addTag}
                className="px-2 py-1.5 text-xs rounded-lg"
                style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
              >
                Add
              </button>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-3" style={{ color: textMuted }}>Search Preview</label>
            <div className="rounded-lg p-3" style={{ backgroundColor: bgColor }}>
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
    </div>
  );
}
