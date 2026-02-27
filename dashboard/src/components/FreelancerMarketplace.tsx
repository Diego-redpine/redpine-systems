'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { Gig, FreelancerProfile, PricingTier } from '@/types/freelancer';
import OrderFlowModal from './marketplace/OrderFlowModal';
import FreelancerProfileModal from './marketplace/FreelancerProfile';

interface FreelancerMarketplaceProps {
  colors: DashboardColors;
}

// Demo freelancer profiles
const DEMO_FREELANCERS: FreelancerProfile[] = [
  {
    id: 'f1', user_id: '', display_name: 'Alex Rivera', tagline: 'Full-stack developer & automation expert',
    bio: 'I build custom integrations, automations, and web applications for small businesses. 5+ years of experience with modern tech stacks.',
    avatar_url: '', hourly_rate_cents: 7500, category: 'development', skills: ['React', 'Node.js', 'API Integration', 'Automation'],
    portfolio: [], location: 'Austin, TX', languages: ['English', 'Spanish'], response_time_hours: 2,
    rating_avg: 4.9, rating_count: 127, total_orders: 203, total_earnings_cents: 0,
    is_verified: true, is_featured: true, is_active: true, created_at: '2024-06-01', updated_at: '2025-01-01',
  },
  {
    id: 'f2', user_id: '', display_name: 'Sarah Chen', tagline: 'Brand designer & visual identity specialist',
    bio: 'I create beautiful brand identities, logos, and marketing materials that help businesses stand out.',
    avatar_url: '', hourly_rate_cents: 6000, category: 'design', skills: ['Logo Design', 'Brand Identity', 'Figma', 'Illustration'],
    portfolio: [], location: 'San Francisco, CA', languages: ['English', 'Mandarin'], response_time_hours: 4,
    rating_avg: 4.8, rating_count: 94, total_orders: 156, total_earnings_cents: 0,
    is_verified: true, is_featured: true, is_active: true, created_at: '2024-07-15', updated_at: '2025-01-01',
  },
  {
    id: 'f3', user_id: '', display_name: 'Marcus Johnson', tagline: 'Digital marketing & SEO strategist',
    bio: 'I help small businesses grow their online presence through SEO, paid ads, and social media strategy.',
    avatar_url: '', hourly_rate_cents: 5500, category: 'marketing', skills: ['SEO', 'Google Ads', 'Social Media', 'Content Strategy'],
    portfolio: [], location: 'Chicago, IL', languages: ['English'], response_time_hours: 3,
    rating_avg: 4.7, rating_count: 68, total_orders: 112, total_earnings_cents: 0,
    is_verified: true, is_featured: false, is_active: true, created_at: '2024-08-01', updated_at: '2025-01-01',
  },
  {
    id: 'f4', user_id: '', display_name: 'Emma Williams', tagline: 'Professional copywriter & content creator',
    bio: 'Website copy, blog posts, email sequences, and social media content that converts. SEO-optimized writing for every platform.',
    avatar_url: '', hourly_rate_cents: 4500, category: 'writing', skills: ['Copywriting', 'Blog Writing', 'Email Marketing', 'SEO Content'],
    portfolio: [], location: 'Portland, OR', languages: ['English'], response_time_hours: 6,
    rating_avg: 4.8, rating_count: 82, total_orders: 134, total_earnings_cents: 0,
    is_verified: true, is_featured: false, is_active: true, created_at: '2024-09-01', updated_at: '2025-01-01',
  },
  {
    id: 'f5', user_id: '', display_name: 'David Park', tagline: 'Video editor & motion graphics designer',
    bio: 'Professional video editing for social media, ads, and promotional content. After Effects, Premiere Pro, DaVinci Resolve.',
    avatar_url: '', hourly_rate_cents: 5000, category: 'video', skills: ['Video Editing', 'Motion Graphics', 'Color Grading', 'Social Reels'],
    portfolio: [], location: 'Los Angeles, CA', languages: ['English', 'Korean'], response_time_hours: 8,
    rating_avg: 4.6, rating_count: 53, total_orders: 87, total_earnings_cents: 0,
    is_verified: false, is_featured: false, is_active: true, created_at: '2024-10-01', updated_at: '2025-01-01',
  },
  {
    id: 'f6', user_id: '', display_name: 'Lisa Thompson', tagline: 'Business consultant & operations optimizer',
    bio: 'I help small businesses streamline operations, improve workflows, and scale efficiently. 10+ years in business consulting.',
    avatar_url: '', hourly_rate_cents: 9000, category: 'business', skills: ['Strategy', 'Operations', 'Process Optimization', 'Financial Planning'],
    portfolio: [], location: 'New York, NY', languages: ['English'], response_time_hours: 12,
    rating_avg: 4.9, rating_count: 41, total_orders: 68, total_earnings_cents: 0,
    is_verified: true, is_featured: true, is_active: true, created_at: '2024-05-01', updated_at: '2025-01-01',
  },
  {
    id: 'f7', user_id: '', display_name: 'Carlos Mendez', tagline: 'Mobile app developer & UI designer',
    bio: 'I build beautiful, functional mobile apps for iOS and Android. React Native and Flutter specialist.',
    avatar_url: '', hourly_rate_cents: 8000, category: 'development', skills: ['React Native', 'Flutter', 'iOS', 'Android'],
    portfolio: [], location: 'Miami, FL', languages: ['English', 'Spanish'], response_time_hours: 4,
    rating_avg: 4.7, rating_count: 62, total_orders: 95, total_earnings_cents: 0,
    is_verified: true, is_featured: false, is_active: true, created_at: '2024-08-15', updated_at: '2025-01-01',
  },
  {
    id: 'f8', user_id: '', display_name: 'Nina Patel', tagline: 'Social media manager & community builder',
    bio: 'Full-service social media management — content creation, scheduling, engagement, and growth strategy for Instagram, TikTok, and LinkedIn.',
    avatar_url: '', hourly_rate_cents: 4000, category: 'marketing', skills: ['Instagram', 'TikTok', 'LinkedIn', 'Community Management'],
    portfolio: [], location: 'Denver, CO', languages: ['English', 'Hindi'], response_time_hours: 2,
    rating_avg: 4.5, rating_count: 48, total_orders: 76, total_earnings_cents: 0,
    is_verified: false, is_featured: false, is_active: true, created_at: '2024-11-01', updated_at: '2025-01-01',
  },
];

