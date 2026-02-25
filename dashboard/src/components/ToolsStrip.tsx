'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getContrastText } from '@/lib/view-colors';

interface ToolsStripProps {
  onOpenChat: () => void;
  isChatOpen: boolean;
  onNavigateToComms?: () => void;
  isCommsActive?: boolean;
  side?: 'left' | 'right';
  onSideChange?: (side: 'left' | 'right') => void;
  buttonColor?: string;
  onNavigateToBrand?: () => void;
  isBrandActive?: boolean;
  onNavigateToSite?: () => void;
  isSiteActive?: boolean;
  onNavigateToMarketplace?: () => void;
  isMarketplaceActive?: boolean;
  onNavigateToMarketing?: () => void;
  isMarketingActive?: boolean;
  disableDrag?: boolean;
}

export default function ToolsStrip({ onOpenChat, isChatOpen, onNavigateToComms, isCommsActive, side: controlledSide, onSideChange, buttonColor, onNavigateToBrand, isBrandActive, onNavigateToSite, isSiteActive, onNavigateToMarketplace, isMarketplaceActive, onNavigateToMarketing, isMarketingActive, disableDrag }: ToolsStripProps) {
  const [internalSide, setInternalSide] = useState<'left' | 'right'>('left');
  const side = controlledSide ?? internalSide;
  const setSide = (s: 'left' | 'right') => {
    setInternalSide(s);
    onSideChange?.(s);
  };

  const [yOffset, setYOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for lag-free drag — direct DOM manipulation, no React re-renders
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startOffset: number;
    moved: boolean;
    lastX: number;
    lastY: number;
  } | null>(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffset: yOffset,
      moved: false,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    setIsDragging(true);
    // Remove transition during drag for instant response
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
    }
  }, [yOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !containerRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragRef.current.moved = true;
    }

    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    // Direct DOM manipulation — bypasses React for zero-lag positioning
    const maxOffset = Math.floor(window.innerHeight / 2) - 100;
    const newYOffset = Math.max(-maxOffset, Math.min(maxOffset, dragRef.current.startOffset + deltaY));
    const clampedX = Math.max(12, Math.min(window.innerWidth - 60, e.clientX - 24));

    containerRef.current.style.left = `${clampedX}px`;
    containerRef.current.style.right = 'auto';
    containerRef.current.style.transform = `translateY(calc(-50% + ${newYOffset}px))`;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current || !containerRef.current) return;

    // Compute final Y offset directly from drag delta
    const maxOffset = Math.floor(window.innerHeight / 2) - 100;
    const deltaY = dragRef.current.lastY - dragRef.current.startY;
    const finalYOffset = Math.max(-maxOffset, Math.min(maxOffset, dragRef.current.startOffset + deltaY));

    // Determine which side to snap to
    let newSide = side;
    if (dragRef.current.moved) {
      const midX = window.innerWidth / 2;
      newSide = dragRef.current.lastX < midX ? 'left' : 'right';
    }

    // Re-enable transition for snap animation
    containerRef.current.style.transition = 'left 0.2s ease-out, right 0.2s ease-out';

    // Snap to edge
    if (newSide === 'left') {
      containerRef.current.style.left = '12px';
      containerRef.current.style.right = 'auto';
    } else {
      containerRef.current.style.left = 'auto';
      containerRef.current.style.right = '12px';
    }

    // Preserve the Y position during snap
    containerRef.current.style.transform = `translateY(calc(-50% + ${finalYOffset}px))`;

    setYOffset(finalYOffset);
    setIsDragging(false);
    setSide(newSide);
    dragRef.current = null;
  }, [side]);

  // Sync container position when side or yOffset changes (non-drag updates)
  useEffect(() => {
    if (!containerRef.current || isDragging) return;
    if (side === 'left') {
      containerRef.current.style.left = '12px';
      containerRef.current.style.right = 'auto';
    } else {
      containerRef.current.style.left = 'auto';
      containerRef.current.style.right = '12px';
    }
    containerRef.current.style.transform = `translateY(calc(-50% + ${yOffset}px))`;
  }, [side, yOffset, isDragging]);

  // Button click guard — only fire if not dragged
  const guardClick = useCallback((handler: () => void) => {
    return () => {
      if (dragRef.current?.moved) return;
      handler();
    };
  }, []);

  const bg = buttonColor || '#111827';
  const iconColor = getContrastText(bg);
  const isLight = iconColor === '#000000';
  const activeOverlay = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)';
  const mutedOpacity = isLight ? 0.4 : 0.45;

  const buttons = [
    { id: 'comms', label: 'Messages', onClick: () => onNavigateToComms?.(), active: !!isCommsActive, disabled: false, icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    )},
    { id: 'brand', label: 'Brand & Design', onClick: () => onNavigateToBrand?.(), active: !!isBrandActive, disabled: false, icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12c0 1.33.26 2.61.74 3.77C3.97 18.75 6.76 20.5 10 20.5c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.37-.61-.37-.99 0-.83.67-1.5 1.5-1.5H14c3.31 0 6-2.69 6-6 0-4.97-4.48-7.5-8-7.5z" />
        <circle cx="6.5" cy="11.5" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="9.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="11.5" r="1.25" fill="currentColor" stroke="none" />
      </svg>
    )},
    { id: 'website', label: 'Website', onClick: () => onNavigateToSite?.(), active: !!isSiteActive, disabled: false, icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    )},
    { id: 'marketplace', label: 'Marketplace', onClick: () => onNavigateToMarketplace?.(), active: !!isMarketplaceActive, disabled: false, icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75z" />
      </svg>
    )},
    { id: 'marketing', label: 'Marketing', onClick: () => onNavigateToMarketing?.(), active: !!isMarketingActive, disabled: false, icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    )},
  ];

  return (
    <div
      ref={containerRef}
      className="hidden lg:flex fixed z-30"
      style={{
        top: '50%',
        ...(side === 'left' ? { left: '12px' } : { right: '12px' }),
        transform: `translateY(calc(-50% + ${yOffset}px))`,
      }}
    >
      <div
        data-tour-id="tools-strip"
        className="relative flex flex-col items-center rounded-2xl py-5 px-1.5 gap-5 shadow-lg select-none"
        style={{
          backgroundColor: bg,
          cursor: disableDrag ? 'default' : isDragging ? 'grabbing' : 'grab',
          touchAction: disableDrag ? 'auto' : 'none',
        }}
        onPointerDown={disableDrag ? undefined : handlePointerDown}
        onPointerMove={disableDrag ? undefined : handlePointerMove}
        onPointerUp={disableDrag ? undefined : handlePointerUp}
      >
        {buttons.map(btn => (
          <div key={btn.id} className="relative">
            <button
              data-tour-id={`tool-${btn.id}`}
              onClick={disableDrag ? btn.onClick : guardClick(btn.onClick)}
              onMouseEnter={() => !isDragging && setTooltip(btn.id)}
              onMouseLeave={() => setTooltip(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              disabled={btn.disabled}
              style={{
                backgroundColor: btn.active ? activeOverlay : 'transparent',
                color: iconColor,
                opacity: btn.disabled ? mutedOpacity : btn.active ? 1 : 0.85,
                pointerEvents: 'auto',
              }}
            >
              {btn.icon}
            </button>

            {/* Tooltip */}
            {tooltip === btn.id && !isDragging && (
              <div
                className="absolute top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none"
                style={{
                  backgroundColor: bg,
                  color: iconColor,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  ...(side === 'left'
                    ? { left: '100%', marginLeft: '12px' }
                    : { right: '100%', marginRight: '12px' }),
                }}
              >
                {btn.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
