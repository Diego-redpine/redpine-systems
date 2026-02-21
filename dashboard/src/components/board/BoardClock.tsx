'use client';

import { useState, useEffect } from 'react';

interface BoardClockProps {
  tvMode?: boolean;
}

export function BoardClock({ tvMode = false }: BoardClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): string => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatDate = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    return `${dayName}, ${monthName} ${dayNum}`;
  };

  const timeColor = tvMode ? '#FFFFFF' : '#6B7280';
  const dateColor = tvMode ? 'rgba(255,255,255,0.7)' : '#9CA3AF';

  return (
    <div className="flex flex-col items-end">
      <span
        className={`font-mono font-semibold ${tvMode ? 'text-xl' : 'text-sm'}`}
        style={{ color: timeColor }}
      >
        {formatTime(now)}
      </span>
      <span
        className={`font-['Inter'] ${tvMode ? 'text-xl' : 'text-sm'}`}
        style={{ color: dateColor }}
      >
        {formatDate(now)}
      </span>
    </div>
  );
}
