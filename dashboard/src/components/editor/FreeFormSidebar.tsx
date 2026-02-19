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
  Image,
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
  CloudUpload,
  FolderOpen,
  Grid3X3,
  Sparkles,
  X,
  Loader2,
  AlertCircle,
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
  Grid2X2,
  Columns,
  Rows,
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
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BASE_ELEMENT_SIZES } from '@/hooks/useFreeFormEditor';
import { useUserUploads } from '@/hooks/useUserUploads';

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

interface GridItem {
  type: string;
  gridType: string;
  label: string;
  icon: LucideIcon;
  description: string;
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

interface BrandColors {
  primary: string | null;
  secondary: string | null;
  accent1: string | null;
  accent2: string | null;
  background: string | null;
}

interface BrandColorSlot {
  id: keyof BrandColors;
  label: string;
  description: string;
}

interface SiteSettingsData {
  siteName: string;
  siteDescription: string;
  favicon: string;
  socialImage: string;
  customDomain: string;
}

interface UserUpload {
  id: string;
  public_url: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  isLocal?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

// Sidebar navigation items
const NAV_ITEMS: NavItem[] = [
  { id: 'elements', label: 'Elements', icon: LayoutGrid },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'uploads', label: 'Uploads', icon: CloudUpload },
  { id: 'projects', label: 'Project', icon: FolderOpen },
];

// Section items for the new section-based architecture
const BLANK_SECTION_ITEM: SectionItem = { type: 'blank', label: 'Blank Section', icon: Square, description: 'Free-form canvas for custom layouts' };

const PREBUILT_SECTION_ITEMS: SectionItem[] = [
  { type: 'bookingWidget', label: 'Booking Calendar', icon: Calendar, description: 'Let visitors book appointments' },
  { type: 'galleryWidget', label: 'Photo Gallery', icon: ImageIcon, description: 'Display your photo gallery' },
  { type: 'productGrid', label: 'Services / Products', icon: ShoppingBag, description: 'Show services with pricing' },
  { type: 'reviewCarousel', label: 'Reviews', icon: Star, description: 'Client testimonials carousel' },
];

const SECTION_ITEMS: SectionItem[] = [BLANK_SECTION_ITEM, ...PREBUILT_SECTION_ITEMS];

// Portable widgets that can be added to blank sections
const PORTABLE_WIDGET_ITEMS: PortableWidgetItem[] = [
  { type: 'contactForm', label: 'Contact Form', icon: ClipboardList, description: 'Pre-built contact form' },
  { type: 'customForm', label: 'Custom Form', icon: FormInput, description: 'Build your own form' },
  { type: 'button', label: 'Button', icon: MousePointerClick, description: 'Call-to-action button' },
];
// Media elements
const MEDIA_ITEMS: MediaItem[] = [
  { type: 'image', label: 'Image', icon: Image, description: 'Photo or graphic' },
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

// Grid elements - layout containers for multiple images
const GRID_ITEMS: GridItem[] = [
  { type: 'grid', gridType: '2-up', label: '2-Up', icon: Columns, description: 'Two images side by side' },
  { type: 'grid', gridType: '3-up', label: '3-Up', icon: Rows, description: 'Three images in a row' },
  { type: 'grid', gridType: '4-grid', label: '4 Grid', icon: Grid2X2, description: '2x2 image grid' },
  { type: 'grid', gridType: '6-grid', label: '6 Grid', icon: Grid3X3, description: '2x3 image grid' },
  { type: 'grid', gridType: 'collage', label: 'Collage', icon: LayoutTemplate, description: '1 large + 2 small' },
  { type: 'grid', gridType: 'masonry', label: 'Masonry', icon: LayoutGrid, description: 'Pinterest-style grid' },
];

// Text elements
const TEXT_ITEMS: TextItemData[] = [
  { type: 'heading', label: 'Add a heading', icon: Heading, description: 'Large title text', size: 'large' },
  { type: 'subheading', label: 'Add a subheading', icon: CaseSensitive, description: 'Medium subtitle text', size: 'medium' },
  { type: 'text', label: 'Add body text', icon: Type, description: 'Paragraph text', size: 'body' },
  { type: 'caption', label: 'Add a caption', icon: Text, description: 'Small caption text', size: 'small' },
  { type: 'quote', label: 'Add a quote', icon: MessageSquareQuote, description: 'Styled quotation', size: 'quote' },
  { type: 'button', label: 'Add a button', icon: MousePointerClick, description: 'Clickable button', size: 'button' },
];

// Form elements
const FORM_ITEMS: FormItem[] = [
  { type: 'contactForm', label: 'Contact Form', icon: ClipboardList, description: 'Pre-built contact form' },
  { type: 'customForm', label: 'Custom Form', icon: FormInput, description: 'Start blank, add fields' },
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
      { type: 'contactForm', properties: {} },
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
const BRAND_COLOR_SLOTS: BrandColorSlot[] = [
  { id: 'primary', label: 'Primary', description: 'Main brand color for headers and titles' },
  { id: 'secondary', label: 'Secondary', description: 'Accent color for borders and highlights' },
  { id: 'accent1', label: 'Accent 1', description: 'Additional accent color' },
  { id: 'accent2', label: 'Accent 2', description: 'Secondary accent color' },
  { id: 'background', label: 'Background', description: 'Widget background color' },
];

// Default brand colors
const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: null,
  secondary: null,
  accent1: null,
  accent2: null,
  background: null,
};

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
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm font-['Inter'] transition-colors ${
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
        flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab
        border transition-all duration-150 group
        active:cursor-grabbing active:scale-[0.98]
        ${isDark
          ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
          : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
        }
      `}
    >
      <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
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
        <p className={`text-sm font-medium font-['Inter'] ${
          isDark ? 'text-zinc-200' : 'text-zinc-800'
        }`}>
          {item.label}
        </p>
        {!compact && (
          <p className={`text-xs font-['Inter'] truncate ${
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
        px-4 py-4 rounded-lg cursor-grab
        border transition-all duration-150 group
        active:cursor-grabbing active:scale-[0.98]
        ${isDark
          ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
          : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
        }
      `}
    >
      <p className={`font-['Inter'] font-medium ${sizeClasses[item.size]} ${
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
  onAddSection?: (type: string) => void;
  onAddElement: (type: string, options?: Record<string, unknown>) => void;
  onDragStart: (type: string) => void;
}

function ElementsPanel({ theme, searchQuery, isPageLocked = false, onAddSection, onAddElement, onDragStart }: ElementsPanelProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const isDark = theme === 'dark';

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Filter sections by search query
  const showBlankSection = !searchQuery || BLANK_SECTION_ITEM.label.toLowerCase().includes(searchQuery.toLowerCase()) || BLANK_SECTION_ITEM.description.toLowerCase().includes(searchQuery.toLowerCase());
  const filteredPrebuiltSections = PREBUILT_SECTION_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
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

  // Filter grids by search query
  const filteredGrids = GRID_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter form items
  const filteredForms = FORM_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for adding frames with frameType
  const handleAddFrame = (frameType: string) => {
    onAddElement?.('frame', { frameType });
  };

  // Handler for adding grids with gridType
  const handleAddGrid = (gridType: string) => {
    onAddElement?.('grid', { gridType });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Locked Page Warning */}
      {isPageLocked && (
        <div className={`p-3 rounded-lg border flex items-center gap-2 ${
          isDark
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-['Inter']">
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
                className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 cursor-grab active:cursor-grabbing ${
                  isDark
                    ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                }`}>
                  <Square className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-['Inter'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    Blank Section
                  </span>
                  <span className={`text-xs font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
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
                    className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 cursor-grab active:cursor-grabbing ${
                      isDark
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-['Inter'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        {item.label}
                      </span>
                      <span className={`text-xs font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
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
              <p className={`text-xs font-['Inter'] mb-3 ${
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

      {/* Frames */}
      {filteredFrameCategories.length > 0 && (
        <div className="space-y-4">
          {filteredFrameCategories.map((category) => (
            <div key={`frame-${category.id}`}>
              <CategoryHeader
                label={category.label}
                theme={theme}
                collapsed={collapsedCategories[`frame-${category.id}`]}
                onToggle={() => toggleCategory(`frame-${category.id}`)}
              />
              {!collapsedCategories[`frame-${category.id}`] && (
                <div className="grid grid-cols-3 gap-2">
                  {category.frames.map((frame) => {
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
                        className={`p-3 rounded-lg border transition-all ${
                          isDark
                            ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                            : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-[10px] font-['Inter'] block truncate">{frame.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Grids */}
      {filteredGrids.length > 0 && (
        <div>
          <CategoryHeader
            label="Image Grids"
            theme={theme}
            collapsed={collapsedCategories.grids}
            onToggle={() => toggleCategory('grids')}
          />
          {!collapsedCategories.grids && (
            <div className="grid grid-cols-2 gap-2">
              {filteredGrids.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.gridType}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('elementType', 'grid');
                      e.dataTransfer.setData('gridType', item.gridType);
                      e.dataTransfer.effectAllowed = 'copy';
                      onDragStart?.('grid');
                    }}
                    onClick={() => handleAddGrid(item.gridType)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      isDark
                        ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                      <div>
                        <span className={`text-xs font-['Inter'] font-medium block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Forms */}
      {filteredForms.length > 0 && (
        <div>
          <CategoryHeader
            label="Forms"
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
 * Brand Preview Component - shows how colors work together
 */
interface BrandPreviewProps {
  brandColors: BrandColors;
  theme: string;
}

function BrandPreview({ brandColors, theme }: BrandPreviewProps) {
  const isDark = theme === 'dark';
  const primary = brandColors.primary || '#3B82F6';
  const secondary = brandColors.secondary || '#2563eb';
  const background = brandColors.background || (isDark ? '#18181b' : '#f4f4f5');

  return (
    <div
      className="rounded-lg p-3 border transition-colors"
      style={{
        backgroundColor: background,
        borderColor: secondary,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded" style={{ backgroundColor: primary }} />
        <div className="flex-1">
          <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: primary }} />
          <div className="h-1.5 rounded-full w-1/2 mt-1" style={{ backgroundColor: secondary, opacity: 0.5 }} />
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
          />
        ))}
      </div>
      <p className={`text-[10px] font-['Inter'] text-center mt-2 ${
        isDark ? 'text-zinc-500' : 'text-zinc-400'
      }`}>
        Preview
      </p>
    </div>
  );
}

/**
 * Brand Panel
 */
interface BrandPanelProps {
  theme: string;
  brandColors: BrandColors | null;
  onUpdateBrandColors?: (colors: BrandColors) => void;
  onApplyToAllWidgets?: () => void;
}

function BrandPanel({ theme, brandColors, onUpdateBrandColors, onApplyToAllWidgets }: BrandPanelProps) {
  const isDark = theme === 'dark';
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const colors = brandColors || DEFAULT_BRAND_COLORS;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (slotId: string, color: string) => {
    onUpdateBrandColors?.({ ...colors, [slotId]: color });
  };

  const handleDeleteColor = (slotId: string) => {
    onUpdateBrandColors?.({ ...colors, [slotId]: null });
    setEditingSlot(null);
  };

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>, slotId: string) => {
    if (editingSlot === slotId) {
      setEditingSlot(null);
      return;
    }

    // Calculate popup position relative to the container
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

    setPopupPosition({
      top: rect.top - containerRect.top + rect.height / 2,
      left: rect.left - containerRect.left + rect.width / 2,
    });
    setEditingSlot(slotId);
  };

  // Calculate text color based on background (for contrast)
  const getContrastColor = (hexColor: string | null): string => {
    if (!hexColor) return isDark ? '#a1a1aa' : '#71717a';
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#18181b' : '#ffffff';
  };

  const hasAnyColors = Object.values(colors).some(c => c !== null);

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      {/* Coolors-style color columns */}
      <div className="flex-1 flex min-h-[280px] overflow-x-auto">
        {BRAND_COLOR_SLOTS.map((slot) => {
          const color = colors[slot.id];
          const isEmpty = !color;
          const isEditing = editingSlot === slot.id;
          const textColor = getContrastColor(color);

          return (
            <div
              key={slot.id}
              className="flex-1 flex flex-col relative group cursor-pointer transition-all flex-shrink-0"
              style={{ minWidth: '44px', backgroundColor: color || (isDark ? '#27272a' : '#e4e4e7') }}
              onClick={(e) => handleSlotClick(e, slot.id)}
            >
              {/* Empty state plus icon */}
              {isEmpty && (
                <div className="flex-1 flex items-center justify-center">
                  <Plus className={`w-6 h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'} group-hover:scale-110 transition-transform`} />
                </div>
              )}

              {/* Filled state - shows color fill */}
              {!isEmpty && (
                <div className="flex-1" />
              )}

              {/* Bottom info area */}
              <div
                className="p-2 text-center transition-colors"
                style={{
                  backgroundColor: isEmpty ? 'transparent' : (color ?? undefined),
                }}
              >
                <p
                  className="text-[10px] font-['Inter'] font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: isEmpty ? (isDark ? '#71717a' : '#a1a1aa') : textColor }}
                >
                  {slot.label.replace('Accent ', 'Acc').replace('Primary', 'Pri').replace('Secondary', 'Sec').replace('Background', 'BG')}
                </p>
                {!isEmpty && (
                  <p
                    className="text-[9px] font-['Inter'] uppercase"
                    style={{ color: textColor, opacity: 0.7 }}
                  >
                    {color}
                  </p>
                )}
              </div>

              {/* Active/editing indicator */}
              {isEditing && (
                <div className="absolute inset-0 ring-2 ring-blue-500 ring-inset pointer-events-none" />
              )}

              {/* Hover overlay with delete button for filled slots */}
              {!isEmpty && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteColor(slot.id);
                    }}
                    className="w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center transition-colors"
                    title="Remove color"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Color picker popup */}
      {editingSlot && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setEditingSlot(null)}
          />

          {/* Popup */}
          <div
            className={`absolute z-50 w-64 rounded-xl shadow-2xl border ${
              isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'
            }`}
            style={{
              top: Math.min(popupPosition.top, 200),
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}>
              <span className={`text-xs font-semibold font-['Inter'] uppercase tracking-wider ${
                isDark ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                {BRAND_COLOR_SLOTS.find(s => s.id === editingSlot)?.label}
              </span>
              <button
                onClick={() => setEditingSlot(null)}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Color input */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="color"
                  value={colors[editingSlot as keyof BrandColors] || '#3b82f6'}
                  onChange={(e) => handleColorChange(editingSlot, e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={colors[editingSlot as keyof BrandColors] || ''}
                  placeholder="#000000"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                      if (val.length === 7) {
                        handleColorChange(editingSlot, val);
                      }
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-['Inter'] uppercase ${
                    isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                  } border`}
                />
              </div>

              {/* Quick color swatches */}
              <div className="grid grid-cols-8 gap-1.5">
                {[
                  '#ef4444', '#f97316', '#eab308', '#22c55e',
                  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
                  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
                  '#f43f5e', '#78716c', '#71717a', '#18181b',
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(editingSlot, c)}
                    className={`aspect-square rounded transition-all hover:scale-110 ${
                      colors[editingSlot as keyof BrandColors] === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                    style={{
                      backgroundColor: c,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom actions */}
      <div className={`p-4 border-t space-y-3 flex-shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        {/* Apply to All Widgets Button */}
        {hasAnyColors && (
          <button
            onClick={onApplyToAllWidgets}
            className="w-full py-2.5 rounded-lg text-sm font-['Inter'] font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply to All Sections
          </button>
        )}

        {/* Info text */}
        <p className={`text-[10px] font-['Inter'] text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Click a column to set color
        </p>
      </div>
    </div>
  );
}

/**
 * Uploads Panel
 */
interface UploadsPanelProps {
  theme: string;
  onAddImage?: (url: string, name: string) => void;
}

function UploadsPanel({ theme, onAddImage }: UploadsPanelProps) {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    uploads,
    isLoading,
    isUploading,
    error,
    uploadImage,
    deleteUpload,
    validateFile,
    formatFileSize,
  } = useUserUploads();

  // Handle file selection
  const handleFileSelect = async (files: FileList) => {
    const fileList = Array.from(files);

    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        continue;
      }

      try {
        await uploadImage(file);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFileSelect(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Handle image click - add to canvas
  const handleImageClick = (upload: UserUpload) => {
    onAddImage?.(upload.public_url, upload.file_name);
  };

  // Handle delete
  const handleDelete = async (upload: UserUpload, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === upload.id) {
      try {
        await deleteUpload(upload.id, upload.file_path);
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    } else {
      setDeleteConfirm(upload.id);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Upload Area */}
      <div
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full py-6 rounded-lg border-2 border-dashed transition-all cursor-pointer
          ${dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : isDark
              ? 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
              : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <div className="text-center">
            <Loader2 className={`w-8 h-8 mx-auto mb-2 animate-spin ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
            <p className={`text-sm font-['Inter'] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Uploading...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <CloudUpload className={`w-8 h-8 mx-auto mb-2 ${
              dragOver ? 'text-blue-500' : isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`} />
            <p className={`text-sm font-['Inter'] ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              Upload images
            </p>
            <p className={`text-xs font-['Inter'] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              or drag and drop
            </p>
          </div>
        )}
      </div>

      {/* File constraints info */}
      <p className={`text-[10px] font-['Inter'] text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
        JPG, PNG, GIF, WebP - Max 5MB
      </p>

      {/* Error Message */}
      {error && (
        <div className={`p-3 rounded-lg flex items-start gap-2 ${
          isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className={`text-xs font-['Inter'] ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
        </div>
      )}

      {/* Uploads Grid */}
      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          isDark ? 'text-zinc-500' : 'text-zinc-500'
        }`}>
          Your Images {uploads.length > 0 && `(${uploads.length})`}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          </div>
        ) : uploads.length === 0 ? (
          <div className={`text-center py-8 rounded-lg ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-100'}`}>
            <ImageIcon className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
            <p className={`text-sm font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              No images yet
            </p>
            <p className={`text-xs font-['Inter'] mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Upload images to use in your designs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {uploads.map((upload: UserUpload) => (
              <div
                key={upload.id}
                onClick={() => handleImageClick(upload)}
                className={`
                  group relative aspect-square rounded-lg overflow-hidden cursor-pointer
                  border-2 transition-all
                  ${isDark
                    ? 'border-zinc-700 hover:border-blue-500'
                    : 'border-zinc-200 hover:border-blue-500'
                  }
                `}
              >
                {/* Thumbnail */}
                <img
                  src={upload.public_url}
                  alt={upload.file_name}
                  className="w-full h-full object-cover"
                />

                {/* Hover Overlay */}
                <div className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-gradient-to-t from-black/80 via-black/30 to-transparent
                  flex flex-col justify-end p-2
                `}>
                  {/* File name */}
                  <p className="text-white text-[10px] font-['Inter'] truncate">
                    {upload.file_name}
                  </p>
                  {upload.file_size && (
                    <p className="text-white/60 text-[9px] font-['Inter']">
                      {formatFileSize(upload.file_size)}
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(upload, e)}
                  className={`
                    absolute top-1 right-1 p-1 rounded-md transition-all
                    ${deleteConfirm === upload.id
                      ? 'bg-red-500 opacity-100'
                      : 'bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-red-500'
                    }
                  `}
                  title={deleteConfirm === upload.id ? 'Click again to confirm' : 'Delete'}
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Local indicator (for demo mode) */}
                {upload.isLocal && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-yellow-500/90">
                    <span className="text-[8px] font-['Inter'] font-bold text-black">
                      LOCAL
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className={`p-3 rounded-lg ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-100'}`}>
        <p className={`text-[10px] font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          Click an image to add it to your canvas
        </p>
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
}

function SiteSettingsModal({ isOpen, onClose, theme, siteSettings, onUpdateSiteSettings }: SiteSettingsModalProps) {
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState<SiteSettingsData>(siteSettings || {
    siteName: '',
    siteDescription: '',
    favicon: '',
    socialImage: '',
    customDomain: '',
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSiteSettings?.(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full max-w-md mx-4 rounded-xl shadow-2xl ${
        isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <h2 className={`text-lg font-semibold font-['Inter'] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Site Settings
          </h2>
          <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
          }`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Site Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 font-['Inter'] uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="My Business"
              className={`w-full px-3 py-2 rounded-lg border text-sm font-['Inter'] ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            />
          </div>

          {/* Site Description */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 font-['Inter'] uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Tagline / Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              placeholder="Your business tagline"
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-['Inter'] resize-none ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            />
          </div>

          {/* Favicon */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 font-['Inter'] uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Favicon
            </label>
            <div className="flex gap-2">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-100'
              }`}>
                {settings.favicon ? (
                  <img src={settings.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  <Globe className={`w-6 h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                )}
              </div>
              <input
                type="text"
                value={settings.favicon}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                placeholder="https://... or upload"
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-['Inter'] ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>

          {/* Social Preview Image */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 font-['Inter'] uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Social Preview Image
            </label>
            <div className={`aspect-video rounded-lg flex items-center justify-center mb-2 ${
              isDark ? 'bg-zinc-800' : 'bg-zinc-100'
            }`}>
              {settings.socialImage ? (
                <img src={settings.socialImage} alt="Social preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className={`w-8 h-8 mx-auto mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                  <span className={`text-xs font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    1200 x 630px recommended
                  </span>
                </div>
              )}
            </div>
            <input
              type="text"
              value={settings.socialImage}
              onChange={(e) => setSettings({ ...settings, socialImage: e.target.value })}
              placeholder="https://... or upload"
              className={`w-full px-3 py-2 rounded-lg border text-sm font-['Inter'] ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            />
          </div>

          {/* Custom Domain */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 font-['Inter'] uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              Custom Domain
            </label>
            <div className="flex gap-2 items-center">
              <Link2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <input
                type="text"
                value={settings.customDomain}
                disabled
                placeholder="yourdomain.com (coming soon)"
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-['Inter'] cursor-not-allowed ${
                  isDark ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                }`}
              />
            </div>
            <p className={`text-[10px] mt-1 font-['Inter'] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Custom domains available in Pro plan
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-2 px-5 py-4 border-t ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-['Inter'] transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-['Inter'] bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
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
            <div className={`text-xs font-semibold uppercase tracking-wider font-['Inter'] ${
              isDark ? 'text-zinc-500' : 'text-zinc-500'
            }`}>
              Pages
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
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
                      relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all
                      ${isActive
                        ? 'bg-blue-600/20 border border-blue-600'
                        : isDark
                          ? 'bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800'
                          : 'bg-white hover:bg-zinc-50 border border-zinc-200'
                      }
                      ${isDragging ? 'opacity-50' : ''}
                    `}
                  >
                    {/* Drag Handle */}
                    {!page.isDefault && (
                      <GripVertical className={`w-3 h-3 flex-shrink-0 cursor-grab ${
                        isDark ? 'text-zinc-600' : 'text-zinc-400'
                      }`} />
                    )}

                    {/* Page Icon */}
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-zinc-900' : 'bg-zinc-100'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-500' : isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
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
                          className={`w-full px-1 py-0.5 rounded text-sm font-['Inter'] ${
                            isDark ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-900'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-['Inter'] truncate ${
                            isActive ? 'text-blue-500' : isDark ? 'text-zinc-200' : 'text-zinc-800'
                          }`}>
                            {page.name}
                          </span>
                          {page.isHomepage && (
                            <span className={`text-[9px] px-1 py-0.5 rounded font-['Inter'] ${
                              isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
                            }`}>
                              HOME
                            </span>
                          )}
                          {page.isDefault && (
                            <span className={`text-[9px] px-1 py-0.5 rounded font-['Inter'] ${
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
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
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
                        className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-50 ${
                          isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleSetHomepage(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Inter'] transition-colors ${
                            isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                          Set as Homepage
                        </button>
                        <button
                          onClick={() => handleDuplicate(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Inter'] transition-colors ${
                            isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Inter'] text-red-500 transition-colors ${
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
            <div className={`py-6 text-center text-sm font-['Inter'] ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              No pages found
            </div>
          )}

          {/* Add Page Button */}
          <button
            onClick={onAddPage}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-3 rounded-lg border-2 border-dashed transition-colors ${
              isDark
                ? 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                : 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-['Inter']">Add Page</span>
          </button>
        </div>

        {/* Templates Section */}
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-3 font-['Inter'] ${
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
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isDark
                      ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    isDark ? 'bg-zinc-900' : 'bg-zinc-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                  </div>
                  <div className={`text-xs font-semibold font-['Inter'] truncate ${
                    isDark ? 'text-zinc-200' : 'text-zinc-800'
                  }`}>
                    {template.name}
                  </div>
                  <div className={`text-[10px] font-['Inter'] mt-0.5 truncate ${
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
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
            isDark
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-['Inter']">Site Settings</span>
        </button>
      </div>

      {/* Site Settings Modal */}
      <SiteSettingsModal
        isOpen={showSiteSettings}
        onClose={() => setShowSiteSettings(false)}
        theme={theme}
        siteSettings={siteSettings}
        onUpdateSiteSettings={onUpdateSiteSettings}
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
  onAddSection?: (type: string) => void;
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
  brandColors?: BrandColors | null;
  onUpdateBrandColors?: (colors: BrandColors) => void;
  onApplyBrandToAllWidgets?: () => void;
  className?: string;
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
  brandColors = null,
  onUpdateBrandColors,
  onApplyBrandToAllWidgets,
  className = '',
}: FreeFormSidebarProps) {
  const [activePanel, setActivePanel] = useState<string | null>('elements');
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';

  // Handle icon click - toggle panel
  const handleNavClick = useCallback((panelId: string) => {
    if (activePanel === panelId) {
      setActivePanel(null);
    } else {
      setActivePanel(panelId);
      setSearchQuery('');
    }
  }, [activePanel]);

  // Handle collapse button click
  const handleCollapse = useCallback(() => {
    setActivePanel(null);
  }, []);

  // Handle add element with centering
  const handleAddElement = useCallback((type: string, optionsOrShapeType?: string | Record<string, unknown>) => {
    if (!onAddElement) return;

    const baseSize = BASE_ELEMENT_SIZES[type] || { width: 200, height: 100 };
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
    const centerY = Math.floor((canvasHeight - scaledHeight) / 2);

    // Build options with brand colors
    const options: Record<string, unknown> = {};
    if (typeof optionsOrShapeType === 'object' && optionsOrShapeType !== null) {
      Object.assign(options, optionsOrShapeType);
    }

    if (brandColors) {
      if (brandColors.primary) {
        options.brandTitleColor = brandColors.primary;
      }
      if (brandColors.secondary) {
        options.brandAccentColor = brandColors.secondary;
      }
      if (brandColors.background) {
        options.brandBackgroundColor = brandColors.background;
      }
    }

    onAddElement(type, centerX, centerY, viewportMode, viewportWidth, canvasHeight, Object.keys(options).length > 0 ? options : undefined);
  }, [onAddElement, viewportWidth, viewportMode, canvasHeight, brandColors]);

  // Get panel title
  const getPanelTitle = (): string => {
    const item = NAV_ITEMS.find(n => n.id === activePanel);
    return item?.label || '';
  };

  // Render panel content
  const renderPanelContent = (): ReactNode => {
    switch (activePanel) {
      case 'elements':
        return (
          <ElementsPanel
            theme={theme}
            searchQuery={searchQuery}
            isPageLocked={isPageLocked}
            onAddSection={onAddSection}
            onAddElement={handleAddElement}
            onDragStart={() => {}}
          />
        );
      case 'text':
        return (
          <TextPanel
            theme={theme}
            searchQuery={searchQuery}
            onAddElement={handleAddElement}
            onDragStart={() => {}}
          />
        );
      case 'brand':
        return (
          <BrandPanel
            theme={theme}
            brandColors={brandColors}
            onUpdateBrandColors={onUpdateBrandColors}
            onApplyToAllWidgets={onApplyBrandToAllWidgets}
          />
        );
      case 'uploads':
        return <UploadsPanel theme={theme} onAddImage={onAddImage} />;
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside className={`flex h-full ${className}`}>
      {/* Icon Rail */}
      <div className={`w-[60px] flex-shrink-0 flex flex-col border-r ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className="flex-1 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  relative w-full flex flex-col items-center justify-center gap-1 py-3 px-1
                  transition-colors group
                  ${isActive
                    ? isDark
                      ? 'text-white'
                      : 'text-zinc-900'
                    : isDark
                      ? 'text-zinc-500 hover:text-zinc-300'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }
                `}
              >
                {/* Active indicator - left bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-blue-500 rounded-r-full" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-['Inter'] leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Panel with slide animation */}
      <div
        className={`
          flex-shrink-0 flex flex-col border-r overflow-hidden
          transition-all duration-300 ease-out
          ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}
        `}
        style={{
          width: activePanel ? '220px' : '0px',
          opacity: activePanel ? 1 : 0,
        }}
      >
        {/* Panel Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <h2 className={`text-sm font-semibold font-['Inter'] ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            {getPanelTitle()}
          </h2>
          <button
            onClick={handleCollapse}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar - Only for panels that need search */}
        {activePanel && !['brand'].includes(activePanel) && (
          <div className="px-4 py-3 flex-shrink-0">
            <SearchInput
              placeholder={`Search ${getPanelTitle().toLowerCase()}...`}
              theme={theme}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        )}

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto min-w-[220px]">
          {renderPanelContent()}
        </div>

        {/* Help text */}
        {(activePanel === 'elements' || activePanel === 'text') && (
          <div className={`px-4 py-3 border-t flex-shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <p className={`text-xs font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Click or drag elements to add
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
