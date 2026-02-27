'use client';

/**
 * Free-Form Sidebar Component
 * Canva-style collapsible icon-based navigation with expandable panels
 *
 * Ported from Red Pine Beats v2 → Red Pine OS
 * - Removed: Shapes tab, Drawing tools, Beat widgets, Login/Cart widgets
 * - Kept: Elements, Sections, Images, Templates, Text, Brand, Uploads, Projects
 * - Converted: JSX → TSX, dark accent #dc2626 → #3B82F6, Fira Code → Inter
 */

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import {
  Type,
  Heading,
  MousePointerClick,
  Minus,
  Square,
  ChevronLeft,
  FileText,
  Plus,
  Home,
  User,
  LayoutGrid,
  Search,
  Palette,
  FolderOpen,
  Grid3X3,
  Sparkles,
  X,
  ImageIcon,
  ClipboardList,
  FormInput,
  // Frame & Grid icons
  Circle,
  Hexagon,
  Triangle,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Frame,
  LayoutTemplate,
  // Text element icons
  Text,
  MessageSquareQuote,
  CaseSensitive,
  // Projects panel icons
  MoreVertical,
  Copy,
  Trash2,
  GripVertical,
  Settings,
  Globe,
  Link2,
  UserCircle,
  Mail,
  ExternalLink,
  Upload,
  Lock,
  // Widget icons
  Calendar,
  ShoppingBag,
  UtensilsCrossed,
  Ticket,
  Star,
  Send,
  ArrowUp,
  HelpCircle,
  Play,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BASE_ELEMENT_SIZES } from '@/hooks/useFreeFormEditor';
import { getTemplateKey } from '@/lib/onboarding/website-sections';
import BrandBoardEditor from '@/components/BrandBoardEditor';
import type { ColorItem } from '@/components/editors/ColorsEditor';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SectionItem {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface PortableWidgetItem {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface MediaItem {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface FrameItem {
  type: string;
  frameType: string;
  label: string;
  icon: LucideIcon;
}

interface FrameCategory {
  id: string;
  label: string;
  frames: FrameItem[];
}

interface TextItemData {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  size: 'large' | 'medium' | 'body' | 'small' | 'quote' | 'button';
}

interface FormItem {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface PageData {
  id: string;
  name: string;
  icon?: LucideIcon;
  isDefault?: boolean;
  isHomepage?: boolean;
}

interface PageTemplate {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  elements: Array<{ type: string; properties: Record<string, string> }>;
}


interface SiteSettingsData {
  siteName: string;
  siteDescription: string;
  favicon: string;
  socialImage: string;
  customDomain: string;
}

// ============================================
// CONSTANTS
// ============================================

// Sidebar navigation items
const NAV_ITEMS: NavItem[] = [
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'elements', label: 'Elements', icon: LayoutGrid },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'projects', label: 'Project', icon: FolderOpen },
];

// Section items for the new section-based architecture
const BLANK_SECTION_ITEM: SectionItem = { type: 'blank', label: 'Blank Section', icon: Square, description: 'Free-form canvas for custom layouts' };

const PREBUILT_SECTION_ITEMS: SectionItem[] = [
  { type: 'serviceWidget', label: 'Service Booking', icon: Calendar, description: 'Full service catalog with booking calendar' },
  { type: 'galleryWidget', label: 'Photo Gallery', icon: ImageIcon, description: 'Display your photo gallery' },
  { type: 'productWidget', label: 'Product Catalog', icon: ShoppingBag, description: 'Full product catalog with cart' },
  { type: 'menuWidget', label: 'Restaurant Menu', icon: UtensilsCrossed, description: 'Food menu with ordering & cart' },
  { type: 'eventsWidget', label: 'Events', icon: Ticket, description: 'Event listings with registration' },
  { type: 'classesWidget', label: 'Class Schedule', icon: ClipboardList, description: 'Weekly class schedule with enrollment' },
  { type: 'reviewCarousel', label: 'Reviews', icon: Star, description: 'Client testimonials carousel' },
  { type: 'blogWidget', label: 'Blog', icon: FileText, description: 'Blog posts feed section' },
  { type: 'faqWidget', label: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions' },
];

// Industry-specific section filtering — only show relevant prebuilt sections
const UNIVERSAL_SECTION_TYPES = ['galleryWidget', 'reviewCarousel', 'blogWidget', 'faqWidget'];

const INDUSTRY_SECTION_TYPES: Record<string, string[]> = {
  appointment_based: ['serviceWidget', ...UNIVERSAL_SECTION_TYPES],
  fitness: ['serviceWidget', 'classesWidget', 'eventsWidget', ...UNIVERSAL_SECTION_TYPES],
  retail: ['productWidget', 'menuWidget', ...UNIVERSAL_SECTION_TYPES],
  professional: ['serviceWidget', 'eventsWidget', ...UNIVERSAL_SECTION_TYPES],
  creative: ['serviceWidget', 'eventsWidget', ...UNIVERSAL_SECTION_TYPES],
  home_services: ['serviceWidget', ...UNIVERSAL_SECTION_TYPES],
};

function getIndustrySections(businessType?: string): string[] | null {
  if (!businessType) return null; // Show all when no business type
  const templateKey = getTemplateKey(businessType);
  return INDUSTRY_SECTION_TYPES[templateKey] || null;
}

const SECTION_ITEMS: SectionItem[] = [BLANK_SECTION_ITEM, ...PREBUILT_SECTION_ITEMS];

// Portable widgets that can be added to blank sections
// (customForm and button moved to Forms & Buttons category to avoid duplicates)
const PORTABLE_WIDGET_ITEMS: PortableWidgetItem[] = [];
// Media elements (image removed — now in Images category with frames)
const MEDIA_ITEMS: MediaItem[] = [
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal line' },
  { type: 'spacer', label: 'Spacer', icon: Square, description: 'Empty space' },
];

// Frame elements - shape masks for images
const FRAME_CATEGORIES: FrameCategory[] = [
  {
    id: 'basic',
    label: 'Basic Frames',
    frames: [
      { type: 'frame', frameType: 'circle', label: 'Circle', icon: Circle },
      { type: 'frame', frameType: 'square', label: 'Square', icon: Square },
      { type: 'frame', frameType: 'rounded', label: 'Rounded', icon: Square },
      { type: 'frame', frameType: 'oval', label: 'Oval', icon: Circle },
      { type: 'frame', frameType: 'triangle', label: 'Triangle', icon: Triangle },
      { type: 'frame', frameType: 'hexagon', label: 'Hexagon', icon: Hexagon },
    ],
  },
  {
    id: 'device',
    label: 'Device Frames',
    frames: [
      { type: 'frame', frameType: 'phone', label: 'Phone', icon: Smartphone },
      { type: 'frame', frameType: 'laptop', label: 'Laptop', icon: Laptop },
      { type: 'frame', frameType: 'tablet', label: 'Tablet', icon: Tablet },
      { type: 'frame', frameType: 'monitor', label: 'Monitor', icon: Monitor },
    ],
  },
  {
    id: 'photo',
    label: 'Photo Frames',
    frames: [
      { type: 'frame', frameType: 'polaroid', label: 'Polaroid', icon: Frame },
      { type: 'frame', frameType: 'filmstrip', label: 'Film Strip', icon: LayoutTemplate },
      { type: 'frame', frameType: 'vintage', label: 'Vintage', icon: ImageIcon },
    ],
  },
  {
    id: 'decorative',
    label: 'Decorative',
    frames: [
      { type: 'frame', frameType: 'blob', label: 'Blob', icon: Sparkles },
      { type: 'frame', frameType: 'torn', label: 'Torn Paper', icon: FileText },
    ],
  },
];


// Text elements (button moved to Forms & Buttons category)
const TEXT_ITEMS: TextItemData[] = [
  { type: 'heading', label: 'Add a heading', icon: Heading, description: 'Large title text', size: 'large' },
  { type: 'subheading', label: 'Add a subheading', icon: CaseSensitive, description: 'Medium subtitle text', size: 'medium' },
  { type: 'text', label: 'Add body text', icon: Type, description: 'Paragraph text', size: 'body' },
  { type: 'caption', label: 'Add a caption', icon: Text, description: 'Small caption text', size: 'small' },
  { type: 'quote', label: 'Add a quote', icon: MessageSquareQuote, description: 'Styled quotation', size: 'quote' },
];

// Form & Button elements
const FORM_ITEMS: FormItem[] = [
  { type: 'customForm', label: 'Custom Form', icon: FormInput, description: 'Start blank, add fields' },
  { type: 'button-rect', label: 'Button — Rectangle', icon: MousePointerClick, description: 'Sharp corners' },
  { type: 'button-rounded', label: 'Button — Rounded', icon: MousePointerClick, description: 'Soft corners' },
  { type: 'button-pill', label: 'Button — Pill', icon: MousePointerClick, description: 'Fully rounded' },
  { type: 'button-circle', label: 'Button — Circle', icon: MousePointerClick, description: 'Icon button' },
];

// Default pages
const DEFAULT_PAGES: PageData[] = [
  { id: 'home', name: 'Home', icon: Home, isDefault: true },
];

// Page templates for creating new pages
const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Page',
    icon: FileText,
    description: 'Start with an empty canvas',
    elements: [],
  },
  {
    id: 'about',
    name: 'About',
    icon: UserCircle,
    description: 'Image + text layout',
    elements: [
      { type: 'heading', properties: { content: 'About Us' } },
      { type: 'image', properties: {} },
      { type: 'text', properties: { content: 'Tell your story here...' } },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    icon: LayoutGrid,
    description: 'Showcase your services',
    elements: [
      { type: 'heading', properties: { content: 'Our Services' } },
      { type: 'text', properties: { content: 'Describe what you offer...' } },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: Mail,
    description: 'With contact form',
    elements: [
      { type: 'heading', properties: { content: 'Get In Touch' } },
      { type: 'customForm', properties: {} },
    ],
  },
  {
    id: 'links',
    name: 'Links Page',
    icon: ExternalLink,
    description: 'Social links style',
    elements: [
      { type: 'heading', properties: { content: 'My Links' } },
      { type: 'button', properties: { content: 'Instagram' } },
      { type: 'button', properties: { content: 'Facebook' } },
      { type: 'button', properties: { content: 'LinkedIn' } },
    ],
  },
];

// Brand color slot configuration

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Search Input Component
 */
interface SearchInputProps {
  placeholder: string;
  theme: string;
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({ placeholder, theme, value, onChange }: SearchInputProps) {
  const isDark = theme === 'dark';

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
        isDark ? 'text-zinc-500' : 'text-zinc-400'
      }`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 text-sm font-['Fira_Code'] transition-colors ${
          isDark
            ? 'bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:border-zinc-600'
            : 'bg-white text-zinc-900 placeholder-zinc-400 border border-zinc-200 focus:border-zinc-300'
        } focus:outline-none`}
      />
    </div>
  );
}

/**
 * Category Header
 */
interface CategoryHeaderProps {
  label: string;
  theme: string;
  collapsed: boolean;
  onToggle: () => void;
}

function CategoryHeader({ label, theme, collapsed, onToggle }: CategoryHeaderProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2 py-1 ${
        isDark ? 'text-zinc-500 hover:text-zinc-400' : 'text-zinc-500 hover:text-zinc-600'
      } transition-colors`}
    >
      <span>{label}</span>
      <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`} />
    </button>
  );
}

