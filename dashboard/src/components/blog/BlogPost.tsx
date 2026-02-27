'use client';

import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  tags: string[];
  author_name: string;
  published_at?: string;
}

interface BlogPostProps {
  post: BlogPostData;
  colors: DashboardColors;
  businessName?: string;
}

export default function BlogPost({ post, colors, businessName }: BlogPostProps) {
  const buttonBg = colors.buttons || '#1A1A1A';
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        {post.cover_image && (
          <div className="overflow-hidden mb-6 aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex gap-2 mb-3">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: `${buttonBg}10`, color: buttonBg }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: textMain }}>
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm" style={{ color: textMuted }}>
          <span>{post.author_name || businessName || 'Staff'}</span>
          {post.published_at && (
            <>
              <span>·</span>
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div
        className="p-6 md:p-8 shadow-sm prose prose-sm max-w-none"
        style={{
          backgroundColor: cardBg,
          color: textMain,
          border: `1px solid ${borderColor}`,
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <footer className="mt-8 pt-6" style={{ borderTop: `1px solid ${borderColor}` }}>
        <p className="text-xs text-center" style={{ color: textMuted, fontFamily: 'var(--font-fira-code), monospace' }}>
          Powered by <span className="font-semibold text-red-600">Red Pine</span>
        </p>
      </footer>
    </article>
  );
}
