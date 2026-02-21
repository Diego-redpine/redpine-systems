'use client';

import React, { useState, useMemo } from 'react';
import { BoardSections } from './board/board-detect';
import { BoardData } from './board/board-demo-data';
import { useBoardData } from './board/useBoardData';
import { BoardStatsBar, StatItem } from './board/BoardStatsBar';
import { BoardClock } from './board/BoardClock';
import { ScheduleCard } from './board/ScheduleCard';
import { OrderBoard } from './board/OrderBoard';
import { ClassScheduleCard } from './board/ClassScheduleCard';
import { QueueCard } from './board/QueueCard';
import { PipelineCard } from './board/PipelineCard';
import { TVModeOverlay } from './board/TVModeOverlay';

type BoardType = 'schedule' | 'orders' | 'classes' | 'queue' | 'pipeline';

/**
 * Determine which SINGLE board type fits this business.
 * Each business gets ONE focused board — not a multi-section Frankenstein.
 */
function getBoardType(businessType?: string): BoardType {
  if (!businessType) return 'schedule';
  const t = businessType.toLowerCase();

  if (['restaurant', 'cafe', 'bakery', 'food_truck', 'bar', 'catering', 'pizzeria',
    'coffee_shop', 'juice_bar', 'food', 'deli', 'ice_cream', 'brewery', 'winery',
    'butcher', 'seafood'].some(k => t.includes(k))) {
    return 'orders';
  }

  if (['gym', 'yoga', 'dance', 'martial_art', 'fitness', 'pilates', 'crossfit',
    'boxing', 'swimming', 'music_school', 'tutoring', 'education', 'training',
    'karate', 'jiu_jitsu', 'taekwondo', 'kickboxing'].some(k => t.includes(k))) {
    return 'classes';
  }

  if (['contractor', 'plumber', 'electrician', 'handyman', 'hvac', 'roofing',
    'construction', 'landscaping', 'painting', 'cleaning', 'consulting', 'law',
    'accounting', 'real_estate', 'insurance', 'marketing_agency', 'web_design',
    'it_services', 'moving', 'pest_control', 'solar'].some(k => t.includes(k))) {
    return 'pipeline';
  }

  if (['barbershop', 'walk_in', 'clinic', 'urgent_care', 'dmv'].some(k => t.includes(k))) {
    return 'queue';
  }

  return 'schedule';
}

function boardTypeToSections(boardType: BoardType): BoardSections {
  return {
    schedule: boardType === 'schedule',
    orders: boardType === 'orders',
    classes: boardType === 'classes',
    queue: boardType === 'queue',
    pipeline: boardType === 'pipeline',
  };
}

const BOARD_LABELS: Record<BoardType, string> = {
  schedule: "Today's Schedule",
  orders: 'Order Board',
  classes: "Today's Classes",
  queue: 'Queue Board',
  pipeline: 'Pipeline Board',
};

// SVG icon helpers
const CalendarIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const ClockIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const CheckIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const UsersIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>;
const BagIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const FireIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /></svg>;
const BriefcaseIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
const HashIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" /></svg>;

/**
 * Build stat cards based on board type and actual data
 */
