'use client';

import { useState } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import type { FreelancerProfile as FreelancerProfileType, FreelancerReview } from '@/types/freelancer';

interface FreelancerProfileProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: FreelancerProfileType;
  colors: DashboardColors;
  onHire?: () => void;
}

// Demo reviews for the profile
const DEMO_REVIEWS: FreelancerReview[] = [
  { id: 'r1', order_id: 'o1', reviewer_id: 'u1', freelancer_id: '', gig_id: 'g1', rating: 5, review: 'Absolutely fantastic work! Delivered ahead of schedule and exceeded expectations. Will definitely hire again.', created_at: '2025-01-10' },
  { id: 'r2', order_id: 'o2', reviewer_id: 'u2', freelancer_id: '', gig_id: 'g1', rating: 5, review: 'Very professional and communicative throughout the entire project. Highly recommended!', created_at: '2024-12-20' },
  { id: 'r3', order_id: 'o3', reviewer_id: 'u3', freelancer_id: '', gig_id: 'g2', rating: 4, review: 'Great quality work. Minor delays but the end result was worth the wait.', created_at: '2024-11-15' },
  { id: 'r4', order_id: 'o4', reviewer_id: 'u4', freelancer_id: '', gig_id: 'g1', rating: 5, review: 'Top-notch service. Understood my requirements perfectly and delivered exactly what I needed.', created_at: '2024-10-25' },
];

// Demo portfolio items
const DEMO_PORTFOLIO = [
  { title: 'E-commerce Dashboard', image_url: '', description: 'Full-featured admin dashboard for online store' },
  { title: 'Brand Redesign', image_url: '', description: 'Complete visual identity overhaul' },
  { title: 'Mobile App', image_url: '', description: 'Cross-platform booking application' },
  { title: 'Marketing Campaign', image_url: '', description: 'Multi-channel digital campaign' },
  { title: 'Website Redesign', image_url: '', description: 'Modern responsive website' },
  { title: 'API Integration', image_url: '', description: 'Connected 5 business tools' },
];

const REVIEWER_NAMES = ['Jordan M.', 'Taylor S.', 'Casey P.', 'Morgan K.'];

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

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24" fill={star <= Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function FreelancerProfileModal({ isOpen, onClose, freelancer, colors, onHire }: FreelancerProfileProps) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');

  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);

  const portfolio = freelancer.portfolio.length > 0 ? freelancer.portfolio : DEMO_PORTFOLIO;

  // Generate portfolio placeholder colors
  const getPortfolioColor = (index: number) => {
    const palettes = ['from-indigo-400 to-indigo-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600', 'from-cyan-400 to-cyan-600', 'from-violet-400 to-violet-600'];
    return palettes[index % palettes.length];
  };

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-xl"
      configColors={colors}
    >
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-5">
        <FreelancerAvatar name={freelancer.display_name} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-lg font-bold" style={{ color: textMain }}>{freelancer.display_name}</h3>
            {freelancer.is_verified && (
              <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          </div>
          <p className="text-sm mb-1" style={{ color: textMuted }}>{freelancer.tagline}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={freelancer.rating_avg} />
            <span className="text-xs" style={{ color: textMuted }}>{freelancer.rating_avg} ({freelancer.rating_count})</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Completed', value: freelancer.total_orders.toString() },
          { label: 'Avg Rating', value: freelancer.rating_avg.toFixed(1) },
          { label: 'Response', value: `${freelancer.response_time_hours}h` },
          { label: 'Member Since', value: new Date(freelancer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
        ].map(stat => (
          <div key={stat.label} className="text-center px-2 py-3" style={{ backgroundColor: `${buttonColor}06`, border: `1px solid ${borderColor}` }}>
            <p className="text-base font-bold" style={{ color: textMain }}>{stat.value}</p>
            <p className="text-[10px] font-medium" style={{ color: textMuted }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bio */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: textMain }}>{freelancer.bio}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {freelancer.skills.map(skill => (
          <span key={skill} className="px-2.5 py-1 text-xs font-medium " style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
            {skill}
          </span>
        ))}
      </div>

      {/* Location & Languages */}
      <div className="flex items-center gap-4 mb-5 text-xs" style={{ color: textMuted }}>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {freelancer.location}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
          {freelancer.languages.join(', ')}
        </span>
      </div>

      {/* Tab switcher: Portfolio / Reviews */}
      <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor }}>
        {(['portfolio', 'reviews'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize"
            style={{
              borderColor: activeTab === tab ? buttonColor : 'transparent',
              color: activeTab === tab ? textMain : textMuted,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Portfolio tab */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {portfolio.map((item, i) => (
            <div key={i} className="group relative">
              <div className={`aspect-square bg-gradient-to-br ${getPortfolioColor(i)} flex items-center justify-center overflow-hidden`}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </div>
              <p className="text-xs font-medium mt-1 truncate" style={{ color: textMain }}>{item.title}</p>
              <p className="text-[10px] truncate" style={{ color: textMuted }}>{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-3 mb-5">
          {DEMO_REVIEWS.map((review, i) => (
            <div key={review.id} className="p-3" style={{ backgroundColor: `${buttonColor}04`, border: `1px solid ${borderColor}` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <FreelancerAvatar name={REVIEWER_NAMES[i]} size={24} />
                <span className="text-xs font-medium" style={{ color: textMain }}>{REVIEWER_NAMES[i]}</span>
                <StarRating rating={review.rating} size={10} />
                <span className="text-[10px] ml-auto" style={{ color: textMuted }}>
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: textMain }}>{review.review}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor }}>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm font-medium border transition-colors hover:bg-gray-50"
          style={{ borderColor, color: textMain }}
        >
          Close
        </button>
        {onHire && (
          <button
            onClick={onHire}
            className="flex-1 px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            Hire Me
          </button>
        )}
      </div>
    </CenterModal>
  );
}
