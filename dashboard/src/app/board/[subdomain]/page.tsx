'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { BoardData } from '@/components/board/board-demo-data';
import { BoardSections } from '@/components/board/board-detect';
import { TVModeOverlay } from '@/components/board/TVModeOverlay';

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function PublicBoardPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [boardSections, setBoardSections] = useState<BoardSections | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/board?subdomain=${encodeURIComponent(subdomain)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error('Failed to load board data');
      }

      // Map API sections array to BoardSections object
      const apiSections: string[] = json.sections || [];
      const sections: BoardSections = {
        schedule: apiSections.includes('schedule'),
        orders: apiSections.includes('orders'),
        classes: apiSections.includes('classes'),
        queue: apiSections.includes('queue'),
        pipeline: apiSections.includes('pipeline'),
      };

      // Build BoardData from API response
      const data: BoardData = {
        stats: json.data.stats || { appointments: 0, orders: 0, revenue: 0, customers: 0 },
        schedule: json.data.schedule || [],
        orders: json.data.orders || [],
        classes: json.data.classes || [],
        queue: json.data.queue || { currentNumber: 0, waiting: [], avgWait: 0 },
        pipeline: json.data.pipeline || [],
      };

      setBoardData(data);
      setBoardSections(sections);
      setBusinessName(json.businessName || subdomain);
      setLogoUrl(json.logoUrl || null);

      // Use buttons color as accent if available
      const colors = json.colors || {};
      if (colors.buttons) {
        setAccentColor(colors.buttons);
      } else if (colors.sidebar_bg) {
        setAccentColor(colors.sidebar_bg);
      }

      setError(null);
    } catch (err) {
      console.error('Board fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [subdomain]);

  // Initial fetch + polling
  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Red Pine OS"
            className="mx-auto mb-8"
            style={{ height: '10rem', animation: 'heartbeat 1.2s ease-in-out infinite' }}
          />
          <p className="text-xl font-semibold text-gray-900">Loading<span className="loading-dots" /></p>
          <style>{`
            @keyframes heartbeat {
              0% { transform: scale(1); }
              14% { transform: scale(1.1); }
              28% { transform: scale(1); }
              42% { transform: scale(1.1); }
              70% { transform: scale(1); }
            }
            .loading-dots::after {
              content: '';
              animation: dots 1.5s steps(4, end) infinite;
            }
            @keyframes dots {
              0% { content: ''; }
              25% { content: '.'; }
              50% { content: '..'; }
              75% { content: '...'; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !boardData || !boardSections) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center"
           style={{ backgroundColor: '#0A0A0A' }}>
        <p className="text-white/80 text-xl mb-2">Board Unavailable</p>
        <p className="text-white/40 text-sm">{error || 'Business not found'}</p>
      </div>
    );
  }

  return (
    <TVModeOverlay
      data={boardData}
      sections={boardSections}
      businessName={businessName}
      logoUrl={logoUrl ?? undefined}
      accentColor={accentColor}
    />
  );
}
