'use client';

import { useState, useCallback } from 'react';
import { PipelineStage, DashboardColors } from '@/types/config';
import CenterModal from '@/components/ui/CenterModal';
import { getContrastText } from '@/lib/view-colors';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: PipelineStage[];
  onSave: (stages: PipelineStage[]) => void;
  configColors: DashboardColors;
}

function SortableStageRow({
  stage,
  onUpdate,
  onDelete,
  configColors,
}: {
  stage: PipelineStage;
  onUpdate: (id: string, changes: Partial<PipelineStage>) => void;
  onDelete: (id: string) => void;
  configColors: DashboardColors;
}) {
  const [showSecondary, setShowSecondary] = useState(!!stage.color_secondary);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-xl border bg-white"
      {...attributes}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
        style={{ color: configColors.text || '#9CA3AF' }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
        </svg>
      </button>

      {/* Color swatch */}
      <div className="shrink-0 flex items-center gap-1">
        <label className="relative w-7 h-7 rounded-lg overflow-hidden cursor-pointer border border-gray-200">
          <input
            type="color"
            value={stage.color}
            onChange={(e) => onUpdate(stage.id, { color: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-full h-full" style={{ backgroundColor: stage.color }} />
        </label>
        {showSecondary && (
          <label className="relative w-7 h-7 rounded-lg overflow-hidden cursor-pointer border border-gray-200">
            <input
              type="color"
              value={stage.color_secondary || '#3B82F6'}
              onChange={(e) => onUpdate(stage.id, { color_secondary: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full h-full" style={{ backgroundColor: stage.color_secondary || '#3B82F6' }} />
          </label>
        )}
      </div>

      {/* Name input */}
      <input
        type="text"
        value={stage.name}
        onChange={(e) => onUpdate(stage.id, { name: e.target.value })}
        className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50 outline-none focus:border-gray-400"
        style={{ color: configColors.text || '#111827' }}
      />

      {/* Secondary color toggle */}
      <button
        onClick={() => {
          if (showSecondary) {
            setShowSecondary(false);
            onUpdate(stage.id, { color_secondary: undefined });
          } else {
            setShowSecondary(true);
            onUpdate(stage.id, { color_secondary: '#3B82F6' });
          }
        }}
        className="shrink-0 text-[10px] px-2 py-1 rounded-md border transition-colors"
        style={{
          backgroundColor: showSecondary ? (configColors.buttons || '#1A1A1A') : 'transparent',
          color: showSecondary ? getContrastText(configColors.buttons || '#1A1A1A') : '#9CA3AF',
          borderColor: showSecondary ? (configColors.buttons || '#1A1A1A') : '#E5E7EB',
        }}
        title={showSecondary ? 'Remove secondary color' : 'Add secondary color'}
      >
        2nd
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(stage.id)}
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

const STAGE_COLORS = [
  '#6366F1', '#F59E0B', '#10B981', '#8B5CF6', '#F97316',
  '#14B8A6', '#EC4899', '#3B82F6', '#EF4444', '#84CC16',
];

export default function StageManagerModal({
  isOpen,
  onClose,
  stages,
  onSave,
  configColors,
}: StageManagerModalProps) {
  const [localStages, setLocalStages] = useState<PipelineStage[]>(stages);

  // Reset when re-opened
  useState(() => {
    setLocalStages(stages);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalStages(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id);
      const newIndex = prev.findIndex(s => s.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const handleUpdate = useCallback((id: string, changes: Partial<PipelineStage>) => {
    setLocalStages(prev =>
      prev.map(s => s.id === id ? { ...s, ...changes } : s)
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setLocalStages(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return filtered.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const handleAdd = useCallback(() => {
    const nextOrder = localStages.length;
    const colorIndex = nextOrder % STAGE_COLORS.length;
    const newStage: PipelineStage = {
      id: `stage_${Date.now()}`,
      name: 'New Stage',
      color: STAGE_COLORS[colorIndex],
      order: nextOrder,
    };
    setLocalStages(prev => [...prev, newStage]);
  }, [localStages.length]);

  const handleSave = () => {
    onSave(localStages);
    onClose();
  };

  const buttonBg = configColors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonBg);

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Stages"
      subtitle={`${localStages.length} stages`}
      maxWidth="max-w-md"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localStages.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {localStages.map(stage => (
              <SortableStageRow
                key={stage.id}
                stage={stage}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                configColors={configColors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {localStages.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-400">
          No stages yet. Add one below.
        </div>
      )}

      {/* Add stage button */}
      <button
        onClick={handleAdd}
        className="w-full mt-3 py-2.5 text-sm font-medium rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        + Add Stage
      </button>

      {/* Footer */}
      <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: configColors.borders || '#E5E7EB' }}>
        <button
          onClick={onClose}
          className="flex-1 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
          style={{
            borderColor: configColors.borders || '#E5E7EB',
            color: configColors.text || '#374151',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: buttonBg, color: buttonText }}
        >
          Save
        </button>
      </div>
    </CenterModal>
  );
}