// Demo gigs
const DEMO_GIGS: (Gig & { freelancer: FreelancerProfile })[] = [
  {
    id: 'g1', freelancer_id: 'f1', freelancer: DEMO_FREELANCERS[0],
    title: 'Build custom integrations for your business tools',
    description: 'I will connect your business tools (CRM, calendar, payments, email) with custom API integrations. Zapier-level automation without the monthly fee.',
    category: 'development', subcategory: 'integrations',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 15000, delivery_days: 5, description: '1 simple integration between 2 tools', revisions: 1, features: ['1 integration', 'Basic setup', 'Documentation'] },
      standard: { name: 'Standard', price_cents: 35000, delivery_days: 10, description: '3 integrations with error handling', revisions: 2, features: ['3 integrations', 'Error handling', 'Testing', 'Documentation'] },
      premium: { name: 'Premium', price_cents: 75000, delivery_days: 20, description: 'Full automation suite with monitoring', revisions: 3, features: ['Unlimited integrations', 'Monitoring dashboard', 'Priority support', '30-day warranty'] },
    },
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop', 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=340&fit=crop'], tags: ['api', 'automation', 'integration'], is_active: true,
    order_count: 89, rating_avg: 4.9, rating_count: 72, created_at: '2024-06-15', updated_at: '2025-01-01',
  },
  {
    id: 'g2', freelancer_id: 'f2', freelancer: DEMO_FREELANCERS[1],
    title: 'Design a professional brand identity for your business',
    description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines document.',
    category: 'design', subcategory: 'branding',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 20000, delivery_days: 7, description: 'Logo + color palette', revisions: 2, features: ['Logo design', 'Color palette', '2 concepts', 'PNG + SVG files'] },
      standard: { name: 'Standard', price_cents: 45000, delivery_days: 14, description: 'Full brand kit', revisions: 3, features: ['Logo + variations', 'Color palette', 'Typography', 'Brand guidelines PDF', 'Social media templates'] },
      premium: { name: 'Premium', price_cents: 80000, delivery_days: 21, description: 'Complete visual identity', revisions: 5, features: ['Everything in Standard', 'Business cards', 'Letterhead', 'Email signature', 'Presentation template', 'Print-ready files'] },
    },
    images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=340&fit=crop', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=340&fit=crop'], tags: ['branding', 'logo', 'identity'], is_active: true,
    order_count: 67, rating_avg: 4.8, rating_count: 54, created_at: '2024-07-20', updated_at: '2025-01-01',
  },
  {
    id: 'g3', freelancer_id: 'f3', freelancer: DEMO_FREELANCERS[2],
    title: 'SEO audit and optimization for your website',
    description: 'Comprehensive SEO audit with actionable recommendations. On-page optimization, keyword research, and competitor analysis.',
    category: 'marketing', subcategory: 'seo',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 10000, delivery_days: 3, description: 'SEO audit report', revisions: 1, features: ['Site audit report', 'Top 10 issues', 'Keyword suggestions'] },
      standard: { name: 'Standard', price_cents: 25000, delivery_days: 7, description: 'Audit + optimization', revisions: 2, features: ['Full audit', 'On-page optimization', 'Meta tags', 'Internal linking', 'Competitor analysis'] },
      premium: { name: 'Premium', price_cents: 50000, delivery_days: 14, description: 'Full SEO strategy', revisions: 3, features: ['Everything in Standard', 'Content strategy', 'Backlink plan', 'Monthly tracking setup', '30-day support'] },
    },
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop'], tags: ['seo', 'marketing', 'website'], is_active: true,
    order_count: 45, rating_avg: 4.7, rating_count: 38, created_at: '2024-08-10', updated_at: '2025-01-01',
  },
  {
    id: 'g4', freelancer_id: 'f4', freelancer: DEMO_FREELANCERS[3],
    title: 'Write converting website copy for your business',
    description: 'Compelling, SEO-friendly website copy that turns visitors into customers. Landing pages, about pages, service descriptions.',
    category: 'writing', subcategory: 'copywriting',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 8000, delivery_days: 3, description: '1 page of copy', revisions: 2, features: ['1 page (up to 500 words)', 'SEO optimization', '2 revisions'] },
      standard: { name: 'Standard', price_cents: 20000, delivery_days: 5, description: '5 pages of copy', revisions: 3, features: ['5 pages', 'SEO optimization', 'CTA optimization', 'Meta descriptions'] },
      premium: { name: 'Premium', price_cents: 40000, delivery_days: 10, description: 'Full website copy', revisions: 5, features: ['Up to 15 pages', 'SEO optimization', 'Brand voice guide', 'Email sequence (5 emails)', 'Ongoing support'] },
    },
    images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=340&fit=crop'], tags: ['copywriting', 'content', 'seo'], is_active: true,
    order_count: 56, rating_avg: 4.8, rating_count: 44, created_at: '2024-09-15', updated_at: '2025-01-01',
  },
  {
    id: 'g5', freelancer_id: 'f5', freelancer: DEMO_FREELANCERS[4],
    title: 'Create engaging social media video content',
    description: 'Professional video editing for Instagram Reels, TikTok, YouTube Shorts. Captions, transitions, music, and effects.',
    category: 'video', subcategory: 'social_media',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 5000, delivery_days: 2, description: '1 short-form video', revisions: 1, features: ['1 video (up to 60s)', 'Captions', 'Music', 'Basic effects'] },
      standard: { name: 'Standard', price_cents: 15000, delivery_days: 5, description: '5 short-form videos', revisions: 2, features: ['5 videos', 'Custom transitions', 'Color grading', 'Thumbnail'] },
      premium: { name: 'Premium', price_cents: 35000, delivery_days: 10, description: '10 videos + strategy', revisions: 3, features: ['10 videos', 'Content strategy', 'Brand consistency', 'Platform optimization', 'Monthly calendar'] },
    },
    images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=340&fit=crop'], tags: ['video', 'social media', 'reels'], is_active: true,
    order_count: 38, rating_avg: 4.6, rating_count: 31, created_at: '2024-10-10', updated_at: '2025-01-01',
  },
  {
    id: 'g6', freelancer_id: 'f6', freelancer: DEMO_FREELANCERS[5],
    title: 'Business strategy consultation and growth plan',
    description: 'One-on-one business consulting to identify growth opportunities, optimize operations, and create a clear action plan.',
    category: 'business', subcategory: 'consulting',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 25000, delivery_days: 3, description: '1-hour strategy call', revisions: 0, features: ['1-hour video call', 'Action item summary', 'Email follow-up'] },
      standard: { name: 'Standard', price_cents: 60000, delivery_days: 7, description: 'Full business audit', revisions: 1, features: ['3-hour deep dive', 'Business audit report', 'Growth strategy document', '2 follow-up calls'] },
      premium: { name: 'Premium', price_cents: 150000, delivery_days: 30, description: '30-day advisory', revisions: 0, features: ['Ongoing advisory (30 days)', 'Weekly calls', 'Slack access', 'Implementation support', 'KPI tracking setup'] },
    },
    images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=340&fit=crop'], tags: ['consulting', 'strategy', 'growth'], is_active: true,
    order_count: 28, rating_avg: 4.9, rating_count: 23, created_at: '2024-05-20', updated_at: '2025-01-01',
  },
  {
    id: 'g7', freelancer_id: 'f1', freelancer: DEMO_FREELANCERS[0],
    title: 'Build a custom dashboard or internal tool',
    description: 'Custom web application for your business — admin panels, dashboards, client portals, booking systems.',
    category: 'development', subcategory: 'web_apps',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 50000, delivery_days: 14, description: 'Simple dashboard', revisions: 2, features: ['1-page dashboard', 'Database setup', 'Authentication', 'Responsive design'] },
      standard: { name: 'Standard', price_cents: 120000, delivery_days: 30, description: 'Multi-page app', revisions: 3, features: ['Up to 5 pages', 'CRUD operations', 'User roles', 'API integration', 'Deployment'] },
      premium: { name: 'Premium', price_cents: 250000, delivery_days: 60, description: 'Full custom platform', revisions: 5, features: ['Unlimited pages', 'Complex workflows', 'Third-party integrations', 'Admin panel', '90-day support'] },
    },
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop'], tags: ['web app', 'dashboard', 'custom'], is_active: true,
    order_count: 34, rating_avg: 4.9, rating_count: 28, created_at: '2024-07-01', updated_at: '2025-01-01',
  },
  {
    id: 'g8', freelancer_id: 'f7', freelancer: DEMO_FREELANCERS[6],
    title: 'Build a mobile app for your business',
    description: 'Cross-platform mobile app for iOS and Android. Booking, e-commerce, client portals, and more.',
    category: 'development', subcategory: 'mobile',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 80000, delivery_days: 21, description: 'Simple mobile app', revisions: 2, features: ['3 screens', 'Basic navigation', 'API connection', 'App Store submission'] },
      standard: { name: 'Standard', price_cents: 180000, delivery_days: 45, description: 'Feature-rich app', revisions: 3, features: ['10 screens', 'Push notifications', 'User auth', 'Payment integration', 'Analytics'] },
      premium: { name: 'Premium', price_cents: 350000, delivery_days: 90, description: 'Enterprise app', revisions: 5, features: ['Unlimited screens', 'Offline mode', 'Admin dashboard', 'Custom animations', '6-month support'] },
    },
    images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=340&fit=crop'], tags: ['mobile', 'ios', 'android', 'app'], is_active: true,
    order_count: 22, rating_avg: 4.7, rating_count: 18, created_at: '2024-09-01', updated_at: '2025-01-01',
  },
  {
    id: 'g9', freelancer_id: 'f8', freelancer: DEMO_FREELANCERS[7],
    title: 'Manage your social media accounts for a month',
    description: 'Full social media management — content creation, scheduling, engagement, and growth reporting for Instagram, TikTok, or LinkedIn.',
    category: 'marketing', subcategory: 'social_media',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 30000, delivery_days: 30, description: '1 platform, 12 posts', revisions: 1, features: ['1 platform', '12 posts/month', 'Content calendar', 'Basic engagement'] },
      standard: { name: 'Standard', price_cents: 55000, delivery_days: 30, description: '2 platforms, 24 posts', revisions: 2, features: ['2 platforms', '24 posts/month', 'Stories/Reels', 'Engagement management', 'Monthly report'] },
      premium: { name: 'Premium', price_cents: 90000, delivery_days: 30, description: '3 platforms, 36 posts', revisions: 3, features: ['3 platforms', '36 posts/month', 'Paid ads management', 'Community building', 'Weekly strategy calls'] },
    },
    images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=340&fit=crop'], tags: ['social media', 'instagram', 'tiktok'], is_active: true,
    order_count: 31, rating_avg: 4.5, rating_count: 26, created_at: '2024-11-15', updated_at: '2025-01-01',
  },
  {
    id: 'g10', freelancer_id: 'f2', freelancer: DEMO_FREELANCERS[1],
    title: 'Design marketing materials and social graphics',
    description: 'Professional design for flyers, social media posts, menus, brochures, and promotional materials.',
    category: 'design', subcategory: 'graphics',
    pricing_tiers: {
      basic: { name: 'Basic', price_cents: 5000, delivery_days: 2, description: '3 social media graphics', revisions: 2, features: ['3 graphics', 'Custom design', 'Multiple sizes', 'Source files'] },
      standard: { name: 'Standard', price_cents: 12000, delivery_days: 4, description: '10 graphics + templates', revisions: 3, features: ['10 graphics', 'Editable templates', 'Brand consistency', 'Print-ready'] },
      premium: { name: 'Premium', price_cents: 25000, delivery_days: 7, description: 'Full marketing kit', revisions: 5, features: ['25 graphics', 'Brochure/flyer', 'Menu design', 'Social templates', 'Print coordination'] },
    },
    images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop'], tags: ['design', 'graphics', 'marketing'], is_active: true,
    order_count: 48, rating_avg: 4.8, rating_count: 39, created_at: '2024-08-01', updated_at: '2025-01-01',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  development: 'Development',
  design: 'Design',
  marketing: 'Marketing',
  writing: 'Writing',
  business: 'Business',
  video: 'Video',
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Best Match' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-0.5">({count})</span>
    </div>
  );
}

function FreelancerAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F97316', '#14B8A6'];
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: colors[colorIndex], fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function formatPrice(cents: number) {
  if (cents === 0) return 'Free';
  if (cents >= 100) return `$${(cents / 100).toLocaleString()}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export default function FreelancerMarketplace({ colors }: FreelancerMarketplaceProps) {
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const bgColor = colors.background || '#F5F5F5';

  const [gigs, setGigs] = useState<(Gig & { freelancer: FreelancerProfile })[]>([]);
  const [selectedGig, setSelectedGig] = useState<(Gig & { freelancer: FreelancerProfile }) | null>(null);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [orderFlowGig, setOrderFlowGig] = useState<{ gig: Gig & { freelancer: FreelancerProfile }; tier: 'basic' | 'standard' | 'premium' } | null>(null);
  const [profileFreelancer, setProfileFreelancer] = useState<FreelancerProfile | null>(null);
  const [gigImageIndex, setGigImageIndex] = useState(0);

  const fetchGigs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ sort });
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      const res = await fetch(`/api/freelancers?${params}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setGigs(json.data);
          setIsDemoMode(false);
          return;
        }
      }
    } catch { /* fall through */ }
    setGigs(DEMO_GIGS);
    setIsDemoMode(true);
  }, [category, search, sort]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const filteredGigs = gigs.filter(g => {
    if (category !== 'all' && g.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.tags.some(t => t.includes(q)) || g.freelancer?.display_name.toLowerCase().includes(q);
    }
    return true;
  });

  const featuredGigs = filteredGigs.filter(g => g.freelancer?.is_featured).slice(0, 3);
  const allGigs = filteredGigs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm" style={{ color: textMuted }}>
          Browse, hire, and pay freelancers directly within your platform.
        </p>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search freelancers and services..."
            className="w-full pl-10 pr-4 py-2.5 border text-sm"
            style={{ borderColor, color: textMain, backgroundColor: cardBg }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 border text-sm"
          style={{ borderColor, color: textMain, backgroundColor: cardBg }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className="px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              backgroundColor: category === key ? buttonColor : 'transparent',
              color: category === key ? buttonText : textMain,
              border: category === key ? 'none' : `1px solid ${borderColor}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="px-4 py-2.5 text-sm" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
          Showing sample freelancers. Real freelancers will appear when the marketplace is live.
        </div>
      )}

      {/* Featured Gigs */}
      {featuredGigs.length > 0 && !search && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: textMuted }}>FEATURED</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredGigs.map(gig => (
              <button
                key={gig.id}
                onClick={() => { setSelectedGig(gig); setSelectedTier('basic'); setGigImageIndex(0); }}
                className="text-left overflow-hidden transition-shadow hover:shadow-md"
                style={{ backgroundColor: cardBg, border: `2px solid ${buttonColor}30` }}
              >
                {gig.images[0] && (
                  <div className="w-full h-36 overflow-hidden">
                    <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <FreelancerAvatar name={gig.freelancer.display_name} size={44} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium" style={{ color: buttonColor }}>
                        {gig.freelancer.display_name}
                        {gig.freelancer.is_verified && (
                          <svg className="inline w-3.5 h-3.5 ml-1 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        )}
                      </p>
                      <StarRating rating={gig.rating_avg} count={gig.rating_count} />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: textMain }}>{gig.title}</h4>
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: textMuted }}>{gig.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: textMain }}>
                      From {formatPrice(gig.pricing_tiers.basic.price_cents)}
                    </span>
                    <span className="text-xs" style={{ color: textMuted }}>{gig.order_count} orders</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Gigs */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: textMuted }}>
          {search ? `RESULTS (${allGigs.length})` : 'ALL SERVICES'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allGigs.map(gig => (
            <button
              key={gig.id}
              onClick={() => { setSelectedGig(gig); setSelectedTier('basic'); setGigImageIndex(0); }}
              className="text-left overflow-hidden transition-shadow hover:shadow-md flex flex-col"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
            >
              {gig.images[0] ? (
                <div className="w-full h-32 overflow-hidden">
                  <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 flex items-center justify-center" style={{ backgroundColor: `${buttonColor}08` }}>
                  <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5zm14.25-14.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <FreelancerAvatar name={gig.freelancer.display_name} size={36} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: textMain }}>
                      {gig.freelancer.display_name}
                      {gig.freelancer.is_verified && (
                        <svg className="inline w-3 h-3 ml-1 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      )}
                    </p>
                    <StarRating rating={gig.rating_avg} count={gig.rating_count} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: textMain }}>{gig.title}</h4>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-bold" style={{ color: textMain }}>
                    From {formatPrice(gig.pricing_tiers.basic.price_cents)}
                  </span>
                  <span className="px-2 py-0.5 text-xs " style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
                    {CATEGORY_LABELS[gig.category] || gig.category}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {allGigs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: textMuted }}>No services found matching your search.</p>
        </div>
      )}

      {/* Order Flow Modal */}
      {orderFlowGig && (
        <OrderFlowModal
          gig={orderFlowGig.gig}
          tier={orderFlowGig.tier}
          colors={colors}
          onClose={() => setOrderFlowGig(null)}
          onOrderCreated={() => setOrderFlowGig(null)}
        />
      )}

      {/* Gig Detail Modal */}
      {selectedGig && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSelectedGig(null)} />
          <div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            style={{ backgroundColor: cardBg }}
          >
            {/* Photo gallery */}
            {selectedGig.images.length > 0 && (
              <div className="relative">
                <div className="w-full h-48 overflow-hidden">
                  <img src={selectedGig.images[gigImageIndex % selectedGig.images.length]} alt={selectedGig.title} className="w-full h-full object-cover" />
                </div>
                {selectedGig.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGigImageIndex(i => (i - 1 + selectedGig.images.length) % selectedGig.images.length); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setGigImageIndex(i => (i + 1) % selectedGig.images.length); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                    {/* Thumbnails */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {selectedGig.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setGigImageIndex(idx); }}
                          className="w-10 h-7 rounded overflow-hidden border-2 transition-opacity"
                          style={{
                            borderColor: idx === gigImageIndex % selectedGig.images.length ? '#fff' : 'transparent',
                            opacity: idx === gigImageIndex % selectedGig.images.length ? 1 : 0.6,
                          }}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Freelancer header */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4 mb-4">
                <button onClick={() => { setProfileFreelancer(selectedGig.freelancer); }} className="shrink-0">
                  <FreelancerAvatar name={selectedGig.freelancer.display_name} size={56} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProfileFreelancer(selectedGig.freelancer)}
                      className="text-base font-bold hover:underline"
                      style={{ color: textMain }}
                    >
                      {selectedGig.freelancer.display_name}
                    </button>
                    {selectedGig.freelancer.is_verified && (
                      <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: textMuted }}>{selectedGig.freelancer.tagline}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <StarRating rating={selectedGig.freelancer.rating_avg} count={selectedGig.freelancer.rating_count} />
                    <span className="text-xs" style={{ color: textMuted }}>{selectedGig.freelancer.total_orders} orders</span>
                    <span className="text-xs" style={{ color: textMuted }}>{selectedGig.freelancer.location}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedGig(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <h4 className="text-lg font-bold mb-2" style={{ color: textMain }}>{selectedGig.title}</h4>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <p className="text-sm mb-5 leading-relaxed" style={{ color: textMain }}>{selectedGig.description}</p>

              {/* Pricing tiers */}
              <div className="mb-5">
                <h5 className="text-xs font-semibold mb-3" style={{ color: textMuted }}>PRICING</h5>
                <div className="grid grid-cols-3 gap-3">
                  {(['basic', 'standard', 'premium'] as const).map(tier => {
                    const t = selectedGig.pricing_tiers[tier] as PricingTier;
                    const isSelected = selectedTier === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className="text-left p-4 transition-all"
                        style={{
                          backgroundColor: isSelected ? `${buttonColor}08` : bgColor,
                          border: isSelected ? `2px solid ${buttonColor}` : `1px solid ${borderColor}`,
                        }}
                      >
                        <p className="text-xs font-semibold uppercase mb-1" style={{ color: isSelected ? buttonColor : textMuted }}>
                          {t.name}
                        </p>
                        <p className="text-xl font-bold mb-1" style={{ color: textMain }}>
                          {formatPrice(t.price_cents)}
                        </p>
                        <p className="text-xs mb-2" style={{ color: textMuted }}>
                          {t.delivery_days} day delivery
                        </p>
                        <p className="text-xs mb-3" style={{ color: textMain }}>{t.description}</p>
                        <div className="space-y-1">
                          {t.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <svg className="w-3 h-3 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="text-xs" style={{ color: textMain }}>{f}</span>
                            </div>
                          ))}
                        </div>
                        {t.revisions > 0 && (
                          <p className="text-xs mt-2" style={{ color: textMuted }}>
                            {t.revisions} revision{t.revisions > 1 ? 's' : ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h5 className="text-xs font-semibold mb-2" style={{ color: textMuted }}>SKILLS</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGig.freelancer.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-0.5 text-xs " style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs" style={{ color: textMuted }}>Tags:</span>
                {selectedGig.tags.map(tag => (
                  <span key={tag} className="text-xs" style={{ color: textMuted }}>#{tag}</span>
                ))}
              </div>
            </div>

            {/* Action bar */}
            <div className="p-4 border-t flex items-center justify-between" style={{ borderColor }}>
              <div>
                <p className="text-xs" style={{ color: textMuted }}>Selected: {selectedGig.pricing_tiers[selectedTier].name}</p>
                <p className="text-xl font-bold" style={{ color: textMain }}>
                  {formatPrice(selectedGig.pricing_tiers[selectedTier].price_cents)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedGig(null)}
                  className="px-4 py-2.5 text-sm font-medium border"
                  style={{ borderColor, color: textMain }}
                >
                  Close
                </button>
                <button
                  onClick={() => { setOrderFlowGig({ gig: selectedGig, tier: selectedTier }); setSelectedGig(null); }}
                  className="px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: buttonColor, color: buttonText }}
                >
                  Hire Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Freelancer Profile Modal */}
      {profileFreelancer && (
        <FreelancerProfileModal
          isOpen={!!profileFreelancer}
          onClose={() => setProfileFreelancer(null)}
          freelancer={profileFreelancer}
          colors={colors}
          onHire={() => {
            setProfileFreelancer(null);
            // Find first gig by this freelancer
            const gig = gigs.find(g => g.freelancer_id === profileFreelancer.id);
            if (gig) {
              setSelectedGig(gig);
              setSelectedTier('basic');
              setGigImageIndex(0);
            }
          }}
        />
      )}
    </div>
  );
}
