'use client';

import type { BoardClass } from './board-demo-data';

interface ClassScheduleCardProps {
  classes: BoardClass[];
  accentColor?: string;
  tvMode?: boolean;
}

function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

export function ClassScheduleCard({ classes, accentColor = '#3B82F6', tvMode = false }: ClassScheduleCardProps) {
  const bg = tvMode ? '#1A1A1A' : '#FFFFFF';
  const textPrimary = tvMode ? '#FFFFFF' : '#111827';
  const textSecondary = tvMode ? '#9CA3AF' : '#6B7280';
  const barBg = tvMode ? '#374151' : '#E5E7EB';
  const fontSize = tvMode ? 'text-base' : 'text-sm';

  return (
    <div className="p-5" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${tvMode ? 'text-xl' : 'text-lg'}`} style={{ color: textPrimary }}>
          Today&apos;s Classes
        </h3>
        <span
          className={`${fontSize} font-medium px-2.5 py-0.5 rounded-full`}
          style={{ backgroundColor: accentColor + '1A', color: accentColor }}
        >
          {classes.length}
        </span>
      </div>

      {/* Class rows */}
      <div className="space-y-3">
        {classes.map((cls) => {
          const isFull = cls.enrolled >= cls.capacity;
          const isCompleted = cls.status === 'completed';
          const isInProgress = cls.status === 'in_progress';
          const fillPct = Math.min((cls.enrolled / cls.capacity) * 100, 100);

          return (
            <div
              key={cls.id}
              className={`flex items-center gap-3 px-3 py-2.5 ${fontSize}`}
              style={{
                opacity: isCompleted ? 0.45 : 1,
                borderLeft: isInProgress ? `3px solid ${accentColor}` : '3px solid transparent',
                backgroundColor: isInProgress
                  ? (tvMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)')
                  : 'transparent',
              }}
            >
              {/* Time */}
              <span
                className="shrink-0 w-[72px] tabular-nums"
                style={{ color: textSecondary }}
              >
                {formatTime12h(cls.time)}
              </span>

              {/* Name + Instructor */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold block truncate" style={{ color: textPrimary }}>
                  {cls.name}
                </span>
                <span className="block truncate" style={{ color: textSecondary }}>
                  {cls.instructor}
                </span>
              </div>

              {/* Capacity bar + count */}
              <div className="shrink-0 flex items-center gap-2 w-[120px]">
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: barBg }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      backgroundColor: isFull ? '#EF4444' : accentColor,
                    }}
                  />
                </div>
                {isFull ? (
                  <span className="text-xs font-bold shrink-0" style={{ color: '#EF4444' }}>
                    FULL
                  </span>
                ) : (
                  <span className="text-xs tabular-nums shrink-0" style={{ color: textSecondary }}>
                    {cls.enrolled}/{cls.capacity}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
