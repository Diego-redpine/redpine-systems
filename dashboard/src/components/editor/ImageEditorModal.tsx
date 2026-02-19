'use client';

/**
 * Image Editor Modal
 * Modal for editing images with crop, flip, and rotate tools
 */

import { useState, useRef } from 'react';
import {
  X,
  Crop,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Check,
  Undo2,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface CropPreset {
  id: string;
  label: string;
  ratio: number | null;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageProperties {
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotation?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  theme?: string;
  disabled?: boolean;
  accentColor?: string;
}

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  currentProperties?: ImageProperties;
  onApply: (properties: ImageProperties) => void;
  theme?: string;
  accentColor?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

// Aspect ratio presets for cropping
const CROP_PRESETS: CropPreset[] = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '3:4', label: '3:4', ratio: 3 / 4 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
  { id: '9:16', label: '9:16', ratio: 9 / 16 },
  { id: '3:2', label: '3:2', ratio: 3 / 2 },
  { id: '2:3', label: '2:3', ratio: 2 / 3 },
];

// ── Tool Button ────────────────────────────────────────────────────────────

/**
 * Tool Button Component
 */
function ToolButton({ icon: Icon, label, active, onClick, theme = 'light', disabled = false, accentColor = '#E11D48' }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded-lg transition-colors ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : active
            ? ''
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
      }`}
      style={active && !disabled ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageSrc,
  currentProperties = {},
  onApply,
  theme = 'light',
  accentColor = '#E11D48',
}: ImageEditorModalProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  // State for transforms
  const [flipH, setFlipH] = useState(currentProperties.flipHorizontal || false);
  const [flipV, setFlipV] = useState(currentProperties.flipVertical || false);
  const [rotation, setRotation] = useState(currentProperties.rotation || 0);
  const [zoom, setZoom] = useState(100);

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropPreset, setCropPreset] = useState('free');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });

  // Tool selection
  const [activeTool, setActiveTool] = useState('move');

  // Reset to initial values
  const handleReset = () => {
    setFlipH(false);
    setFlipV(false);
    setRotation(0);
    setZoom(100);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  // Apply changes
  const handleApply = () => {
    onApply({
      flipHorizontal: flipH,
      flipVertical: flipV,
      rotation: rotation,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height,
    });
    onClose();
  };

  // Rotate handlers
  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-[90vw] max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <h2
            className="text-sm font-semibold font-['Inter'] uppercase tracking-wider"
            style={{ color: '#1A1A1A' }}
          >
            Image Editor
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-1 px-4 py-2 border-b"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#f5f5f5' }}
        >
          {/* Tools */}
          <div className="flex items-center gap-1">
            <ToolButton
              icon={Move}
              label="Move"
              active={activeTool === 'move'}
              onClick={() => setActiveTool('move')}
              theme={theme}
              accentColor={accentColor}
            />
            <ToolButton
              icon={Crop}
              label="Crop"
              active={activeTool === 'crop'}
              onClick={() => {
                setActiveTool('crop');
                setCropMode(true);
              }}
              theme={theme}
              accentColor={accentColor}
            />
          </div>

          <div className="w-px h-6 mx-2" style={{ backgroundColor: '#E5E7EB' }} />

          {/* Flip controls */}
          <div className="flex items-center gap-1">
            <ToolButton
              icon={FlipHorizontal}
              label="Flip Horizontal"
              active={flipH}
              onClick={() => setFlipH(!flipH)}
              theme={theme}
              accentColor={accentColor}
            />
            <ToolButton
              icon={FlipVertical}
              label="Flip Vertical"
              active={flipV}
              onClick={() => setFlipV(!flipV)}
              theme={theme}
              accentColor={accentColor}
            />
          </div>

          <div className="w-px h-6 mx-2" style={{ backgroundColor: '#E5E7EB' }} />

          {/* Rotate controls */}
          <div className="flex items-center gap-1">
            <ToolButton
              icon={RotateCcw}
              label="Rotate Left"
              onClick={rotateLeft}
              theme={theme}
              accentColor={accentColor}
            />
            <ToolButton
              icon={RotateCw}
              label="Rotate Right"
              onClick={rotateRight}
              theme={theme}
              accentColor={accentColor}
            />
            <span
              className="px-2 text-xs font-['Inter']"
              style={{ color: '#6B7280' }}
            >
              {rotation}&deg;
            </span>
          </div>

          <div className="w-px h-6 mx-2" style={{ backgroundColor: '#E5E7EB' }} />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <ToolButton
              icon={ZoomOut}
              label="Zoom Out"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              theme={theme}
              accentColor={accentColor}
              disabled={zoom <= 25}
            />
            <span
              className="w-12 text-center text-xs font-['Inter']"
              style={{ color: '#6B7280' }}
            >
              {zoom}%
            </span>
            <ToolButton
              icon={ZoomIn}
              label="Zoom In"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              theme={theme}
              accentColor={accentColor}
              disabled={zoom >= 200}
            />
          </div>

          <div className="flex-1" />

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex">
          {/* Main canvas */}
          <div
            className="flex-1 flex items-center justify-center p-8 overflow-auto"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {/* Checkerboard background for transparency */}
            <div
              className="relative"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e4e4e7 25%, transparent 25%),
                  linear-gradient(-45deg, #e4e4e7 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e4e4e7 75%),
                  linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Edit preview"
                className="max-w-full max-h-[50vh] block"
                style={{
                  transform: `
                    scale(${zoom / 100})
                    scaleX(${flipH ? -1 : 1})
                    scaleY(${flipV ? -1 : 1})
                    rotate(${rotation}deg)
                  `,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease',
                }}
              />

              {/* Crop overlay */}
              {cropMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-black/50" />
                  <div
                    className="absolute border-2 border-white"
                    style={{
                      left: `${cropArea.x}%`,
                      top: `${cropArea.y}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Crop handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full pointer-events-auto cursor-nw-resize" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full pointer-events-auto cursor-ne-resize" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full pointer-events-auto cursor-sw-resize" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full pointer-events-auto cursor-se-resize" />
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/30" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side panel for crop presets */}
          {cropMode && (
            <div
              className="w-48 border-l p-4"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#ffffff' }}
            >
              <h3
                className="text-xs font-semibold font-['Inter'] uppercase tracking-wider mb-3"
                style={{ color: '#6B7280' }}
              >
                Aspect Ratio
              </h3>
              <div className="space-y-1">
                {CROP_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setCropPreset(preset.id)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-['Inter'] text-left transition-colors ${
                      cropPreset === preset.id
                        ? ''
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                    style={cropPreset === preset.id ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-4 py-3 border-t"
          style={{ borderColor: '#E5E7EB' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-['Inter'] transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-['Inter'] transition-colors hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            <Check className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
