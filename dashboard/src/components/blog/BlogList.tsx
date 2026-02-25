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
  status: 'draft' | 'published';
  tags: string[];
  author_name: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface BlogListProps {
  colors: DashboardColors;
}

const DEMO_POSTS: BlogPost[] = [
  {
    id: 'bp1',
    title: 'Welcome to Our Blog',
    slug: 'welcome-to-our-blog',
    excerpt: 'We are excited to launch our new blog where we will share updates, tips, and insights.',
    content: '<h2>Hello World!</h2><p>We are thrilled to announce the launch of our blog. Stay tuned for updates, tips, and insights from our team.</p><p>We will be covering topics like industry trends, how-to guides, and behind-the-scenes looks at our business.</p>',
    status: 'published',
    tags: ['announcement', 'news'],
    author_name: 'You',
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'bp2',
    title: '5 Tips for Getting the Most Out of Your Visit',
    slug: '5-tips-for-your-visit',
    excerpt: 'Make your next appointment even better with these simple preparation tips.',
    content: '<h2>Preparation is Key</h2><p>Before your appointment, here are five things you can do to ensure the best experience:</p><ol><li>Book in advance to secure your preferred time</li><li>Arrive 5 minutes early</li><li>Have your preferences ready</li><li>Ask questions — we love helping</li><li>Leave a review to help others find us</li></ol>',
    status: 'published',
    tags: ['tips', 'guide'],
    author_name: 'You',
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bp3',
    title: 'Spring Specials Are Here!',
    slug: 'spring-specials',
    excerpt: 'Check out our limited-time spring promotions and new services.',
    content: '<h2>Spring Into Something New</h2><p>We are excited to announce our spring specials! From now until the end of the season, enjoy exclusive offers on our most popular services.</p>',
    status: 'draft',
    tags: ['promotions', 'seasonal'],
    author_name: 'You',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function BlogList({ colors }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(DEMO_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/data/blog_posts');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setPosts(json.data);
        }
      }
    } catch {
      // Keep demo posts
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
        } else {
          // Demo mode fallback
          setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...post, updated_at: new Date().toISOString() } as BlogPost : p));
        }
      } catch {
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...post, updated_at: new Date().toISOString() } as BlogPost : p));
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
        } else {
          const newPost: BlogPost = {
            id: `bp_${Date.now()}`,
            title: post.title || 'Untitled',
            slug: post.slug || 'untitled',
            excerpt: post.excerpt || '',
            content: post.content || '',
            status: (post.status as 'draft' | 'published') || 'draft',
            tags: post.tags || [],
            author_name: 'You',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setPosts(prev => [newPost, ...prev]);
        }
      } catch {
        const newPost: BlogPost = {
          id: `bp_${Date.now()}`,
          title: post.title || 'Untitled',
          slug: post.slug || 'untitled',
          excerpt: post.excerpt || '',
          content: post.content || '',
          status: (post.status as 'draft' | 'published') || 'draft',
          tags: post.tags || [],
          author_name: 'You',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setPosts(prev => [newPost, ...prev]);
      }
    }
    setEditingPost(null);
    setIsCreating(false);
    toast.success(editingPost ? 'Post updated' : 'Post created');
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/data/blog_posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Fallback
    }
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Post deleted');
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize"
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
          className="px-4 py-2 text-sm font-medium rounded-xl transition-opacity hover:opacity-90 flex items-center gap-2"
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
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: cardBg }}>
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke={textMuted} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
          <p className="text-sm font-medium mb-1" style={{ color: textMain }}>No blog posts yet</p>
          <p className="text-xs" style={{ color: textMuted }}>Create your first post to start sharing content with your audience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden shadow-sm group cursor-pointer transition-shadow hover:shadow-md"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
              onClick={() => setEditingPost(post)}
            >
              {/* Cover image or gradient placeholder */}
              <div className="h-32 relative" style={{ background: post.cover_image ? `url(${post.cover_image}) center/cover` : `linear-gradient(135deg, ${buttonBg}15, ${buttonBg}05)` }}>
                <div className="absolute top-3 right-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: post.status === 'published' ? '#10B98120' : '#F59E0B20',
                      color: post.status === 'published' ? '#10B981' : '#F59E0B',
                    }}
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: textMain }}>{post.title}</h3>
                <p className="text-xs line-clamp-2 mb-3" style={{ color: textMuted }}>{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: textMuted }}>
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </span>
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs"
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
                  className="p-1.5 rounded-lg hover:opacity-70"
                  style={{ color: '#EF4444' }}
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