/**
 * Draggable Element Item
 */
interface ElementItemProps {
  item: { type: string; label: string; icon: LucideIcon; description: string };
  theme: string;
  onClick: (type: string) => void;
  onDragStart?: (type: string) => void;
  compact?: boolean;
}

function ElementItem({ item, theme, onClick, onDragStart, compact = false }: ElementItemProps) {
  const Icon = item.icon;
  const isDark = theme === 'dark';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', item.type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(item.type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(item.type)}
      className={`
        flex items-center gap-3 px-3 py-2.5 cursor-grab
        border transition-all duration-150 group
        active:cursor-grabbing active:scale-[0.98]
        ${isDark
          ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
          : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
        }
      `}
    >
      <div className={`p-2 transition-colors flex-shrink-0 ${
        isDark
          ? 'bg-zinc-900 group-hover:bg-zinc-700'
          : 'bg-zinc-100 group-hover:bg-zinc-200'
      }`}>
        <Icon className={`w-4 h-4 ${
          isDark
            ? 'text-zinc-400 group-hover:text-zinc-200'
            : 'text-zinc-500 group-hover:text-zinc-700'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium font-['Fira_Code'] ${
          isDark ? 'text-zinc-200' : 'text-zinc-800'
        }`}>
          {item.label}
        </p>
        {!compact && (
          <p className={`text-xs font-['Fira_Code'] truncate ${
            isDark ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Text Item (styled differently for text panel)
 */
interface TextItemProps {
  item: TextItemData;
  theme: string;
  onClick: (type: string) => void;
  onDragStart?: (type: string) => void;
}

function TextItem({ item, theme, onClick, onDragStart }: TextItemProps) {
  const isDark = theme === 'dark';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', item.type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(item.type);
  };

  const sizeClasses: Record<string, string> = {
    large: 'text-2xl font-bold',
    medium: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-xs text-zinc-400',
    quote: 'text-lg italic',
    button: 'text-sm font-semibold',
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(item.type)}
      className={`
        px-4 py-4 cursor-grab
        border transition-all duration-150 group
        active:cursor-grabbing active:scale-[0.98]
        ${isDark
          ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
          : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
        }
      `}
    >
      <p className={`font-['Fira_Code'] font-medium ${sizeClasses[item.size]} ${
        isDark ? 'text-zinc-200' : 'text-zinc-800'
      }`}>
        {item.label}
      </p>
    </div>
  );
}

/**
 * Panel Content Components
 */
interface ElementsPanelProps {
  theme: string;
  searchQuery: string;
  isPageLocked?: boolean;
  businessType?: string;
  onAddSection?: (type: string) => string | void;
  onAddElement: (type: string, options?: Record<string, unknown>) => void;
  onDragStart: (type: string) => void;
  accentColor?: string;
}

function ElementsPanel({ theme, searchQuery, isPageLocked = false, businessType, onAddSection, onAddElement, onDragStart, accentColor = '#E11D48' }: ElementsPanelProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    sections: false, // Canvas Sections — open by default
    prebuilt: true,
    widgets: true,
    media: true,
    images: true,
    forms: true,
    text: true,
  });
  const isDark = theme === 'dark';

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const isCurrentlyOpen = !prev[categoryId];
      if (isCurrentlyOpen) {
        // Closing this one — just toggle it
        return { ...prev, [categoryId]: true };
      }
      // Opening this one — collapse all others
      const allCollapsed: Record<string, boolean> = {};
      for (const key of Object.keys(prev)) {
        allCollapsed[key] = true;
      }
      allCollapsed[categoryId] = false;
      return allCollapsed;
    });
  };

  // Filter sections by search query
  const showBlankSection = !searchQuery || BLANK_SECTION_ITEM.label.toLowerCase().includes(searchQuery.toLowerCase()) || BLANK_SECTION_ITEM.description.toLowerCase().includes(searchQuery.toLowerCase());
  const industrySections = getIndustrySections(businessType);
  const filteredPrebuiltSections = PREBUILT_SECTION_ITEMS.filter(item => {
    // Industry filter: only show relevant sections
    if (industrySections && !industrySections.includes(item.type)) return false;
    // Search filter
    return item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
  });
  // Keep combined for backward compat
  const filteredSections = SECTION_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter portable widgets
  const filteredPortableWidgets = PORTABLE_WIDGET_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter media items
  const filteredMedia = MEDIA_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter frames by search query
  const filteredFrameCategories = FRAME_CATEGORIES.map(category => ({
    ...category,
    frames: category.frames.filter(frame =>
      frame.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.frames.length > 0);

  // Filter form items
  const filteredForms = FORM_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter text items
  const filteredTextItems = TEXT_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for adding frames with frameType
  const handleAddFrame = (frameType: string) => {
    onAddElement?.('frame', { frameType });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Locked Page Warning */}
      {isPageLocked && (
        <div className={`p-3 border flex items-center gap-2 ${
          isDark
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-['Fira_Code']">
            This page has a locked section. You can edit properties but cannot add or remove sections.
          </span>
        </div>
      )}

      {/* Blank Section */}
      {showBlankSection && !isPageLocked && (
        <div>
          <CategoryHeader
            label="Canvas Section"
            theme={theme}
            collapsed={collapsedCategories.sections}
            onToggle={() => toggleCategory('sections')}
          />
          {!collapsedCategories.sections && (
            <div className="space-y-2">
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/section-type', 'blank');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => onAddSection?.('blank')}
                className={`w-full p-3 border transition-all text-left flex items-center gap-3 cursor-grab active:cursor-grabbing ${
                  isDark
                    ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                }`}>
                  <Square className="w-5 h-5" style={{ color: isDark ? '#FFFFFF' : '#1A1A1A' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-['Fira_Code'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    Blank Section
                  </span>
                  <span className={`text-xs font-['Fira_Code'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Free-form canvas for custom layouts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pre-built Sections */}
      {filteredPrebuiltSections.length > 0 && !isPageLocked && (
        <div>
          <CategoryHeader
            label="Pre-built Sections"
            theme={theme}
            collapsed={collapsedCategories.prebuilt ?? false}
            onToggle={() => toggleCategory('prebuilt')}
          />
          {!(collapsedCategories.prebuilt ?? false) && (
            <div className="space-y-2">
              {filteredPrebuiltSections.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/section-type', item.type);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => onAddSection?.(item.type)}
                    className={`w-full p-3 border transition-all text-left flex items-center gap-3 cursor-grab active:cursor-grabbing ${
                      isDark
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-['Fira_Code'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        {item.label}
                      </span>
                      <span className={`text-xs font-['Fira_Code'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {item.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Portable Widgets (for blank sections) */}
      {filteredPortableWidgets.length > 0 && (
        <div>
          <CategoryHeader
            label="Portable Widgets"
            theme={theme}
            collapsed={collapsedCategories.widgets}
            onToggle={() => toggleCategory('widgets')}
          />
          {!collapsedCategories.widgets && (
            <>
              <p className={`text-xs font-['Fira_Code'] mb-3 ${
                isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                Add to blank sections only
              </p>
              <div className="space-y-2">
                {filteredPortableWidgets.map((item) => (
                  <ElementItem
                    key={item.type}
                    item={item}
                    theme={theme}
                    onClick={onAddElement}
                    onDragStart={onDragStart}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Media & Layout */}
      {filteredMedia.length > 0 && (
        <div>
          <CategoryHeader
            label="Media & Layout"
            theme={theme}
            collapsed={collapsedCategories.media}
            onToggle={() => toggleCategory('media')}
          />
          {!collapsedCategories.media && (
            <div className="space-y-2">
              {filteredMedia.map((item) => (
                <ElementItem
                  key={item.type}
                  item={item}
                  theme={theme}
                  onClick={onAddElement}
                  onDragStart={onDragStart}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Images — gallery section + flattened frames */}
      {(filteredFrameCategories.length > 0 || !searchQuery) && (
        <div>
          <CategoryHeader
            label="Images & Videos"
            theme={theme}
            collapsed={collapsedCategories.images}
            onToggle={() => toggleCategory('images')}
          />
          {!collapsedCategories.images && (
            <div className="space-y-4">
              {/* Gallery Section button — first, prominent */}
              {!isPageLocked && (
                <button
                  onClick={() => onAddSection?.('galleryWidget')}
                  className={`w-full flex items-center gap-3 p-3 border transition-all ${
                    isDark
                      ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <ImageIcon className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                  <div className="text-left">
                    <span className={`text-xs font-['Fira_Code'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      Gallery Section
                    </span>
                    <span className={`text-[10px] font-['Fira_Code'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Add photo gallery to page
                    </span>
                  </div>
                </button>
              )}

              {/* Video Embed */}
              <button
                onClick={() => onAddElement('videoEmbed')}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('elementType', 'videoEmbed');
                  e.dataTransfer.effectAllowed = 'copy';
                  onDragStart?.('videoEmbed');
                }}
                className={`w-full flex items-center gap-3 p-3 border transition-all ${
                  isDark
                    ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                <Play className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <div className="text-left">
                  <span className={`text-xs font-['Fira_Code'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    Video Embed
                  </span>
                  <span className={`text-[10px] font-['Fira_Code'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    YouTube or Vimeo video
                  </span>
                </div>
              </button>

              {/* Frames — single flat list */}
              {filteredFrameCategories.length > 0 && (
                <div>
                  <p className={`text-[10px] font-['Fira_Code'] uppercase tracking-wider mb-2 px-1 ${
                    isDark ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>Frames</p>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredFrameCategories.flatMap((category) => category.frames).map((frame) => {
                      const Icon = frame.icon;
                      return (
                        <button
                          key={frame.frameType}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('elementType', 'frame');
                            e.dataTransfer.setData('frameType', frame.frameType);
                            e.dataTransfer.effectAllowed = 'copy';
                            onDragStart?.('frame');
                          }}
                          onClick={() => handleAddFrame(frame.frameType)}
                          className={`p-3 border transition-all ${
                            isDark
                              ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                              : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-[10px] font-['Fira_Code'] block">{frame.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Forms */}
      {filteredForms.length > 0 && (
        <div>
          <CategoryHeader
            label="Forms & Buttons"
            theme={theme}
            collapsed={collapsedCategories.forms}
            onToggle={() => toggleCategory('forms')}
          />
          {!collapsedCategories.forms && (
            <div className="space-y-2">
              {filteredForms.map((item) => (
                <ElementItem
                  key={item.type}
                  item={item}
                  theme={theme}
                  onClick={onAddElement}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Text */}
      {filteredTextItems.length > 0 && (
        <div>
          <CategoryHeader
            label="Click text to add to page"
            theme={theme}
            collapsed={collapsedCategories.text}
            onToggle={() => toggleCategory('text')}
          />
          {!collapsedCategories.text && (
            <div className="space-y-2">
              {filteredTextItems.map((item) => (
                <TextItem
                  key={item.type}
                  item={item}
                  theme={theme}
                  onClick={onAddElement}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Text Panel
 */
interface TextPanelProps {
  theme: string;
  searchQuery: string;
  onAddElement: (type: string) => void;
  onDragStart: (type: string) => void;
}

function TextPanel({ theme, searchQuery, onAddElement, onDragStart }: TextPanelProps) {
  const filteredItems = TEXT_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-3">
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
      }`}>
        Click text to add to page
      </div>
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <TextItem
            key={item.type}
            item={item}
            theme={theme}
            onClick={onAddElement}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}



/**
 * Site Settings Modal Component
 */
interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  siteSettings?: SiteSettingsData;
  onUpdateSiteSettings?: (settings: SiteSettingsData) => void;
  accentColor?: string;
}

function SiteSettingsModal({ isOpen, onClose, theme, siteSettings, onUpdateSiteSettings, accentColor = '#E11D48' }: SiteSettingsModalProps) {
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState<SiteSettingsData>(siteSettings || {
    siteName: '',
    siteDescription: '',
    favicon: '',
    socialImage: '',
    customDomain: '',
  });
  const [showDomainSetup, setShowDomainSetup] = useState(false);
  const [domainInput, setDomainInput] = useState(settings.customDomain || '');
  const subdomain = (settings.siteName || 'mysite').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSiteSettings?.(settings);
    onClose();
  };

  const textMain = isDark ? '#FFFFFF' : '#1A1A1A';
  const textMuted = isDark ? '#A1A1AA' : '#6B7280';
  const borderColor = isDark ? '#3F3F46' : '#E5E7EB';
  const cardBg = isDark ? '#27272A' : '#FFFFFF';
  const inputBg = isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900';

  // Domain setup sub-view
  if (showDomainSetup) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowDomainSetup(false)} />
        <div className={`relative w-full max-w-lg mx-4 shadow-2xl ${
          isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
        }`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b`} style={{ borderColor }}>
            <div>
              <h2 className="text-lg font-semibold font-['Fira_Code']" style={{ color: textMain }}>Domain Settings</h2>
              <p className="text-xs font-['Fira_Code'] mt-0.5" style={{ color: textMuted }}>Connect a custom domain to your site</p>
            </div>
            <button onClick={() => setShowDomainSetup(false)} className={`p-1 transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Default domain */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5 font-['Fira_Code']" style={{ color: textMuted }}>Default Domain</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border" style={{ borderColor, backgroundColor: isDark ? '#18181B' : '#F9FAFB' }}>
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium font-['Fira_Code']" style={{ color: textMain }}>{subdomain}.redpine.systems</span>
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
              </div>
            </div>

            {/* Custom domain input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5 font-['Fira_Code']" style={{ color: textMuted }}>Custom Domain</label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="www.yourdomain.com"
                className={`w-full px-3 py-2.5 text-sm border font-['Fira_Code'] focus:outline-none ${inputBg}`}
              />
            </div>

            {/* DNS Instructions */}
            <div className="p-4" style={{ backgroundColor: isDark ? '#18181B' : '#F9FAFB', border: `1px solid ${borderColor}` }}>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-3 font-['Fira_Code']" style={{ color: textMuted }}>DNS Configuration</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-1 font-['Fira_Code']" style={{ color: textMuted }}>Step 1</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="px-2 py-1.5 font-['Fira_Code']" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>CNAME</div>
                    <div className="px-2 py-1.5 font-['Fira_Code']" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>www</div>
                    <div className="px-2 py-1.5 font-['Fira_Code'] truncate" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>{subdomain}.redpine.systems</div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1 font-['Fira_Code']" style={{ color: textMuted }}>Step 2</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="px-2 py-1.5 font-['Fira_Code']" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>A</div>
                    <div className="px-2 py-1.5 font-['Fira_Code']" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>@</div>
                    <div className="px-2 py-1.5 font-['Fira_Code']" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textMain }}>76.76.21.21</div>
                  </div>
                </div>
              </div>
              <p className="text-xs mt-3 font-['Fira_Code']" style={{ color: textMuted }}>
                Add these records in your domain registrar&apos;s DNS settings. Changes may take up to 48 hours.
              </p>
            </div>

            {/* Verification status */}
            <div className="flex items-center gap-2 px-3 py-2.5 border" style={{ borderColor }}>
              <div className="w-2 h-2 bg-amber-400" />
              <span className="text-xs font-medium font-['Fira_Code']" style={{ color: textMuted }}>Verification pending — DNS not yet detected</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor }}>
            <button onClick={() => setShowDomainSetup(false)} className="px-4 py-2 text-sm font-['Fira_Code'] transition-opacity hover:opacity-70" style={{ color: textMuted }}>Cancel</button>
            <button
              onClick={() => { setSettings({ ...settings, customDomain: domainInput.trim() }); setShowDomainSetup(false); }}
              disabled={!domainInput.trim()}
              className="px-5 py-2 text-sm font-['Fira_Code'] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              Save Domain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full max-w-md mx-4 shadow-2xl ${
        isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b`} style={{ borderColor }}>
          <h2 className="text-lg font-semibold font-['Fira_Code']" style={{ color: textMain }}>Site Settings</h2>
          <button onClick={onClose} className={`p-1 transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — matches dashboard Website > Settings */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Site Title */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2 font-['Fira_Code']" style={{ color: textMuted }}>Site Title</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="Your site name"
              className={`w-full px-3 py-2 text-sm border font-['Fira_Code'] focus:outline-none ${inputBg}`}
            />
            <p className="text-xs mt-1.5 font-['Fira_Code']" style={{ color: textMuted }}>Displayed in the browser tab and search results.</p>
          </div>

          {/* Favicon */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2 font-['Fira_Code']" style={{ color: textMuted }}>Favicon</label>
            <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed cursor-pointer transition-colors hover:bg-black/[0.02]" style={{ borderColor }}>
              <div className={`w-10 h-10 flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                {settings.favicon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={settings.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  <svg className={`w-5 h-5 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium font-['Fira_Code']" style={{ color: textMain }}>Upload favicon</p>
                <p className="text-xs font-['Fira_Code']" style={{ color: textMuted }}>32x32px recommended, PNG or ICO</p>
              </div>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="p-5 shadow-sm" style={{ backgroundColor: cardBg }}>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2 font-['Fira_Code']" style={{ color: textMuted }}>Custom Domain</label>
            <div className="flex items-center justify-between">
              <p className="text-sm font-['Fira_Code']" style={{ color: textMain }}>
                {settings.customDomain || 'No custom domain connected'}
              </p>
              <button
                onClick={() => setShowDomainSetup(true)}
                className="px-3 py-1.5 text-xs font-medium font-['Fira_Code'] transition-colors hover:opacity-80"
                style={{ backgroundColor: '#F3F4F6', color: '#1A1A1A' }}
              >
                {settings.customDomain ? 'Change' : 'Connect Domain'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor }}>
          <button onClick={onClose} className="px-4 py-2 text-sm font-['Fira_Code'] transition-colors" style={{ color: textMuted }}>Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-['Fira_Code'] text-white hover:opacity-90 transition-colors" style={{ backgroundColor: '#1A1A1A' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced Projects Panel Component
 */
interface ProjectsPanelProps {
  theme: string;
  searchQuery: string;
  pages: PageData[];
  currentPageId: string;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: () => void;
  onRenamePage?: (pageId: string, name: string) => void;
  onDeletePage?: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onSetHomepage?: (pageId: string) => void;
  onReorderPages?: (draggedId: string, targetId: string) => void;
  onAddPageFromTemplate?: (template: PageTemplate) => void;
  siteSettings?: SiteSettingsData;
  onUpdateSiteSettings?: (settings: SiteSettingsData) => void;
  accentColor?: string;
}

function ProjectsPanel({
  theme,
  searchQuery,
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onDuplicatePage,
  onSetHomepage,
  onReorderPages,
  onAddPageFromTemplate,
  siteSettings,
  onUpdateSiteSettings,
  accentColor = '#E11D48',
}: ProjectsPanelProps) {
  const isDark = theme === 'dark';
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [showSiteSettings, setShowSiteSettings] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle double-click to edit page name
  const handleDoubleClick = (page: PageData) => {
    if (page.isDefault) return; // Can't rename default pages
    setEditingPageId(page.id);
    setEditingName(page.name);
    setMenuOpenId(null);
  };

  // Save page name on blur or enter
  const handleSavePageName = () => {
    if (editingPageId && editingName.trim()) {
      onRenamePage?.(editingPageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName('');
  };

  // Handle key press in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePageName();
    } else if (e.key === 'Escape') {
      setEditingPageId(null);
      setEditingName('');
    }
  };

  // Toggle menu
  const handleMenuClick = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === pageId ? null : pageId);
  };

  // Menu actions
  const handleSetHomepage = (pageId: string) => {
    onSetHomepage?.(pageId);
    setMenuOpenId(null);
  };

  const handleDuplicate = (pageId: string) => {
    onDuplicatePage?.(pageId);
    setMenuOpenId(null);
  };

  const handleDelete = (pageId: string) => {
    onDeletePage?.(pageId);
    setMenuOpenId(null);
  };

  // Drag and drop for reordering
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    if (draggedPageId && draggedPageId !== targetPageId) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    if (draggedPageId && draggedPageId !== targetPageId) {
      onReorderPages?.(draggedPageId, targetPageId);
    }
    setDraggedPageId(null);
  };

  const handleDragEnd = () => {
    setDraggedPageId(null);
  };

  // Add page from template
  const handleAddFromTemplate = (template: PageTemplate) => {
    onAddPageFromTemplate?.(template);
  };

  // Close menu when clicking outside
  const handlePanelClick = () => {
    if (menuOpenId) setMenuOpenId(null);
  };

  return (
    <div className="flex flex-col h-full" onClick={handlePanelClick}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Pages Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-xs font-semibold uppercase tracking-wider font-['Fira_Code'] ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}>
              Pages
              <span className={`ml-2 px-1.5 py-0.5 text-[10px] ${
                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500'
              }`}>
                {pages.length}
              </span>
            </div>
          </div>

          {/* Page List */}
          {filteredPages.length > 0 ? (
            <div className="space-y-1">
              {filteredPages.map((page) => {
                const Icon = page.icon || FileText;
                const isActive = page.id === currentPageId;
                const isEditing = editingPageId === page.id;
                const isMenuOpen = menuOpenId === page.id;
                const isDragging = draggedPageId === page.id;

                return (
                  <div
                    key={page.id}
                    draggable={!page.isDefault && !isEditing}
                    onDragStart={(e) => handleDragStart(e, page.id)}
                    onDragOver={(e) => handleDragOver(e, page.id)}
                    onDrop={(e) => handleDrop(e, page.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isEditing && onSelectPage?.(page.id)}
                    onDoubleClick={() => handleDoubleClick(page)}
                    className={`
                      relative flex items-center gap-2 px-2 py-2 cursor-pointer transition-all
                      ${isActive
                        ? 'border'
                        : isDark
                          ? 'bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800'
                          : 'bg-white hover:bg-zinc-50 border border-zinc-200'
                      }
                      ${isDragging ? 'opacity-50' : ''}
                    `}
                    style={isActive ? { backgroundColor: isDark ? '#3F3F46' : '#F3F4F6', borderColor: isDark ? '#52525B' : '#1A1A1A' } : undefined}
                  >
                    {/* Drag Handle */}
                    {!page.isDefault && (
                      <GripVertical className={`w-3 h-3 flex-shrink-0 cursor-grab ${
                        isDark ? 'text-zinc-600' : 'text-zinc-400'
                      }`} />
                    )}

                    {/* Page Icon */}
                    <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-zinc-900' : 'bg-zinc-100'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? '' : isDark ? 'text-zinc-500' : 'text-zinc-400'}`} style={isActive ? { color: isDark ? '#FFFFFF' : '#1A1A1A' } : undefined} />
                    </div>

                    {/* Page Name */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSavePageName}
                          onKeyDown={handleEditKeyDown}
                          autoFocus
                          className={`w-full px-1 py-0.5 text-sm font-['Fira_Code'] ${
                            isDark ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-900'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-['Fira_Code'] truncate ${
                            isActive ? '' : isDark ? 'text-zinc-200' : 'text-zinc-800'
                          }`} style={isActive ? { color: isDark ? '#FFFFFF' : '#1A1A1A' } : undefined}>
                            {page.name}
                          </span>
                          {page.isHomepage && (
                            <span className={`text-[9px] px-1 py-0.5 font-['Fira_Code'] ${
                              isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
                            }`}>
                              HOME
                            </span>
                          )}
                          {page.isDefault && (
                            <span className={`text-[9px] px-1 py-0.5 font-['Fira_Code'] ${
                              isDark ? 'bg-zinc-700 text-zinc-400' : 'bg-zinc-200 text-zinc-500'
                            }`}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Menu Button */}
                    {!page.isDefault && (
                      <button
                        onClick={(e) => handleMenuClick(e, page.id)}
                        className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-500'
                        } ${isMenuOpen ? 'opacity-100' : ''}`}
                        style={{ opacity: isMenuOpen ? 1 : undefined }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}

                    {/* Context Menu */}
                    {isMenuOpen && (
                      <div
                        className={`absolute right-0 top-full mt-1 w-40 shadow-lg border z-50 ${
                          isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleSetHomepage(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Fira_Code'] transition-colors ${
                            isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                          Set as Homepage
                        </button>
                        <button
                          onClick={() => handleDuplicate(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Fira_Code'] transition-colors ${
                            isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Fira_Code'] text-red-500 transition-colors ${
                            isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`py-6 text-center text-sm font-['Fira_Code'] ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              No pages found
            </div>
          )}

          {/* Add Page Button */}
          <button
            onClick={onAddPage}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-3 border-2 border-dashed transition-colors ${
              isDark
                ? 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                : 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-['Fira_Code']">Add Page</span>
          </button>
        </div>

        {/* Templates Section */}
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-3 font-['Fira_Code'] ${
            isDark ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            Page Templates
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PAGE_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleAddFromTemplate(template)}
                  className={`p-3 border text-left transition-all ${
                    isDark
                      ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center mb-2 ${
                    isDark ? 'bg-zinc-900' : 'bg-zinc-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                  </div>
                  <div className={`text-xs font-semibold font-['Fira_Code'] truncate ${
                    isDark ? 'text-zinc-200' : 'text-zinc-800'
                  }`}>
                    {template.name}
                  </div>
                  <div className={`text-[10px] font-['Fira_Code'] mt-0.5 truncate ${
                    isDark ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>
                    {template.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Site Settings Button - Fixed at bottom */}
      <div className={`flex-shrink-0 p-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <button
          onClick={() => setShowSiteSettings(true)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 transition-colors ${
            isDark
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-['Fira_Code']">Site Settings</span>
        </button>
      </div>

      {/* Site Settings Modal */}
      <SiteSettingsModal
        isOpen={showSiteSettings}
        onClose={() => setShowSiteSettings(false)}
        theme={theme}
        siteSettings={siteSettings}
        onUpdateSiteSettings={onUpdateSiteSettings}
        accentColor={accentColor}
      />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export interface FreeFormSidebarProps {
  pages?: PageData[];
  currentPageId?: string;
  isPageLocked?: boolean;
  onAddElement?: (
    type: string,
    x: number,
    y: number,
    viewportMode: string,
    viewportWidth: number,
    canvasHeight: number,
    options?: Record<string, unknown>
  ) => void;
  onAddSection?: (type: string) => string | void;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: () => void;
  onAddImage?: (url: string, name: string) => void;
  // Page management callbacks
  onRenamePage?: (pageId: string, name: string) => void;
  onDeletePage?: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onSetHomepage?: (pageId: string) => void;
  onReorderPages?: (draggedId: string, targetId: string) => void;
  onAddPageFromTemplate?: (template: PageTemplate) => void;
  // Site settings
  siteSettings?: SiteSettingsData;
  onUpdateSiteSettings?: (settings: SiteSettingsData) => void;
  // Layout
  viewportWidth?: number;
  viewportMode?: string;
  canvasHeight?: number;
  theme?: string;
  brandBoardColors?: ColorItem[];
  onBrandBoardColorsChange?: (colors: ColorItem[]) => void;
  brandHeadingFont?: string;
  brandBodyFont?: string;
  onBrandFontChange?: (heading: string, body: string) => void;
  accentColor?: string;
  businessType?: string;
  /** @deprecated No longer used — kept for backward compat */
  onActivePanelChange?: (panel: string | null) => void;
  className?: string;
  // AI editor: page context + mutation callbacks
  sections?: Array<{ id: string; type: string; properties: Record<string, unknown> }>;
  elements?: Array<{ id: string; type: string; sectionId?: string; x?: number; y?: number; width?: number; height?: number; properties: Record<string, unknown> }>;
  onUpdateElement?: (elementId: string, properties: Record<string, unknown>) => void;
  onDeleteElement?: (elementId: string) => void;
  onMoveSection?: (sectionId: string, direction: 'up' | 'down') => void;
  onUpdateSectionProperties?: (sectionId: string, properties: Record<string, unknown>) => void;
  isOverlayOpen?: boolean;
  onClose?: () => void;
  onElementAdded?: () => void;
}

/**
 * Main Sidebar Component
 */
export default function FreeFormSidebar({
  pages = DEFAULT_PAGES,
  currentPageId = 'home',
  isPageLocked = false,
  onAddElement,
  onAddSection,
  onSelectPage,
  onAddPage,
  onAddImage,
  // Page management callbacks
  onRenamePage,
  onDeletePage,
  onDuplicatePage,
  onSetHomepage,
  onReorderPages,
  onAddPageFromTemplate,
  // Site settings
  siteSettings,
  onUpdateSiteSettings,
  // Layout
  viewportWidth = 1200,
  viewportMode = 'desktop',
  canvasHeight = 800,
  theme = 'dark',
  brandBoardColors = [],
  onBrandBoardColorsChange,
  brandHeadingFont = 'Inter, system-ui, sans-serif',
  brandBodyFont = 'Inter, system-ui, sans-serif',
  onBrandFontChange,
  accentColor = '#E11D48',
  businessType,
  onActivePanelChange,
  className = '',
  // AI editor
  sections,
  elements,
  onUpdateElement,
  onDeleteElement,
  onMoveSection,
  onUpdateSectionProperties,
  // Overlay mode
  isOverlayOpen = false,
  onClose,
  onElementAdded,
}: FreeFormSidebarProps) {
  const [activePanel, setActivePanel] = useState<string | null>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';

  // Handle add element with centering
  const handleAddElement = useCallback((type: string, optionsOrShapeType?: string | Record<string, unknown>) => {
    if (!onAddElement) return;

    // Normalize button variants → 'button' type with borderRadius
    let actualType = type;
    let extraOptions: Record<string, unknown> = {};
    if (type === 'button-rect') {
      actualType = 'button';
      extraOptions = { borderRadius: 0 };
    } else if (type === 'button-rounded') {
      actualType = 'button';
      extraOptions = { borderRadius: 8 };
    } else if (type === 'button-pill') {
      actualType = 'button';
      extraOptions = { borderRadius: 9999 };
    } else if (type === 'button-circle') {
      actualType = 'button';
      extraOptions = { borderRadius: 9999, content: '→' };
    }

    const baseSize = BASE_ELEMENT_SIZES[actualType] || { width: 200, height: 100 };
    const padding = 20;

    let scaledWidth = baseSize.width;
    let scaledHeight = baseSize.height;
    const maxHeight = canvasHeight - (padding * 2);

    if (baseSize.height > maxHeight) {
      const scaleFactor = maxHeight / baseSize.height;
      scaledHeight = Math.floor(baseSize.height * scaleFactor);
      scaledWidth = Math.floor(baseSize.width * scaleFactor);
    }

    const maxWidth = viewportWidth - (padding * 2);
    if (scaledWidth > maxWidth) {
      const widthScaleFactor = maxWidth / scaledWidth;
      scaledWidth = Math.floor(scaledWidth * widthScaleFactor);
      scaledHeight = Math.floor(scaledHeight * widthScaleFactor);
    }

    const centerX = Math.floor((viewportWidth - scaledWidth) / 2);

    // Find target section and stack below existing elements instead of centering
    const targetSection = sections?.find(s => s.type === 'blank');
    const targetSectionId = targetSection?.id;
    let yPos = 40; // default start position
    if (elements && targetSectionId) {
      let maxBottom = 0;
      for (const el of elements) {
        if (el.sectionId === targetSectionId) {
          const elY = el.y || 0;
          const elH = el.height || 100;
          maxBottom = Math.max(maxBottom, elY + elH);
        }
      }
      if (maxBottom > 0) yPos = maxBottom + 20;
    }

    // Build options with brand colors
    const options: Record<string, unknown> = {};
    if (typeof optionsOrShapeType === 'object' && optionsOrShapeType !== null) {
      Object.assign(options, optionsOrShapeType);
    }
    if (targetSectionId) {
      options.sectionId = targetSectionId;
    }

    if (brandBoardColors.length > 0) {
      const colorMap: Record<string, string> = {};
      brandBoardColors.forEach(c => { colorMap[c.target] = c.color; });
      if (colorMap.buttons) options.brandTitleColor = colorMap.buttons;
      if (colorMap.headings) options.brandAccentColor = colorMap.headings;
      if (colorMap.background) options.brandBackgroundColor = colorMap.background;
    }

    // Merge button variant options
    Object.assign(options, extraOptions);

    onAddElement(actualType, centerX, yPos, viewportMode, viewportWidth, canvasHeight, Object.keys(options).length > 0 ? options : undefined);
    onElementAdded?.();
  }, [onAddElement, viewportWidth, viewportMode, canvasHeight, brandBoardColors, sections, elements, onElementAdded]);

  // ---- AI Chat state ----
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // AI action executor — runs structured actions from the AI response
  const executeAIActions = useCallback((actions: Array<Record<string, unknown>>) => {
    const VALID_ELEMENT_TYPES = new Set(['heading', 'subheading', 'text', 'caption', 'quote', 'button', 'image', 'divider', 'spacer', 'contactForm', 'customForm']);
    const VALID_SECTION_TYPES = new Set(['blank', 'bookingWidget', 'serviceWidget', 'galleryWidget', 'productGrid', 'productWidget', 'menuWidget', 'eventsWidget', 'classesWidget', 'reviewCarousel']);

    let lastCreatedSectionId: string | null = null;
    const vw = viewportWidth || 1200;

    // Element height estimates for Y staggering
    const BASE_HEIGHTS: Record<string, number> = {
      heading: 80, subheading: 60, text: 100, caption: 40, quote: 80,
      button: 60, image: 250, divider: 30, spacer: 50, contactForm: 400,
    };
    const textTypes = new Set(['heading', 'subheading', 'text', 'caption', 'quote']);

    // Estimate height for text based on content length
    const estimateHeight = (type: string, props: Record<string, unknown>) => {
      const base = BASE_HEIGHTS[type] || 80;
      if (!textTypes.has(type) || !props?.content) return base;
      const content = props.content as string;
      const fontSize = (props.fontSize as number) || (type === 'heading' ? 48 : 16);
      const lineHeight = (props.lineHeight as number) || (type === 'heading' ? 1.2 : 1.5);
      const elWidth = type === 'heading' ? 400 : 300;
      const avgCharWidth = fontSize * 0.55;
      const charsPerLine = Math.max(1, Math.floor(elWidth / avgCharWidth));
      const lineCount = Math.ceil(content.length / charsPerLine);
      const estimated = lineCount * fontSize * lineHeight + 16;
      return Math.max(base, Math.ceil(estimated));
    };

    // Compute bottom edge of existing elements per section to avoid overlaps
    const sectionBottoms: Record<string, number> = {};
    if (elements) {
      for (const el of elements) {
        const sid = el.sectionId || '';
        const elY = el.y || 0;
        const elH = el.height || 100;
        const bottom = elY + elH;
        sectionBottoms[sid] = Math.max(sectionBottoms[sid] || 0, bottom);
      }
    }

    for (const action of actions) {
      switch (action.type) {
        case 'add_element': {
          const elType = action.elementType as string;
          if (!VALID_ELEMENT_TYPES.has(elType)) break;
          // Prefer: explicit sectionId > last created section > first blank section
          const targetSectionId = (action.sectionId as string) || lastCreatedSectionId || sections?.[0]?.id || '';
          const x = Math.max(20, vw / 2 - 200);
          // Start below existing elements in this section, or at 40 if empty
          const sectionBottom = sectionBottoms[targetSectionId] || 0;
          const y = sectionBottom > 0 ? sectionBottom + 20 : 40;
          const elHeight = estimateHeight(elType, (action.properties as Record<string, unknown>) || {});
          // Track for subsequent elements in same section
          sectionBottoms[targetSectionId] = y + elHeight;
          onAddElement?.(
            elType, x, y,
            viewportMode || 'desktop',
            vw,
            canvasHeight || 800,
            {
              ...((action.properties as Record<string, unknown>) || {}),
              ...(targetSectionId ? { sectionId: targetSectionId } : {}),
            },
          );
          break;
        }
        case 'add_section': {
          const secType = action.sectionType as string;
          if (!VALID_SECTION_TYPES.has(secType)) break;
          const newId = onAddSection?.(secType);
          if (typeof newId === 'string') {
            lastCreatedSectionId = newId;
            sectionBottoms[newId] = 0; // new section is empty
          }
          break;
        }
        case 'update_element':
          if (action.elementId && action.properties) {
            onUpdateElement?.(action.elementId as string, action.properties as Record<string, unknown>);
          }
          break;
        case 'delete_element':
          if (action.elementId) {
            onDeleteElement?.(action.elementId as string);
          }
          break;
        case 'move_section':
          if (action.sectionId && action.direction) {
            onMoveSection?.(action.sectionId as string, action.direction as 'up' | 'down');
          }
          break;
        case 'update_section':
          if (action.sectionId && action.properties) {
            onUpdateSectionProperties?.(action.sectionId as string, action.properties as Record<string, unknown>);
          }
          break;
      }
    }
  }, [sections, elements, viewportWidth, viewportMode, canvasHeight, onAddElement, onAddSection, onUpdateElement, onDeleteElement, onMoveSection, onUpdateSectionProperties]);

  const sendChatMessage = useCallback(async (text?: string) => {
    const msg = (text || chatInput).trim();
    if (!msg || isChatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Build page context for the AI
      const pageContext = {
        sections: (sections || []).map((s, i) => ({
          id: s.id,
          type: s.type,
          index: i,
          properties: s.properties || {},
        })),
        elements: (elements || []).slice(0, 40).map(el => ({
          id: el.id,
          type: el.type,
          sectionId: el.sectionId,
          x: Math.round(el.x || 0),
          y: Math.round(el.y || 0),
          width: Math.round(el.width || 0),
          height: Math.round(el.height || 0),
          properties: {
            content: typeof el.properties?.content === 'string' ? el.properties.content.slice(0, 100) : undefined,
            color: el.properties?.color,
            fontSize: el.properties?.fontSize,
            backgroundColor: el.properties?.backgroundColor,
            fontFamily: el.properties?.fontFamily,
            textAlign: el.properties?.textAlign,
            src: el.properties?.src,
            alt: el.properties?.alt,
          },
        })),
      };

      const pageName = pages?.find(p => p.id === currentPageId)?.name || 'Home';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: 'website_edit',
          pageSlug: currentPageId || 'home',
          pageTitle: pageName,
          history: chatMessages,
          pageContext,
        }),
      });
      const data = await res.json();
      const response = data.data?.response || data.response || 'Done.';
      const actions = data.data?.actions || [];

      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Execute AI actions after displaying the message
      if (actions.length > 0) {
        setTimeout(() => executeAIActions(actions), 150);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Please try again.' }]);
    }
    setIsChatLoading(false);
  }, [chatInput, isChatLoading, chatMessages, sections, elements, pages, currentPageId, executeAIActions]);

  const handleChatKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  // Get panel title
  const getPanelTitle = (): string => {
    switch (activePanel) {
      case 'ai': return 'AI Assistant';
      case 'brand': return 'Brand & Design';
      case 'projects': return 'Project & Pages';
      case 'elements': return 'Elements';
      default: return 'Tools';
    }
  };

  // Simple markdown renderer for AI chat
  const renderMarkdown = useCallback((text: string): ReactNode => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let key = 0;

    for (const line of lines) {
      if (line.trim() === '') {
        elements.push(<br key={key++} />);
        continue;
      }

      // List items
      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s/, '');
        elements.push(
          <div key={key++} className="flex gap-1.5 items-start">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-50" />
            <span>{parseBold(content)}</span>
          </div>
        );
        continue;
      }

      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        const num = line.match(/^(\d+)\.\s/)![1];
        const content = line.replace(/^\d+\.\s/, '');
        elements.push(
          <div key={key++} className="flex gap-1.5 items-start">
            <span className="opacity-50 flex-shrink-0">{num}.</span>
            <span>{parseBold(content)}</span>
          </div>
        );
        continue;
      }

      // Regular paragraph
      elements.push(<p key={key++} className="mb-1">{parseBold(line)}</p>);
    }

    return <>{elements}</>;
  }, []);

  // Parse **bold** text within a line
  function parseBold(text: string): ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  // AI suggestion chips
  const AI_SUGGESTIONS = [
    'Add a hero section with a headline and button',
    'Add a contact form section',
    'Change the color scheme to something modern',
  ];

  // Render panel content
  const renderPanelContent = (): ReactNode => {
    switch (activePanel) {
      case 'ai':
        return (
          <div className="flex flex-col h-full min-w-[220px]">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`} />
                  <p className={`text-xs mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Ask AI for help with your website content
                  </p>
                  <div className="space-y-2">
                    {AI_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendChatMessage(suggestion)}
                        className={`w-full text-left text-xs px-3 py-2 transition-colors ${
                          isDark
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`inline-block px-3 py-2 text-xs max-w-[95%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white'
                        : isDark
                          ? 'bg-zinc-800 text-zinc-200'
                          : 'bg-zinc-100 text-zinc-700'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: '#1A1A1A' } : undefined}
                  >
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className={`inline-flex items-center gap-1 px-3 py-2 text-xs ${
                    isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#6B7280', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#6B7280', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#6B7280', animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className={`px-3 py-2 border-t flex-shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-end gap-1.5">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask AI..."
                  rows={1}
                  className={`flex-1 text-xs resize-none px-2.5 py-2 outline-none max-h-[80px] font-['Fira_Code'] ${
                    isDark
                      ? 'bg-zinc-800 text-white placeholder-zinc-500 focus:ring-1'
                      : 'bg-zinc-100 text-zinc-900 placeholder-zinc-400 focus:ring-1'
                  }`}
                  style={{ '--tw-ring-color': '#1A1A1A' } as React.CSSProperties}
                />
                <button
                  onClick={() => sendChatMessage()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className={`p-2 transition-colors flex-shrink-0 ${
                    chatInput.trim() && !isChatLoading
                      ? 'text-white'
                      : isDark
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                  style={chatInput.trim() && !isChatLoading ? { backgroundColor: '#1A1A1A' } : undefined}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      case 'brand':
        return (
          <div className="flex flex-col h-full">
            <p className={`text-[10px] font-['Fira_Code'] px-4 pt-3 pb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              These settings only affect your website, not your dashboard.
            </p>
            <BrandBoardEditor
              configId={null}
              colors={brandBoardColors}
              onColorsChange={onBrandBoardColorsChange || (() => {})}
              headingFont={brandHeadingFont}
              bodyFont={brandBodyFont}
              onFontChange={onBrandFontChange || (() => {})}
              buttonColor={accentColor}
              mode="sidebar"
            />
          </div>
        );
      case 'projects':
        return (
          <ProjectsPanel
            theme={theme}
            searchQuery={searchQuery}
            pages={pages}
            currentPageId={currentPageId}
            onSelectPage={onSelectPage}
            onAddPage={onAddPage}
            onRenamePage={onRenamePage}
            onDeletePage={onDeletePage}
            onDuplicatePage={onDuplicatePage}
            onSetHomepage={onSetHomepage}
            onReorderPages={onReorderPages}
            onAddPageFromTemplate={onAddPageFromTemplate}
            siteSettings={siteSettings}
            onUpdateSiteSettings={onUpdateSiteSettings}
            accentColor={accentColor}
          />
        );
      default:
        // Unified tool list — show elements + text + navigation to sub-panels
        return (
          <div className="px-2">
            {/* Sections + Elements + Widgets + Media + Forms from ElementsPanel */}
            <ElementsPanel
              theme={theme}
              searchQuery={searchQuery}
              isPageLocked={isPageLocked}
              businessType={businessType}
              onAddSection={(type: string) => { onAddSection?.(type); onElementAdded?.(); }}
              onAddElement={handleAddElement}
              onDragStart={() => {}}
              accentColor={accentColor}
            />

            {/* Navigation to sub-panels */}
            {!searchQuery && (
              <div className="mt-2 space-y-1 px-2 pb-4">
                <button
                  onClick={() => setActivePanel('brand')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 text-gray-700"
                >
                  <Palette className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-['Fira_Code'] font-medium">Brand & Design</span>
                </button>
                <button
                  onClick={() => setActivePanel('ai')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 text-gray-700"
                >
                  <Sparkles className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-['Fira_Code'] font-medium">AI Assistant</span>
                </button>
                <button
                  onClick={() => setActivePanel('projects')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 text-gray-700"
                >
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-['Fira_Code'] font-medium">Project & Pages</span>
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  if (!isOverlayOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      {/* Overlay panel */}
      <aside className={`absolute left-0 top-0 bottom-0 z-50 w-[280px] flex flex-col border-r shadow-xl bg-white border-gray-200 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          {activePanel && activePanel !== 'elements' ? (
            <>
              <button
                onClick={() => setActivePanel(null)}
                className="flex items-center gap-1.5 text-sm font-['Fira_Code'] text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <h2 className="text-sm font-semibold font-['Fira_Code'] uppercase tracking-wider text-zinc-900">
                {getPanelTitle()}
              </h2>
            </>
          ) : (
            <h2 className="text-sm font-semibold font-['Fira_Code'] uppercase tracking-wider text-zinc-900">
              Tools
            </h2>
          )}
          <button onClick={onClose} className="p-1.5 transition-colors hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        {(!activePanel || activePanel === 'elements') && (
          <div className="px-4 py-3 flex-shrink-0">
            <SearchInput
              placeholder="Search tools..."
              theme={theme}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 ${activePanel === 'ai' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
          {renderPanelContent()}
        </div>
      </aside>
    </>
  );
}
