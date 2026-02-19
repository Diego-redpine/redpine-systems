'use client';

/**
 * Free-Form Element Component
 * Draggable and resizable element for the canvas
 */

import { useState, useRef, useEffect, CSSProperties, MouseEvent, KeyboardEvent } from 'react';
import { Trash2, Lock, RotateCw, Sparkles } from 'lucide-react';
import { getAnimationById } from '@/hooks/useFreeFormEditor';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ElementProperties {
  content?: string;
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: string;
  highlightColor?: string;
  textOutline?: boolean;
  textOutlineWidth?: number;
  textOutlineColor?: string;
  textShadow?: boolean;
  textShadowX?: number;
  textShadowY?: number;
  textShadowBlur?: number;
  textShadowColor?: string;
  gradientText?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  curvedText?: number;
  fontStyle?: string;
  showQuoteIcon?: boolean;
  quoteIconColor?: string;
  backgroundColor?: string;
  borderRadius?: number | string;
  src?: string;
  alt?: string;
  shape?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  grayscale?: boolean;
  sepia?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: string;
  objectFit?: string;
  objectPosition?: string;
  opacity?: number;
  lockAspectRatio?: boolean;
  thickness?: number;
  frameType?: string;
  imageSrc?: string;
  imageAlt?: string;
  gridType?: string;
  gap?: number;
  cells?: Array<{ imageSrc?: string; imageAlt?: string }>;
  fields?: FormField[];
  formTitle?: string;
  submitButtonText?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  labelColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: number;
  animation?: {
    type: string;
    speed?: number;
    delay?: number;
  } | null;
  [key: string]: unknown;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FreeFormElementData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  locked?: boolean;
  deletable?: boolean;
  zIndex?: number;
  rotation?: number;
  properties: ElementProperties;
}

interface FreeFormElementProps {
  element: FreeFormElementData;
  isSelected: boolean;
  isDragging: boolean;
  isRotating?: boolean;
  theme?: 'dark' | 'light';
  isPreviewMode?: boolean;
  animationKey?: number;
  onMouseDown?: (e: MouseEvent) => void;
  onResizeMouseDown?: (e: MouseEvent, handle: string) => void;
  onRotateMouseDown?: (e: MouseEvent) => void;
  onDoubleClick?: () => void;
  onDelete?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onUpdateContent?: (id: string, props: Partial<ElementProperties>) => void;
}

interface ResizeHandleProps {
  position: string;
  onMouseDown?: (e: MouseEvent, position: string) => void;
}

interface RotationHandleProps {
  onMouseDown?: (e: MouseEvent) => void;
}

interface ElementContentProps {
  element: FreeFormElementData;
  theme?: 'dark' | 'light';
  isEditing?: boolean;
  contentRef?: React.RefObject<HTMLDivElement | null> | null;
  onBlur?: (() => void) | null;
}

// ─── Resize Handle ──────────────────────────────────────────────────────────────

function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  const positionStyles: Record<string, string> = {
    nw: 'top-0 left-0 cursor-nw-resize',
    n: 'top-0 left-1/2 -translate-x-1/2 cursor-n-resize',
    ne: 'top-0 right-0 cursor-ne-resize',
    e: 'top-1/2 right-0 -translate-y-1/2 cursor-e-resize',
    se: 'bottom-0 right-0 cursor-se-resize',
    s: 'bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize',
    sw: 'bottom-0 left-0 cursor-sw-resize',
    w: 'top-1/2 left-0 -translate-y-1/2 cursor-w-resize',
  };

  return (
    <div
      className={`
        absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm
        hover:bg-blue-500 transition-colors z-20
        ${positionStyles[position]}
      `}
      style={{ transform: position.length === 1 ? positionStyles[position].split(' ').pop() : undefined }}
      onMouseDown={(e) => onMouseDown?.(e, position)}
    />
  );
}

// ─── Rotation Handle ────────────────────────────────────────────────────────────

