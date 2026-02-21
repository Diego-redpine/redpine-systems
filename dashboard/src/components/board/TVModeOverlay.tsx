'use client';
import { useEffect, useState, useCallback } from 'react';
import { BoardData } from './board-demo-data';
import { BoardSections, activeSectionCount } from './board-detect';
import { BoardStatsBar, StatItem } from './BoardStatsBar';
import { BoardClock } from './BoardClock';
import { ScheduleCard } from './ScheduleCard';
import { OrderBoard } from './OrderBoard';
import { ClassScheduleCard } from './ClassScheduleCard';
import { QueueCard } from './QueueCard';
import { PipelineCard } from './PipelineCard';

interface TVModeOverlayProps {
  data: BoardData;
  sections: BoardSections;
  statItems?: StatItem[];
  businessName?: string;
  logoUrl?: string;
  accentColor?: string;
  onExit?: () => void;
}

export function TVModeOverlay({
  data,
  sections,
  statItems,
  businessName,
  logoUrl,
  accentColor,
  onExit,
}: TVModeOverlayProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onExit?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Collect active cards
  const cards: { key: string; component: React.ReactNode }[] = [];

  if (sections.schedule) {
    cards.push({
      key: 'schedule',
      component: <ScheduleCard appointments={data.schedule} tvMode accentColor={accentColor} />,
    });
  }
  if (sections.orders) {
    cards.push({
      key: 'orders',
      component: <OrderBoard orders={data.orders} tvMode accentColor={accentColor} />,
    });
  }
  if (sections.classes) {
    cards.push({
      key: 'classes',
      component: <ClassScheduleCard classes={data.classes} tvMode accentColor={accentColor} />,
    });
  }
  if (sections.queue) {
    cards.push({
      key: 'queue',
      component: <QueueCard queue={data.queue} tvMode accentColor={accentColor} />,
    });
  }
  if (sections.pipeline) {
    cards.push({
      key: 'pipeline',
      component: <PipelineCard stages={data.pipeline} tvMode accentColor={accentColor} />,
    });
  }

  const totalCards = cards.length;
  const needsCycling = totalCards > 4;
  const totalPages = needsCycling ? Math.ceil(totalCards / 4) : 1;

  // Auto-cycle pages every 15 seconds
  useEffect(() => {
    if (!needsCycling) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 15000);
    return () => clearInterval(interval);
  }, [needsCycling, totalPages]);

  // Get visible cards for current page
  const visibleCards = needsCycling
    ? cards.slice(currentPage * 4, currentPage * 4 + 4)
    : cards;

  // Determine grid classes based on visible card count
  const gridClass = (() => {
    const count = visibleCards.length;
    if (count === 1) return 'grid grid-cols-1 gap-4';
    if (count === 2) return 'grid grid-cols-2 gap-4';
    return 'grid grid-cols-2 gap-4';
  })();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0A0A0A',
      }}
      className="flex flex-col overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: 40 }}
              className="object-contain"
            />
          )}
          <span className="text-2xl font-bold text-white">
            {businessName || 'Live Board'}
          </span>
        </div>
        <BoardClock tvMode />
      </div>

      {/* Stats bar */}
      <div className="px-6 shrink-0">
        {statItems && <BoardStatsBar items={statItems} tvMode accentColor={accentColor} />}
      </div>

      {/* Card grid */}
      <div className="flex-1 px-6 py-4 min-h-0">
        <div className={`${gridClass} h-full`}>
          {visibleCards.map((card) => (
            <div key={card.key} className="min-h-0 overflow-hidden">
              {card.component}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators for cycling */}
      {needsCycling && (
        <div className="flex items-center justify-center gap-2 pb-4 shrink-0">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentPage ? 10 : 8,
                height: i === currentPage ? 10 : 8,
                background: i === currentPage
                  ? (accentColor || '#FFFFFF')
                  : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
