'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import BlogEditor from './BlogEditor';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

interface BlogListProps {
  colors: DashboardColors;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'published': return { bg: '#10B98120', color: '#10B981', label: 'Published' };
    case 'scheduled': return { bg: '#3B82F620', color: '#3B82F6', label: 'Scheduled' };
    default: return { bg: '#F59E0B20', color: '#F59E0B', label: 'Draft' };
  }
};

export default function BlogList({ colors }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/data/blog_posts');
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data || []);
      }
    } catch {
      // Keep empty — no fake data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSave = async (post: Partial<BlogPost>) => {
    if (editingPost) {
      // Update
      try {
        const res = await fetch('/api/data/blog_posts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPost.id, ...post }),
        });
        if (res.ok) {
          fetchPosts();
          toast.success('Post updated');
        } else {
          toast.error('Failed to update post');
        }
      } catch {
        toast.error('Failed to update post');
      }
    } else {
      // Create
      try {
        const res = await fetch('/api/data/blog_posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post),
        });
        if (res.ok) {
          fetchPosts();
          toast.success('Post created');
        } else {
          toast.error('Failed to create post');
        }
      } catch {
        toast.error('Failed to create post');
      }
    }
    setEditingPost(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/data/blog_posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        toast.success('Post deleted');
      } else {
        toast.error('Failed to delete post');
      }
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Editor view
  if (isCreating || editingPost) {
    return (
      <BlogEditor
        colors={colors}
        post={editingPost || undefined}
        onSave={handleSave}
        onCancel={() => { setEditingPost(null); setIsCreating(false); }}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: buttonBg, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'published', 'scheduled', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-xs font-medium transition-colors capitalize"
              style={{
                backgroundColor: filter === f ? buttonBg : 'transparent',
                color: filter === f ? buttonText : textMuted,
                border: filter === f ? 'none' : `1px solid ${borderColor}`,
              }}
            >
              {f} {f !== 'all' && `(${posts.filter(p => p.status === f).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: buttonBg, color: buttonText }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Post
        </button>
      </div>

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center" style={{ backgroundColor: cardBg }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke={textMuted} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
          <p className="text-sm font-medium mb-1" style={{ color: textMain }}>No blog posts yet</p>
          <p className="text-xs mb-6" style={{ color: textMuted }}>Create your first post to start sharing content with your audience.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto opacity-50">
            <div className="p-3 text-left" style={{ backgroundColor: `${buttonBg}05`, border: `1px dashed ${borderColor}` }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: textMuted }}>Example</p>
              <p className="text-xs font-semibold" style={{ color: textMain }}>Welcome to Our Blog</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: textMuted }}>Share updates, tips, and insights with your audience.</p>
            </div>
            <div className="p-3 text-left" style={{ backgroundColor: `${buttonBg}05`, border: `1px dashed ${borderColor}` }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: textMuted }}>Example</p>
              <p className="text-xs font-semibold" style={{ color: textMain }}>5 Tips for Getting Started</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: textMuted }}>Help your clients make the most of your services.</p>
            </div>
            <div className="p-3 text-left" style={{ backgroundColor: `${buttonBg}05`, border: `1px dashed ${borderColor}` }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: textMuted }}>Example</p>
              <p className="text-xs font-semibold" style={{ color: textMain }}>Spring Specials Are Here!</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: textMuted }}>Announce seasonal promotions and new services.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map(post => {
            const statusStyle = getStatusStyle(post.status);
            return (
              <div
                key={post.id}
                className="overflow-hidden shadow-sm group cursor-pointer transition-shadow hover:shadow-md"
                style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                onClick={() => setEditingPost(post)}
              >
                {/* Cover image or gradient placeholder */}
                <div className="h-32 relative" style={{ background: post.cover_image ? `url(${post.cover_image}) center/cover` : `linear-gradient(135deg, ${buttonBg}15, ${buttonBg}05)` }}>
                  <div className="absolute top-3 right-3">
                    <span
                      className="px-2.5 py-1 text-xs font-medium"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: textMain }}>{post.title}</h3>
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: textMuted }}>{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: textMuted }}>
                        {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                      </span>
                      {post.status === 'scheduled' && post.scheduled_at && (
                        <span className="text-xs" style={{ color: '#3B82F6' }}>
                          {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs"
                          style={{ backgroundColor: `${buttonBg}08`, color: textMuted }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover actions */}
                <div
                  className="px-4 py-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ borderTop: `1px solid ${borderColor}` }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                    className="p-1.5 hover:opacity-70"
                    style={{ color: '#EF4444' }}
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
