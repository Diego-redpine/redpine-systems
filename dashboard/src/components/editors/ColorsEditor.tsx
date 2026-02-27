'use client';

import { useState, useRef, useEffect } from 'react';

// Color assignment targets
const COLOR_TARGETS = [
  { id: 'sidebar_bg', label: 'Accent Dark' },
  { id: 'sidebar_icons', label: 'Icons' },
  { id: 'sidebar_buttons', label: 'Accent' },
  { id: 'sidebar_text', label: 'Accent Text' },
  { id: 'background', label: 'Background' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cards', label: 'Cards' },
  { id: 'text', label: 'Text' },
  { id: 'headings', label: 'Headings' },
  { id: 'borders', label: 'Borders' },
] as const;

type ColorTarget = typeof COLOR_TARGETS[number]['id'];

export interface ColorItem {
  color: string;
  target: ColorTarget;
}

// 18 curated professional palettes (all 10 keys)
const CURATED_PALETTES: ColorItem[][] = [
  // 1. Midnight Blue
  [
    { color: '#1E293B', target: 'sidebar_bg' }, { color: '#94A3B8', target: 'sidebar_icons' },
    { color: '#3B82F6', target: 'sidebar_buttons' }, { color: '#E2E8F0', target: 'sidebar_text' },
    { color: '#F8FAFC', target: 'background' }, { color: '#3B82F6', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#334155', target: 'text' },
    { color: '#0F172A', target: 'headings' }, { color: '#E2E8F0', target: 'borders' },
  ],
  // 2. Forest Green
  [
    { color: '#14532D', target: 'sidebar_bg' }, { color: '#86EFAC', target: 'sidebar_icons' },
    { color: '#22C55E', target: 'sidebar_buttons' }, { color: '#DCFCE7', target: 'sidebar_text' },
    { color: '#F0FDF4', target: 'background' }, { color: '#16A34A', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#14532D', target: 'headings' }, { color: '#D1FAE5', target: 'borders' },
  ],
  // 3. Warm Terracotta
  [
    { color: '#7C2D12', target: 'sidebar_bg' }, { color: '#FDBA74', target: 'sidebar_icons' },
    { color: '#EA580C', target: 'sidebar_buttons' }, { color: '#FED7AA', target: 'sidebar_text' },
    { color: '#FFF7ED', target: 'background' }, { color: '#EA580C', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#44403C', target: 'text' },
    { color: '#7C2D12', target: 'headings' }, { color: '#FED7AA', target: 'borders' },
  ],
  // 4. Royal Purple
  [
    { color: '#3B0764', target: 'sidebar_bg' }, { color: '#C084FC', target: 'sidebar_icons' },
    { color: '#A855F7', target: 'sidebar_buttons' }, { color: '#E9D5FF', target: 'sidebar_text' },
    { color: '#FAF5FF', target: 'background' }, { color: '#9333EA', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#3B0764', target: 'headings' }, { color: '#E9D5FF', target: 'borders' },
  ],
  // 5. Clean Slate
  [
    { color: '#111827', target: 'sidebar_bg' }, { color: '#9CA3AF', target: 'sidebar_icons' },
    { color: '#1F2937', target: 'sidebar_buttons' }, { color: '#F3F4F6', target: 'sidebar_text' },
    { color: '#F9FAFB', target: 'background' }, { color: '#111827', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#4B5563', target: 'text' },
    { color: '#111827', target: 'headings' }, { color: '#E5E7EB', target: 'borders' },
  ],
  // 6. Ocean Teal
  [
    { color: '#134E4A', target: 'sidebar_bg' }, { color: '#5EEAD4', target: 'sidebar_icons' },
    { color: '#14B8A6', target: 'sidebar_buttons' }, { color: '#CCFBF1', target: 'sidebar_text' },
    { color: '#F0FDFA', target: 'background' }, { color: '#0D9488', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#134E4A', target: 'headings' }, { color: '#CCFBF1', target: 'borders' },
  ],
  // 7. Sunset Rose
  [
    { color: '#881337', target: 'sidebar_bg' }, { color: '#FDA4AF', target: 'sidebar_icons' },
    { color: '#F43F5E', target: 'sidebar_buttons' }, { color: '#FFE4E6', target: 'sidebar_text' },
    { color: '#FFF1F2', target: 'background' }, { color: '#E11D48', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#881337', target: 'headings' }, { color: '#FFE4E6', target: 'borders' },
  ],
  // 8. Warm Gold
  [
    { color: '#78350F', target: 'sidebar_bg' }, { color: '#FCD34D', target: 'sidebar_icons' },
    { color: '#F59E0B', target: 'sidebar_buttons' }, { color: '#FEF3C7', target: 'sidebar_text' },
    { color: '#FFFBEB', target: 'background' }, { color: '#D97706', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#44403C', target: 'text' },
    { color: '#78350F', target: 'headings' }, { color: '#FDE68A', target: 'borders' },
  ],
  // 9. Deep Navy
  [
    { color: '#172554', target: 'sidebar_bg' }, { color: '#93C5FD', target: 'sidebar_icons' },
    { color: '#2563EB', target: 'sidebar_buttons' }, { color: '#DBEAFE', target: 'sidebar_text' },
    { color: '#EFF6FF', target: 'background' }, { color: '#2563EB', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#1E3A5F', target: 'text' },
    { color: '#172554', target: 'headings' }, { color: '#BFDBFE', target: 'borders' },
  ],
  // 10. Charcoal Minimal
  [
    { color: '#18181B', target: 'sidebar_bg' }, { color: '#A1A1AA', target: 'sidebar_icons' },
    { color: '#DC2626', target: 'sidebar_buttons' }, { color: '#E4E4E7', target: 'sidebar_text' },
    { color: '#FAFAFA', target: 'background' }, { color: '#DC2626', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#52525B', target: 'text' },
    { color: '#18181B', target: 'headings' }, { color: '#E4E4E7', target: 'borders' },
  ],
  // 11. Sage Garden
  [
    { color: '#1A2E1A', target: 'sidebar_bg' }, { color: '#A7C4A0', target: 'sidebar_icons' },
    { color: '#65A30D', target: 'sidebar_buttons' }, { color: '#D9F0D3', target: 'sidebar_text' },
    { color: '#F7FDF5', target: 'background' }, { color: '#65A30D', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#3F4F3F', target: 'text' },
    { color: '#1A2E1A', target: 'headings' }, { color: '#D9F0D3', target: 'borders' },
  ],
  // 12. Warm Mocha
  [
    { color: '#3E2723', target: 'sidebar_bg' }, { color: '#D7CCC8', target: 'sidebar_icons' },
    { color: '#8D6E63', target: 'sidebar_buttons' }, { color: '#EFEBE9', target: 'sidebar_text' },
    { color: '#FAF7F5', target: 'background' }, { color: '#795548', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#4E342E', target: 'text' },
    { color: '#3E2723', target: 'headings' }, { color: '#D7CCC8', target: 'borders' },
  ],
  // 13. Electric Indigo
  [
    { color: '#312E81', target: 'sidebar_bg' }, { color: '#A5B4FC', target: 'sidebar_icons' },
    { color: '#6366F1', target: 'sidebar_buttons' }, { color: '#E0E7FF', target: 'sidebar_text' },
    { color: '#EEF2FF', target: 'background' }, { color: '#4F46E5', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#312E81', target: 'headings' }, { color: '#C7D2FE', target: 'borders' },
  ],
  // 14. Arctic Blue
  [
    { color: '#0C4A6E', target: 'sidebar_bg' }, { color: '#7DD3FC', target: 'sidebar_icons' },
    { color: '#0EA5E9', target: 'sidebar_buttons' }, { color: '#E0F2FE', target: 'sidebar_text' },
    { color: '#F0F9FF', target: 'background' }, { color: '#0284C7', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#0C4A6E', target: 'headings' }, { color: '#BAE6FD', target: 'borders' },
  ],
  // 15. Burgundy Wine
  [
    { color: '#450A0A', target: 'sidebar_bg' }, { color: '#FCA5A5', target: 'sidebar_icons' },
    { color: '#B91C1C', target: 'sidebar_buttons' }, { color: '#FEE2E2', target: 'sidebar_text' },
    { color: '#FEF2F2', target: 'background' }, { color: '#DC2626', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#44403C', target: 'text' },
    { color: '#450A0A', target: 'headings' }, { color: '#FECACA', target: 'borders' },
  ],
  // 16. Nordic Frost
  [
    { color: '#1E3A5F', target: 'sidebar_bg' }, { color: '#B0C4DE', target: 'sidebar_icons' },
    { color: '#4682B4', target: 'sidebar_buttons' }, { color: '#D6E4F0', target: 'sidebar_text' },
    { color: '#F5F8FC', target: 'background' }, { color: '#4682B4', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#1E3A5F', target: 'headings' }, { color: '#D6E4F0', target: 'borders' },
  ],
  // 17. Emerald Dark
  [
    { color: '#022C22', target: 'sidebar_bg' }, { color: '#6EE7B7', target: 'sidebar_icons' },
    { color: '#10B981', target: 'sidebar_buttons' }, { color: '#A7F3D0', target: 'sidebar_text' },
    { color: '#ECFDF5', target: 'background' }, { color: '#059669', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#022C22', target: 'headings' }, { color: '#A7F3D0', target: 'borders' },
  ],
  // 18. Soft Lavender
  [
    { color: '#4A1D96', target: 'sidebar_bg' }, { color: '#C4B5FD', target: 'sidebar_icons' },
    { color: '#8B5CF6', target: 'sidebar_buttons' }, { color: '#EDE9FE', target: 'sidebar_text' },
    { color: '#F5F3FF', target: 'background' }, { color: '#7C3AED', target: 'buttons' },
    { color: '#FFFFFF', target: 'cards' }, { color: '#374151', target: 'text' },
    { color: '#4A1D96', target: 'headings' }, { color: '#DDD6FE', target: 'borders' },
  ],
];

function isColorLight(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return true;
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

interface ColorsEditorProps {
  colors: ColorItem[];
  onColorsChange: (colors: ColorItem[]) => void;
}

export default function ColorsEditor({ colors, onColorsChange }: ColorsEditorProps) {
  const [hoveredColor, setHoveredColor] = useState<number | null>(null);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragY, setDragY] = useState<number>(0);
  const [initialY, setInitialY] = useState<number>(0);
  const colorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close target picker when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowTargetPicker(false);
    if (showTargetPicker) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTargetPicker]);

  // Color operations
  const addColor = () => {
    if (getAvailableTargets().length === 0) return;
    setShowTargetPicker(true);
  };

  const addColorWithTarget = (target: ColorTarget) => {
    const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    onColorsChange([...colors, { color: newColor, target }]);
    setShowTargetPicker(false);
  };

  const getAvailableTargets = () => {
    const usedTargets = colors.map(c => c.target);
    return COLOR_TARGETS.filter(t => !usedTargets.includes(t.id));
  };

  const removeColor = (index: number) => {
    onColorsChange(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], color: newColor };
    onColorsChange(newColors);
  };

  const randomizeColor = (index: number) => {
    const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    updateColor(index, newColor);
  };

  const getTargetLabel = (targetId: ColorTarget) => {
    return COLOR_TARGETS.find(t => t.id === targetId)?.label || targetId;
  };

  const applyPalette = () => {
    const randomPalette = CURATED_PALETTES[Math.floor(Math.random() * CURATED_PALETTES.length)];
    onColorsChange([...randomPalette]);
  };

  // Mouse-based drag
  const handleColorDragStart = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setDraggedIndex(index);
    setInitialY(e.clientY);
    setDragY(0);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (draggedIndex === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - initialY;
      setDragY(deltaY);

      colorRefs.current.forEach((ref, index) => {
        if (ref && index !== draggedIndex) {
          const rect = ref.getBoundingClientRect();
          if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
            setDragOverIndex(index);
          }
        }
      });
    };

    const handleMouseUp = () => {
      if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
        const newColors = [...colors];
        const [draggedItem] = newColors.splice(draggedIndex, 1);
        newColors.splice(dragOverIndex, 0, draggedItem);
        onColorsChange(newColors);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDragY(0);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedIndex, dragOverIndex, initialY, colors, onColorsChange]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Apply Palette button */}
      <button
        onClick={applyPalette}
        className="mx-3 mt-3 mb-2 px-3 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
        Apply Palette
      </button>

      {/* Color swatches */}
      <div className="flex-1 flex flex-col min-h-0">
        {colors.map((colorItem, index) => {
          const textSize = colors.length <= 3 ? 'text-sm' : colors.length <= 4 ? 'text-xs' : 'text-[10px]';
          const paddingSize = colors.length <= 3 ? 'px-4 py-2' : colors.length <= 4 ? 'px-3 py-1.5' : 'px-2 py-1';
          const isHovered = hoveredColor === index;
          const textOnColor = isColorLight(colorItem.color) ? '#000000' : '#FFFFFF';
          const labelBg = isColorLight(colorItem.color) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
          const labelBorder = isColorLight(colorItem.color) ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)';

          return (
            <div
              key={index}
              ref={(el) => { colorRefs.current[index] = el; }}
              className="relative group select-none"
              style={{
                backgroundColor: colorItem.color,
                flex: '1 1 0%',
                minHeight: '44px',
                transform: draggedIndex === index ? `translateY(${dragY}px)` : 'none',
                zIndex: draggedIndex === index ? 50 : 1,
                opacity: draggedIndex === index ? 0.9 : 1,
                boxShadow: draggedIndex === index ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                transition: draggedIndex === index ? 'none' : 'transform 0.15s ease',
                borderBottom: index < colors.length - 1 ? `1px solid ${labelBorder}` : 'none',
                borderTop: dragOverIndex === index && draggedIndex !== index ? `3px solid ${textOnColor}` : 'none',
              }}
              onMouseEnter={() => setHoveredColor(index)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              {/* Left drag zone */}
              <div
                className="absolute top-0 bottom-0 left-0"
                style={{ width: '25%', cursor: draggedIndex === index ? 'grabbing' : 'grab' }}
                onMouseDown={(e) => handleColorDragStart(e, index)}
              />
              {/* Right drag zone */}
              <div
                className="absolute top-0 bottom-0 right-0"
                style={{ width: '25%', cursor: draggedIndex === index ? 'grabbing' : 'grab' }}
                onMouseDown={(e) => handleColorDragStart(e, index)}
              />

              {/* Center label — triggers color picker */}
              <label
                className="absolute top-0 bottom-0 left-[25%] right-[25%] flex items-center justify-center"
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="color"
                  value={colorItem.color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className="absolute w-0 h-0 opacity-0"
                />
                <div
                  className={`${paddingSize} rounded transition-shadow`}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: labelBg,
                    border: `1px solid ${labelBorder}`,
                  }}
                >
                  <span className={`font-semibold ${textSize} font-mono`} style={{ cursor: 'pointer', color: textOnColor }}>
                    {isHovered ? colorItem.color.toUpperCase() : getTargetLabel(colorItem.target)}
                  </span>
                </div>
              </label>

              {/* Control buttons */}
              <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {/* Randomize */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => randomizeColor(index)}
                  className="w-6 h-6 rounded transition-colors flex items-center justify-center cursor-pointer pointer-events-auto"
                  style={{
                    backgroundColor: labelBg,
                    border: `1px solid ${labelBorder}`,
                    color: textOnColor,
                  }}
                  title="Randomize"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => removeColor(index)}
                  className="w-6 h-6 rounded transition-colors flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-red-500 hover:text-white"
                  style={{
                    backgroundColor: labelBg,
                    border: `1px solid ${labelBorder}`,
                    color: textOnColor,
                  }}
                  title="Remove"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add color button */}
      {getAvailableTargets().length > 0 && (
        <div className="relative shrink-0">
          <button
            onClick={addColor}
            className="w-full p-3 font-medium text-sm bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border-t border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Color
          </button>

          {/* Target picker overlay */}
          {showTargetPicker && (
            <div
              className="absolute bottom-full left-0 right-0 mb-[-1px] max-h-[250px] overflow-y-auto z-30 shadow-lg bg-white border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 text-xs font-semibold sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-500">
                Where does this color apply?
              </div>
              {getAvailableTargets().map((target) => (
                <button
                  key={target.id}
                  onClick={() => addColorWithTarget(target.id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {target.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
