'use client';

import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { DashboardColors, TabComponent } from '@/types/config';
import { getDefaultView, getAvailableViews } from '@/lib/view-registry';
import { getCardFields, getCalendarFields, getPipelineFields, getListFields, getTableFields, getRouteFields } from '@/lib/entity-fields';
import { useEntityData, UseEntityDataOptions } from '@/hooks/useEntityData';
import { useEntityMutations } from '@/hooks/useEntityMutations';
import {
  optimisticCreate,
  optimisticDelete,
  optimisticUpdateRecord,
  generateTempId,
} from '@/hooks/useOptimisticUpdate';
import EmptyState from './EmptyState';
import DetailPanel from './DetailPanel';
import ListView from './ListView';
import TableView from './TableView';
import DataToolbar from '@/components/data/DataToolbar';
import Pagination from '@/components/data/Pagination';
import AddRecordButton from './AddRecordButton';
import { getTextColor, getContrastText } from '@/lib/view-colors';
import type { ViewType } from '@/lib/view-registry';
import { toast } from '@/components/ui/Toaster';
import { exportToCSV } from '@/lib/csv-export';
import { useCustomFields } from '@/hooks/useCustomFields';
import { useDataMode } from '@/hooks/useDataMode';

// Lazy-loaded heavy views — only mount when user navigates to them
const CalendarView = lazy(() => import('./CalendarView'));
const PipelineView = lazy(() => import('./PipelineView'));
const CardView = lazy(() => import('./CardView'));
const StageManagerModal = lazy(() => import('./StageManagerModal'));
const StaffSetupWizard = lazy(() => import('./StaffSetupWizard'));
const FormBuilder = lazy(() => import('./FormBuilder'));
const AutomationBuilder = lazy(() => import('./AutomationBuilder'));
const BlockTimeModal = lazy(() => import('./BlockTimeModal'));
const BookingSetupWizard = lazy(() => import('./BookingSetupWizard'));
const SocialMediaComposer = lazy(() => import('./SocialMediaComposer'));
const ChatInboxView = lazy(() => import('./ChatInboxView'));
const StatCards = lazy(() => import('./StatCards'));
const DocumentEditor = lazy(() => import('@/components/editors/DocumentEditor'));
const CSVImport = lazy(() => import('@/components/data/CSVImport'));
const RouteView = lazy(() => import('./RouteView'));
const AddEventModal = lazy(() => import('./AddEventModal'));
const AddCatalogItemWizard = lazy(() => import('./AddCatalogItemWizard'));
const GalleryManager = lazy(() => import('./GalleryManager'));

// Small SVG icons for view toggle buttons
function ViewIcon({ type }: { type: ViewType }) {
  const cls = "w-4 h-4";
  switch (type) {
    case 'pipeline':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M4.5 4.5h15" />
        </svg>
      );
    case 'list':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      );
    case 'table':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12h-7.5m8.625 0h7.5m-8.625 0c.621 0 1.125.504 1.125 1.125v1.5" />
        </svg>
      );
    case 'cards':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case 'route':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      );
    default:
      return null;
  }
}

interface ViewRendererProps {
  componentId: string;
  componentConfig: TabComponent;
  configColors: DashboardColors;
  entityType: string;
  onViewChange?: (viewType: string) => void;
}

