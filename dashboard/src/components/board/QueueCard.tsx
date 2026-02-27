'use client';

import type { BoardQueue } from './board-demo-data';

interface QueueCardProps {
  queue: BoardQueue;
  accentColor?: string;
  tvMode?: boolean;
}

export function QueueCard({ queue, accentColor = '#3B82F6', tvMode = false }: QueueCardProps) {
  const bg = tvMode ? '#1A1A1A' : '#FFFFFF';
  const textPrimary = tvMode ? '#FFFFFF' : '#111827';
  const textSecondary = tvMode ? '#9CA3AF' : '#6B7280';
  const fontSize = tvMode ? 'text-base' : 'text-sm';

  if (queue.currentNumber === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: bg }}>
        <p className={`${tvMode ? 'text-xl' : 'text-lg'} font-medium`} style={{ color: textSecondary }}>
          No active queue
        </p>
      </div>
    );
  }

  const nextThree = queue.waiting.slice(0, 3);

  return (
    <div className="p-6 flex flex-col items-center text-center" style={{ backgroundColor: bg }}>
      {/* NOW SERVING label */}
      <span
        className="text-sm font-semibold uppercase tracking-widest mb-2"
        style={{ color: textSecondary }}
      >
        Now Serving
      </span>

      {/* Big number */}
      <span
        className={`${tvMode ? 'text-7xl' : 'text-5xl'} font-bold leading-none mb-3`}
        style={{ color: accentColor }}
      >
        {queue.currentNumber}
      </span>

      {/* Waiting / Avg Wait summary */}
      <p className={`${fontSize} mb-4`} style={{ color: textSecondary }}>
        Waiting: {queue.waiting.length} &middot; Avg Wait: {queue.avgWait}m
      </p>

      {/* Next 3 waiting entries */}
      {nextThree.length > 0 && (
        <div className="w-full space-y-1.5">
          {nextThree.map((entry, i) => (
            <p key={i} className={fontSize} style={{ color: textPrimary }}>
              {entry.name} (party of {entry.partySize}) &mdash; {entry.waitMinutes}m
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
