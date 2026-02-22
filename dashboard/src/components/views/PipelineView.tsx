'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DashboardColors, PipelineConfig } from '@/types/config';
import { EntityFieldConfig } from '@/lib/entity-fields';
import { getTextColor, getContrastText } from '@/lib/view-colors';
import PipelineColumn from './PipelineColumn';

interface PipelineViewProps {
  data: Record<string, unknown>[];
  pipelineConfig: PipelineConfig | undefined | null;
  configColors: DashboardColors;
  entityType: string;
  fields: EntityFieldConfig['pipeline'] | null;
  onRecordClick?: (record: Record<string, unknown>) => void;
  onStageMove?: (recordId: string, newStageId: string) => void;
  onAddToStage?: (stageId: string) => void;
  readOnly?: boolean;
}

export default function PipelineView({
  data,
  pipelineConfig,
  configColors,
  fields,
  onRecordClick,
  onStageMove,
  onAddToStage,
  readOnly,
}: PipelineViewProps) {
  const textColor = getTextColor(configColors);
  const [activeRecord, setActiveRecord] = useState<Record<string, unknown> | null>(null);

  // Require 8px drag distance to avoid accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (!pipelineConfig || !pipelineConfig.stages || pipelineConfig.stages.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed"
        style={{
          borderColor: configColors.borders || '#E5E7EB',
          backgroundColor: configColors.cards || '#FFFFFF',
        }}
      >
        <p className="text-lg font-medium mb-2" style={{ color: textColor }}>
          No pipeline stages configured
        </p>
        <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
          Use the chat to add stages for this component.
        </p>
      </div>
    );
  }

  const stages = [...pipelineConfig.stages].sort((a, b) => a.order - b.order);
  const defaultStageId = pipelineConfig.default_stage_id || stages[0]?.id;

  // Group items by stage
  const itemsByStage: Record<string, Record<string, unknown>[]> = {};
  stages.forEach((stage) => { itemsByStage[stage.id] = []; });
  data.forEach((item) => {
    const stageId = item.stage_id as string | undefined;
    if (stageId && itemsByStage[stageId]) {
      itemsByStage[stageId].push(item);
    } else if (defaultStageId && itemsByStage[defaultStageId]) {
      itemsByStage[defaultStageId].push(item);
    }
  });

  // Deal value rollups per stage
  const stageValues: Record<string, number> = {};
  if (fields?.valueField) {
    stages.forEach((stage) => {
      const stageItems = itemsByStage[stage.id] || [];
      stageValues[stage.id] = stageItems.reduce((sum, item) => {
        return sum + (Number(item[fields.valueField!]) || 0);
      }, 0);
    });
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveRecord((event.active.data.current?.record as Record<string, unknown>) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRecord(null);
    if (!over) return;

    const recordId = String(active.id);
    const newStageId = String(over.id);
    const oldStageId = active.data.current?.stageId as string;

    if (oldStageId !== newStageId) {
      onStageMove?.(recordId, newStageId);
    }
  };

  // Read-only mode: render columns without drag-drop (for auto-progress pipelines)
  if (readOnly) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-3 px-1">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span className="text-xs text-gray-500">Clients progress automatically based on activity</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {stages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                items={itemsByStage[stage.id] || []}
                configColors={configColors}
                fields={fields}
                stageValue={fields?.valueField ? stageValues[stage.id] : undefined}
                onItemClick={onRecordClick}
                readOnly
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Columns with dnd-kit drag-drop context */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {stages.map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                items={itemsByStage[stage.id] || []}
                configColors={configColors}
                fields={fields}
                stageValue={fields?.valueField ? stageValues[stage.id] : undefined}
                onItemClick={onRecordClick}
                onAddClick={onAddToStage ? () => onAddToStage(stage.id) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Drag overlay — ghost card that follows cursor */}
        <DragOverlay>
          {activeRecord ? (
            <div
              className="px-4 py-3 rounded-xl shadow-lg border-2"
              style={{
                backgroundColor: configColors.cards || '#FFFFFF',
                borderColor: configColors.buttons || '#DC2626',
                maxWidth: 280,
              }}
            >
              <p
                className="font-medium text-sm truncate"
                style={{ color: configColors.headings || '#1A1A1A' }}
              >
                {fields?.title
                  ? String(activeRecord[fields.title] || activeRecord.name || activeRecord.title || '')
                  : String(activeRecord.name || activeRecord.title || '')}
              </p>
              {fields?.subtitle && (
                <p className="text-xs truncate mt-1" style={{ color: '#6B7280' }}>
                  {String(activeRecord[fields.subtitle] || activeRecord.subtitle || '')}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
