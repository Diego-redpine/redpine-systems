'use client';

import { BoardAppointment } from './board-demo-data';

interface ScheduleCardProps {
  appointments: BoardAppointment[];
  accentColor?: string;
  tvMode?: boolean;
  maxItems?: number;
}

const STATUS_COLORS: Record<BoardAppointment['status'], string> = {
  completed: '#6B7280',
  in_progress: '#10B981',
  upcoming: '#3B82F6',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<BoardAppointment['status'], string> = {
  completed: 'Done',
  in_progress: 'In Progress',
  upcoming: 'Upcoming',
  cancelled: 'Cancelled',
};

function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

export function ScheduleCard({
  appointments,
  accentColor = '#3B82F6',
  tvMode = false,
  maxItems = 8,
}: ScheduleCardProps) {
  const visible = appointments.slice(0, maxItems);
  const overflow = appointments.length - maxItems;

  const bg = tvMode ? '#1A1A1A' : '#FFFFFF';
  const textPrimary = tvMode ? '#FFFFFF' : '#111827';
  const textSecondary = tvMode ? '#9CA3AF' : '#6B7280';
  const textSize = tvMode ? 'text-lg' : 'text-sm';
  const headerSize = tvMode ? 'text-xl' : 'text-base';

  return (
    <div
      className="p-5 h-full flex flex-col"
      style={{ backgroundColor: bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`${headerSize} font-semibold`}
          style={{ color: textPrimary }}
        >
          Today&apos;s Schedule
        </h3>
        <span
          className="text-xs font-medium px-2 py-0.5 "
          style={{
            backgroundColor: accentColor + '20',
            color: accentColor,
          }}
        >
          {appointments.length}
        </span>
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ color: textSecondary }}
        >
          <p className={textSize}>No appointments today</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {visible.map((appt) => {
            const isActive = appt.status === 'in_progress';
            const statusColor = STATUS_COLORS[appt.status];

            return (
              <div
                key={appt.id}
                className={`flex items-center gap-3 px-3 py-2 ${textSize}`}
                style={{
                  borderLeft: isActive
                    ? `3px solid ${accentColor}`
                    : '3px solid transparent',
                  backgroundColor: isActive
                    ? accentColor + '08'
                    : 'transparent',
                }}
              >
                {/* Time */}
                <span
                  className="shrink-0 font-medium w-[5.5rem] text-right"
                  style={{ color: textSecondary }}
                >
                  {formatTime12h(appt.time)}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-medium truncate"
                      style={{ color: textPrimary }}
                    >
                      {appt.client}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate"
                      style={{ color: textSecondary, fontSize: tvMode ? '0.875rem' : '0.75rem' }}
                    >
                      {appt.title}
                    </span>
                    {appt.staff && (
                      <span
                        className="truncate"
                        style={{ color: textSecondary, fontSize: tvMode ? '0.75rem' : '0.675rem' }}
                      >
                        &middot; {appt.staff}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className="shrink-0 text-xs font-medium px-2 py-0.5 "
                  style={{
                    backgroundColor: statusColor + '20',
                    color: statusColor,
                  }}
                >
                  {STATUS_LABELS[appt.status]}
                </span>
              </div>
            );
          })}

          {/* Overflow */}
          {overflow > 0 && (
            <p
              className={`${textSize} text-center mt-1`}
              style={{ color: textSecondary }}
            >
              and {overflow} more&hellip;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
