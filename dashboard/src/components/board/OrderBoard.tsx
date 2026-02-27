'use client';

import { BoardOrder } from './board-demo-data';

interface OrderBoardProps {
  orders: BoardOrder[];
  accentColor?: string;
  tvMode?: boolean;
}

interface ColumnDef {
  status: BoardOrder['status'];
  label: string;
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { status: 'new', label: 'New', color: '#3B82F6' },
  { status: 'preparing', label: 'Preparing', color: '#F59E0B' },
  { status: 'ready', label: 'Ready', color: '#10B981' },
  { status: 'completed', label: 'Completed', color: '#6B7280' },
];

function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  return `${h}h ago`;
}

export function OrderBoard({
  orders,
  accentColor: _accentColor,
  tvMode = false,
}: OrderBoardProps) {
  // Suppress unused lint — accentColor reserved for future use
  void _accentColor;

  const grouped = COLUMNS.map((col) => ({
    ...col,
    orders: orders.filter((o) => o.status === col.status),
  }));

  const bg = tvMode ? '#1A1A1A' : '#FFFFFF';
  const colBg = tvMode ? '#111111' : '#F9FAFB';
  const textPrimary = tvMode ? '#FFFFFF' : '#111827';
  const textSecondary = tvMode ? '#9CA3AF' : '#6B7280';
  const cardBg = tvMode ? '#1A1A1A' : '#FFFFFF';
  const headerSize = tvMode ? 'text-xl' : 'text-base';
  const bodySize = tvMode ? 'text-base' : 'text-sm';
  const smallSize = tvMode ? 'text-sm' : 'text-xs';

  return (
    <div
      className="p-5 h-full flex flex-col"
      style={{ backgroundColor: bg }}
    >
      {/* Header */}
      <h3
        className={`${headerSize} font-semibold mb-4`}
        style={{ color: textPrimary }}
      >
        Orders
      </h3>

      {orders.length === 0 ? (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ color: textSecondary }}
        >
          <p className={bodySize}>No active orders</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-hidden">
          {grouped.map((col) => (
            <div
              key={col.status}
              className="p-3 flex flex-col gap-2 overflow-y-auto"
              style={{ backgroundColor: colBg }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span
                    className={`${bodySize} font-semibold`}
                    style={{ color: textPrimary }}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  className={`${smallSize} font-medium px-1.5 py-0.5 rounded-full`}
                  style={{
                    backgroundColor: col.color + '20',
                    color: col.color,
                  }}
                >
                  {col.orders.length}
                </span>
              </div>

              {/* Order Cards */}
              {col.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-2.5"
                  style={{
                    backgroundColor: cardBg,
                    border: tvMode ? '1px solid #222' : '1px solid #E5E7EB',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`${bodySize} font-bold`}
                      style={{ color: textPrimary }}
                    >
                      {order.number}
                    </span>
                    <span
                      className={smallSize}
                      style={{ color: textSecondary }}
                    >
                      {formatTimeAgo(order.minutesAgo)}
                    </span>
                  </div>
                  <p
                    className={`${smallSize} mt-0.5 truncate`}
                    style={{ color: textSecondary }}
                  >
                    {order.customer}
                  </p>
                  <p
                    className={`${smallSize} mt-0.5`}
                    style={{ color: textSecondary }}
                  >
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
