'use client';

import React, { useState, useMemo, useCallback } from 'react';

export interface MonthCalendarProps {
  selectedDate: string | null; // YYYY-MM-DD format
  onSelectDate: (dateISO: string) => void;
  availableDays?: Set<string>; // Set of YYYY-MM-DD where business is open (if undefined, all future days are available)
  accentColor?: string; // Highlight color for selected date (default '#3B82F6')
  minDate?: Date; // Earliest selectable date (default: tomorrow)
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/** Parse a hex color and return an rgba string at the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  selectedDate,
  onSelectDate,
  availableDays,
  accentColor = '#3B82F6',
  minDate,
}) => {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const effectiveMinDate = useMemo(() => {
    if (minDate) return minDate;
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate]);

  const todayStr = toDateString(now.getFullYear(), now.getMonth(), now.getDate());

  // Cannot navigate before the month containing today
  const canGoPrev = currentYear > now.getFullYear()
    || (currentYear === now.getFullYear() && currentMonth > now.getMonth());

  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }, [canGoPrev, currentMonth]);

  const handleNext = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }, [currentMonth]);

  // Build grid cells
  const cells = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const result: Array<{
      day: number;
      month: number; // 0-indexed
      year: number;
      isCurrentMonth: boolean;
      dateStr: string;
    }> = [];

    // Leading days from previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      result.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr: toDateString(prevYear, prevMonth, d),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateStr: toDateString(currentYear, currentMonth, d),
      });
    }

    // Trailing days from next month to fill 6 rows
    const totalCells = 42; // 6 rows x 7 cols
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    let nextDay = 1;
    while (result.length < totalCells) {
      result.push({
        day: nextDay,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr: toDateString(nextYear, nextMonth, nextDay),
      });
      nextDay++;
    }

    return result;
  }, [currentYear, currentMonth]);

  const getDayState = useCallback(
    (cell: (typeof cells)[0]) => {
      const cellDate = new Date(cell.year, cell.month, cell.day);
      const isToday = cell.dateStr === todayStr;
      const isSelected = cell.dateStr === selectedDate;
      const isPast = cellDate < effectiveMinDate && !isSameDay(cellDate, effectiveMinDate);
      const isOtherMonth = !cell.isCurrentMonth;

      let isUnavailable = false;
      if (!isPast && !isOtherMonth && availableDays !== undefined) {
        isUnavailable = !availableDays.has(cell.dateStr);
      }

      const isClickable = cell.isCurrentMonth && !isPast && !isUnavailable;

      return { isToday, isSelected, isPast, isOtherMonth, isUnavailable, isClickable };
    },
    [todayStr, selectedDate, effectiveMinDate, availableDays],
  );

  // Chevron SVG path
  const chevronLeft = 'M15 19l-7-7 7-7';
  const chevronRight = 'M9 5l7 7-7 7';

  return (
    <div
      style={{
        fontFamily: FONT_STACK,
        borderRadius: 12,
        padding: 20,
        userSelect: 'none',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: canGoPrev ? 'pointer' : 'default',
            opacity: canGoPrev ? 1 : 0.3,
            padding: 0,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (canGoPrev) (e.currentTarget.style.backgroundColor = '#F3F4F6');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={chevronLeft} />
          </svg>
        </button>

        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
          }}
        >
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>

        <button
          onClick={handleNext}
          aria-label="Next month"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            padding: 0,
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={chevronRight} />
          </svg>
        </button>
      </div>

      {/* Day-of-week row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: 4,
        }}
      >
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 500,
              color: '#9CA3AF',
              padding: '4px 0',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid: 6 rows x 7 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
        }}
      >
        {cells.map((cell) => {
          const { isToday, isSelected, isPast, isOtherMonth, isUnavailable, isClickable } = getDayState(cell);
          const isHovered = hoveredDay === cell.dateStr && isClickable && !isSelected;

          // Determine styles based on state
          let backgroundColor = 'transparent';
          let color = '#1A1A1A';
          let fontWeight: number = 400;
          let cursor = 'default';
          let borderRadius = 10;
          let boxShadow = 'none';

          if (isSelected) {
            backgroundColor = accentColor;
            color = '#FFFFFF';
            fontWeight = 600;
            cursor = 'pointer';
            borderRadius = 10;
          } else if (isHovered) {
            backgroundColor = hexToRgba(accentColor, 0.1);
            color = '#1A1A1A';
            fontWeight = 500;
            cursor = 'pointer';
          } else if (isOtherMonth) {
            color = '#D1D5DB';
          } else if (isPast) {
            color = '#D1D5DB';
          } else if (isUnavailable) {
            color = '#D1D5DB';
          } else {
            // Available future day
            fontWeight = 500;
            cursor = 'pointer';
          }

          if (isToday && !isSelected) {
            boxShadow = `inset 0 0 0 1.5px ${hexToRgba(accentColor, 0.4)}`;
          }

          return (
            <button
              key={cell.dateStr}
              onClick={() => {
                if (isClickable) onSelectDate(cell.dateStr);
              }}
              onMouseEnter={() => setHoveredDay(cell.dateStr)}
              onMouseLeave={() => setHoveredDay(null)}
              disabled={!isClickable}
              aria-label={`${MONTH_NAMES[cell.month]} ${cell.day}, ${cell.year}`}
              aria-pressed={isSelected}
              style={{
                width: '100%',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight,
                color,
                backgroundColor,
                border: 'none',
                borderRadius,
                boxShadow,
                cursor,
                padding: 0,
                fontFamily: FONT_STACK,
                transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
                lineHeight: 1,
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
