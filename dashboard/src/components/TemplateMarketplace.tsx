'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from 'sonner';

interface Template {
  id: string;
  author_name: string;
  name: string;
  description: string;
  business_type: string;
  category: string;
  colors: Record<string, string>;
  tabs: { label: string; icon?: string }[];
  is_featured: boolean;
  clone_count: number;
  rating_avg: number;
  rating_count: number;
  tags: string[];
  created_at: string;
}

interface TemplateMarketplaceProps {
  colors: DashboardColors;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'beauty', label: 'Beauty & Salon' },
  { id: 'food', label: 'Food & Hospitality' },
  { id: 'professional', label: 'Professional Services' },
  { id: 'fitness', label: 'Fitness & Sports' },
  { id: 'education', label: 'Education' },
  { id: 'home', label: 'Home Services' },
  { id: 'creative', label: 'Creative & Media' },
  { id: 'retail', label: 'Retail & Commerce' },
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'rating', label: 'Top Rated' },
];

const DEMO_TEMPLATES: Template[] = [
  {
    id: 't1', author_name: 'Red Pine Team', name: 'Modern Nail Salon', description: 'Complete nail salon management with booking, client tracking, and product inventory.',
    business_type: 'nail_salon', category: 'beauty', colors: { sidebar_bg: '#1A1A1A', buttons: '#E91E63', cards: '#FFFFFF', background: '#F5F5F5' },
    tabs: [{ label: 'Clients' }, { label: 'Schedule' }, { label: 'Products' }, { label: 'Invoices' }],
    is_featured: true, clone_count: 342, rating_avg: 4.8, rating_count: 67, tags: ['nail salon', 'beauty', 'appointments'], created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 't2', author_name: 'Red Pine Team', name: 'Dental Practice Pro', description: 'Patient management, treatment plans, insurance tracking, and appointment scheduling.',
    business_type: 'dental_clinic', category: 'health', colors: { sidebar_bg: '#0D47A1', buttons: '#1E88E5', cards: '#FFFFFF', background: '#F5F5F5' },
    tabs: [{ label: 'Patients' }, { label: 'Appointments' }, { label: 'Treatments' }, { label: 'Billing' }],
    is_featured: true, clone_count: 256, rating_avg: 4.7, rating_count: 43, tags: ['dental', 'healthcare', 'patients'], created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 't3', author_name: 'FitTrack Studios', name: 'CrossFit Box Manager', description: 'WOD scheduling, member progress tracking, class bookings, and equipment inventory.',
    business_type: 'crossfit_gym', category: 'fitness', colors: { sidebar_bg: '#212121', buttons: '#FF5722', cards: '#FFFFFF', background: '#FAFAFA' },
    tabs: [{ label: 'Members' }, { label: 'Classes' }, { label: 'WODs' }, { label: 'Equipment' }],
    is_featured: true, clone_count: 189, rating_avg: 4.9, rating_count: 31, tags: ['crossfit', 'gym', 'fitness'], created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 't4', author_name: 'EduPlatform', name: 'Tutoring Center', description: 'Student enrollment, lesson scheduling, progress reports, and parent communication.',
    business_type: 'tutoring', category: 'education', colors: { sidebar_bg: '#1B5E20', buttons: '#43A047', cards: '#FFFFFF', background: '#F5F5F5' },
    tabs: [{ label: 'Students' }, { label: 'Lessons' }, { label: 'Reports' }, { label: 'Parents' }],
    is_featured: false, clone_count: 124, rating_avg: 4.5, rating_count: 22, tags: ['tutoring', 'education', 'students'], created_at: '2026-01-25T00:00:00Z',
  },
  {
    id: 't5', author_name: 'GourmetOps', name: 'Restaurant & Bar', description: 'Table management, online ordering, kitchen operations, and delivery tracking.',
    business_type: 'restaurant', category: 'food', colors: { sidebar_bg: '#BF360C', buttons: '#E64A19', cards: '#FFFFFF', background: '#FBE9E7' },
    tabs: [{ label: 'Orders' }, { label: 'Menu' }, { label: 'Tables' }, { label: 'Kitchen' }, { label: 'Delivery' }],
    is_featured: false, clone_count: 298, rating_avg: 4.6, rating_count: 55, tags: ['restaurant', 'food', 'ordering'], created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 't6', author_name: 'CleanPro', name: 'Cleaning Service', description: 'Job scheduling, team assignment, client properties, estimates and invoicing.',
    business_type: 'cleaning_service', category: 'home', colors: { sidebar_bg: '#004D40', buttons: '#00897B', cards: '#FFFFFF', background: '#F5F5F5' },
    tabs: [{ label: 'Jobs' }, { label: 'Clients' }, { label: 'Teams' }, { label: 'Estimates' }],
    is_featured: false, clone_count: 87, rating_avg: 4.3, rating_count: 15, tags: ['cleaning', 'home services', 'scheduling'], created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 't7', author_name: 'LegalFlow', name: 'Law Firm Starter', description: 'Case management, client intake, document tracking, billing, and court dates.',
    business_type: 'law_firm', category: 'professional', colors: { sidebar_bg: '#1A237E', buttons: '#3949AB', cards: '#FFFFFF', background: '#F5F5F5' },
    tabs: [{ label: 'Cases' }, { label: 'Clients' }, { label: 'Documents' }, { label: 'Billing' }, { label: 'Calendar' }],
    is_featured: false, clone_count: 156, rating_avg: 4.4, rating_count: 28, tags: ['law firm', 'legal', 'cases'], created_at: '2026-01-18T00:00:00Z',
  },
  {
    id: 't8', author_name: 'StudioCreative', name: 'Photography Studio', description: 'Client galleries, shoot scheduling, package pricing, contracts, and invoices.',
    business_type: 'photography', category: 'creative', colors: { sidebar_bg: '#263238', buttons: '#546E7A', cards: '#FFFFFF', background: '#ECEFF1' },
    tabs: [{ label: 'Shoots' }, { label: 'Clients' }, { label: 'Galleries' }, { label: 'Contracts' }, { label: 'Invoices' }],
    is_featured: false, clone_count: 95, rating_avg: 4.6, rating_count: 19, tags: ['photography', 'creative', 'bookings'], created_at: '2026-01-22T00:00:00Z',
  },
  {
    id: 't9', author_name: 'RetailHub', name: 'Boutique Shop', description: 'Inventory management, POS integration, customer loyalty, and supplier tracking.',
    business_type: 'retail_shop', category: 'retail', colors: { sidebar_bg: '#4A148C', buttons: '#7B1FA2', cards: '#FFFFFF', background: '#F3E5F5' },
    tabs: [{ label: 'Products' }, { label: 'Orders' }, { label: 'Customers' }, { label: 'Suppliers' }, { label: 'Analytics' }],
    is_featured: false, clone_count: 112, rating_avg: 4.2, rating_count: 20, tags: ['retail', 'inventory', 'POS'], created_at: '2026-01-28T00:00:00Z',
  },
];

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}>
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78L10 1z" />
        </svg>
      ))}
    </span>
  );
}

