'use client';

/**
 * Free-Form Properties Panel
 * Collapsible section-based properties panel for editing selected elements
 * Sections: Layout, Style, Typography, Animation, Actions
 */

import { useState, useRef, useCallback, useMemo, type ReactNode } from 'react';
import {
  MousePointer, ChevronDown, ChevronRight, Move, RotateCw, Type as TypeIcon,
  Paintbrush, Sun, Copy, Layers, Trash2, ArrowUp, ArrowDown,
  Upload, X, Instagram, Twitter, Youtube, Facebook, Music2, Play, Sparkles, Lock,
  Plus, GripVertical, Mail, Phone, AlignLeft, CheckSquare,
  FlipHorizontal, FlipVertical, Image, Contrast, Edit3
} from 'lucide-react';
import { FONT_LIBRARY, loadGoogleFont, ELEMENT_ANIMATIONS, ANIMATION_SPEEDS, getAnimationById } from '@/hooks/useFreeFormEditor';
import type { EditorElement, Section, AnimationConfig } from '@/hooks/useFreeFormEditor';
import AnimationPickerModal from './AnimationPickerModal';
import ImageEditorModal from './ImageEditorModal';

// ---------------------------------------------------------------------------
// Shared sub-component prop types
// ---------------------------------------------------------------------------

interface ThemeProps {
  theme?: 'dark' | 'light';
}

interface CollapsibleSectionProps extends ThemeProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function CollapsibleSection({ title, icon: Icon, isOpen, onToggle, children, theme = 'dark' }: CollapsibleSectionProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />}
          <span className={`text-xs font-semibold font-['Inter'] uppercase tracking-wider ${
            isDark ? 'text-zinc-300' : 'text-zinc-700'
          }`}>
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        ) : (
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Property Input
// ---------------------------------------------------------------------------

interface PropertyInputProps extends ThemeProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}