function getStatsForBoardType(boardType: BoardType, data: BoardData): StatItem[] {
  switch (boardType) {
    case 'schedule': {
      const total = data.schedule.length;
      const inProgress = data.schedule.filter(a => a.status === 'in_progress').length;
      const upcoming = data.schedule.filter(a => a.status === 'upcoming').length;
      const completed = data.schedule.filter(a => a.status === 'completed').length;
      return [
        { label: 'Appointments', value: total, featured: true, icon: CalendarIcon },
        { label: 'In Progress', value: inProgress, icon: ClockIcon },
        { label: 'Upcoming', value: upcoming, icon: FireIcon },
        { label: 'Completed', value: completed, icon: CheckIcon },
      ];
    }
    case 'orders': {
      const newOrders = data.orders.filter(o => o.status === 'new').length;
      const preparing = data.orders.filter(o => o.status === 'preparing').length;
      const ready = data.orders.filter(o => o.status === 'ready').length;
      const completed = data.orders.filter(o => o.status === 'completed').length;
      return [
        { label: 'New Orders', value: newOrders, featured: true, icon: BagIcon },
        { label: 'Preparing', value: preparing, icon: FireIcon },
        { label: 'Ready', value: ready, icon: CheckIcon },
        { label: 'Completed', value: completed, icon: BriefcaseIcon },
      ];
    }
    case 'classes': {
      const total = data.classes.length;
      const enrolled = data.classes.reduce((s, c) => s + c.enrolled, 0);
      const available = data.classes.reduce((s, c) => s + Math.max(0, c.capacity - c.enrolled), 0);
      const instructors = new Set(data.classes.map(c => c.instructor).filter(Boolean)).size;
      return [
        { label: 'Classes Today', value: total, featured: true, icon: CalendarIcon },
        { label: 'Total Enrolled', value: enrolled, icon: UsersIcon },
        { label: 'Spots Available', value: available, icon: CheckIcon },
        { label: 'Instructors', value: instructors, icon: BriefcaseIcon },
      ];
    }
    case 'pipeline': {
      const totalItems = data.pipeline.reduce((s, p) => s + p.count, 0);
      const stages = data.pipeline.length;
      const topStage = data.pipeline.length > 0
        ? data.pipeline.reduce((a, b) => a.count > b.count ? a : b)
        : null;
      return [
        { label: 'Active Items', value: totalItems, featured: true, icon: BriefcaseIcon },
        { label: 'Stages', value: stages, icon: HashIcon },
        { label: 'Busiest Stage', value: topStage?.stage || '—', icon: FireIcon },
        { label: 'In First Stage', value: data.pipeline[0]?.count || 0, icon: ClockIcon },
      ];
    }
    case 'queue': {
      return [
        { label: 'Now Serving', value: `#${data.queue.currentNumber}`, featured: true, icon: HashIcon },
        { label: 'Waiting', value: data.queue.waiting.length, icon: UsersIcon },
        { label: 'Avg Wait', value: `${data.queue.avgWait}m`, icon: ClockIcon },
        { label: 'Served Today', value: data.queue.currentNumber, icon: CheckIcon },
      ];
    }
  }
}

interface LiveBoardProps {
  colors?: {
    buttons?: string;
    cards?: string;
    text?: string;
    headings?: string;
    background?: string;
    [key: string]: string | undefined;
  };
  businessName?: string;
  businessType?: string;
}

export default function LiveBoard({ colors, businessName, businessType }: LiveBoardProps) {
  const [showTVMode, setShowTVMode] = useState(false);

  const boardType = useMemo(() => getBoardType(businessType), [businessType]);
  const sections = useMemo(() => boardTypeToSections(boardType), [boardType]);
  const { data, isLoading, lastUpdated } = useBoardData(sections);

  const accentColor = colors?.buttons || '#3B82F6';
  const textColor = colors?.text || '#111827';

  const statItems = useMemo(() => getStatsForBoardType(boardType, data), [boardType, data]);

  function formatLastUpdated(): string {
    if (!lastUpdated) return '';
    const seconds = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 10) return 'Updated just now';
    if (seconds < 60) return `Updated ${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    return `Updated ${minutes}m ago`;
  }

  function renderBoard() {
    switch (boardType) {
      case 'schedule':
        return <ScheduleCard appointments={data.schedule} accentColor={accentColor} />;
      case 'orders':
        return <OrderBoard orders={data.orders} accentColor={accentColor} />;
      case 'classes':
        return <ClassScheduleCard classes={data.classes} accentColor={accentColor} />;
      case 'queue':
        return <QueueCard queue={data.queue} accentColor={accentColor} />;
      case 'pipeline':
        return <PipelineCard stages={data.pipeline} accentColor={accentColor} />;
    }
  }

  return (
    <div className="h-full w-full overflow-auto" style={{ color: textColor }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold" style={{ color: colors?.headings || '#111827' }}>
            {BOARD_LABELS[boardType]}
          </span>
          {isLoading && (
            <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">{formatLastUpdated()}</span>
          )}
          <BoardClock />
          <button
            onClick={() => setShowTVMode(true)}
            className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            TV Mode
          </button>
        </div>
      </div>

      {/* Stats Bar — contextual to board type */}
      <div className="mb-6">
        <BoardStatsBar items={statItems} accentColor={accentColor} />
      </div>

      {/* Single focused board — full width */}
      {renderBoard()}

      {/* TV Mode Overlay */}
      {showTVMode && (
        <TVModeOverlay
          data={data}
          sections={sections}
          statItems={statItems}
          businessName={businessName}
          accentColor={accentColor}
          onExit={() => setShowTVMode(false)}
        />
      )}
    </div>
  );
}
