'use client';

import type { BoardPipelineStage } from './board-demo-data';

interface PipelineCardProps {
  stages: BoardPipelineStage[];
  accentColor?: string;
  tvMode?: boolean;
}

export function PipelineCard({ stages, accentColor = '#3B82F6', tvMode = false }: PipelineCardProps) {
  const bg = tvMode ? '#1A1A1A' : '#FFFFFF';
  const textPrimary = tvMode ? '#FFFFFF' : '#111827';
  const textSecondary = tvMode ? '#9CA3AF' : '#6B7280';
  const barBg = tvMode ? '#374151' : '#E5E7EB';
  const fontSize = tvMode ? 'text-base' : 'text-sm';

  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${tvMode ? 'text-xl' : 'text-lg'}`} style={{ color: textPrimary }}>
          Pipeline
        </h3>
        <span
          className={`${fontSize} font-medium px-2.5 py-0.5 rounded-full`}
          style={{ backgroundColor: accentColor + '1A', color: accentColor }}
        >
          {totalCount}
        </span>
      </div>

      {/* Stage rows */}
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const barWidthPct = (stage.count / maxCount) * 100;

          return (
            <div key={i} className={`flex items-center gap-3 ${fontSize}`}>
              {/* Color dot */}
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: stage.color,
                }}
              />

              {/* Stage name */}
              <span className="shrink-0 w-24 truncate font-medium" style={{ color: textPrimary }}>
                {stage.stage}
              </span>

              {/* Count */}
              <span className="shrink-0 w-8 text-right tabular-nums" style={{ color: textSecondary }}>
                {stage.count}
              </span>

              {/* Mini bar */}
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: barBg }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidthPct}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