function PropertyInput({ label, value, onChange, type = 'text', min, max, step, theme = 'dark' }: PropertyInputProps) {
  const isDark = theme === 'dark';

  if (type === 'number') {
    return (
      <SliderInput
        label={label}
        value={Number(value) || 0}
        onChange={onChange as (v: number) => void}
        min={min}
        max={max}
        step={step}
        theme={theme}
      />
    );
  }

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm font-['Inter']
          focus:outline-none focus:ring-2 focus:ring-[--editor-accent] focus:border-transparent
          ${isDark
            ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
            : 'bg-white border-zinc-300 text-zinc-800'
          }
        `}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider Input
// ---------------------------------------------------------------------------

interface SliderInputProps extends ThemeProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, theme = 'dark', unit = '' }: SliderInputProps) {
  const isDark = theme === 'dark';
  const numValue = Number(value) || 0;

  const getDefaults = () => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('x') || lowerLabel.includes('y')) {
      return { min: 0, max: 1200, step: 1, unit: 'px' };
    }
    if (lowerLabel.includes('width')) {
      return { min: 20, max: 1200, step: 1, unit: 'px' };
    }
    if (lowerLabel.includes('height')) {
      return { min: 20, max: 800, step: 1, unit: 'px' };
    }
    if (lowerLabel.includes('font size')) {
      return { min: 8, max: 120, step: 1, unit: 'px' };
    }
    if (lowerLabel.includes('line height')) {
      return { min: 0.5, max: 3, step: 0.1, unit: '' };
    }
    if (lowerLabel.includes('letter') || lowerLabel.includes('spacing')) {
      return { min: -5, max: 20, step: 0.5, unit: 'px' };
    }
    if (lowerLabel.includes('radius')) {
      return { min: 0, max: 100, step: 1, unit: 'px' };
    }
    if (lowerLabel.includes('thickness')) {
      return { min: 1, max: 20, step: 1, unit: 'px' };
    }
    return { min, max, step, unit };
  };

  const defaults = getDefaults();
  const finalMin = min ?? defaults.min;
  const finalMax = max ?? defaults.max;
  const finalStep = step ?? defaults.step;
  const finalUnit = unit || defaults.unit;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-medium font-['Inter'] uppercase tracking-wider ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          {label}
        </label>
        <span className={`text-xs font-['Inter'] font-medium ${
          isDark ? 'text-zinc-300' : 'text-zinc-700'
        }`}>
          {numValue}{finalUnit}
        </span>
      </div>
      <input
        type="range"
        value={numValue}
        onChange={(e) => onChange(Number(e.target.value))}
        min={finalMin}
        max={finalMax}
        step={finalStep}
        className={`
          w-full h-2 rounded-full appearance-none cursor-pointer
          ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[--editor-accent]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:hover:brightness-110
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[--editor-accent]
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
        `}
      />
      <div className={`flex justify-between mt-1 text-[10px] font-['Inter'] ${
        isDark ? 'text-zinc-600' : 'text-zinc-400'
      }`}>
        <span>{finalMin}{finalUnit}</span>
        <span>{finalMax}{finalUnit}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rotation Control
// ---------------------------------------------------------------------------

interface RotationControlProps extends ThemeProps {
  value: number;
  onChange: (value: number) => void;
}

function RotationControl({ value, onChange, theme = 'dark' }: RotationControlProps) {
  const isDark = theme === 'dark';
  const rotation = value || 0;
  const controlRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!controlRef.current) return;
      const rect = controlRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      if (moveEvent.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      }
      onChange(Math.round(angle));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onChange]);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-medium font-['Inter'] uppercase tracking-wider ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          Rotation
        </label>
        <span className={`text-xs font-['Inter'] font-medium ${
          isDark ? 'text-zinc-300' : 'text-zinc-700'
        }`}>
          {rotation}°
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div
          ref={controlRef}
          className={`relative w-14 h-14 rounded-full cursor-grab flex-shrink-0 ${
            isDragging ? 'cursor-grabbing' : ''
          } ${isDark ? 'bg-zinc-800 border-2 border-zinc-700' : 'bg-zinc-100 border-2 border-zinc-300'}`}
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute top-1/2 left-1/2 w-5 h-0.5 editor-accent-bg origin-left"
            style={{ transform: `translateY(-50%) rotate(${rotation - 90}deg)` }}
          />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 editor-accent-bg rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <input
          type="number"
          value={rotation}
          onChange={(e) => onChange(Number(e.target.value) % 360)}
          min={0}
          max={360}
          className={`flex-1 px-3 py-2 border rounded-lg text-sm font-['Inter'] ${
            isDark
              ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
              : 'bg-white border-zinc-300 text-zinc-800'
          }`}
        />
      </div>
      <div className="flex gap-1 mt-2">
        {[0, 45, 90, 180, 270].map((deg) => (
          <button
            key={deg}
            onClick={() => onChange(deg)}
            className={`flex-1 py-1 text-[10px] font-['Inter'] rounded transition-colors ${
              rotation === deg
                ? 'editor-accent-active'
                : isDark
                  ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800'
            }`}
          >
            {deg}°
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

interface ToggleSwitchProps extends ThemeProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSwitch({ label, value, onChange, theme = 'dark' }: ToggleSwitchProps) {
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between mb-3">
      <label className={`text-xs font-medium font-['Inter'] uppercase tracking-wider ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        {label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          value
            ? 'editor-accent-bg'
            : isDark ? 'bg-zinc-700' : 'bg-zinc-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Property Textarea
// ---------------------------------------------------------------------------

interface PropertyTextareaProps extends ThemeProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

function PropertyTextarea({ label, value, onChange, theme = 'dark' }: PropertyTextareaProps) {
  const isDark = theme === 'dark';

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        {label}
      </label>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm font-['Inter'] resize-none
          focus:outline-none focus:ring-2 focus:ring-[--editor-accent] focus:border-transparent
          ${isDark
            ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
            : 'bg-white border-zinc-300 text-zinc-800'
          }
        `}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Font Family Select
// ---------------------------------------------------------------------------

interface FontFamilySelectProps extends ThemeProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

function FontFamilySelect({ value, onChange, theme = 'dark' }: FontFamilySelectProps) {
  const isDark = theme === 'dark';
  const categories = ['Sans Serif', 'Serif', 'Monospace', 'Display'];

  const handleChange = (newValue: string) => {
    loadGoogleFont(newValue);
    onChange(newValue);
  };

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        Font Family
      </label>
      <select
        value={value || 'Inter'}
        onChange={(e) => handleChange(e.target.value)}
        style={{ fontFamily: value || 'Inter' }}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-[--editor-accent] focus:border-transparent
          ${isDark
            ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
            : 'bg-white border-zinc-300 text-zinc-800'
          }
        `}
      >
        {categories.map(category => (
          <optgroup key={category} label={category}>
            {FONT_LIBRARY.filter(f => f.category === category).map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color Picker
// ---------------------------------------------------------------------------

interface ColorPickerProps extends ThemeProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange, theme = 'dark' }: ColorPickerProps) {
  const isDark = theme === 'dark';
  const colorValue = value ?? '#ffffff';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-medium font-['Inter'] uppercase tracking-wider ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          {label}
        </label>
        <span className={`text-[10px] font-['Inter'] ${
          isDark ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          {colorValue}
        </span>
      </div>
      <div className="relative">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0 z-10"
        />
        <div
          className={`w-full h-10 rounded-lg pointer-events-none border-2 ${
            isDark ? 'border-zinc-600' : 'border-zinc-400'
          } shadow-sm`}
          style={{ backgroundColor: colorValue }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image Drop Zone
// ---------------------------------------------------------------------------

interface ImageDropZoneProps extends ThemeProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

function ImageDropZone({ label, value, onChange, theme = 'dark' }: ImageDropZoneProps) {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        {label}
      </label>

      {value ? (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="w-full h-24 object-cover rounded-lg border-2 border-zinc-700"
            />
            <button
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-2 px-3 rounded-lg text-xs font-['Inter'] font-medium transition-colors flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Replace Image
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full h-24 rounded-lg border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-colors
            ${isDragOver
              ? 'editor-accent-border editor-accent-active'
              : isDark
                ? 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50'
                : 'border-zinc-300 hover:border-zinc-400 bg-zinc-100'
            }
          `}
        >
          <Upload className={`w-6 h-6 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <span className={`text-xs font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Drop image or click
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Element-specific property components
// ---------------------------------------------------------------------------

interface ElementPropertiesProps extends ThemeProps {
  properties: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
  accentColor?: string;
}

function HeadingProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  return (
    <>
      <PropertyTextarea
        label="Text"
        value={properties.content as string}
        onChange={(v) => onChange({ content: v })}
        theme={theme}
      />
      <ColorPicker
        label="Color"
        value={properties.color as string}
        onChange={(v) => onChange({ color: v })}
        theme={theme}
      />
    </>
  );
}

function TextProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  return (
    <>
      <PropertyTextarea
        label="Text"
        value={properties.content as string}
        onChange={(v) => onChange({ content: v })}
        theme={theme}
      />
      <ColorPicker
        label="Color"
        value={properties.color as string}
        onChange={(v) => onChange({ color: v })}
        theme={theme}
      />
    </>
  );
}

function QuoteProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  const isDark = theme === 'dark';
  return (
    <>
      <PropertyTextarea
        label="Quote Text"
        value={properties.content as string}
        onChange={(v) => onChange({ content: v })}
        theme={theme}
      />
      <ColorPicker
        label="Text Color"
        value={properties.color as string}
        onChange={(v) => onChange({ color: v })}
        theme={theme}
      />
      <div className="mb-3">
        <label className={`flex items-center gap-2 text-xs font-medium font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input
            type="checkbox"
            checked={!!properties.showQuoteIcon}
            onChange={(e) => onChange({ showQuoteIcon: e.target.checked })}
            className="rounded"
          />
          Show Quote Icon
        </label>
      </div>
      {properties.showQuoteIcon && (
        <ColorPicker
          label="Quote Icon Color"
          value={properties.quoteIconColor as string}
          onChange={(v) => onChange({ quoteIconColor: v })}
          theme={theme}
        />
      )}
    </>
  );
}

const FRAME_TYPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'oval', label: 'Oval' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'phone', label: 'Phone' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'polaroid', label: 'Polaroid' },
];

function FrameProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  const isDark = theme === 'dark';
  return (
    <>
      <div className="mb-3">
        <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Frame Shape
        </label>
        <select
          value={(properties.frameType as string) || 'circle'}
          onChange={(e) => onChange({ frameType: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg text-sm font-['Inter'] ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
          }`}
        >
          {FRAME_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <ImageDropZone label="Image" value={properties.imageSrc as string} onChange={(v) => onChange({ imageSrc: v })} theme={theme} />
      <ColorPicker label="Border Color" value={properties.borderColor as string} onChange={(v) => onChange({ borderColor: v })} theme={theme} />
      <SliderInput label="Border Width" value={(properties.borderWidth as number) || 0} onChange={(v) => onChange({ borderWidth: v })} min={0} max={10} step={1} unit="px" theme={theme} />
      <ToggleSwitch label="Shadow" value={!!properties.shadowEnabled} onChange={(v) => onChange({ shadowEnabled: v })} theme={theme} />
      {properties.shadowEnabled && (
        <>
          <ColorPicker label="Shadow Color" value={properties.shadowColor as string} onChange={(v) => onChange({ shadowColor: v })} theme={theme} />
          <SliderInput label="Shadow Blur" value={(properties.shadowBlur as number) || 12} onChange={(v) => onChange({ shadowBlur: v })} min={0} max={50} step={1} unit="px" theme={theme} />
        </>
      )}
    </>
  );
}

const GRID_TYPES = [
  { value: '2-up', label: '2-Up (Side by Side)' },
  { value: '3-up', label: '3-Up (Row)' },
  { value: '4-grid', label: '4 Grid (2x2)' },
  { value: '6-grid', label: '6 Grid (3x2)' },
  { value: 'collage', label: 'Collage' },
  { value: 'masonry', label: 'Masonry' },
];

function GridProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  const isDark = theme === 'dark';
  const cells = (properties.cells as Array<{ imageSrc?: string }>) || [];
  const getCellCount = (gridType: string) => {
    const counts: Record<string, number> = { '2-up': 2, '3-up': 3, '4-grid': 4, '6-grid': 6, 'collage': 3, 'masonry': 6 };
    return counts[gridType] || 4;
  };
  const cellCount = getCellCount((properties.gridType as string) || '2-up');

  return (
    <>
      <div className="mb-3">
        <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Grid Layout
        </label>
        <select
          value={(properties.gridType as string) || '2-up'}
          onChange={(e) => onChange({ gridType: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg text-sm font-['Inter'] ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
          }`}
        >
          {GRID_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <SliderInput label="Gap" value={(properties.gap as number) || 8} onChange={(v) => onChange({ gap: v })} min={0} max={32} step={1} unit="px" theme={theme} />
      <SliderInput label="Corner Radius" value={(properties.borderRadius as number) || 8} onChange={(v) => onChange({ borderRadius: v })} min={0} max={32} step={1} unit="px" theme={theme} />
      <ColorPicker label="Background" value={(properties.backgroundColor as string) || 'transparent'} onChange={(v) => onChange({ backgroundColor: v })} theme={theme} />
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Cell Images ({cellCount} cells)
        </h4>
        <div className="space-y-3">
          {Array.from({ length: cellCount }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`text-xs font-['Inter'] w-8 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>#{i + 1}</span>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Image URL or upload"
                  value={cells[i]?.imageSrc || ''}
                  onChange={(e) => {
                    const newCells = [...cells];
                    newCells[i] = { ...newCells[i], imageSrc: e.target.value };
                    onChange({ cells: newCells });
                  }}
                  className={`w-full px-2 py-1.5 border rounded text-xs font-['Inter'] ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ButtonProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  return (
    <>
      <PropertyInput label="Button Text" value={properties.content as string} onChange={(v) => onChange({ content: v })} theme={theme} />
      <ColorPicker label="Background" value={properties.backgroundColor as string} onChange={(v) => onChange({ backgroundColor: v })} theme={theme} />
      <ColorPicker label="Text Color" value={properties.color as string} onChange={(v) => onChange({ color: v })} theme={theme} />
      <PropertyInput label="Border Radius" type="number" value={properties.borderRadius as number} onChange={(v) => onChange({ borderRadius: v })} min={0} max={50} theme={theme} />
    </>
  );
}

const IMAGE_SHAPES = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'oval', label: 'Oval' },
];

const FIT_MODES = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
];

const OBJECT_POSITIONS = [
  ['top left', 'top center', 'top right'],
  ['center left', 'center', 'center right'],
  ['bottom left', 'bottom center', 'bottom right'],
];

const BORDER_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

function ImageProperties({ properties, onChange, theme, accentColor = '#E11D48' }: ElementPropertiesProps) {
  const isDark = theme === 'dark';
  const [showImageEditor, setShowImageEditor] = useState(false);

  const handleReplaceImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => onChange({ src: ev.target?.result as string });
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <>
      {/* IMAGE SECTION */}
      <div className={`mb-4 pb-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider flex items-center gap-2 ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          <Image className="w-3.5 h-3.5" />
          Image
        </h4>

        {!properties.src && (
          <ImageDropZone label="Image" value={properties.src as string} onChange={(v) => onChange({ src: v })} theme={theme} />
        )}

        {!!properties.src && (
          <>
            <div className={`relative mb-3 rounded-lg overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <img src={properties.src as string} alt={(properties.alt as string) || 'Preview'} className="w-full h-24 object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleReplaceImage}
                className={`py-2 rounded-lg text-xs font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300'
                }`}
              >
                <RotateCw className="w-3 h-3" />
                Replace
              </button>
              <button
                onClick={() => setShowImageEditor(true)}
                className={`py-2 rounded-lg text-xs font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>
          </>
        )}

        <PropertyInput label="Alt Text" value={properties.alt as string} onChange={(v) => onChange({ alt: v })} theme={theme} />

        {/* Fit Mode */}
        <div className="mb-3">
          <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Fit Mode</label>
          <div className="grid grid-cols-4 gap-1">
            {FIT_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onChange({ objectFit: mode.value })}
                className={`py-1.5 rounded text-[10px] font-['Inter'] transition-colors ${
                  properties.objectFit === mode.value ? 'editor-accent-active' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Object Position Grid */}
        <div className="mb-3">
          <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Position</label>
          <div className={`inline-grid grid-cols-3 gap-0.5 p-1 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            {OBJECT_POSITIONS.map((row) =>
              row.map((pos) => (
                <button
                  key={pos}
                  onClick={() => onChange({ objectPosition: pos })}
                  className={`w-6 h-6 rounded transition-colors ${
                    properties.objectPosition === pos ? 'editor-accent-bg' : isDark ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-200 hover:bg-zinc-300'
                  }`}
                  title={pos}
                />
              ))
            )}
          </div>
        </div>

        {/* Flip toggles */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onChange({ flipHorizontal: !properties.flipHorizontal })}
            className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${
              properties.flipHorizontal ? 'editor-accent-active border editor-accent-border' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800 border border-zinc-300'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            Flip H
          </button>
          <button
            onClick={() => onChange({ flipVertical: !properties.flipVertical })}
            className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${
              properties.flipVertical ? 'editor-accent-active border editor-accent-border' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800 border border-zinc-300'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            Flip V
          </button>
        </div>
      </div>

      {/* STYLE SECTION */}
      <div className={`mb-4 pb-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <Paintbrush className="w-3.5 h-3.5" />
          Style
        </h4>

        {/* Shape */}
        <div className="mb-3">
          <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Shape</label>
          <div className="grid grid-cols-4 gap-2">
            {IMAGE_SHAPES.map((shape) => (
              <button
                key={shape.value}
                onClick={() => onChange({ shape: shape.value })}
                className={`p-2 rounded-lg border-2 transition-colors flex flex-col items-center gap-1.5 ${
                  properties.shape === shape.value ? 'editor-accent-border editor-accent-active' : isDark ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-300 hover:border-zinc-400'
                }`}
              >
                <div
                  className={`w-6 h-6 ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}
                  style={{
                    borderRadius: shape.value === 'rounded' ? 6 : shape.value === 'circle' ? '50%' : 0,
                    clipPath: shape.value === 'oval' ? 'ellipse(50% 40% at 50% 50%)' : undefined,
                  }}
                />
                <span className={`text-[10px] font-['Inter'] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {properties.shape === 'rounded' && (
          <SliderInput label="Corner Radius" value={(properties.borderRadius as number) || 16} onChange={(v) => onChange({ borderRadius: v })} min={0} max={100} step={1} unit="px" theme={theme} />
        )}

        {/* Border */}
        <div className="mb-3">
          <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Border</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {BORDER_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => onChange({ borderStyle: style.value })}
                className={`py-1.5 rounded text-[10px] font-['Inter'] transition-colors ${
                  properties.borderStyle === style.value ? 'editor-accent-active' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Width</label>
              <input
                type="number"
                value={(properties.borderWidth as number) || 0}
                onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
                min={0}
                max={20}
                className={`w-full px-2 py-1.5 border rounded text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Color</label>
              <input
                type="color"
                value={(properties.borderColor as string) || '#000000'}
                onChange={(e) => onChange({ borderColor: e.target.value })}
                className={`w-full h-[34px] rounded border cursor-pointer ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Shadow */}
        <ToggleSwitch label="Shadow" value={!!properties.shadowEnabled} onChange={(v) => onChange({ shadowEnabled: v })} theme={theme} />
        {!!properties.shadowEnabled && (
          <div className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>X Offset</label>
                <input type="number" value={(properties.shadowX as number) || 0} onChange={(e) => onChange({ shadowX: Number(e.target.value) })} className={`w-full px-2 py-1 border rounded text-xs font-['Inter'] ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Y Offset</label>
                <input type="number" value={(properties.shadowY as number) || 4} onChange={(e) => onChange({ shadowY: Number(e.target.value) })} className={`w-full px-2 py-1 border rounded text-xs font-['Inter'] ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Blur</label>
                <input type="number" value={(properties.shadowBlur as number) || 12} onChange={(e) => onChange({ shadowBlur: Number(e.target.value) })} min={0} className={`w-full px-2 py-1 border rounded text-xs font-['Inter'] ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Color</label>
                <input type="color" value={(properties.shadowColor as string) || '#000000'} onChange={(e) => onChange({ shadowColor: e.target.value })} className={`w-full h-[26px] rounded border cursor-pointer ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <Contrast className="w-3.5 h-3.5" />
          Filters
        </h4>
        <SliderInput label="Brightness" value={(properties.brightness as number) ?? 100} onChange={(v) => onChange({ brightness: v })} min={0} max={200} step={1} unit="%" theme={theme} />
        <SliderInput label="Contrast" value={(properties.contrast as number) ?? 100} onChange={(v) => onChange({ contrast: v })} min={0} max={200} step={1} unit="%" theme={theme} />
        <SliderInput label="Saturation" value={(properties.saturation as number) ?? 100} onChange={(v) => onChange({ saturation: v })} min={0} max={200} step={1} unit="%" theme={theme} />
        <SliderInput label="Blur" value={(properties.blur as number) ?? 0} onChange={(v) => onChange({ blur: v })} min={0} max={20} step={0.5} unit="px" theme={theme} />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <ToggleSwitch label="Grayscale" value={!!properties.grayscale} onChange={(v) => onChange({ grayscale: v })} theme={theme} />
          <ToggleSwitch label="Sepia" value={!!properties.sepia} onChange={(v) => onChange({ sepia: v })} theme={theme} />
        </div>
        <button
          onClick={() => onChange({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false, sepia: false })}
          className={`w-full mt-3 py-2 rounded-lg text-xs font-['Inter'] font-medium transition-colors ${
            isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 border border-zinc-300'
          }`}
        >
          Reset Filters
        </button>
      </div>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        imageSrc={properties.src as string}
        currentProperties={properties}
        onApply={(changes) => onChange(changes as unknown as Record<string, unknown>)}
        theme={theme}
        accentColor={accentColor}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Form Properties
// ---------------------------------------------------------------------------

interface FormFieldType {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FORM_FIELD_TYPES: FormFieldType[] = [
  { value: 'text', label: 'Text Input', icon: TypeIcon },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'textarea', label: 'Text Area', icon: AlignLeft },
  { value: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
];

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

function FormProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  const isDark = theme === 'dark';
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const fields = (properties.fields as FormField[]) || [];

  const handleAddField = (fieldType: string) => {
    const fieldId = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newField: FormField = {
      id: fieldId,
      type: fieldType,
      label: FORM_FIELD_TYPES.find(f => f.value === fieldType)?.label || 'New Field',
      placeholder: '',
      required: false,
      options: fieldType === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
    };
    onChange({ fields: [...fields, newField] });
    setShowAddField(false);
    setExpandedField(newField.id);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange({ fields: fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) });
  };

  const handleDeleteField = (fieldId: string) => {
    onChange({ fields: fields.filter(f => f.id !== fieldId) });
    if (expandedField === fieldId) setExpandedField(null);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange({ fields: newFields });
  };

  return (
    <>
      <PropertyInput label="Form Title" value={properties.formTitle as string} onChange={(v) => onChange({ formTitle: v })} theme={theme} />
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className={`text-xs font-medium font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Form Fields ({fields.length})
          </label>
          <button
            onClick={() => setShowAddField(!showAddField)}
            className={`p-1.5 rounded-lg transition-colors ${showAddField ? 'editor-accent-bg text-white' : isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showAddField && (
          <div className={`mb-3 p-2 rounded-lg border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
            <p className={`text-xs font-['Inter'] mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Select field type:</p>
            <div className="grid grid-cols-2 gap-1">
              {FORM_FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.value}
                    onClick={() => handleAddField(fieldType.value)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-['Inter'] transition-colors ${isDark ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-200 text-zinc-700'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {fieldType.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {fields.length === 0 ? (
          <div className={`py-6 text-center border-2 border-dashed rounded-lg ${isDark ? 'border-zinc-700 text-zinc-500' : 'border-zinc-300 text-zinc-400'}`}>
            <p className="text-xs font-['Inter']">No fields yet</p>
            <p className="text-xs font-['Inter'] mt-1">Click + to add a field</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => {
              const FieldIcon = FORM_FIELD_TYPES.find(f => f.value === field.type)?.icon || TypeIcon;
              const isExpanded = expandedField === field.id;
              return (
                <div key={field.id} className={`rounded-lg border transition-colors ${isExpanded ? isDark ? 'editor-accent-border bg-zinc-800' : 'editor-accent-border bg-zinc-50' : isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-200 bg-white'}`}>
                  <div className="flex items-center gap-2 px-2 py-2 cursor-pointer" onClick={() => setExpandedField(isExpanded ? null : field.id)}>
                    <GripVertical className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    <FieldIcon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
                    <span className={`flex-1 text-xs font-['Inter'] truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{field.label}</span>
                    {field.required && <span className="text-red-500 text-xs">*</span>}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
                  </div>
                  {isExpanded && (
                    <div className={`px-3 pb-3 pt-1 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                      <div className="mb-2">
                        <label className={`block text-[10px] font-['Inter'] mb-1 text-zinc-500`}>Label</label>
                        <input type="text" value={field.label} onChange={(e) => handleUpdateField(field.id, { label: e.target.value })} className={`w-full px-2 py-1.5 rounded text-xs font-['Inter'] border ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
                      </div>
                      {field.type !== 'checkbox' && (
                        <div className="mb-2">
                          <label className={`block text-[10px] font-['Inter'] mb-1 text-zinc-500`}>Placeholder</label>
                          <input type="text" value={field.placeholder || ''} onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })} className={`w-full px-2 py-1.5 rounded text-xs font-['Inter'] border ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
                        </div>
                      )}
                      {field.type === 'dropdown' && (
                        <div className="mb-2">
                          <label className={`block text-[10px] font-['Inter'] mb-1 text-zinc-500`}>Options (one per line)</label>
                          <textarea
                            value={(field.options || []).join('\n')}
                            onChange={(e) => { const options = e.target.value.split('\n').filter(opt => opt.trim()); handleUpdateField(field.id, { options }); }}
                            rows={3}
                            className={`w-full px-2 py-1.5 rounded text-xs font-['Inter'] border resize-none ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-['Inter'] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Required</span>
                        <button
                          onClick={() => handleUpdateField(field.id, { required: !field.required })}
                          className={`relative w-8 h-4 rounded-full transition-colors ${field.required ? 'editor-accent-bg' : isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow ${field.required ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleMoveField(index, 'up')} disabled={index === 0} className={`p-1 rounded transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`} title="Move up">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleMoveField(index, 'down')} disabled={index === fields.length - 1} className={`p-1 rounded transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-600'}`} title="Move down">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex-1" />
                        <button onClick={() => handleDeleteField(field.id)} className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`} title="Delete field">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={`pt-3 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <PropertyInput label="Submit Button Text" value={properties.submitButtonText as string} onChange={(v) => onChange({ submitButtonText: v })} theme={theme} />
        <PropertyInput label="Success Message" value={properties.successMessage as string} onChange={(v) => onChange({ successMessage: v })} theme={theme} />
      </div>

      <div className={`pt-3 mt-3 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Styling</h4>
        <ColorPicker label="Background" value={properties.backgroundColor as string} onChange={(v) => onChange({ backgroundColor: v })} theme={theme} />
        <ColorPicker label="Border Color" value={properties.borderColor as string} onChange={(v) => onChange({ borderColor: v })} theme={theme} />
        <SliderInput label="Border Radius" value={(properties.borderRadius as number) || 12} onChange={(v) => onChange({ borderRadius: v })} min={0} max={32} theme={theme} />
      </div>

      <div className={`pt-3 mt-3 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Submit Button</h4>
        <ColorPicker label="Button Background" value={properties.buttonBackgroundColor as string} onChange={(v) => onChange({ buttonBackgroundColor: v })} theme={theme} />
        <ColorPicker label="Button Text Color" value={properties.buttonTextColor as string} onChange={(v) => onChange({ buttonTextColor: v })} theme={theme} />
        <SliderInput label="Button Radius" value={(properties.buttonBorderRadius as number) || 8} onChange={(v) => onChange({ buttonBorderRadius: v })} min={0} max={24} theme={theme} />
      </div>

      <div className={`pt-3 mt-3 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <FontFamilySelect value={properties.fontFamily as string} onChange={(v) => onChange({ fontFamily: v })} theme={theme} />
      </div>
    </>
  );
}

function DividerProperties({ properties, onChange, theme }: ElementPropertiesProps) {
  return (
    <>
      <ColorPicker label="Color" value={properties.color as string} onChange={(v) => onChange({ color: v })} theme={theme} />
      <PropertyInput label="Thickness" type="number" value={properties.thickness as number} onChange={(v) => onChange({ thickness: v })} min={1} max={10} theme={theme} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Header / Footer / Canvas Properties
// ---------------------------------------------------------------------------

interface ConfigPropertiesProps extends ThemeProps {
  config: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
}

function HeaderProperties({ config, onChange, theme }: ConfigPropertiesProps) {
  const isDark = theme === 'dark';
  return (
    <>
      <PropertyInput label="Business Name" value={config.storeName as string || ''} onChange={(v) => onChange({ storeName: v })} theme={theme} />
      <ColorPicker label="Name Color" value={(config.storeNameColor as string) || (isDark ? '#ffffff' : '#18181b')} onChange={(v) => onChange({ storeNameColor: v })} theme={theme} />
      <div className="mb-3">
        <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Name Font</label>
        <select
          value={(config.storeNameFont as string) || 'Inter'}
          onChange={(e) => onChange({ storeNameFont: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`}
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
      </div>
      <div className="mb-3">
        <label className={`flex items-center gap-2 text-xs font-medium font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input type="checkbox" checked={!!config.showLogo} onChange={(e) => onChange({ showLogo: e.target.checked })} className="rounded" />
          Use Logo Instead
        </label>
      </div>
      {config.showLogo && <ImageDropZone label="Logo Image" value={(config.logoUrl as string) || ''} onChange={(v) => onChange({ logoUrl: v })} theme={theme} />}
      <ColorPicker label="Background Color" value={(config.backgroundColor as string) || (isDark ? '#18181b' : '#ffffff')} onChange={(v) => onChange({ backgroundColor: v })} theme={theme} />
      <ColorPicker label="Link Text Color" value={(config.linkColor as string) || (isDark ? '#a1a1aa' : '#52525b')} onChange={(v) => onChange({ linkColor: v })} theme={theme} />
      <ColorPicker label="Icon Color" value={(config.iconColor as string) || (isDark ? '#a1a1aa' : '#52525b')} onChange={(v) => onChange({ iconColor: v })} theme={theme} />
    </>
  );
}

interface SocialIconToggleProps extends ThemeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  enabled: boolean;
  url: string;
  onToggle: (value: boolean) => void;
  onUrlChange: (value: string) => void;
}

function SocialIconToggle({ icon: Icon, label, enabled, url, onToggle, onUrlChange, theme }: SocialIconToggleProps) {
  const isDark = theme === 'dark';
  return (
    <div className={`mb-3 p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-4 h-4 ${enabled ? 'editor-accent-text' : isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        <label className={`flex-1 flex items-center gap-2 text-xs font-medium font-['Inter'] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="rounded editor-accent-text" />
          {label}
        </label>
      </div>
      {enabled && (
        <input
          type="url"
          value={url || ''}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={`${label} URL`}
          className={`w-full px-3 py-2 rounded text-xs font-['Inter'] ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-300 text-zinc-700'} border`}
        />
      )}
    </div>
  );
}

function FooterProperties({ config, onChange, theme }: ConfigPropertiesProps) {
  const isDark = theme === 'dark';
  const socialIcons = (config.socialIcons as Record<string, { enabled: boolean; url: string }>) || {
    instagram: { enabled: true, url: '' },
    twitter: { enabled: true, url: '' },
    youtube: { enabled: true, url: '' },
    facebook: { enabled: false, url: '' },
  };

  const updateSocialIcon = (platform: string, updates: Partial<{ enabled: boolean; url: string }>) => {
    onChange({
      socialIcons: { ...socialIcons, [platform]: { ...socialIcons[platform], ...updates } },
    });
  };

  return (
    <>
      <PropertyInput label="Business Name" value={(config.storeName as string) || ''} onChange={(v) => onChange({ storeName: v })} theme={theme} />
      <div className="mb-3">
        <label className={`flex items-center gap-2 text-xs font-medium font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input type="checkbox" checked={config.showStoreName !== false} onChange={(e) => onChange({ showStoreName: e.target.checked })} className="rounded" />
          Show Business Name
        </label>
      </div>
      <div className="mb-3">
        <label className={`flex items-center gap-2 text-xs font-medium font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input type="checkbox" checked={!!config.showLogo} onChange={(e) => onChange({ showLogo: e.target.checked })} className="rounded" />
          Add Logo
        </label>
      </div>
      {config.showLogo && <ImageDropZone label="Logo Image" value={(config.logoUrl as string) || ''} onChange={(v) => onChange({ logoUrl: v })} theme={theme} />}
      <PropertyInput label="Tagline" value={(config.tagline as string) || ''} onChange={(v) => onChange({ tagline: v })} theme={theme} />

      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Social Links</h4>
        <SocialIconToggle icon={Instagram} label="Instagram" enabled={socialIcons.instagram?.enabled} url={socialIcons.instagram?.url} onToggle={(v) => updateSocialIcon('instagram', { enabled: v })} onUrlChange={(v) => updateSocialIcon('instagram', { url: v })} theme={theme} />
        <SocialIconToggle icon={Twitter} label="Twitter / X" enabled={socialIcons.twitter?.enabled} url={socialIcons.twitter?.url} onToggle={(v) => updateSocialIcon('twitter', { enabled: v })} onUrlChange={(v) => updateSocialIcon('twitter', { url: v })} theme={theme} />
        <SocialIconToggle icon={Youtube} label="YouTube" enabled={socialIcons.youtube?.enabled} url={socialIcons.youtube?.url} onToggle={(v) => updateSocialIcon('youtube', { enabled: v })} onUrlChange={(v) => updateSocialIcon('youtube', { url: v })} theme={theme} />
        <SocialIconToggle icon={Facebook} label="Facebook" enabled={socialIcons.facebook?.enabled} url={socialIcons.facebook?.url} onToggle={(v) => updateSocialIcon('facebook', { enabled: v })} onUrlChange={(v) => updateSocialIcon('facebook', { url: v })} theme={theme} />
      </div>

      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
        <h4 className={`text-xs font-semibold mb-3 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Colors</h4>
        <ColorPicker label="Background Color" value={(config.backgroundColor as string) || (isDark ? '#18181b' : '#ffffff')} onChange={(v) => onChange({ backgroundColor: v })} theme={theme} />
        <ColorPicker label="Text Color" value={(config.textColor as string) || (isDark ? '#ffffff' : '#18181b')} onChange={(v) => onChange({ textColor: v })} theme={theme} />
        <ColorPicker label="Link Text Color" value={(config.linkColor as string) || (isDark ? '#a1a1aa' : '#52525b')} onChange={(v) => onChange({ linkColor: v })} theme={theme} />
        <ColorPicker label="Social Icon Color" value={(config.socialIconColor as string) || (isDark ? '#a1a1aa' : '#52525b')} onChange={(v) => onChange({ socialIconColor: v })} theme={theme} />
      </div>
    </>
  );
}

const PAGE_TRANSITIONS = [
  { id: 'none', name: 'None', description: 'Instant transition' },
  { id: 'fade', name: 'Fade', description: 'Cross-fade' },
  { id: 'slideLeft', name: 'Slide Left', description: 'Slide in from right' },
  { id: 'slideRight', name: 'Slide Right', description: 'Slide in from left' },
  { id: 'slideUp', name: 'Slide Up', description: 'Slide in from bottom' },
  { id: 'slideDown', name: 'Slide Down', description: 'Slide in from top' },
];

function CanvasProperties({ config, onChange, theme }: ConfigPropertiesProps) {
  const isDark = theme === 'dark';
  return (
    <>
      <ColorPicker label="Background Color" value={(config.backgroundColor as string) || (isDark ? '#18181b' : '#fafafa')} onChange={(v) => onChange({ backgroundColor: v })} theme={theme} />
      <ImageDropZone label="Background Image" value={(config.backgroundImage as string) || ''} onChange={(v) => onChange({ backgroundImage: v })} theme={theme} />
      {config.backgroundImage && (
        <div className="mb-3">
          <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Background Size</label>
          <select
            value={(config.backgroundSize as string) || 'cover'}
            onChange={(e) => onChange({ backgroundSize: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      )}
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Page Transition</label>
        <div className="grid grid-cols-2 gap-2">
          {PAGE_TRANSITIONS.map((transition) => (
            <button
              key={transition.id}
              onClick={() => onChange({ pageTransition: transition.id })}
              className={`p-3 rounded-lg border-2 transition-colors text-left ${
                (config.pageTransition || 'fade') === transition.id ? 'editor-accent-border editor-accent-active' : isDark ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-300 hover:border-zinc-400'
              }`}
            >
              <span className={`block text-xs font-medium font-['Inter'] ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{transition.name}</span>
              <span className={`text-[10px] font-['Inter'] text-zinc-500`}>{transition.description}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}



// ---------------------------------------------------------------------------
// Animation Section
// ---------------------------------------------------------------------------

interface AnimationSectionProps extends ThemeProps {
  element: EditorElement;
  onChange: (updates: Record<string, unknown>) => void;
  onPreview?: (animation: AnimationConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  accentColor?: string;
}

function AnimationSection({ element, onChange, onPreview, theme, isOpen, onToggle, accentColor = '#E11D48' }: AnimationSectionProps) {
  const isDark = theme === 'dark';
  const [showPicker, setShowPicker] = useState(false);
  const animation = (element?.properties?.animation as AnimationConfig) || null;
  const hasAnimation = animation && animation.type;
  const animationPreset = hasAnimation ? getAnimationById(animation.type!) : null;

  const handleSelectAnimation = (newAnimation: AnimationConfig | null) => {
    onChange({ animation: newAnimation });
  };

  const handleSpeedChange = (speed: number) => {
    if (animation) {
      onChange({ animation: { ...animation, speed } });
    }
  };

  const handleDelayChange = (delay: number) => {
    if (animation) {
      onChange({ animation: { ...animation, delay } });
    }
  };

  return (
    <>
      <CollapsibleSection title="Animation" icon={Sparkles} isOpen={isOpen} onToggle={onToggle} theme={theme}>
        {hasAnimation ? (
          <>
            <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 editor-accent-text" />
                  <span className={`text-sm font-medium font-['Inter'] ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {animationPreset?.name || animation.type}
                  </span>
                </div>
                <button onClick={() => setShowPicker(true)} className="text-xs font-['Inter'] editor-accent-text hover:opacity-80">
                  Change
                </button>
              </div>
              <p className={`text-xs font-['Inter'] text-zinc-500`}>{animationPreset?.description || 'Custom animation'}</p>
            </div>

            <div className="mb-4">
              <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Speed</label>
              <div className="flex gap-1">
                {ANIMATION_SPEEDS.map((speed) => (
                  <button
                    key={speed.value}
                    onClick={() => handleSpeedChange(speed.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors ${
                      animation.speed === speed.value ? 'editor-accent-bg text-white' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200'
                    }`}
                  >
                    {speed.value}x
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-xs font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Delay (seconds)</label>
              <input
                type="number"
                value={animation.delay || 0}
                onChange={(e) => handleDelayChange(Math.max(0, parseFloat(e.target.value) || 0))}
                min={0}
                max={10}
                step={0.1}
                className={`w-full px-3 py-2 rounded-lg text-sm font-['Inter'] border ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onPreview?.(animation)}
                className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] font-medium transition-colors flex items-center justify-center gap-1.5 ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
              >
                <Play className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => onChange({ animation: null })}
                className="flex-1 py-2 rounded-lg text-xs font-['Inter'] font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowPicker(true)}
              className={`w-full py-3 rounded-lg text-sm font-['Inter'] font-medium transition-colors flex items-center justify-center gap-2 ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300'}`}
            >
              <Sparkles className="w-4 h-4" />
              Add Animation
            </button>
            <p className={`text-xs font-['Inter'] mt-3 text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Make this element come alive with animations
            </p>
          </>
        )}
      </CollapsibleSection>

      <AnimationPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        currentAnimation={animation}
        onSelect={handleSelectAnimation}
        onPreview={onPreview}
        theme={theme}
        accentColor={accentColor}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// getPropertiesComponent
// ---------------------------------------------------------------------------

function getPropertiesComponent(type: string): React.ComponentType<ElementPropertiesProps> | null {
  switch (type) {
    case 'heading': return HeadingProperties;
    case 'text': return TextProperties;
    case 'subheading': return TextProperties;
    case 'caption': return TextProperties;
    case 'quote': return QuoteProperties;
    case 'button': return ButtonProperties;
    case 'image': return ImageProperties;
    case 'frame': return FrameProperties;
    case 'grid': return GridProperties;
    case 'divider': return DividerProperties;
    case 'contactForm': return FormProperties;
    case 'customForm': return FormProperties;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Main FreeFormPropertiesPanel
// ---------------------------------------------------------------------------

interface FreeFormPropertiesPanelProps {
  selectedElement: EditorElement | null;
  selectedSection?: string | null;
  selectedSectionData?: Section | null;
  sectionIndex?: number;
  totalSections?: number;
  headerConfig?: Record<string, unknown>;
  footerConfig?: Record<string, unknown>;
  canvasConfig?: Record<string, unknown>;
  onUpdateProperties: (id: string, propUpdates: Record<string, unknown>, posUpdates?: Record<string, unknown>) => void;
  onUpdateHeaderConfig?: (updates: Record<string, unknown>) => void;
  onUpdateFooterConfig?: (updates: Record<string, unknown>) => void;
  onUpdateCanvasConfig?: (updates: Record<string, unknown>) => void;
  onUpdateSectionProperties?: (id: string, updates: Record<string, unknown>) => void;
  onUpdateSectionHeight?: (id: string, height: number) => void;
  onMoveSection?: (fromIndex: number, toIndex: number) => void;
  onDeleteSection?: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onPreviewAnimation?: (animation: AnimationConfig) => void;
  theme?: 'dark' | 'light';
  accentColor?: string;
  className?: string;
}

export default function FreeFormPropertiesPanel({
  selectedElement,
  selectedSection = null,
  selectedSectionData = null,
  sectionIndex = -1,
  totalSections = 0,
  headerConfig = {},
  footerConfig = {},
  canvasConfig = {},
  onUpdateProperties,
  onUpdateHeaderConfig,
  onUpdateFooterConfig,
  onUpdateCanvasConfig,
  onUpdateSectionProperties,
  onUpdateSectionHeight,
  onMoveSection,
  onDeleteSection,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onPreviewAnimation,
  theme = 'dark',
  accentColor = '#E11D48',
  className = '',
}: FreeFormPropertiesPanelProps) {
  const isDark = theme === 'dark';

  // Generate accent color CSS for the panel scope
  const accentStyles = useMemo(() => `
    .editor-accent-active { background-color: ${accentColor}20; color: ${accentColor}; }
    .editor-accent-bg { background-color: ${accentColor}; }
    .editor-accent-border { border-color: ${accentColor}; }
    .editor-accent-text { color: ${accentColor}; }
  `, [accentColor]);
  const accentCssVars = { '--editor-accent': accentColor } as React.CSSProperties;

  const [openSections, setOpenSections] = useState({
    layout: true,
    style: true,
    typography: true,
    animation: false,
    actions: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Header selected
  if (selectedSection === 'header') {
    return (
      <aside className={`flex flex-col h-full border-l transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${className}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h2 className={`text-sm font-semibold font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Header Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <HeaderProperties config={headerConfig} onChange={onUpdateHeaderConfig!} theme={theme} />
        </div>
      </aside>
    );
  }

  // Footer selected
  if (selectedSection === 'footer') {
    return (
      <aside className={`flex flex-col h-full border-l transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${className}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h2 className={`text-sm font-semibold font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Footer Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <FooterProperties config={footerConfig} onChange={onUpdateFooterConfig!} theme={theme} />
        </div>
      </aside>
    );
  }

  // Canvas selected
  if (selectedSection === 'canvas') {
    return (
      <aside className={`flex flex-col h-full border-l transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${className}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h2 className={`text-sm font-semibold font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Canvas Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <CanvasProperties config={canvasConfig} onChange={onUpdateCanvasConfig!} theme={theme} />
        </div>
      </aside>
    );
  }

  // Section data selected
  if (selectedSectionData && typeof selectedSectionData === 'object') {
    const sectionType = selectedSectionData.type;
    const isBlankSection = sectionType === 'blank';
    const isLocked = selectedSectionData.locked;

    const getSectionName = (type: string) => {
      const names: Record<string, string> = {
        blank: 'Blank Section',
        bookingWidget: 'Booking Calendar',
        galleryWidget: 'Photo Gallery',
        productGrid: 'Services / Products',
        reviewCarousel: 'Reviews',
      };
      return names[type] || type;
    };
    const isWidgetSection = ['bookingWidget', 'galleryWidget', 'productGrid', 'reviewCarousel'].includes(sectionType);

    return (
      <aside className={`flex flex-col h-full border-l transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${className}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-semibold font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Section</h2>
            {isLocked && <Lock className={`w-4 h-4 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />}
          </div>
        </div>

        <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-200 bg-zinc-100'}`}>
          <p className={`text-sm font-medium font-['Inter'] ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{getSectionName(sectionType)}</p>
          <p className={`text-xs font-['Inter'] mt-1 text-zinc-500`}>{`Height: ${selectedSectionData.height || 400}px`}</p>
        </div>

        {!isLocked && totalSections > 1 && (
          <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <h4 className={`text-[10px] font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Section Order</h4>
            <div className="flex gap-2">
              <button
                onClick={() => onMoveSection?.(sectionIndex, sectionIndex - 1)}
                disabled={sectionIndex === 0}
                className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors flex items-center justify-center gap-1.5 ${
                  sectionIndex === 0 ? isDark ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed' : 'bg-zinc-100/50 text-zinc-400 cursor-not-allowed' : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Move Up
              </button>
              <button
                onClick={() => onMoveSection?.(sectionIndex, sectionIndex + 1)}
                disabled={sectionIndex >= totalSections - 1}
                className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors flex items-center justify-center gap-1.5 ${
                  sectionIndex >= totalSections - 1 ? isDark ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed' : 'bg-zinc-100/50 text-zinc-400 cursor-not-allowed' : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Move Down
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <CollapsibleSection title="Layout" icon={Move} isOpen={openSections.layout} onToggle={() => toggleSection('layout')} theme={theme}>
            <SliderInput label="Section Height" value={selectedSectionData.height || 400} onChange={(v) => onUpdateSectionHeight?.(selectedSectionData.id, v)} min={200} max={1200} step={10} unit="px" theme={theme} />
          </CollapsibleSection>

          {/* Widget-specific properties */}
          {sectionType === 'bookingWidget' && (
            <CollapsibleSection title="Booking Settings" icon={Paintbrush} isOpen={openSections.style} onToggle={() => toggleSection('style')} theme={theme}>
              <PropertyInput label="Heading" value={(selectedSectionData.properties?.heading as string) || 'Book an Appointment'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { heading: v })} theme={theme} />
              <PropertyInput label="Button Text" value={(selectedSectionData.properties?.buttonText as string) || 'Book Now'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { buttonText: v })} theme={theme} />
              <ColorPicker label="Accent Color" value={(selectedSectionData.properties?.accentColor as string) || accentColor} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { accentColor: v })} theme={theme} />
            </CollapsibleSection>
          )}

          {sectionType === 'galleryWidget' && (
            <CollapsibleSection title="Gallery Settings" icon={Paintbrush} isOpen={openSections.style} onToggle={() => toggleSection('style')} theme={theme}>
              <PropertyInput label="Heading" value={(selectedSectionData.properties?.heading as string) || 'Our Gallery'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { heading: v })} theme={theme} />
              <SliderInput label="Columns" value={(selectedSectionData.properties?.columns as number) || 3} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { columns: v })} min={2} max={4} step={1} theme={theme} />
              <SliderInput label="Max Photos" value={(selectedSectionData.properties?.maxPhotos as number) || 9} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { maxPhotos: v })} min={3} max={12} step={1} theme={theme} />
              <ToggleSwitch label="Show Captions" value={(selectedSectionData.properties?.showCaptions as boolean) ?? true} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { showCaptions: v })} theme={theme} />
              <ColorPicker label="Accent Color" value={(selectedSectionData.properties?.accentColor as string) || '#1A1A1A'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { accentColor: v })} theme={theme} />
            </CollapsibleSection>
          )}

          {sectionType === 'productGrid' && (
            <CollapsibleSection title="Product Settings" icon={Paintbrush} isOpen={openSections.style} onToggle={() => toggleSection('style')} theme={theme}>
              <PropertyInput label="Heading" value={(selectedSectionData.properties?.heading as string) || 'Our Services'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { heading: v })} theme={theme} />
              <SliderInput label="Columns" value={(selectedSectionData.properties?.columns as number) || 3} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { columns: v })} min={2} max={4} step={1} theme={theme} />
              <ToggleSwitch label="Show Price" value={(selectedSectionData.properties?.showPrice as boolean) ?? true} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { showPrice: v })} theme={theme} />
              <ColorPicker label="Accent Color" value={(selectedSectionData.properties?.accentColor as string) || '#1A1A1A'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { accentColor: v })} theme={theme} />
            </CollapsibleSection>
          )}

          {sectionType === 'reviewCarousel' && (
            <CollapsibleSection title="Review Settings" icon={Paintbrush} isOpen={openSections.style} onToggle={() => toggleSection('style')} theme={theme}>
              <PropertyInput label="Heading" value={(selectedSectionData.properties?.heading as string) || 'What Our Clients Say'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { heading: v })} theme={theme} />
              <ToggleSwitch label="Auto Play" value={(selectedSectionData.properties?.autoPlay as boolean) ?? true} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { autoPlay: v })} theme={theme} />
              <ColorPicker label="Accent Color" value={(selectedSectionData.properties?.accentColor as string) || '#1A1A1A'} onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { accentColor: v })} theme={theme} />
            </CollapsibleSection>
          )}

          <CollapsibleSection title="Style" icon={Paintbrush} isOpen={!isWidgetSection && openSections.style} onToggle={() => toggleSection('style')} theme={theme}>
            <ColorPicker
              label="Background Color"
              value={(selectedSectionData.properties?.backgroundColor as string) || (isDark ? '#18181b' : '#fafafa')}
              onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { backgroundColor: v })}
              theme={theme}
            />
            {isBlankSection && (
              <>
                <ImageDropZone
                  label="Background Image"
                  value={(selectedSectionData.properties?.backgroundImage as string) || ''}
                  onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { backgroundImage: v })}
                  theme={theme}
                />
                <SliderInput
                  label="Padding"
                  value={(selectedSectionData.properties?.padding as number) || 20}
                  onChange={(v) => onUpdateSectionProperties?.(selectedSectionData.id, { padding: v })}
                  min={0} max={100} step={5} unit="px" theme={theme}
                />
              </>
            )}
          </CollapsibleSection>

          {!isLocked && (
            <div className={`px-4 py-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <button
                onClick={() => onDeleteSection?.(selectedSectionData.id)}
                className="w-full py-2 bg-red-600/20 text-red-400 rounded-lg text-xs font-['Inter'] hover:bg-red-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Section
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // No element selected
  if (!selectedElement) {
    return (
      <aside className={`flex flex-col h-full border-l transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${className}`}>
        <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h2 className={`text-sm font-semibold font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Properties</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={`w-12 h-12 mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            <MousePointer className={`w-5 h-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
          </div>
          <p className={`text-sm font-['Inter'] text-center text-zinc-500`}>
            Select an element to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  // Element selected
  const PropertiesComponent = getPropertiesComponent(selectedElement.type);

  const handleChange = (updates: Record<string, unknown>) => {
    onUpdateProperties(selectedElement.id, updates);
  };

  const hasTypography = ['heading', 'text', 'subheading', 'caption', 'quote', 'button'].includes(selectedElement.type);

  return (
    <aside className={`flex flex-col h-full border-l transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${className}`} style={accentCssVars}>
      <style dangerouslySetInnerHTML={{ __html: accentStyles }} />
      <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <h2 className={`text-sm font-semibold font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Properties</h2>
      </div>

      <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-200 bg-zinc-100'}`}>
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium font-['Inter'] capitalize ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedElement.type}</p>
          {selectedElement.locked && <Lock className={`w-4 h-4 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />}
        </div>
        <p className={`text-xs font-['Inter'] mt-1 text-zinc-500`}>{Math.round(selectedElement.width)} x {Math.round(selectedElement.height)} px</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* LAYOUT */}
        <CollapsibleSection title="Layout" icon={Move} isOpen={openSections.layout} onToggle={() => toggleSection('layout')} theme={theme}>
          <div className="mb-4">
            <h4 className={`text-[10px] font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Position</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>X</label>
                <input type="number" value={Math.round(selectedElement.x)} onChange={(e) => onUpdateProperties(selectedElement.id, {}, { x: Number(e.target.value) })} className={`w-full px-2 py-1.5 border rounded text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Y</label>
                <input type="number" value={Math.round(selectedElement.y)} onChange={(e) => onUpdateProperties(selectedElement.id, {}, { y: Number(e.target.value) })} className={`w-full px-2 py-1.5 border rounded text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className={`text-[10px] font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Size</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>W</label>
                <input type="number" value={Math.round(selectedElement.width)} onChange={(e) => onUpdateProperties(selectedElement.id, {}, { width: Number(e.target.value) })} className={`w-full px-2 py-1.5 border rounded text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-['Inter'] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>H</label>
                <input type="number" value={Math.round(selectedElement.height)} onChange={(e) => onUpdateProperties(selectedElement.id, {}, { height: Number(e.target.value) })} className={`w-full px-2 py-1.5 border rounded text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`} />
              </div>
            </div>
          </div>

          <RotationControl value={selectedElement.rotation || 0} onChange={(v) => onUpdateProperties(selectedElement.id, { rotation: v })} theme={theme} />
        </CollapsibleSection>

        {/* STYLE */}
        <CollapsibleSection title="Style" icon={Paintbrush} isOpen={openSections.style} onToggle={() => toggleSection('style')} theme={theme}>
          {PropertiesComponent ? (
            <PropertiesComponent properties={selectedElement.properties} onChange={handleChange} theme={theme} accentColor={accentColor} />
          ) : (
            <p className={`text-sm font-['Inter'] text-zinc-500`}>No style properties</p>
          )}

          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <SliderInput label="Opacity" value={(selectedElement.properties.opacity as number) ?? 100} onChange={(v) => handleChange({ opacity: v })} min={0} max={100} step={1} unit="%" theme={theme} />
            <ToggleSwitch label="Shadow" value={!!selectedElement.properties.shadow} onChange={(v) => handleChange({ shadow: v })} theme={theme} />
            {selectedElement.properties.borderRadius !== undefined && selectedElement.type !== 'button' && selectedElement.type !== 'image' && (
              <SliderInput label="Corner Radius" value={(selectedElement.properties.borderRadius as number) || 0} onChange={(v) => handleChange({ borderRadius: v })} min={0} max={100} step={1} unit="px" theme={theme} />
            )}
          </div>
        </CollapsibleSection>

        {/* TYPOGRAPHY */}
        {hasTypography && (
          <CollapsibleSection title="Typography" icon={TypeIcon} isOpen={openSections.typography} onToggle={() => toggleSection('typography')} theme={theme}>
            {selectedElement.properties.fontFamily !== undefined && (
              <FontFamilySelect value={selectedElement.properties.fontFamily as string} onChange={(v) => handleChange({ fontFamily: v })} theme={theme} />
            )}
            {selectedElement.properties.fontSize !== undefined && (
              <SliderInput label="Font Size" value={selectedElement.properties.fontSize as number} onChange={(v) => handleChange({ fontSize: v })} min={8} max={120} step={1} unit="px" theme={theme} />
            )}
            {selectedElement.properties.fontWeight !== undefined && (
              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Font Weight</label>
                <select
                  value={selectedElement.properties.fontWeight as number}
                  onChange={(e) => handleChange({ fontWeight: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm font-['Inter'] ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'}`}
                >
                  <option value={300}>Light</option>
                  <option value={400}>Regular</option>
                  <option value={500}>Medium</option>
                  <option value={600}>Semi Bold</option>
                  <option value={700}>Bold</option>
                  <option value={800}>Extra Bold</option>
                </select>
              </div>
            )}
            {selectedElement.properties.color !== undefined && (
              <ColorPicker label="Text Color" value={selectedElement.properties.color as string} onChange={(v) => handleChange({ color: v })} theme={theme} />
            )}
            {selectedElement.properties.textAlign !== undefined && (
              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Alignment</label>
                <div className="flex gap-1">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => handleChange({ textAlign: align })}
                      className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] capitalize transition-colors ${
                        selectedElement.properties.textAlign === align ? 'editor-accent-active' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedElement.properties.lineHeight !== undefined && (
              <SliderInput label="Line Height" value={selectedElement.properties.lineHeight as number} onChange={(v) => handleChange({ lineHeight: v })} min={0.5} max={3} step={0.1} unit="" theme={theme} />
            )}
            {selectedElement.properties.letterSpacing !== undefined && (
              <SliderInput label="Letter Spacing" value={selectedElement.properties.letterSpacing as number} onChange={(v) => handleChange({ letterSpacing: v })} min={-5} max={20} step={0.5} unit="px" theme={theme} />
            )}
            {selectedElement.properties.textTransform !== undefined && (
              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Text Transform</label>
                <div className="flex gap-1">
                  {[{ value: 'none', label: 'Aa' }, { value: 'uppercase', label: 'AA' }, { value: 'lowercase', label: 'aa' }, { value: 'capitalize', label: 'Aa' }].map((transform) => (
                    <button
                      key={transform.value}
                      onClick={() => handleChange({ textTransform: transform.value })}
                      className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors ${
                        selectedElement.properties.textTransform === transform.value ? 'editor-accent-active' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-800'
                      }`}
                      title={transform.value}
                    >
                      {transform.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* ANIMATION */}
        <AnimationSection
          element={selectedElement}
          onChange={handleChange}
          onPreview={onPreviewAnimation}
          theme={theme}
          isOpen={openSections.animation}
          onToggle={() => toggleSection('animation')}
          accentColor={accentColor}
        />

        {/* ACTIONS */}
        <CollapsibleSection title="Actions" icon={Layers} isOpen={openSections.actions} onToggle={() => toggleSection('actions')} theme={theme}>
          <div className="mb-4">
            <h4 className={`text-[10px] font-medium mb-2 font-['Inter'] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Layer Order</h4>
            <div className="flex gap-2">
              <button
                onClick={() => onBringToFront(selectedElement.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors flex items-center justify-center gap-1.5 ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Front
              </button>
              <button
                onClick={() => onSendToBack(selectedElement.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors flex items-center justify-center gap-1.5 ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Back
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDuplicate(selectedElement.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-['Inter'] transition-colors flex items-center justify-center gap-1.5 ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </button>
            <button
              onClick={() => onDelete(selectedElement.id)}
              className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg text-xs font-['Inter'] hover:bg-red-600/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </CollapsibleSection>
      </div>
    </aside>
  );
}
