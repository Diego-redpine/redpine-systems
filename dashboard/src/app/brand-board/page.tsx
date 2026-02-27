'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import BrandBoardEditor from '@/components/BrandBoardEditor';
import { ColorItem } from '@/components/editors/ColorsEditor';
import { FONT_OPTIONS } from '@/lib/fonts';

// ─── Color helpers ──────────────────────────────────────────────────────────

function colorsObjectToArray(colors: Record<string, string>): ColorItem[] {
  const allTargets = [
    'sidebar_bg', 'sidebar_icons', 'sidebar_buttons', 'sidebar_text',
    'background', 'buttons', 'cards', 'text', 'headings', 'borders',
  ] as const;
  const result: ColorItem[] = [];
  allTargets.forEach((target) => {
    const value = colors[target];
    if (value) result.push({ color: value, target });
  });
  return result;
}

function colorsArrayToObject(colors: ColorItem[]): Record<string, string> {
  const result: Record<string, string> = {};
  colors.forEach(({ color, target }) => {
    result[target] = color;
  });
  return result;
}

// ─── Font name <-> family conversion ────────────────────────────────────────

/** Config stores font names (e.g. "Inter"), BrandBoardEditor uses families (e.g. "Inter, system-ui, sans-serif") */
const fontNameToFamily = (name: string) =>
  FONT_OPTIONS.find((f) => f.name === name)?.family || name;

const fontFamilyToName = (family: string) =>
  FONT_OPTIONS.find((f) => f.family === family)?.name || family;

// ─── Inner content (uses useSearchParams, needs Suspense) ───────────────────

function BrandBoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const configId = searchParams.get('config_id');
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  const [isLoading, setIsLoading] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [headingFont, setHeadingFont] = useState(FONT_OPTIONS[0].family);
  const [bodyFont, setBodyFont] = useState(FONT_OPTIONS[0].family);
  const [buttonColor, setButtonColor] = useState('#1A1A1A');
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    async function init() {
      // 1. Set auth session from URL tokens
      if (accessToken && refreshToken) {
        try {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          // Clean URL -- remove auth tokens so they are not visible/bookmarkable
          const url = new URL(window.location.href);
          url.searchParams.delete('access_token');
          url.searchParams.delete('refresh_token');
          window.history.replaceState({}, '', url.toString());
        } catch (err) {
          console.error('Failed to set auth session from URL tokens:', err);
        }
      }

      // 2. Fetch config
      if (configId) {
        try {
          const res = await fetch(`/api/config?id=${configId}`);
          const data = await res.json();
          if (data.success && data.data) {
            const cfg = data.data;
            setBusinessName(cfg.businessName || '');
            setBusinessType(cfg.businessType || '');

            // Colors
            if (cfg.colors && Object.keys(cfg.colors).length > 0) {
              const items = colorsObjectToArray(cfg.colors);
              setColors(items);
              // Derive button color from the palette
              const btn = cfg.colors.buttons || cfg.colors.sidebar_buttons;
              if (btn) setButtonColor(btn);
            }

            // Fonts -- config stores names, component uses families
            if (cfg.headingFont) {
              setHeadingFont(fontNameToFamily(cfg.headingFont));
            }
            if (cfg.bodyFont) {
              setBodyFont(fontNameToFamily(cfg.bodyFont));
            }
          }
        } catch (err) {
          console.error('Failed to fetch config:', err);
        }
      }

      setIsLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configId]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleColorsChange = (newColors: ColorItem[]) => {
    setColors(newColors);
    const btn = newColors.find((c) => c.target === 'buttons')?.color
      || newColors.find((c) => c.target === 'sidebar_buttons')?.color;
    if (btn) setButtonColor(btn);
  };

  const handleFontChange = (heading: string, body: string) => {
    setHeadingFont(heading);
    setBodyFont(body);
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    // Save current brand board state to config
    if (configId) {
      try {
        await fetch(`/api/config?id=${configId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: configId,
            colors: colorsArrayToObject(colors),
            headingFont: fontFamilyToName(headingFont),
            bodyFont: fontFamilyToName(bodyFont),
          }),
        });
      } catch (err) {
        console.error('Failed to save brand board:', err);
      }
    }
    router.push('/dashboard');
  };

  // ─── Loading state ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white" style={{ fontFamily: "'Fira Code', monospace" }}>
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Red Pine"
            className="mx-auto mb-8"
            style={{ height: '10rem', animation: 'heartbeat 1.2s ease-in-out infinite' }}
          />
          <p className="text-xl font-bold text-black">Loading<span className="loading-dots" /></p>
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

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white overflow-y-auto fixed inset-0" style={{ fontFamily: "'Fira Code', monospace" }}>
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold text-black">{businessName || 'Your Brand'}</h1>
        <p className="text-sm text-gray-500 mt-1">Set up your brand kit</p>
      </div>
      <BrandBoardEditor
        configId={configId}
        colors={colors}
        onColorsChange={handleColorsChange}
        headingFont={headingFont}
        bodyFont={bodyFont}
        onFontChange={handleFontChange}
        businessType={businessType}
        businessName={businessName}
        buttonColor={buttonColor}
        mode="onboarding"
        onLaunch={handleLaunch}
        launching={isLaunching}
      />
    </div>
  );
}

// ─── Page wrapper (Suspense boundary for useSearchParams) ───────────────────

export default function BrandBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white" style={{ fontFamily: "'Fira Code', monospace" }}>
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-black animate-spin mb-4" />
            <p className="text-sm text-gray-500">Loading brand board</p>
          </div>
        </div>
      }
    >
      <BrandBoardContent />
    </Suspense>
  );
}
