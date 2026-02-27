'use client';

import { useMemo, useRef, useCallback, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DashboardColors } from '@/types/config';
import { EntityFieldConfig } from '@/lib/entity-fields';
import { getContrastText } from '@/lib/view-colors';

interface CalendarViewProps {
  data: Record<string, unknown>[];
  entityType: string;
  configColors: DashboardColors;
  fields: EntityFieldConfig['calendar'] | null;
  onRecordClick?: (record: Record<string, unknown>) => void;
  onRecordUpdate?: (record: Record<string, unknown>) => void;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onDateSelect?: (start: Date, end: Date) => void;
}

export default function CalendarView({
  data,
  configColors,
  fields,
  onRecordClick,
  onRecordUpdate,
  onDateRangeChange,
  onDateSelect,
}: CalendarViewProps) {
  const buttonColor = configColors.buttons || '#DC2626';
  const cardBg = configColors.cards || '#FFFFFF';
  const borderColor = configColors.borders || '#E5E7EB';
  const headingColor = configColors.headings || '#1A1A1A';
  const textColor = configColors.text || '#1A1A1A';

  const calendarRef = useRef<FullCalendar>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Detect which event types exist in the data
  const eventTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((record) => {
      if (record.event_type && typeof record.event_type === 'string') {
        types.add(record.event_type);
      }
    });
    return types;
  }, [data]);

  // Only show filter if multiple types exist
  const showFilter = eventTypes.size > 1;

  const titleField = fields?.title || 'title';
  const startField = fields?.startField || 'start_time';
  const endField = fields?.endField || 'end_time';

  // In month view, clicking a day navigates to day view
  const handleDateClick = useCallback((info: { date: Date; view: { type: string } }) => {
    if (info.view.type === 'dayGridMonth' && calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView('timeGridDay', info.date);
    }
  }, []);

  // Event type default colors (universal calendar)
  const EVENT_TYPE_COLORS: Record<string, string> = {
    appointment: '#3B82F6',
    class: '#8B5CF6',
    shift: '#10B981',
  };

  // Filter data by active event type filter
  const filteredData = useMemo(() => {
    if (activeFilter === 'all') return data;
    return data.filter((record) => record.event_type === activeFilter);
  }, [data, activeFilter]);

  // Map data records to FullCalendar event objects
  const events = useMemo(() => {
    return filteredData.map((record) => {
      const isBlocked = record.record_type === 'blocked' || record.status === 'blocked';

      // Color priority: blocked → explicit color_primary → event_type default → buttonColor
      let eventColor: string;
      if (isBlocked) {
        eventColor = '#6B7280';
      } else if (record.color_primary) {
        eventColor = record.color_primary as string;
      } else if (record.event_type && EVENT_TYPE_COLORS[record.event_type as string]) {
        eventColor = EVENT_TYPE_COLORS[record.event_type as string];
      } else {
        eventColor = buttonColor;
      }

      return {
        id: String(record.id || ''),
        title: String(record[titleField] || (isBlocked ? 'Blocked' : '')),
        start: record[startField] as string,
        end: record[endField] as string | undefined,
        backgroundColor: eventColor,
        borderColor: eventColor,
        textColor: getContrastText(eventColor),
        editable: !isBlocked,
        classNames: isBlocked
          ? ['fc-event-blocked']
          : record.event_type
            ? [`fc-event-type-${record.event_type}`]
            : [],
        extendedProps: { record },
      };
    });
  }, [filteredData, titleField, startField, endField, buttonColor]);

  if (!fields) {
    return (
      <div
        className="flex items-center justify-center h-full shadow-sm p-12"
        style={{ backgroundColor: cardBg, color: configColors.icons || '#6B7280' }}
      >
        No calendar configuration available for this entity
      </div>
    );
  }

  const bgColor = configColors.background || '#F5F5F5';

  return (
    <div className="overflow-hidden p-6" style={{ backgroundColor: bgColor }}>
      <style>{`
        .fc {
          --fc-border-color: transparent;
          --fc-button-bg-color: ${buttonColor};
          --fc-button-border-color: ${buttonColor};
          --fc-button-hover-bg-color: ${buttonColor}dd;
          --fc-button-hover-border-color: ${buttonColor}dd;
          --fc-button-active-bg-color: ${buttonColor};
          --fc-button-active-border-color: ${buttonColor};
          --fc-button-text-color: ${getContrastText(buttonColor)};
          --fc-today-bg-color: transparent;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          --fc-list-event-hover-bg-color: ${buttonColor}08;
          --fc-event-border-color: transparent;
          font-family: inherit;
        }

        /* Toolbar */
        .fc .fc-toolbar {
          margin-bottom: 16px !important;
        }
        .fc .fc-toolbar-title {
          color: ${headingColor};
          font-size: 1.1rem;
          font-weight: 600;
        }
        .fc .fc-button {
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0;
          font-weight: 500;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: ${buttonColor};
          border-color: ${buttonColor};
        }
        .fc .fc-button-group {
          gap: 2px;
        }

        /* Month view — card-style days */
        .fc table {
          border-collapse: separate !important;
          border-spacing: 4px !important;
        }
        .fc td, .fc th {
          border: none !important;
        }
        .fc .fc-scrollgrid {
          border: none !important;
        }

        /* Day header */
        .fc .fc-col-header-cell {
          border: none !important;
          padding: 8px 0;
        }
        .fc .fc-col-header-cell-cushion {
          color: ${textColor};
          text-decoration: none;
          font-weight: 600;
          font-size: 0.8rem;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Today header label — button color pill in week/day views */
        .fc-timeGridWeek-view .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion,
        .fc-timeGridDay-view .fc-col-header-cell .fc-col-header-cell-cushion {
          background: ${buttonColor};
          color: ${getContrastText(buttonColor)};
          opacity: 1;
          border-radius: 0;
          padding: 4px 12px;
          display: inline-block;
        }

        /* Today all-day cell — button color in week/day views */
        .fc-timeGridWeek-view .fc-daygrid-day.fc-day-today .fc-daygrid-day-frame,
        .fc-timeGridDay-view .fc-daygrid-day .fc-daygrid-day-frame {
          background: ${buttonColor} !important;
          border-radius: 0;
        }

        /* Day cells as mini cards — fixed height */
        .fc .fc-daygrid-day {
          background: transparent !important;
        }
        .fc .fc-daygrid-day-frame {
          border-radius: 0;
          background: ${cardBg};
          border: 1px solid ${borderColor};
          height: 110px;
          overflow: hidden;
          transition: border-color 0.15s ease;
        }
        .fc .fc-daygrid-day-frame:hover {
          border-color: ${textColor}40;
        }
        .fc .fc-daygrid-day-number {
          color: ${textColor};
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 8px 10px;
        }

        /* Today highlight — inset ring */
        .fc .fc-daygrid-day.fc-day-today {
          background: transparent !important;
        }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-frame {
          border: 2px solid ${buttonColor};
        }

        /* Other month days */
        .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-frame {
          opacity: 0.45;
        }

        /* "+N more" link */
        .fc .fc-daygrid-more-link {
          color: ${buttonColor};
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0 10px 4px;
        }

        /* Blocked time events — diagonal stripes */
        .fc .fc-event-blocked {
          background-image: repeating-linear-gradient(
            135deg,
            transparent,
            transparent 3px,
            rgba(255,255,255,0.15) 3px,
            rgba(255,255,255,0.15) 6px
          ) !important;
          cursor: not-allowed !important;
          opacity: 0.85;
        }
        .fc .fc-event-blocked:active {
          cursor: not-allowed !important;
        }

        /* Events */
        .fc .fc-event {
          border-radius: 0;
          padding: 3px 8px;
          margin: 2px 4px;
          font-size: 0.75rem;
          cursor: grab;
          border: none;
        }
        .fc .fc-event:active {
          cursor: grabbing;
        }
        .fc .fc-daygrid-event {
          margin: 2px 4px;
        }
        .fc .fc-timegrid-event {
          border-radius: 0;
        }
        .fc .fc-highlight {
          background: ${buttonColor}20;
          border-radius: 0;
        }

        /* Week view — card columns */
        .fc-timeGridWeek-view .fc-timegrid-col {
          background: ${cardBg} !important;
          border-radius: 0;
          border: 1px solid ${borderColor} !important;
        }
        .fc-timeGridWeek-view .fc-timegrid-col-frame {
          margin: 0 2px;
        }
        /* Day view — full-width card */
        .fc-timeGridDay-view .fc-timegrid-col {
          background: ${cardBg} !important;
          border-radius: 0;
          border: 1px solid ${borderColor} !important;
        }

        /* Time labels */
        .fc .fc-timegrid-slot-label-cushion {
          color: ${textColor};
          opacity: 0.5;
          font-size: 0.75rem;
        }

        /* Links */
        .fc a {
          color: inherit;
        }
      `}</style>
      {showFilter && (
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'all', label: 'All', color: buttonColor },
            { key: 'appointment', label: 'Appointments', color: EVENT_TYPE_COLORS.appointment },
            { key: 'class', label: 'Classes', color: EVENT_TYPE_COLORS.class },
            { key: 'shift', label: 'Shifts', color: EVENT_TYPE_COLORS.shift },
          ]
            .filter((f) => f.key === 'all' || eventTypes.has(f.key))
            .map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? f.color : 'transparent',
                    color: isActive ? getContrastText(f.color) : textColor,
                    border: `1.5px solid ${isActive ? f.color : borderColor}`,
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {f.key !== 'all' && (
                    <span
                      className="w-2 h-2 "
                      style={{ backgroundColor: f.color }}
                    />
                  )}
                  {f.label}
                </button>
              );
            })}
        </div>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        editable={!!onRecordUpdate}
        eventDurationEditable={!!onRecordUpdate}
        selectable={!!onDateSelect}
        selectMirror={true}
        dayMaxEvents={2}
        dateClick={handleDateClick}
        moreLinkClick="day"
        eventClick={(info) => {
          const record = info.event.extendedProps.record as Record<string, unknown>;
          onRecordClick?.(record);
        }}
        eventDrop={(info) => {
          if (!onRecordUpdate) return;
          const record = info.event.extendedProps.record as Record<string, unknown>;
          const updated = {
            ...record,
            [startField]: info.event.start?.toISOString(),
            [endField]: info.event.end?.toISOString() || info.event.start?.toISOString(),
          };
          onRecordUpdate(updated);
        }}
        eventResize={(info) => {
          if (!onRecordUpdate) return;
          const record = info.event.extendedProps.record as Record<string, unknown>;
          const updated = {
            ...record,
            [startField]: info.event.start?.toISOString(),
            [endField]: info.event.end?.toISOString(),
          };
          onRecordUpdate(updated);
        }}
        select={(info) => {
          // Only open create popup in week/day views, not month
          if (info.view.type !== 'dayGridMonth') {
            onDateSelect?.(info.start, info.end);
          }
        }}
        datesSet={(info) => {
          onDateRangeChange?.(info.start, info.end);
        }}
        height="auto"
        fixedWeekCount={false}
        nowIndicator={true}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  );
}
