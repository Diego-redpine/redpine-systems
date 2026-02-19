'use client';

/**
 * Drag & Drop Provider Component
 * Wraps the entire editor with DnD context from @dnd-kit
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import DragPreview from '@/components/editor/DragPreview';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DropValidation {
  isValid: boolean;
  reason: string;
}

interface DragDropContextValue {
  activeId: string | null;
  activeType: string | null;
  activeSource: 'library' | 'canvas' | null;
  overId: string | number | null;
  overType: string | null;
  dropValidation: DropValidation;
  isDragging: boolean;
}

interface DragDropProviderProps {
  children: ReactNode;
  onAddComponent: (type: string, parentId: string | null, index: number) => void;
  onMoveComponent: (componentId: string | number, newParentId: string | null, newIndex: number) => void;
  getComponentById?: (id: string) => unknown;
  validateDrop?: (draggedType: string, targetType: string | null, targetId: string | number) => DropValidation;
}

// ── Context ────────────────────────────────────────────────────────────────────

const DragDropContext = createContext<DragDropContextValue | null>(null);

/**
 * Custom hook to access drag-drop context
 */
export function useDragDrop(): DragDropContextValue {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}

/**
 * Default drop validation — always valid.
 * Pass a real validateDrop prop to enforce nesting rules.
 */
function defaultValidateDrop(
  _draggedType: string,
  _targetType: string | null,
  _targetId: string | number,
): DropValidation {
  return { isValid: true, reason: '' };
}

/**
 * Custom collision detection that prefers drop zones
 */
const customCollisionDetection: CollisionDetection = (args) => {
  // First, check for pointer-within collisions (more precise for nesting)
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // Fall back to rect intersection
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) {
    return rectCollisions;
  }

  // Finally, use closest center
  return closestCenter(args);
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * DragDropProvider Component
 * Wraps children with @dnd-kit DndContext, sensors, collision detection,
 * and a shared context for drag state.
 */
export default function DragDropProvider({
  children,
  onAddComponent,
  onMoveComponent,
  getComponentById: _getComponentById,
  validateDrop = defaultValidateDrop,
}: DragDropProviderProps) {
  // Active drag state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'library' | 'canvas' | null>(null);

  // Over state for drop validation
  const [overId, setOverId] = useState<string | number | null>(null);
  const [overType, setOverType] = useState<string | null>(null);
  const [dropValidation, setDropValidation] = useState<DropValidation>({ isValid: true, reason: '' });

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const { id, data } = active;

    setActiveId(String(id));
    setActiveType(data.current?.type || null);
    setActiveSource(data.current?.source || 'canvas');
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setOverId(null);
      setOverType(null);
      setDropValidation({ isValid: true, reason: '' });
      return;
    }

    const draggedType: string | undefined = active.data.current?.type;
    const overData = over.data.current;
    const targetType: string | null = overData?.type || null;
    const targetId = over.id;

    setOverId(targetId);
    setOverType(targetType);

    // Validate the drop
    if (draggedType) {
      const validation = validateDrop(draggedType, targetType, targetId);
      setDropValidation(validation);
    }
  }, [validateDrop]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Reset state
    setActiveId(null);
    setActiveType(null);
    setActiveSource(null);
    setOverId(null);
    setOverType(null);
    setDropValidation({ isValid: true, reason: '' });

    if (!over) return;

    const draggedType: string | undefined = active.data.current?.type;
    const isFromLibrary = active.data.current?.source === 'library';
    const overData = over.data.current;

    // Validate the drop
    if (draggedType) {
      const validation = validateDrop(
        draggedType,
        overData?.type || null,
        over.id
      );

      if (!validation.isValid) {
        console.log('Invalid drop:', validation.reason);
        return;
      }
    }

    if (isFromLibrary) {
      // Adding new component from library
      // If dropping on canvas-root or a root-dropzone, parentId should be null
      let parentId: string | null = null;
      if (over.id !== 'canvas-root' && !String(over.id).startsWith('root-dropzone')) {
        parentId = overData?.accepts ? String(over.id) : overData?.parentId || null;
      }
      const index: number = overData?.index ?? -1;
      console.log('Adding component:', draggedType, 'to parent:', parentId, 'at index:', index);
      onAddComponent(draggedType || '', parentId, index);
    } else {
      // Moving existing component within canvas
      const componentId = active.id;
      let newParentId: string | null = null;
      if (over.id !== 'canvas-root' && !String(over.id).startsWith('root-dropzone')) {
        newParentId = overData?.accepts ? String(over.id) : overData?.parentId || null;
      }
      const newIndex: number = overData?.index ?? -1;

      // Don't move if dropping on itself
      if (componentId !== over.id) {
        onMoveComponent(componentId, newParentId, newIndex);
      }
    }
  }, [onAddComponent, onMoveComponent, validateDrop]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveType(null);
    setActiveSource(null);
    setOverId(null);
    setOverType(null);
    setDropValidation({ isValid: true, reason: '' });
  }, []);

  // Context value
  const contextValue: DragDropContextValue = {
    activeId,
    activeType,
    activeSource,
    overId,
    overType,
    dropValidation,
    isDragging: activeId !== null,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}

        {/* Drag overlay - ghost preview */}
        <DragOverlay dropAnimation={null}>
          {activeId && activeType && (
            <DragPreview
              type={activeType}
              isValid={dropValidation.isValid}
            />
          )}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
}