function ColorPreview({ colors }: { colors: Record<string, string> }) {
  const sidebarBg = colors.sidebar_bg || '#1A1A1A';
  const buttonColor = colors.buttons || '#3B82F6';
  const bgColor = colors.background || '#F5F5F5';
  const cardColor = colors.cards || '#FFFFFF';

  return (
    <div className="flex gap-1 mt-2">
      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: sidebarBg }} title="Sidebar" />
      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: buttonColor }} title="Buttons" />
      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: bgColor }} title="Background" />
      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: cardColor }} title="Cards" />
    </div>
  );
}

export default function TemplateMarketplace({ colors }: TemplateMarketplaceProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  const buttonBg = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);
  const cardBg = colors.cards || '#FFFFFF';
  const textColor = colors.text || '#6B7280';
  const headingColor = colors.headings || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';
  const bgColor = colors.background || '#F5F5F5';

  const fetchTemplates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sort', sortBy);

      const res = await fetch(`/api/marketplace?${params}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTemplates(json.data);
          setIsDemoMode(false);
          return;
        }
      }
    } catch { /* ignore */ }
    // Fallback to demo
    let filtered = [...DEMO_TEMPLATES];
    if (selectedCategory !== 'all') filtered = filtered.filter(t => t.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.business_type.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'popular') filtered.sort((a, b) => b.clone_count - a.clone_count);
    else if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating_avg - a.rating_avg);
    setTemplates(filtered);
    setIsDemoMode(true);
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleClone = async (template: Template) => {
    setIsCloning(true);
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1000));
      toast.success(`"${template.name}" template cloned! Configure it in your dashboard.`);
      setIsCloning(false);
      setSelectedTemplate(null);
      return;
    }
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clone', template_id: template.id }),
      });
      if (res.ok) {
        toast.success(`"${template.name}" template cloned!`);
      } else {
        toast.error('Failed to clone template');
      }
    } catch {
      toast.error('Failed to clone template');
    }
    setIsCloning(false);
    setSelectedTemplate(null);
  };

  const featuredTemplates = templates.filter(t => t.is_featured);
  const regularTemplates = templates.filter(t => !t.is_featured);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: headingColor }}>Template Marketplace</h2>
        <p className="text-sm mt-1" style={{ color: textColor }}>Browse and clone pre-built dashboard configurations for your business</p>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={textColor} strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
          style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, color: headingColor }}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              backgroundColor: selectedCategory === cat.id ? buttonBg : 'transparent',
              color: selectedCategory === cat.id ? buttonText : textColor,
              border: `1px solid ${selectedCategory === cat.id ? buttonBg : borderColor}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured section */}
      {featuredTemplates.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: textColor }}>Featured Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="text-left rounded-2xl p-5 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: cardBg,
                  border: `2px solid ${buttonBg}30`,
                }}
              >
                {/* Mini dashboard preview */}
                <div className="rounded-lg overflow-hidden mb-3 h-20" style={{ backgroundColor: bgColor }}>
                  <div className="flex h-full">
                    <div className="w-8" style={{ backgroundColor: template.colors.sidebar_bg || '#1A1A1A' }} />
                    <div className="flex-1 p-1.5">
                      <div className="h-2 w-16 rounded-full mb-1" style={{ backgroundColor: template.colors.buttons || '#3B82F6', opacity: 0.4 }} />
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-4 rounded" style={{ backgroundColor: template.colors.cards || '#FFF', border: `1px solid ${borderColor}` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-bold" style={{ color: headingColor }}>{template.name}</p>
                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${buttonBg}15`, color: buttonBg }}>
                    Featured
                  </span>
                </div>
                <p className="text-xs line-clamp-2 mb-2" style={{ color: textColor }}>{template.description}</p>
                <div className="flex items-center gap-3">
                  <StarRating rating={template.rating_avg} />
                  <span className="text-xs" style={{ color: textColor }}>{template.clone_count} clones</span>
                </div>
                <ColorPreview colors={template.colors} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All templates grid */}
      <div>
        {(featuredTemplates.length > 0 && selectedCategory === 'all' && !searchQuery) && (
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: textColor }}>All Templates</h3>
        )}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: textColor }}>No templates found. Try a different search or category.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(searchQuery || selectedCategory !== 'all' ? templates : regularTemplates).map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="text-left rounded-xl p-4 transition-shadow hover:shadow-md"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: headingColor }}>{template.name}</p>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ backgroundColor: `${borderColor}80`, color: textColor }}>
                  {template.business_type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs line-clamp-2 mb-2" style={{ color: textColor }}>{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={template.rating_avg} size={10} />
                  <span className="text-xs" style={{ color: textColor }}>({template.rating_count})</span>
                </div>
                <span className="text-xs" style={{ color: textColor }}>{template.clone_count} clones</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <ColorPreview colors={template.colors} />
                <span className="text-xs ml-auto" style={{ color: textColor }}>by {template.author_name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Template detail modal */}
      {selectedTemplate && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSelectedTemplate(null)} />
          <div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: cardBg }}
          >
            {/* Preview banner */}
            <div className="h-28 relative" style={{ backgroundColor: bgColor }}>
              <div className="flex h-full">
                <div className="w-14" style={{ backgroundColor: selectedTemplate.colors.sidebar_bg || '#1A1A1A' }}>
                  <div className="p-2 space-y-2 pt-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#ffffff30' }} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-3">
                  <div className="h-2.5 w-24 rounded-full mb-2" style={{ backgroundColor: selectedTemplate.colors.buttons || '#3B82F6', opacity: 0.5 }} />
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 rounded-lg" style={{ backgroundColor: selectedTemplate.colors.cards || '#FFF', border: `1px solid ${borderColor}` }} />
                    ))}
                  </div>
                  <div className="mt-2 h-10 rounded-lg" style={{ backgroundColor: selectedTemplate.colors.cards || '#FFF', border: `1px solid ${borderColor}` }} />
                </div>
              </div>
              {selectedTemplate.is_featured && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: buttonBg, color: buttonText }}>
                  Featured
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold" style={{ color: headingColor }}>{selectedTemplate.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: textColor }}>
                by {selectedTemplate.author_name} · {selectedTemplate.business_type.replace(/_/g, ' ')}
              </p>
              <p className="text-sm mt-3" style={{ color: headingColor }}>{selectedTemplate.description}</p>

              {/* Stats */}
              <div className="flex gap-4 mt-4">
                <div>
                  <StarRating rating={selectedTemplate.rating_avg} />
                  <p className="text-xs mt-0.5" style={{ color: textColor }}>{selectedTemplate.rating_avg} ({selectedTemplate.rating_count} reviews)</p>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: headingColor }}>{selectedTemplate.clone_count}</p>
                  <p className="text-xs" style={{ color: textColor }}>clones</p>
                </div>
              </div>

              {/* Tabs preview */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: textColor }}>Included Tabs</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTemplate.tabs.map((tab, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${buttonBg}10`, color: headingColor, border: `1px solid ${borderColor}` }}>
                      {tab.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedTemplate.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedTemplate.tags.map(tag => (
                    <span key={tag} className="text-xs" style={{ color: textColor }}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Color palette */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: textColor }}>Color Palette</p>
                <ColorPreview colors={selectedTemplate.colors} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: `1px solid ${borderColor}`, color: textColor }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClone(selectedTemplate)}
                  disabled={isCloning}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: buttonBg, color: buttonText }}
                >
                  {isCloning ? 'Cloning...' : 'Use This Template'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Demo banner */}
      {isDemoMode && (
        <div className="mt-6 text-center py-3 rounded-xl" style={{ backgroundColor: `${buttonBg}05`, border: `1px solid ${borderColor}` }}>
          <p className="text-xs" style={{ color: textColor }}>Showing demo templates — sign in to browse the full marketplace</p>
        </div>
      )}
    </div>
  );
}
