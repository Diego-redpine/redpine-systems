'use client';

import { useEffect } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
  configColors?: DashboardColors;
}

export default function CenterModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-lg',
  children,
  headerRight,
  noPadding,
  configColors,
}: CenterModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bg = configColors?.cards || '#FFFFFF';
  const headingColor = configColors?.headings || '#1A1A1A';
  const borderColor = configColors?.borders || '#E5E7EB';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-modalFadeIn"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`${maxWidth} w-full shadow-xl flex flex-col max-h-[85vh] pointer-events-auto animate-modalScaleIn overflow-hidden`}
          style={{ backgroundColor: bg }}
        >
          {/* Header */}
          {title && (
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
              style={{ borderColor }}
            >
              <div>
                <h2 className="text-sm font-semibold" style={{ color: headingColor }}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs mt-0.5" style={{ color: headingColor, opacity: 0.6 }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {headerRight}
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center transition-colors hover:opacity-70"
                  style={{ color: headingColor, opacity: 0.5 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-5'}`}>
            {children}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modalFadeIn {
          animation: modalFadeIn 0.15s ease-out;
        }
        .animate-modalScaleIn {
          animation: modalScaleIn 0.15s ease-out;
        }
      `}</style>
    </>
  );
}