export default function ViewRenderer({
  componentId,
  componentConfig,
  configColors,
  entityType,
  onViewChange,
}: ViewRendererProps) {
  // Manage current view as internal state - initialized from config or default
  // Config view ALWAYS takes priority — if template says view:'pipeline', that wins
  const registryViews = componentConfig.availableViews || getAvailableViews(componentId);
  const configuredView = componentConfig.view || getDefaultView(componentId);
  // Ensure config view is in the available views list (prevents registry from overriding template)
  const availableViews = componentConfig.view && !registryViews.includes(componentConfig.view as ViewType)
    ? [componentConfig.view as ViewType, ...registryViews]
    : registryViews;
  const [currentView, setCurrentView] = useState(configuredView as ViewType);

  // Search, filter, sort, pagination state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();

  // Build data fetch options
  const dataOptions: UseEntityDataOptions = {
    search,
    filters,
    page,
    pageSize: 25,
    dateRange,
    componentId, // Pass original component ID for dummy data lookup
    pipelineStages: componentConfig.pipeline?.stages, // Remap dummy stage IDs to config stage IDs
  };

  // Fetch data using the hook
  const { data: fetchedData, isLoading, error, totalCount, totalPages, refetch } = useEntityData(entityType, dataOptions);

  // Optimistic data state - allows instant UI updates before API confirms
  const [optimisticData, setOptimisticData] = useState<Record<string, unknown>[] | null>(null);

  // Persistent stage overrides for demo mode (survives onSuccess clearing)
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});

  // Use optimistic data if available, otherwise use fetched data
  // Apply stage overrides on top for persistent demo drag-and-drop
  const baseData = optimisticData ?? fetchedData;
  const data = Object.keys(stageOverrides).length > 0
    ? baseData.map(r => stageOverrides[String(r.id)] ? { ...r, stage_id: stageOverrides[String(r.id)] } : r)
    : baseData;

  // Mutations hook with refetch on success
  const {
    createRecord,
    updateRecord,
    deleteRecord,
    moveStage,
    isCreating,
    isUpdating,
    isDeleting,
    error: mutationError,
  } = useEntityMutations(entityType, {
    onSuccess: () => {
      // Clear optimistic data and refetch real data
      setOptimisticData(null);
      refetch();
    },
  });

  // Detail panel state
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<'create' | 'edit'>('edit');

  // Document editor state — opens for documents/contracts entities
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);
  const isDocumentEntity = ['documents', 'contracts'].includes(entityType);

  // CSV import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Stage manager modal state
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);

  // Staff wizard state — intercepts "Add" for staff/team_members entities
  const [isStaffWizardOpen, setIsStaffWizardOpen] = useState(false);
  const isStaffEntity = ['staff', 'team_members'].includes(entityType);

  // Form builder state — intercepts "Add" and row click for forms entity
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingFormRecord, setEditingFormRecord] = useState<Record<string, unknown> | null>(null);
  const isFormsEntity = entityType === 'forms';

  // Automation builder state — intercepts "Add" and row click for workflows entity
  const [isAutomationBuilderOpen, setIsAutomationBuilderOpen] = useState(false);
  const [editingWorkflowRecord, setEditingWorkflowRecord] = useState<Record<string, unknown> | null>(null);
  const isWorkflowsEntity = entityType === 'workflows';

  const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);
  const [isBookingSetupOpen, setIsBookingSetupOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingSettings, setBookingSettings] = useState<any>(null);
  const isCalendarEntity = ['appointments', 'schedules', 'shifts', 'classes', 'reservations', 'calendar'].includes(entityType);

  // Add event modal state — universal calendar type picker
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventPrefill, setAddEventPrefill] = useState<{ date?: string; startTime?: string; endTime?: string }>({});

  // Social media composer state
  const [isSocialComposerOpen, setIsSocialComposerOpen] = useState(false);
  const [editingSocialPost, setEditingSocialPost] = useState<Record<string, unknown> | null>(null);
  const isSocialMediaEntity = entityType === 'social_media';
  const isChatWidgetEntity = entityType === 'chat_widget';
  const isGalleryEntity = ['galleries', 'images', 'portfolios'].includes(entityType);
  const isPackagesEntity = entityType === 'packages';
  const [isCatalogWizardOpen, setIsCatalogWizardOpen] = useState(false);
  const isRouteEntity = entityType === 'routes';

  // Custom fields for this entity type (only fetched in real mode)
  const { mode: dataMode } = useDataMode();
  const { fields: customFieldDefs } = useCustomFields(entityType, dataMode === 'dummy');

  // Fetch booking settings for calendar entities (owner-only)
  const fetchBookingSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar-settings');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setBookingSettings(json.data[0]);
        }
      }
    } catch { /* ignore — 401 in demo mode */ }
  }, []);

  useEffect(() => {
    if (isCalendarEntity && dataMode === 'real') {
      fetchBookingSettings();
    }
  }, [isCalendarEntity, dataMode, fetchBookingSettings]);

  // Show error via toast
  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  // Handle record click - open detail panel, document editor, or form builder
  const handleRecordClick = (record: Record<string, unknown>) => {
    setSelectedRecord(record);
    if (isFormsEntity) {
      setEditingFormRecord(record);
      setIsFormBuilderOpen(true);
    } else if (isWorkflowsEntity) {
      setEditingWorkflowRecord(record);
      setIsAutomationBuilderOpen(true);
    } else if (isSocialMediaEntity) {
      setEditingSocialPost(record);
      setIsSocialComposerOpen(true);
    } else if (isDocumentEntity && record.id) {
      setIsDocEditorOpen(true);
    } else {
      setDetailMode('edit');
      setIsDetailOpen(true);
    }
  };

  // Handle add button click - open detail panel in create mode (or staff wizard for staff entities)
  const handleAddClick = () => {
    // Routes handle their own add flow inside RouteView
    if (isRouteEntity) return;
    if (isCalendarEntity) {
      setAddEventPrefill({});
      setIsAddEventOpen(true);
      return;
    }
    if (isStaffEntity) {
      setIsStaffWizardOpen(true);
      return;
    }
    if (isFormsEntity) {
      setEditingFormRecord(null);
      setIsFormBuilderOpen(true);
      return;
    }
    if (isWorkflowsEntity) {
      setEditingWorkflowRecord(null);
      setIsAutomationBuilderOpen(true);
      return;
    }
    if (isSocialMediaEntity) {
      setEditingSocialPost(null);
      setIsSocialComposerOpen(true);
      return;
    }
    if (isPackagesEntity) {
      setIsCatalogWizardOpen(true);
      return;
    }
    setSelectedRecord(null);
    setDetailMode('create');
    setIsDetailOpen(true);
  };

  // Handle automation builder save — creates or updates a workflow
  const handleAutomationSave = async (workflowData: Record<string, unknown>) => {
    const currentData = data;
    if (editingWorkflowRecord?.id) {
      setOptimisticData(optimisticUpdateRecord(currentData, String(editingWorkflowRecord.id), workflowData));
      setIsAutomationBuilderOpen(false);
      setEditingWorkflowRecord(null);
      const result = await updateRecord(String(editingWorkflowRecord.id), workflowData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to update automation');
      } else {
        toast.success('Automation saved');
      }
    } else {
      const tempId = generateTempId();
      const newRecord = { ...workflowData, id: tempId, run_count: 0 };
      setOptimisticData(optimisticCreate(currentData, newRecord));
      setIsAutomationBuilderOpen(false);
      setEditingWorkflowRecord(null);
      const result = await createRecord(workflowData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to create automation');
      } else {
        toast.success('Automation created');
      }
    }
  };

  // Handle social media composer save — creates or updates a post
  const handleSocialMediaSave = async (postData: Record<string, unknown>) => {
    const currentData = data;
    if (editingSocialPost?.id) {
      setOptimisticData(optimisticUpdateRecord(currentData, String(editingSocialPost.id), postData));
      setIsSocialComposerOpen(false);
      setEditingSocialPost(null);
      const result = await updateRecord(String(editingSocialPost.id), postData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to update post');
      } else {
        toast.success('Post updated');
      }
    } else {
      const tempId = generateTempId();
      const newRecord = { ...postData, id: tempId };
      setOptimisticData(optimisticCreate(currentData, newRecord));
      setIsSocialComposerOpen(false);
      setEditingSocialPost(null);
      const result = await createRecord(postData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to create post');
      } else {
        toast.success(postData.status === 'scheduled' ? 'Post scheduled' : 'Draft saved');
      }
    }
  };

  // Handle form builder save — creates or updates a form
  const handleFormBuilderSave = async (formData: Record<string, unknown>) => {
    const currentData = data;
    if (editingFormRecord?.id) {
      // Update existing form
      setOptimisticData(optimisticUpdateRecord(currentData, String(editingFormRecord.id), formData));
      setIsFormBuilderOpen(false);
      setEditingFormRecord(null);
      const result = await updateRecord(String(editingFormRecord.id), formData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to update form');
      } else {
        toast.success('Form saved');
      }
    } else {
      // Create new form
      const tempId = generateTempId();
      const newRecord = { ...formData, id: tempId, submissions: 0 };
      setOptimisticData(optimisticCreate(currentData, newRecord));
      setIsFormBuilderOpen(false);
      setEditingFormRecord(null);
      const result = await createRecord(formData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to create form');
      } else {
        toast.success('Form created');
      }
    }
  };

  // Handle staff wizard save — converts wizard data to staff record, uses optimistic create
  const handleStaffWizardSave = async (wizardData: Record<string, unknown>) => {
    const currentData = data;
    const tempId = generateTempId();
    const newRecord = { ...wizardData, id: tempId };
    setOptimisticData(optimisticCreate(currentData, newRecord));
    setIsStaffWizardOpen(false);

    const result = await createRecord(wizardData);
    if (!result) {
      setOptimisticData(null);
      showError(mutationError || 'Failed to add team member');
    } else {
      toast.success('Team member added');
    }
  };

  // Handle catalog item wizard save — creates a service or product
  const handleCatalogItemSave = async (wizardData: Record<string, unknown>) => {
    const currentData = data;
    const tempId = generateTempId();
    // Add display-friendly fields for card rendering (entity-fields uses meta/subtitle/status)
    const priceCents = (wizardData.price_cents as number) || 0;
    const durationMin = wizardData.duration_minutes as number | undefined;
    const bufferMin = (wizardData.buffer_minutes as number) || 0;
    const priceStr = priceCents > 0 ? `$${(priceCents / 100).toFixed(0)}` : 'Free';
    const durationStr = durationMin ? (durationMin < 60 ? `${durationMin} min` : `${Math.floor(durationMin / 60)} hr${durationMin % 60 ? ` ${durationMin % 60}m` : ''}`) : '';
    const bufferStr = bufferMin > 0 ? ` + ${bufferMin}m buffer` : '';
    const metaStr = durationStr ? `${priceStr} · ${durationStr}${bufferStr}` : priceStr;
    const newRecord = {
      ...wizardData,
      id: tempId,
      title: wizardData.name,
      meta: metaStr,
      subtitle: wizardData.description || '',
      status: wizardData.is_active ? 'active' : 'inactive',
    };
    setOptimisticData(optimisticCreate(currentData, newRecord));
    setIsCatalogWizardOpen(false);

    const result = await createRecord(wizardData);
    if (!result) {
      setOptimisticData(null);
      showError(mutationError || 'Failed to add item');
    } else {
      toast.success(wizardData.item_type === 'service' ? 'Service added' : 'Product added');
    }
  };

  // Handle add event save — universal calendar event creation
  const handleAddEventSave = async (eventData: Record<string, unknown>) => {
    const currentData = data;
    const tempId = generateTempId();
    const newRecord = { ...eventData, id: tempId };
    setOptimisticData(optimisticCreate(currentData, newRecord));
    setIsAddEventOpen(false);
    setAddEventPrefill({});

    const result = await createRecord(eventData);
    if (!result) {
      setOptimisticData(null);
      showError(mutationError || 'Failed to create event');
    } else {
      toast.success('Event created');
    }
  };

  // Handle block time save — creates a blocked time record on the calendar
  const handleBlockTimeSave = async (blockData: Record<string, unknown>) => {
    const currentData = data;
    const tempId = generateTempId();
    const newRecord = { ...blockData, id: tempId };
    setOptimisticData(optimisticCreate(currentData, newRecord));
    setIsBlockTimeOpen(false);

    const result = await createRecord(blockData);
    if (!result) {
      setOptimisticData(null);
      showError(mutationError || 'Failed to block time');
    } else {
      toast.success('Time blocked');
    }
  };

  // Handle detail panel close
  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedRecord(null);
  };

  // Handle record save from detail panel
  const handleRecordSave = async (recordData: Record<string, unknown>) => {
    const currentData = data;

    if (detailMode === 'create') {
      // Apply optimistic create immediately
      const tempId = generateTempId();
      const newRecord = { ...recordData, id: tempId };
      setOptimisticData(optimisticCreate(currentData, newRecord));

      // Close panel immediately for instant feedback
      setIsDetailOpen(false);
      setSelectedRecord(null);

      // Then perform the actual mutation
      const result = await createRecord(recordData);
      if (!result) {
        setOptimisticData(null);
        showError(mutationError || 'Failed to create record');
      } else {
        toast.success('Record created');
      }
    } else {
      const recordId = selectedRecord?.id as string;
      if (recordId) {
        setOptimisticData(optimisticUpdateRecord(currentData, recordId, recordData));
        setIsDetailOpen(false);
        setSelectedRecord(null);

        const result = await updateRecord(recordId, recordData);
        if (!result) {
          setOptimisticData(null);
          showError(mutationError || 'Failed to update record');
        } else {
          toast.success('Changes saved');
        }
      }
    }
  };

  // Handle record delete from detail panel
  const handleRecordDelete = async (recordId: string) => {
    const currentData = data;
    setOptimisticData(optimisticDelete(currentData, recordId));
    setIsDetailOpen(false);
    setSelectedRecord(null);

    const success = await deleteRecord(recordId);
    if (!success) {
      setOptimisticData(null);
      showError(mutationError || 'Failed to delete record');
    } else {
      toast.success('Record deleted');
    }
  };

  // Handle bulk delete from table view
  const handleBulkDelete = async (ids: string[]) => {
    // Apply all optimistic deletes at once
    let updatedData = data;
    for (const id of ids) {
      updatedData = optimisticDelete(updatedData, id);
    }
    setOptimisticData(updatedData);

    let failCount = 0;
    for (const id of ids) {
      const success = await deleteRecord(id);
      if (!success) failCount++;
    }

    if (failCount > 0) {
      setOptimisticData(null);
      showError(`Failed to delete ${failCount} of ${ids.length} records`);
    } else {
      toast.success(`Deleted ${ids.length} records`);
    }
  };

  // Handle CSV export
  const handleExport = () => {
    const columns = tableFields?.columns || [];
    if (columns.length === 0 || data.length === 0) return;
    exportToCSV(data, columns, `${entityType}-export`);
    toast.success(`Exported ${data.length} records`);
  };

  // Handle view change from switcher
  const handleViewChange = (viewType: string) => {
    // Update internal view state (cast to ViewType since we know it's valid)
    setCurrentView(viewType as typeof currentView);
    // Reset to page 1 when switching views
    setPage(1);
    // Notify parent if callback provided
    onViewChange?.(viewType);
  };

  // Handle stage move for pipeline view
  const handleStageMove = async (recordId: string, newStageId: string) => {
    // Persist stage override locally (survives onSuccess clearing optimistic data)
    setStageOverrides(prev => ({ ...prev, [recordId]: newStageId }));

    // Try the actual mutation (optimistic update via stageOverrides is already applied)
    await moveStage(recordId, newStageId);
  };

  // Handle date range change for calendar view
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle list item update (for checkbox toggles)
  const handleListRecordUpdate = async (record: Record<string, unknown>) => {
    const recordId = record.id as string;
    if (recordId) {
      const currentData = data;

      // Apply optimistic update immediately
      setOptimisticData(optimisticUpdateRecord(currentData, recordId, record));

      // Then perform the actual mutation
      const result = await updateRecord(recordId, record);
      if (!result) {
        // Rollback on failure
        setOptimisticData(null);
        showError(mutationError || 'Failed to update record');
      }
    }
  };

  // Get field config — prefer component-specific fields (e.g. 'expenses'), fall back to shared entity type (e.g. 'invoices')
  const fieldKey = getCardFields(componentId) ? componentId : entityType;
  const cardFields = getCardFields(fieldKey);
  const calendarFields = getCalendarFields(fieldKey);
  const pipelineFields = getPipelineFields(fieldKey);
  const listFields = getListFields(fieldKey);
  const tableFields = getTableFields(fieldKey);

  // Get table columns for detail panel
  const tableColumns = tableFields?.columns || [];

  const textColor = getTextColor(configColors);

  // Determine if DataToolbar should show (not for calendar view)
  const showToolbar = currentView !== 'calendar';

  // Determine if Pagination should show (only for table, cards, list)
  const showPagination = ['table', 'cards', 'list'].includes(currentView);

  // Render loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center" style={{ color: textColor, opacity: 0.5 }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && data.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate view component
  const renderView = () => {
    // Empty state
    if (!data || data.length === 0) {
      return (
        <EmptyState
          entityType={componentId}
          configColors={configColors}
          onAdd={handleAddClick}
        />
      );
    }

    switch (currentView) {
      case 'cards':
        return (
          <CardView
            data={data}
            entityType={entityType}
            configColors={configColors}
            fields={cardFields}
            onRecordClick={handleRecordClick}
            onRecordUpdate={handleListRecordUpdate}
            onQuickDelete={(id) => handleRecordDelete(id)}
          />
        );

      case 'pipeline': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAutoProgress = !!(componentConfig as any)._auto_progress;
        return (
          <PipelineView
            data={data}
            pipelineConfig={componentConfig.pipeline}
            configColors={configColors}
            entityType={entityType}
            fields={pipelineFields}
            onRecordClick={handleRecordClick}
            onStageMove={isAutoProgress ? undefined : handleStageMove}
            onAddToStage={isAutoProgress ? undefined : () => handleAddClick()}
            readOnly={isAutoProgress}
          />
        );
      }

      case 'calendar':
        return (
          <CalendarView
            data={data}
            entityType={entityType}
            configColors={configColors}
            fields={calendarFields}
            onRecordClick={handleRecordClick}
            onRecordUpdate={handleListRecordUpdate}
            onDateRangeChange={handleDateRangeChange}
            onDateSelect={(start: Date, end: Date) => {
              setAddEventPrefill({
                date: start.toISOString().split('T')[0],
                startTime: start.toISOString(),
                endTime: end.toISOString(),
              });
              setIsAddEventOpen(true);
            }}
          />
        );

      case 'route':
        return (
          <RouteView
            data={data}
            entityType={entityType}
            configColors={configColors}
            fields={getRouteFields(fieldKey)}
            onRecordClick={handleRecordClick}
          />
        );

      case 'list':
        return (
          <ListView
            data={data}
            entityType={entityType}
            configColors={configColors}
            fields={listFields}
            onRecordClick={handleRecordClick}
            onRecordUpdate={handleListRecordUpdate}
          />
        );

      case 'table':
      default:
        return (
          <TableView
            data={data}
            entityType={entityType}
            configColors={configColors}
            fields={tableFields}
            onRecordClick={handleRecordClick}
            onRecordUpdate={handleListRecordUpdate}
            onBulkDelete={handleBulkDelete}
          />
        );
    }
  };

  // Chat widget gets its own full inbox view
  if (isChatWidgetEntity) {
    return (
      <Suspense fallback={null}>
        <ChatInboxView colors={configColors} />
      </Suspense>
    );
  }

  // Gallery/images/portfolios get custom gallery manager
  if (isGalleryEntity) {
    return (
      <Suspense fallback={null}>
        <GalleryManager configColors={configColors} entityType={entityType} />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header with view toggle + import/export + add button */}
      <div className="flex items-center gap-2 mb-4">
        {/* View toggle */}
        {availableViews.length > 1 && (
          <div data-tour-id="view-toggle" className="flex items-center gap-1 mr-auto bg-gray-100 rounded-lg p-1">
            {availableViews.map((vt) => {
              const isActive = currentView === vt;
              const btnColor = configColors.buttons || '#1A1A1A';
              return (
                <button
                  key={vt}
                  onClick={() => handleViewChange(vt)}
                  className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                  title={`${vt.charAt(0).toUpperCase() + vt.slice(1)} view`}
                  style={{
                    backgroundColor: isActive ? btnColor : 'transparent',
                    color: isActive ? getContrastText(btnColor) : '#6B7280',
                  }}
                >
                  <ViewIcon type={vt} />
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {currentView === 'pipeline' && !(componentConfig as any)._auto_progress && (
          <button
            data-tour-id="edit-stages-btn"
            onClick={() => setIsStageManagerOpen(true)}
            className="px-3 py-2 text-sm rounded-lg border transition-opacity hover:opacity-70"
            style={{
              borderColor: configColors.borders || '#E5E7EB',
              color: textColor,
            }}
          >
            Edit Stages
          </button>
        )}
        {currentView === 'table' && (
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3 py-2 text-sm rounded-lg border transition-opacity hover:opacity-70"
            style={{
              borderColor: configColors.borders || '#E5E7EB',
              color: textColor,
            }}
          >
            Import CSV
          </button>
        )}
        {currentView === 'table' && data.length > 0 && (
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm rounded-lg border transition-opacity hover:opacity-70"
            style={{
              borderColor: configColors.borders || '#E5E7EB',
              color: textColor,
            }}
          >
            Export CSV
          </button>
        )}
        {isCalendarEntity && (
          <>
            <button
              onClick={() => setIsBookingSetupOpen(true)}
              className="px-3 py-2 text-sm rounded-lg border transition-opacity hover:opacity-70 flex items-center gap-1.5"
              style={{
                borderColor: configColors.borders || '#E5E7EB',
                color: textColor,
              }}
              title={bookingSettings ? 'Booking Settings' : 'Set Up Booking'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {bookingSettings ? 'Booking Settings' : 'Set Up Booking'}
            </button>
            <button
              onClick={() => setIsBlockTimeOpen(true)}
              className="px-3 py-2 text-sm rounded-lg border transition-opacity hover:opacity-70 flex items-center gap-1.5"
              style={{
                borderColor: configColors.borders || '#E5E7EB',
                color: textColor,
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Block Time
            </button>
          </>
        )}
        {/* Hide header add button for routes and auto-progress pipelines */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {!isRouteEntity && !(componentConfig as any)._auto_progress && (
          <div data-tour-id="add-record-btn">
            <AddRecordButton
              entityType={entityType}
              componentId={componentId}
              configColors={configColors}
              onClick={handleAddClick}
              isLoading={isCreating}
            />
          </div>
        )}
        </div>
      </div>

      {/* Data toolbar (search + filters) - not for calendar */}
      {showToolbar && (
        <div data-tour-id="search-bar">
          <DataToolbar
            entityType={componentId}
            configColors={configColors}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            searchValue={search}
            activeFilters={filters}
          />
        </div>
      )}

      {/* Stat cards row — above view content (hidden for auto-progress pipelines) */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {currentView !== 'calendar' && !(componentConfig as any)._auto_progress && (
        <Suspense fallback={null}>
          <div data-tour-id="stat-cards">
            <StatCards entityType={componentId} data={data} configColors={configColors} dataMode={dataMode} />
          </div>
        </Suspense>
      )}

      {/* View content */}
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>}>
        <div>
          {renderView()}
        </div>
      </Suspense>

      {/* Pagination - only for table, cards, list */}
      {showPagination && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          configColors={configColors}
        />
      )}

      {/* Detail panel */}
      <DetailPanel
        record={selectedRecord}
        entityType={entityType}
        fields={tableColumns}
        configColors={configColors}
        isOpen={isDetailOpen}
        titleField={cardFields?.title || 'name'}
        onClose={handleDetailClose}
        onSave={handleRecordSave}
        onDelete={handleRecordDelete}
        mode={detailMode}
        isSaving={isCreating || isUpdating}
        isDeleting={isDeleting}
        customFields={customFieldDefs}
      />

      {/* Document editor — full page for documents/contracts */}
      {isDocEditorOpen && selectedRecord && (<Suspense fallback={null}>
        <DocumentEditor
          record={selectedRecord}
          entityType={entityType}
          configColors={configColors}
          onSave={async (updatedRecord) => {
            await handleRecordSave(updatedRecord);
          }}
          onClose={() => {
            setIsDocEditorOpen(false);
            setSelectedRecord(null);
          }}
        />
      </Suspense>)}

      {/* CSV Import modal */}
      {isImportOpen && (<Suspense fallback={null}>
        <CSVImport
          entityType={entityType}
          targetColumns={tableFields?.columns || []}
          configColors={configColors}
          onImportComplete={() => {
            setIsImportOpen(false);
            refetch();
          }}
          onClose={() => setIsImportOpen(false)}
        />
      </Suspense>)}

      {/* Staff setup wizard */}
      {isStaffWizardOpen && (<Suspense fallback={null}>
        <StaffSetupWizard
          isOpen={isStaffWizardOpen}
          onClose={() => setIsStaffWizardOpen(false)}
          onSave={handleStaffWizardSave}
          configColors={configColors}
          isSaving={isCreating}
        />
      </Suspense>)}

      {/* Catalog item wizard — services/products */}
      {isCatalogWizardOpen && (<Suspense fallback={null}>
        <AddCatalogItemWizard
          isOpen={isCatalogWizardOpen}
          onClose={() => setIsCatalogWizardOpen(false)}
          onSave={handleCatalogItemSave}
          configColors={configColors}
          isSaving={isCreating}
        />
      </Suspense>)}

      {/* Add event modal — universal calendar */}
      {isAddEventOpen && (<Suspense fallback={null}>
        <AddEventModal
          isOpen={isAddEventOpen}
          onClose={() => { setIsAddEventOpen(false); setAddEventPrefill({}); }}
          onSave={handleAddEventSave}
          configColors={configColors}
          isSaving={isCreating}
          prefillDate={addEventPrefill.date}
          prefillStartTime={addEventPrefill.startTime}
          prefillEndTime={addEventPrefill.endTime}
        />
      </Suspense>)}

      {/* Form builder */}
      {isFormBuilderOpen && (<Suspense fallback={null}>
        <FormBuilder
          isOpen={isFormBuilderOpen}
          onClose={() => { setIsFormBuilderOpen(false); setEditingFormRecord(null); }}
          onSave={handleFormBuilderSave}
          configColors={configColors}
          existingForm={editingFormRecord ? {
            id: String(editingFormRecord.id),
            name: String(editingFormRecord.name || ''),
            description: String(editingFormRecord.description || ''),
            type: (editingFormRecord.type as string) as 'intake',
            fields: (editingFormRecord.fields as unknown[]) as [],
            status: String(editingFormRecord.status || 'active'),
          } : null}
          isSaving={isCreating || isUpdating}
        />
      </Suspense>)}

      {/* Automation builder */}
      {isAutomationBuilderOpen && (<Suspense fallback={null}>
        <AutomationBuilder
          isOpen={isAutomationBuilderOpen}
          onClose={() => { setIsAutomationBuilderOpen(false); setEditingWorkflowRecord(null); }}
          onSave={handleAutomationSave}
          configColors={configColors}
          existingWorkflow={editingWorkflowRecord ? {
            id: String(editingWorkflowRecord.id),
            name: String(editingWorkflowRecord.name || ''),
            description: String(editingWorkflowRecord.description || ''),
            trigger_type: (editingWorkflowRecord.trigger_type as string) as 'manual',
            trigger_config: (editingWorkflowRecord.trigger_config as Record<string, unknown>) || {},
            actions: (editingWorkflowRecord.actions as unknown[]) as [],
            status: String(editingWorkflowRecord.status || 'active'),
            enabled: editingWorkflowRecord.enabled !== false,
          } : null}
          isSaving={isCreating || isUpdating}
        />
      </Suspense>)}

      {/* Social media composer */}
      {isSocialComposerOpen && (<Suspense fallback={null}>
        <SocialMediaComposer
          isOpen={isSocialComposerOpen}
          onClose={() => { setIsSocialComposerOpen(false); setEditingSocialPost(null); }}
          onSave={handleSocialMediaSave}
          configColors={configColors}
          existingPost={editingSocialPost}
          isSaving={isCreating || isUpdating}
        />
      </Suspense>)}

      {/* Block time modal */}
      {isBlockTimeOpen && (<Suspense fallback={null}>
        <BlockTimeModal
          isOpen={isBlockTimeOpen}
          onClose={() => setIsBlockTimeOpen(false)}
          onSave={handleBlockTimeSave}
          colors={configColors}
          isLoading={isCreating}
        />
      </Suspense>)}

      {/* Booking setup wizard — owner-only, calendar entities */}
      {isBookingSetupOpen && (<Suspense fallback={null}>
        <BookingSetupWizard
          isOpen={isBookingSetupOpen}
          onClose={() => setIsBookingSetupOpen(false)}
          onSave={() => fetchBookingSettings()}
          configColors={configColors}
          existingSettings={bookingSettings}
        />
      </Suspense>)}

      {/* Stage manager modal */}
      {componentConfig.pipeline && (<Suspense fallback={null}>
        <StageManagerModal
          isOpen={isStageManagerOpen}
          onClose={() => setIsStageManagerOpen(false)}
          stages={componentConfig.pipeline.stages}
          onSave={(newStages) => {
            // Update locally — componentConfig is a reference from parent
            componentConfig.pipeline!.stages = newStages;
            // Force re-render by refetching (data stays same, but pipeline config changes)
            refetch();
          }}
          configColors={configColors}
        />
      </Suspense>)}
    </div>
  );
}