function RotationHandle({ onMouseDown }: RotationHandleProps) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
      style={{ top: '-32px' }}
    >
      {/* Connector line */}
      <div className="w-px h-3 bg-blue-500" />
      {/* Rotation circle */}
      <div
        className="w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center active:cursor-grabbing"
        onMouseDown={onMouseDown}
        title="Drag to rotate"
      >
        <RotateCw className="w-3 h-3 text-blue-500 hover:text-white" style={{ pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

// ─── Element Content ────────────────────────────────────────────────────────────

function ElementContent({ element, theme = 'light', isEditing = false, contentRef = null, onBlur = null }: ElementContentProps) {
  const { type, properties, width, height } = element;
  const isDark = theme === 'dark';

  switch (type) {
    case 'heading':
      return (
        <div
          ref={isEditing ? contentRef : null}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={isEditing ? (onBlur ?? undefined) : undefined}
          className={`w-full h-full flex items-center overflow-hidden ${isEditing ? 'outline-none cursor-text' : ''}`}
          style={{
            fontFamily: properties.fontFamily || 'Inter',
            fontSize: properties.fontSize,
            fontWeight: properties.fontWeight,
            color: properties.color,
            lineHeight: properties.lineHeight || 1.2,
            letterSpacing: properties.letterSpacing ? `${properties.letterSpacing}px` : 'normal',
          }}
        >
          <div className="w-full" style={{ textAlign: properties.textAlign as CSSProperties['textAlign'] }}>
            {properties.content}
          </div>
        </div>
      );

    case 'text':
    case 'subheading':
    case 'caption': {
      const textStyle: CSSProperties = {
        fontFamily: properties.fontFamily || 'Inter',
        fontSize: properties.fontSize,
        fontWeight: properties.fontWeight,
        color: properties.gradientText ? 'transparent' : properties.color,
        textAlign: properties.textAlign as CSSProperties['textAlign'],
        lineHeight: properties.lineHeight || 1.5,
        letterSpacing: properties.letterSpacing ? `${properties.letterSpacing}px` : 'normal',
        textTransform: (properties.textTransform || 'none') as CSSProperties['textTransform'],
        backgroundColor: properties.highlightColor || 'transparent',
      };

      // Text outline (text-stroke)
      if (properties.textOutline) {
        (textStyle as Record<string, unknown>).WebkitTextStroke = `${properties.textOutlineWidth || 1}px ${properties.textOutlineColor || '#000'}`;
      }

      // Text shadow
      if (properties.textShadow) {
        textStyle.textShadow = `${properties.textShadowX || 2}px ${properties.textShadowY || 2}px ${properties.textShadowBlur || 4}px ${properties.textShadowColor || '#000'}`;
      }

      // Gradient text
      if (properties.gradientText) {
        textStyle.background = `linear-gradient(90deg, ${properties.gradientStart || '#3B82F6'}, ${properties.gradientEnd || '#f97316'})`;
        (textStyle as Record<string, unknown>).WebkitBackgroundClip = 'text';
        textStyle.backgroundClip = 'text';
      }

      // Curved text uses SVG path
      if (properties.curvedText && properties.curvedText > 0) {
        const curveAmount = properties.curvedText;
        const pathId = `curve-${element.id}`;
        const pathD = curveAmount > 50
          ? `M 0,${100 - curveAmount} Q ${width / 2},${curveAmount} ${width},${100 - curveAmount}`
          : `M 0,${curveAmount} Q ${width / 2},${100 - curveAmount * 2} ${width},${curveAmount}`;

        return (
          <svg width="100%" height="100%" className="overflow-visible">
            <defs>
              <path id={pathId} d={pathD} fill="none" />
            </defs>
            <text style={textStyle as React.CSSProperties}>
              <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                {properties.content}
              </textPath>
            </text>
          </svg>
        );
      }

      return (
        <div
          ref={isEditing ? contentRef : null}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={isEditing ? (onBlur ?? undefined) : undefined}
          className={`w-full h-full overflow-hidden ${isEditing ? 'outline-none cursor-text' : ''}`}
          style={textStyle}
        >
          {properties.content}
        </div>
      );
    }

    case 'quote': {
      const quoteStyle: CSSProperties = {
        fontFamily: properties.fontFamily || 'Playfair Display',
        fontSize: properties.fontSize,
        fontWeight: properties.fontWeight,
        fontStyle: (properties.fontStyle || 'italic') as CSSProperties['fontStyle'],
        color: properties.gradientText ? 'transparent' : properties.color,
        textAlign: properties.textAlign as CSSProperties['textAlign'],
        lineHeight: properties.lineHeight || 1.6,
        letterSpacing: properties.letterSpacing ? `${properties.letterSpacing}px` : 'normal',
        textTransform: (properties.textTransform || 'none') as CSSProperties['textTransform'],
      };

      // Text shadow for quotes
      if (properties.textShadow) {
        quoteStyle.textShadow = `${properties.textShadowX || 2}px ${properties.textShadowY || 2}px ${properties.textShadowBlur || 4}px ${properties.textShadowColor || '#000'}`;
      }

      // Gradient text
      if (properties.gradientText) {
        quoteStyle.background = `linear-gradient(90deg, ${properties.gradientStart || '#3B82F6'}, ${properties.gradientEnd || '#f97316'})`;
        (quoteStyle as Record<string, unknown>).WebkitBackgroundClip = 'text';
        quoteStyle.backgroundClip = 'text';
      }

      return (
        <div className="w-full h-full flex flex-col justify-center relative">
          {properties.showQuoteIcon && (
            <svg
              className="absolute -top-2 -left-2 w-8 h-8"
              style={{ color: properties.quoteIconColor || '#3B82F6' }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
          )}
          <div
            ref={isEditing ? contentRef : null}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={isEditing ? (onBlur ?? undefined) : undefined}
            className={`${isEditing ? 'outline-none cursor-text' : ''}`}
            style={quoteStyle}
          >
            {properties.content}
          </div>
        </div>
      );
    }

    case 'button':
      return (
        <button
          className="w-full h-full font-semibold transition-opacity hover:opacity-90"
          style={{
            fontFamily: properties.fontFamily || 'Inter',
            fontSize: properties.fontSize,
            backgroundColor: properties.backgroundColor,
            color: properties.color,
            borderRadius: properties.borderRadius,
          }}
        >
          {properties.content}
        </button>
      );

    case 'image': {
      // Shape styles mapping
      const shapeStyles: Record<string, CSSProperties> = {
        rectangle: {},
        rounded: { borderRadius: 16 },
        circle: { borderRadius: '50%' },
        oval: { clipPath: 'ellipse(50% 40% at 50% 50%)' },
      };
      const currentShape = properties.shape || 'rectangle';
      const shapeStyle = shapeStyles[currentShape] || {};

      // Build filter string
      const filters: string[] = [];
      if (properties.brightness !== undefined && properties.brightness !== 100) {
        filters.push(`brightness(${properties.brightness}%)`);
      }
      if (properties.contrast !== undefined && properties.contrast !== 100) {
        filters.push(`contrast(${properties.contrast}%)`);
      }
      if (properties.saturation !== undefined && properties.saturation !== 100) {
        filters.push(`saturate(${properties.saturation}%)`);
      }
      if (properties.blur && properties.blur > 0) {
        filters.push(`blur(${properties.blur}px)`);
      }
      if (properties.grayscale) {
        filters.push('grayscale(100%)');
      }
      if (properties.sepia) {
        filters.push('sepia(100%)');
      }
      const filterStyle = filters.length > 0 ? filters.join(' ') : 'none';

      // Build transform string for flips
      const transforms: string[] = [];
      if (properties.flipHorizontal) {
        transforms.push('scaleX(-1)');
      }
      if (properties.flipVertical) {
        transforms.push('scaleY(-1)');
      }
      const transformStyle = transforms.length > 0 ? transforms.join(' ') : 'none';

      // Shadow style
      const imgShadowStyle = properties.shadowEnabled
        ? `${properties.shadowX || 0}px ${properties.shadowY || 4}px ${properties.shadowBlur || 12}px ${properties.shadowColor || '#000'}`
        : 'none';

      // Border style
      const imgBorderStyle = (properties.borderWidth ?? 0) > 0
        ? `${properties.borderWidth}px ${properties.borderStyle || 'solid'} ${properties.borderColor || 'transparent'}`
        : 'none';

      // Object position mapping
      const objectPositionMap: Record<string, string> = {
        'top-left': 'top left',
        'top': 'top center',
        'top-right': 'top right',
        'left': 'center left',
        'center': 'center center',
        'right': 'center right',
        'bottom-left': 'bottom left',
        'bottom': 'bottom center',
        'bottom-right': 'bottom right',
      };
      const objectPosition = objectPositionMap[properties.objectPosition || 'center'] || 'center center';

      return properties.src ? (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            borderRadius: properties.borderRadius || shapeStyle.borderRadius || 0,
            clipPath: shapeStyle.clipPath as string | undefined,
            boxShadow: imgShadowStyle,
            border: imgBorderStyle,
            opacity: (properties.opacity || 100) / 100,
          }}
        >
          <img
            src={properties.src}
            alt={properties.alt}
            className="w-full h-full"
            style={{
              objectFit: properties.objectFit as CSSProperties['objectFit'],
              objectPosition,
              filter: filterStyle,
              transform: transformStyle,
            }}
          />
        </div>
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
          style={{
            borderRadius: properties.borderRadius || shapeStyle.borderRadius || 0,
            clipPath: shapeStyle.clipPath as string | undefined,
            border: imgBorderStyle,
            opacity: (properties.opacity || 100) / 100,
          }}
        >
          <div className={`text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-['Inter']">Add Image</span>
          </div>
        </div>
      );
    }

    case 'divider':
      return (
        <div className="w-full h-full flex items-center">
          <div
            className="w-full"
            style={{
              height: properties.thickness,
              backgroundColor: properties.color,
            }}
          />
        </div>
      );

    case 'spacer':
      return (
        <div className={`w-full h-full border border-dashed rounded flex items-center justify-center ${
          isDark ? 'border-zinc-700' : 'border-zinc-400'
        }`}>
          <span className={`text-xs font-['Inter'] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Spacer
          </span>
        </div>
      );

    case 'contactForm':
    case 'customForm': {
      const fields = properties.fields || [];
      const formTitle = properties.formTitle || (type === 'contactForm' ? 'Get In Touch' : 'Custom Form');
      const submitButtonText = properties.submitButtonText || 'Submit';
      const fontFamily = properties.fontFamily || 'Inter';

      // Styling
      const bgColor = properties.backgroundColor || '#ffffff';
      const formBorderRadius = properties.borderRadius || 12;
      const formBorderWidth = properties.borderWidth || 1;
      const formBorderColor = properties.borderColor || '#e5e7eb';

      // Input styling
      const inputBgColor = properties.inputBackgroundColor || '#f5f5f5';
      const inputBorderColor = properties.inputBorderColor || '#e5e7eb';
      const inputTextColor = properties.inputTextColor || '#1a1a1a';
      const inputPlaceholderColor = properties.inputPlaceholderColor || '#9ca3af';

      // Label/Button styling
      const labelColor = properties.labelColor || '#1a1a1a';
      const buttonBgColor = properties.buttonBackgroundColor || '#3B82F6';
      const buttonTextColor = properties.buttonTextColor || '#ffffff';
      const buttonBorderRadius = properties.buttonBorderRadius || 8;

      // Render form field based on type
      const renderField = (field: FormField) => {
        const inputStyle: CSSProperties = {
          backgroundColor: inputBgColor,
          borderColor: inputBorderColor,
          color: inputTextColor,
          fontFamily,
        };

        switch (field.type) {
          case 'textarea':
            return (
              <textarea
                key={field.id}
                placeholder={field.placeholder || ''}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                style={{ ...inputStyle, minHeight: '80px' }}
                disabled
              />
            );
          case 'dropdown':
            return (
              <select
                key={field.id}
                className="w-full px-3 py-2 rounded-lg border text-sm appearance-none"
                style={inputStyle}
                disabled
              >
                <option>{field.placeholder || 'Select an option'}</option>
                {(field.options || []).map((opt, i) => (
                  <option key={i}>{opt}</option>
                ))}
              </select>
            );
          case 'checkbox':
            return (
              <label key={field.id} className="flex items-center gap-2" style={{ color: labelColor, fontFamily }}>
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span className="text-sm">{field.label}</span>
              </label>
            );
          default: // text, email, phone, etc.
            return (
              <input
                key={field.id}
                type={field.type || 'text'}
                placeholder={field.placeholder || ''}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={inputStyle}
                disabled
              />
            );
        }
      };

      return (
        <div
          className="w-full h-full overflow-hidden p-4"
          style={{
            backgroundColor: bgColor,
            borderRadius: formBorderRadius,
            border: `${formBorderWidth}px solid ${formBorderColor}`,
            fontFamily,
          }}
        >
          {/* Form Title */}
          {formTitle && (
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: labelColor, fontFamily }}
            >
              {formTitle}
            </h3>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            {fields.length === 0 ? (
              <div
                className="py-8 text-center text-sm border-2 border-dashed rounded-lg"
                style={{ borderColor: inputBorderColor, color: inputPlaceholderColor }}
              >
                {type === 'customForm' ? 'Add fields in the Properties panel' : 'No fields configured'}
              </div>
            ) : (
              fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  {field.type !== 'checkbox' && (
                    <label className="block text-xs font-medium" style={{ color: labelColor, fontFamily }}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))
            )}
          </div>

          {/* Submit Button */}
          <button
            className="w-full mt-4 py-2.5 px-4 font-medium text-sm transition-colors"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
              borderRadius: buttonBorderRadius,
              fontFamily,
            }}
            disabled
          >
            {submitButtonText}
          </button>
        </div>
      );
    }

    case 'frame': {
      // Frame element - shape masks for images (circle, square, rounded, oval only)
      const frameType = properties.frameType || 'circle';
      const imageSrc = properties.imageSrc || '';
      const frameBorderWidth = properties.borderWidth || 0;
      const frameBorderColor = properties.borderColor || '#e5e7eb';

      // Shadow styles
      const frameShadowStyle = properties.shadowEnabled
        ? `${properties.shadowX || 0}px ${properties.shadowY || 4}px ${properties.shadowBlur || 12}px ${properties.shadowColor || '#000'}`
        : 'none';

      // Frame clip paths for supported shapes
      const frameClipPaths: Record<string, string> = {
        circle: 'circle(50% at 50% 50%)',
        square: 'none',
        rounded: 'none',
        oval: 'ellipse(50% 40% at 50% 50%)',
      };

      const frameBorderRadiusMap: Record<string, number> = {
        square: 0,
        rounded: 16,
      };

      // Standard shape frames (circle, square, rounded, oval)
      const clipPath = frameClipPaths[frameType] || 'none';
      const radius = frameBorderRadiusMap[frameType] || 0;

      return (
        <div
          className="w-full h-full overflow-hidden flex items-center justify-center"
          style={{
            clipPath: clipPath !== 'none' ? clipPath : undefined,
            borderRadius: radius,
            boxShadow: frameShadowStyle,
            border: frameBorderWidth > 0 ? `${frameBorderWidth}px solid ${frameBorderColor}` : 'none',
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={properties.imageAlt}
              className="w-full h-full"
              style={{ objectFit: (properties.objectFit as CSSProperties['objectFit']) || 'cover' }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <div className={`text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-['Inter']">Drop image</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    case 'grid': {
      // Grid element - layout containers for multiple images
      const gridType = properties.gridType || '2-up';
      const gap = properties.gap || 8;
      const gridBorderRadius = properties.borderRadius || 8;
      const gridBgColor = properties.backgroundColor || 'transparent';
      const cells = properties.cells || [];

      // Grid layout configurations
      const gridLayouts: Record<string, { cols: number; rows: number; template: string; rowTemplate?: string }> = {
        '2-up': { cols: 2, rows: 1, template: 'repeat(2, 1fr)' },
        '3-up': { cols: 3, rows: 1, template: 'repeat(3, 1fr)' },
        '4-grid': { cols: 2, rows: 2, template: 'repeat(2, 1fr)' },
        '6-grid': { cols: 3, rows: 2, template: 'repeat(3, 1fr)' },
        'collage': { cols: 2, rows: 2, template: '2fr 1fr', rowTemplate: '1fr 1fr' },
        'masonry': { cols: 3, rows: 2, template: 'repeat(3, 1fr)' },
      };

      const layout = gridLayouts[gridType] || gridLayouts['2-up'];
      const cellCount = layout.cols * layout.rows;

      // Generate cell placeholders
      const renderCell = (index: number) => {
        const cellData = cells[index] || {};
        const hasImage = cellData.imageSrc;

        // Collage special cell (first cell spans 2 rows)
        const isCollageMain = gridType === 'collage' && index === 0;

        return (
          <div
            key={index}
            className={`overflow-hidden flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
            style={{
              borderRadius: gridBorderRadius as number,
              gridRow: isCollageMain ? 'span 2' : undefined,
            }}
          >
            {hasImage ? (
              <img src={cellData.imageSrc} alt={cellData.imageAlt || ''} className="w-full h-full object-cover" />
            ) : (
              <div className={`text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[9px] font-['Inter']">Add</span>
              </div>
            )}
          </div>
        );
      };

      // Adjust cell count for collage (3 cells instead of 4)
      const actualCellCount = gridType === 'collage' ? 3 : cellCount;

      return (
        <div
          className="w-full h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: layout.template,
            gridTemplateRows: layout.rowTemplate || `repeat(${layout.rows}, 1fr)`,
            gap: `${gap}px`,
            backgroundColor: gridBgColor,
            padding: gridBgColor !== 'transparent' ? gap : 0,
            borderRadius: gridBgColor !== 'transparent' ? (gridBorderRadius as number) : 0,
          }}
        >
          {Array.from({ length: actualCellCount }, (_, i) => renderCell(i))}
        </div>
      );
    }


    default:
      return (
        <div className={`w-full h-full rounded flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
          <span className={`text-sm font-['Inter'] ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            {type}
          </span>
        </div>
      );
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FreeFormElement({
  element,
  isSelected,
  isDragging,
  theme = 'light',
  isPreviewMode = false,
  animationKey = 0,
  onMouseDown,
  onResizeMouseDown,
  onRotateMouseDown,
  onDoubleClick,
  onDelete,
  onToggleLock,
  onUpdateContent,
}: FreeFormElementProps) {
  const { x, y, width, height, type, locked, deletable, zIndex = 0, rotation = 0, properties } = element;
  const isDark = theme === 'dark';
  const canDelete = deletable !== false;

  // Get animation data from properties
  const animation = properties?.animation || null;
  const hasAnimation = animation && animation.type;

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate z-index: base from array order, boost when selected/dragging
  const baseZ = zIndex + 1;
  const calculatedZ = isDragging ? 1000 : isSelected ? 500 + (baseZ * 10) : baseZ;

  // Generate animation style when in preview mode
  const getAnimationStyle = (): CSSProperties => {
    if (!hasAnimation || !isPreviewMode) return {};

    const preset = getAnimationById(animation.type);
    if (!preset) return {};

    const duration = (preset.defaultDuration / (animation.speed || 1)).toFixed(2);
    const delay = animation.delay || 0;
    const iterationCount = preset.iterationCount || 1;

    return {
      animationName: `rpb-${animation.type}`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      animationIterationCount: iterationCount,
      animationTimingFunction: 'ease-out',
      animationFillMode: 'both',
    };
  };

  // Focus content when entering edit mode
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  // Handle double-click to enter edit mode for text elements
  const handleDoubleClick = (e: MouseEvent) => {
    const editableTextTypes = ['heading', 'text', 'subheading', 'caption', 'quote'];
    if (editableTextTypes.includes(type) && !locked) {
      e.stopPropagation();
      setIsEditing(true);
    } else {
      onDoubleClick?.();
    }
  };

  // Handle blur to save and exit edit mode
  const handleBlur = () => {
    if (contentRef.current && onUpdateContent) {
      const newContent = contentRef.current.innerText;
      onUpdateContent(element.id, { content: newContent });
    }
    setIsEditing(false);
  };

  // Handle keyboard shortcuts when editing text
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isEditing) return;

    // Text formatting shortcuts (Cmd/Ctrl + B/I/U)
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold', false, undefined);
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic', false, undefined);
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline', false, undefined);
          break;
        default:
          break;
      }
    }

    // Escape to exit edit mode
    if (e.key === 'Escape') {
      e.preventDefault();
      handleBlur();
    }
  };

  // Handle mouse down - allow selection even when locked, just don't start drag
  const handleMouseDown = (e: MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      return; // Don't interfere with text selection
    }
    if (locked) {
      e.stopPropagation();
      onMouseDown?.(e);
    } else {
      onMouseDown?.(e);
    }
  };

  // Combine rotation transform with animation
  const animationStyle = getAnimationStyle();
  const baseTransform = rotation ? `rotate(${rotation}deg)` : '';

  return (
    <div
      key={isPreviewMode ? `anim-${animationKey}` : 'static'}
      className={`group ${locked ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isPreviewMode && hasAnimation ? 'rpb-animate' : ''}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: calculatedZ,
        transform: baseTransform || undefined,
        transformOrigin: 'center center',
        ...animationStyle,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Selection outline */}
      <div
        className={`
          absolute -inset-1 rounded-lg border-2 transition-opacity pointer-events-none
          ${isSelected
            ? isEditing ? 'border-blue-500 opacity-100' : 'border-blue-500 opacity-100'
            : 'border-transparent opacity-0 group-hover:border-blue-500/50 group-hover:opacity-100'
          }
        `}
      />

      {/* Element content */}
      <div className="w-full h-full overflow-hidden rounded">
        <ElementContent
          element={element}
          theme={theme}
          isEditing={isEditing}
          contentRef={contentRef}
          onBlur={handleBlur}
        />
      </div>

      {/* Resize handles - only show when selected and not locked */}
      {isSelected && !locked && (
        <>
          <ResizeHandle position="nw" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="n" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="ne" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="e" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="se" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="s" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="sw" onMouseDown={onResizeMouseDown} />
          <ResizeHandle position="w" onMouseDown={onResizeMouseDown} />
          {/* Rotation handle */}
          <RotationHandle onMouseDown={onRotateMouseDown} />
        </>
      )}

      {/* Type label and action icons - show on hover or when selected */}
      <div
        className={`
          absolute -top-7 left-0 right-0 flex items-center justify-between
          transition-opacity
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        {/* Type label */}
        <div
          className={`
            px-2 py-0.5 rounded text-[10px] font-['Inter'] font-medium flex items-center gap-1
            ${isSelected ? 'bg-blue-500 text-white' : isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-300 text-zinc-700'}
          `}
        >
          {hasAnimation && <Sparkles className="w-3 h-3" />}
          {type}
          {locked && ' (locked)'}
        </div>

        {/* Action icons */}
        {isSelected && (
          <div className="flex items-center gap-1">
            {/* Lock toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock?.(element.id); }}
              className={`
                p-1 rounded transition-colors
                ${locked
                  ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                  : isDark ? 'bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900'
                }
              `}
              title={locked ? 'Unlock element' : 'Lock element'}
            >
              <Lock className="w-3 h-3" />
            </button>

            {/* Delete button */}
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(element.id); }}
                className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                title="Delete element"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
