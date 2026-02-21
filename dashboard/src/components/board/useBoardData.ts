'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDataMode } from '@/hooks/useDataMode';
import { BoardSections } from './board-detect';
import {
  BoardData,
  BoardAppointment,
  BoardOrder,
  BoardClass,
  BoardQueue,
  BoardPipelineStage,
  BoardStats,
  getDemoBoardData,
} from './board-demo-data';

export interface UseBoardDataResult {
  data: BoardData;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

const POLL_INTERVAL = 30_000; // 30 seconds

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function minutesAgo(dateStr: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60_000));
}

function appointmentStatus(start: string, end: string): 'completed' | 'in_progress' | 'upcoming' {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now > e) return 'completed';
  if (now >= s) return 'in_progress';
  return 'upcoming';
}

/**
 * Hook that fetches all board data and polls every 30 seconds.
 * In dummy mode, returns static demo data.
 */
export function useBoardData(sections: BoardSections): UseBoardDataResult {
  const { mode } = useDataMode();
  const [data, setData] = useState<BoardData>(getDemoBoardData());
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (mode === 'dummy') {
      setData(getDemoBoardData());
      setIsLoading(false);
      setLastUpdated(new Date());
      return;
    }

    try {
      const today = todayISO();
      const fetches: Promise<void>[] = [];
      const result: Partial<BoardData> = {};

      // Stats — always fetch appointments + orders for counts
      const statsPromise = (async () => {
        const stats: BoardStats = { appointments: 0, orders: 0, revenue: 0, customers: 0 };
        try {
          const res = await fetch(`/api/data/appointments?page=1&pageSize=200&date_start=${today}&date_end=${today}`);
          if (res.ok) {
            const json = await res.json();
            stats.appointments = json.totalCount || json.data?.length || 0;
            stats.customers = new Set((json.data || []).map((a: Record<string, unknown>) => a.client_name || a.name)).size;
          }
        } catch { /* ignore */ }
        try {
          const res = await fetch(`/api/data/orders?page=1&pageSize=200&date_start=${today}&date_end=${today}`);
          if (res.ok) {
            const json = await res.json();
            stats.orders = json.totalCount || json.data?.length || 0;
            stats.revenue = (json.data || []).reduce((sum: number, o: Record<string, unknown>) => {
              return sum + (typeof o.total_cents === 'number' ? o.total_cents / 100 : 0);
            }, 0);
          }
        } catch { /* ignore */ }
        result.stats = stats;
      })();
      fetches.push(statsPromise);

      // Schedule
      if (sections.schedule) {
        fetches.push((async () => {
          try {
            const res = await fetch(`/api/data/appointments?page=1&pageSize=50&date_start=${today}&date_end=${today}&sort_by=start_time&sort_dir=asc`);
            if (res.ok) {
              const json = await res.json();
              result.schedule = (json.data || []).map((a: Record<string, unknown>) => ({
                id: a.id as string,
                title: (a.service_name || a.title || 'Appointment') as string,
                client: (a.client_name || a.name || 'Walk-in') as string,
                time: formatTime(a.start_time as string),
                endTime: formatTime(a.end_time as string),
                status: (a.status as string) === 'cancelled' ? 'cancelled' : appointmentStatus(a.start_time as string, a.end_time as string),
                staff: a.staff_name as string | undefined,
              })) as BoardAppointment[];
            }
          } catch { result.schedule = []; }
        })());
      }

      // Orders
      if (sections.orders) {
        fetches.push((async () => {
          try {
            const res = await fetch(`/api/data/orders?page=1&pageSize=50&sort_by=created_at&sort_dir=desc`);
            if (res.ok) {
              const json = await res.json();
              result.orders = (json.data || [])
                .filter((o: Record<string, unknown>) => ['new', 'confirmed', 'preparing', 'ready', 'completed'].includes(o.status as string))
                .map((o: Record<string, unknown>) => ({
                  id: o.id as string,
                  number: (o.order_number || `#${(o.id as string).slice(0, 4)}`) as string,
                  customer: (o.customer_name || 'Walk-in') as string,
                  itemCount: Array.isArray(o.items) ? o.items.length : (o.item_count as number) || 1,
                  status: (o.status === 'confirmed' ? 'new' : o.status) as BoardOrder['status'],
                  minutesAgo: minutesAgo(o.created_at as string),
                })) as BoardOrder[];
            }
          } catch { result.orders = []; }
        })());
      }

      // Classes (today's classes via calendar or class_schedule)
      if (sections.classes) {
        fetches.push((async () => {
          try {
            const res = await fetch(`/api/data/classes?page=1&pageSize=50`);
            if (res.ok) {
              const json = await res.json();
              const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
              // Classes are recurring — filter by today's day of week
              result.classes = (json.data || [])
                .filter((c: Record<string, unknown>) => {
                  const schedule = c.schedule as Array<{ day_of_week: string }> | undefined;
                  if (schedule) return schedule.some(s => s.day_of_week === dayName);
                  return c.day_of_week === dayName;
                })
                .map((c: Record<string, unknown>) => ({
                  id: c.id as string,
                  name: (c.name || c.title || 'Class') as string,
                  instructor: (c.instructor_name || c.instructor || '') as string,
                  time: (c.start_time || '00:00') as string,
                  enrolled: (c.enrolled || 0) as number,
                  capacity: (c.capacity || 20) as number,
                  status: 'upcoming' as const,
                })) as BoardClass[];
            }
          } catch { result.classes = []; }
        })());
      }

      // Queue / Waitlist
      if (sections.queue) {
        fetches.push((async () => {
          try {
            const res = await fetch(`/api/data/waitlist?page=1&pageSize=50&sort_by=created_at&sort_dir=asc`);
            if (res.ok) {
              const json = await res.json();
              const entries = (json.data || []) as Record<string, unknown>[];
              const seated = entries.filter(e => e.status === 'seated');
              const waiting = entries.filter(e => e.status === 'waiting');
              const currentNumber = seated.length > 0
                ? (seated[seated.length - 1].queue_number as number) || seated.length
                : 0;
              result.queue = {
                currentNumber,
                waiting: waiting.map(w => ({
                  name: (w.customer_name || 'Guest') as string,
                  partySize: (w.party_size || 1) as number,
                  waitMinutes: minutesAgo(w.created_at as string),
                })),
                avgWait: waiting.length > 0
                  ? Math.round(waiting.reduce((s, w) => s + minutesAgo(w.created_at as string), 0) / waiting.length)
                  : 0,
              } as BoardQueue;
            }
          } catch {
            result.queue = { currentNumber: 0, waiting: [], avgWait: 0 };
          }
        })());
      }

      // Pipeline
      if (sections.pipeline) {
        fetches.push((async () => {
          try {
            const res = await fetch('/api/pipeline/summary');
            if (res.ok) {
              const json = await res.json();
              if (json.stages) {
                result.pipeline = (json.stages as Array<{ name: string; color: string; count: number }>).map(s => ({
                  stage: s.name,
                  color: s.color || '#6B7280',
                  count: s.count || 0,
                })) as BoardPipelineStage[];
              }
            }
          } catch { result.pipeline = []; }
        })());
      }

      await Promise.all(fetches);

      if (!mountedRef.current) return;

      const demo = getDemoBoardData();
      setData({
        stats: result.stats || demo.stats,
        schedule: result.schedule || [],
        orders: result.orders || [],
        classes: result.classes || [],
        queue: result.queue || { currentNumber: 0, waiting: [], avgWait: 0 },
        pipeline: result.pipeline || [],
      });
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch board data');
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [mode, sections]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  return { data, isLoading, lastUpdated, error };
}
