'use client';

import React from 'react';

interface BlogWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  columns?: number;
  accentColor?: string;
  viewportWidth?: number;
  sectionHeight?: number;
  [key: string]: unknown;
}

const DEMO_BLOG_POSTS = [
  { id: '1', title: 'Welcome to Our Blog', excerpt: 'We are excited to share updates, tips, and insights with you.', date: '2 days ago', tag: 'News' },
  { id: '2', title: '5 Tips for Getting Started', excerpt: 'Make the most of your experience with these helpful tips.', date: '1 week ago', tag: 'Tips' },
  { id: '3', title: 'What\'s New This Month', excerpt: 'Check out the latest updates and improvements we\'ve made.', date: '2 weeks ago', tag: 'Updates' },
];

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const BlogWidget: React.FC<BlogWidgetProps> = ({
  inBuilder,
  heading = 'Our Blog',
  columns = 3,
  accentColor = '#1A1A1A',
  viewportWidth,
  sectionHeight,
}) => {
  const isMobile = (viewportWidth || 1280) < 480;
  // Stack vertically when section is expanded tall (> 600px) or on mobile
  const shouldStack = isMobile || (sectionHeight != null && sectionHeight > 600);
  const cols = shouldStack ? 1 : columns;

  return (
    <div style={{ padding: '48px 32px', fontFamily: FONT_STACK }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 8, textAlign: 'center' }}>
        {heading}
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>
        Latest stories and updates
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
        {DEMO_BLOG_POSTS.map(post => (
          <div
            key={post.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              cursor: inBuilder ? 'default' : 'pointer',
            }}
          >
            <div style={{
              height: 140,
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={accentColor} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, backgroundColor: `${accentColor}10`, padding: '2px 8px' }}>
                  {post.tag}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{post.date}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, lineHeight: 1.3 }}>
                {post.title}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
