'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalProgressProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  progressType?: 'belt' | 'tier' | 'level';
  [key: string]: unknown;
}

interface ProgressStage {
  id: string;
  name: string;
  color: string;
  color_secondary?: string;
  order: number;
  completed: boolean;
  current: boolean;
}

const DEMO_BELT_STAGES: ProgressStage[] = [
  { id: '1', name: 'White Belt', color: '#E5E7EB', order: 0, completed: true, current: false },
  { id: '2', name: 'Yellow Belt', color: '#FDE047', order: 1, completed: true, current: false },
  { id: '3', name: 'Green Belt', color: '#22C55E', order: 2, completed: true, current: false },
  { id: '4', name: 'Blue Belt', color: '#3B82F6', order: 3, completed: false, current: true },
  { id: '5', name: 'Red Belt', color: '#EF4444', order: 4, completed: false, current: false },
  { id: '6', name: 'Black Belt', color: '#1A1A1A', order: 5, completed: false, current: false },
];

const DEMO_TIER_STAGES: ProgressStage[] = [
  { id: '1', name: 'Bronze', color: '#CD7F32', order: 0, completed: true, current: false },
  { id: '2', name: 'Silver', color: '#C0C0C0', order: 1, completed: false, current: true },
  { id: '3', name: 'Gold', color: '#FFD700', order: 2, completed: false, current: false },
  { id: '4', name: 'Platinum', color: '#E5E4E2', order: 3, completed: false, current: false },
];

const DEMO_LEVEL_STAGES: ProgressStage[] = [
  { id: '1', name: 'Level 1', color: '#3B82F6', order: 0, completed: true, current: false },
  { id: '2', name: 'Level 2', color: '#6366F1', order: 1, completed: true, current: false },
  { id: '3', name: 'Level 3', color: '#8B5CF6', order: 2, completed: false, current: true },
  { id: '4', name: 'Level 4', color: '#A855F7', order: 3, completed: false, current: false },
  { id: '5', name: 'Level 5', color: '#D946EF', order: 4, completed: false, current: false },
];

function getDemo(type: string): ProgressStage[] {
  if (type === 'tier') return DEMO_TIER_STAGES;
  if (type === 'level') return DEMO_LEVEL_STAGES;
  return DEMO_BELT_STAGES;
}

export const PortalProgress: React.FC<PortalProgressProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'My Progress',
  accentColor = '#1A1A1A',
  progressType = 'belt',
}) => {
  const session = usePortalSession();
  const [stages, setStages] = useState<ProgressStage[]>(getDemo(progressType));

  useEffect(() => {
    if (inBuilder) {
      setStages(getDemo(progressType));
      return;
    }
    if (!session) return;
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=progress&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.stages) setStages(data.stages);
        }
      } catch { /* use demo data */ }
    };
    fetchProgress();
  }, [inBuilder, session, session?.activeStudentId, progressType]);

  const currentStage = stages.find(s => s.current);
  const currentIndex = stages.findIndex(s => s.current);
  const progressPercent = currentIndex >= 0
    ? Math.round(((currentIndex + 0.5) / stages.length) * 100)
    : 0;

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{heading}</h3>

        {/* Current rank card */}
        {currentStage && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 16, borderRadius: 12, marginBottom: 24,
            backgroundColor: '#FAFAFA', border: '1px solid #F3F4F6',
          }}>
            {/* Stage color swatch */}
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: currentStage.color_secondary
                ? `linear-gradient(135deg, ${currentStage.color} 50%, ${currentStage.color_secondary} 50%)`
                : currentStage.color,
              border: currentStage.color === '#E5E7EB' ? '2px solid #D1D5DB' : '2px solid transparent',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }} />
            <div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Current Rank</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{currentStage.name}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: accentColor, margin: 0 }}>{progressPercent}%</p>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>Overall Progress</p>
            </div>
          </div>
        )}

        {/* Progress timeline */}
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 13, top: 0, bottom: 0,
            width: 2, backgroundColor: '#E5E7EB',
          }} />

          {stages.map((stage, i) => {
            const isCompleted = stage.completed;
            const isCurrent = stage.current;

            return (
              <div key={stage.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingBottom: i < stages.length - 1 ? 16 : 0,
                position: 'relative',
              }}>
                {/* Dot on timeline */}
                <div style={{
                  position: 'absolute', left: -22,
                  width: 18, height: 18, borderRadius: '50%',
                  background: stage.color_secondary
                    ? `linear-gradient(135deg, ${stage.color} 50%, ${stage.color_secondary} 50%)`
                    : stage.color,
                  border: isCurrent
                    ? `3px solid ${accentColor}`
                    : isCompleted
                      ? '3px solid #10B981'
                      : '3px solid #E5E7EB',
                  boxShadow: isCurrent ? `0 0 0 4px ${accentColor}20` : 'none',
                  zIndex: 1,
                }} />

                {/* Label */}
                <div style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8,
                  backgroundColor: isCurrent ? `${accentColor}08` : 'transparent',
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isCurrent ? 700 : isCompleted ? 500 : 400,
                    color: isCurrent ? '#1A1A1A' : isCompleted ? '#374151' : '#9CA3AF',
                  }}>
                    {stage.name}
                  </span>
                  {isCompleted && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {isCurrent && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 6,
                      backgroundColor: accentColor, color: '#fff',
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
