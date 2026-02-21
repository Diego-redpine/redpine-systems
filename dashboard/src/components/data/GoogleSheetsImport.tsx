'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

// ─── Types ───────────────────────────────────────────────────────────

interface GoogleSheetsImportProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  colors: DashboardColors;
  onImportComplete: (count: number) => void;
}

interface SpreadsheetEntry {
  id: string;
  name: string;
  modifiedTime: string;
}

interface SheetData {
  headers: string[];
  rows: string[][];
  sheetNames: string[];
  activeSheet: string;
  totalRows: number;
}

interface ColumnMapping {
  sheetHeader: string;
  entityField: string; // 'skip' means unmapped
}

// ─── Entity field definitions ────────────────────────────────────────

const ENTITY_IMPORT_FIELDS: Record<string, string[]> = {
  clients: ['name', 'email', 'phone', 'type', 'status', 'notes'],
  contacts: ['name', 'email', 'phone', 'type'],
  leads: ['name', 'email', 'phone', 'source', 'status', 'value', 'notes'],
  products: ['name', 'description', 'price', 'quantity', 'sku', 'category'],
  inventory: ['name', 'description', 'quantity', 'sku', 'category', 'location'],
  staff: ['name', 'email', 'phone', 'role'],
  vendors: ['name', 'email', 'phone', 'company', 'type', 'notes'],
  tasks: ['title', 'description', 'status', 'priority', 'due_date'],
  todos: ['title', 'description', 'status', 'priority', 'due_date'],
  projects: ['name', 'description', 'status', 'start_date', 'end_date'],
  invoices: ['contact_id', 'amount', 'status', 'due_date', 'notes'],
  expenses: ['description', 'amount', 'category', 'date', 'vendor', 'notes'],
  equipment: ['name', 'type', 'status', 'serial_number', 'location', 'notes'],
  appointments: ['title', 'start_time', 'end_time', 'location', 'status', 'notes'],
  orders: ['customer_name', 'status', 'total', 'notes'],
  tickets: ['title', 'description', 'status', 'priority', 'assigned_to'],
  listings: ['title', 'description', 'price', 'status', 'location'],
  properties: ['name', 'address', 'type', 'status', 'price'],
  guests: ['name', 'email', 'phone', 'notes'],
  memberships: ['name', 'email', 'phone', 'plan', 'status'],
  classes: ['title', 'instructor', 'day_of_week', 'start_time', 'end_time', 'capacity'],
  courses: ['name', 'description', 'instructor', 'status', 'price'],
};

// Fallback fields for any entity not in the map
const DEFAULT_IMPORT_FIELDS = ['name', 'description', 'status', 'notes'];

function getFieldsForEntity(entityType: string): string[] {
  return ENTITY_IMPORT_FIELDS[entityType] || DEFAULT_IMPORT_FIELDS;
}

function formatFieldLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Auto-map sheet headers to entity fields based on case-insensitive name matching.
 * Checks for exact match and also normalized match (underscores/spaces stripped).
 */
function autoMapColumns(headers: string[], entityFields: string[]): ColumnMapping[] {
  return headers.map((header) => {
    const normalizedHeader = header.toLowerCase().replace(/[\s_-]+/g, '');

    // Try exact case-insensitive match first
    const exactMatch = entityFields.find(
      (f) => f.toLowerCase() === header.toLowerCase()
    );

    if (exactMatch) {
      return { sheetHeader: header, entityField: exactMatch };
    }

    // Try normalized match (e.g., "First Name" -> "firstname" matches "first_name" -> "firstname")
    const normalizedMatch = entityFields.find(
      (f) => f.toLowerCase().replace(/[\s_-]+/g, '') === normalizedHeader
    );

    if (normalizedMatch) {
      return { sheetHeader: header, entityField: normalizedMatch };
    }

    // Check for common synonyms
    const synonyms: Record<string, string[]> = {
      name: ['full name', 'fullname', 'client name', 'customer name', 'contact name'],
      email: ['email address', 'e-mail', 'emailaddress'],
      phone: ['phone number', 'phonenumber', 'telephone', 'tel', 'mobile', 'cell'],
      description: ['desc', 'details', 'summary'],
      status: ['state', 'stage'],
      notes: ['note', 'comments', 'comment', 'memo'],
      price: ['cost', 'amount', 'rate'],
      quantity: ['qty', 'count', 'stock'],
      category: ['type', 'group', 'classification'],
      due_date: ['deadline', 'duedate', 'due'],
      title: ['subject', 'heading'],
    };

    for (const [field, alts] of Object.entries(synonyms)) {
      if (entityFields.includes(field) && alts.includes(normalizedHeader)) {
        return { sheetHeader: header, entityField: field };
      }
    }

    return { sheetHeader: header, entityField: 'skip' };
  });
}

// ─── Component ───────────────────────────────────────────────────────

export default function GoogleSheetsImport({
  isOpen,
  onClose,
  entityType,
  colors,
  onImportComplete,
}: GoogleSheetsImportProps) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetEntry[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Step 1 -> 2 transition state
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedTab, setSelectedTab] = useState('');

  // Step 2 state
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);

  // Step 4 state
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  // Style tokens
  const buttonBg = colors.buttons || '#4F46E5';
  const buttonText = getContrastText(buttonBg);
  const textColor = colors.text || '#1A1A1A';
  const mutedColor = colors.text ? `${colors.text}99` : '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';
  const pageBg = colors.background || '#F5F5F5';

  const entityFields = getFieldsForEntity(entityType);

  // ─── Step navigation ─────────────────────────────────────────────

  const totalSteps = 4;

  const resetState = useCallback(() => {
    setStep(1);
    setSpreadsheets([]);
    setIsLoadingSheets(false);
    setIsConnected(true);
    setLoadError('');
    setSelectedSheetId('');
    setSelectedSheetName('');
    setSheetData(null);
    setIsLoadingData(false);
    setSelectedTab('');
    setMappings([]);
    setImportProgress(0);
    setImportTotal(0);
    setImportedCount(0);
    setImportError('');
    setIsImporting(false);
    setImportComplete(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // ─── Fetch spreadsheets on open ──────────────────────────────────

  useEffect(() => {
    if (!isOpen || step !== 1) return;

    let cancelled = false;
    setIsLoadingSheets(true);
    setLoadError('');

    fetch('/api/integrations/google/sheets')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const data = json.data;
        if (!data?.connected) {
          setIsConnected(false);
          setSpreadsheets([]);
        } else {
          setIsConnected(true);
          setSpreadsheets(data.sheets || []);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load sheets:', err);
        setLoadError('Failed to load spreadsheets. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSheets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, step]);

  // ─── Select spreadsheet and load data ─────────────────────────────

  const selectSpreadsheet = useCallback(
    async (id: string, name: string) => {
      setSelectedSheetId(id);
      setSelectedSheetName(name);
      setIsLoadingData(true);
      setLoadError('');

      try {
        const res = await fetch(`/api/integrations/google/sheets/${encodeURIComponent(id)}`);
        const json = await res.json();

        if (!res.ok) {
          setLoadError(json.error || 'Failed to load spreadsheet data');
          setIsLoadingData(false);
          return;
        }

        const data: SheetData = json.data;
        setSheetData(data);
        setSelectedTab(data.activeSheet);

        // Auto-map columns
        const autoMapped = autoMapColumns(data.headers, entityFields);
        setMappings(autoMapped);

        setStep(2);
      } catch (err) {
        console.error('Failed to load sheet data:', err);
        setLoadError('Failed to load spreadsheet data. Please try again.');
      } finally {
        setIsLoadingData(false);
      }
    },
    [entityFields]
  );

  // ─── Switch sheet tab ─────────────────────────────────────────────

  const switchTab = useCallback(
    async (tabName: string) => {
      if (!selectedSheetId || tabName === selectedTab) return;

      setIsLoadingData(true);
      setLoadError('');

      try {
        const res = await fetch(
          `/api/integrations/google/sheets/${encodeURIComponent(selectedSheetId)}?sheet=${encodeURIComponent(tabName)}`
        );
        const json = await res.json();

        if (!res.ok) {
          setLoadError(json.error || 'Failed to load sheet tab');
          setIsLoadingData(false);
          return;
        }

        const data: SheetData = json.data;
        setSheetData(data);
        setSelectedTab(tabName);

        const autoMapped = autoMapColumns(data.headers, entityFields);
        setMappings(autoMapped);
      } catch (err) {
        console.error('Failed to switch tab:', err);
        setLoadError('Failed to load sheet tab.');
      } finally {
        setIsLoadingData(false);
      }
    },
    [selectedSheetId, selectedTab, entityFields]
  );

  // ─── Update mapping ──────────────────────────────────────────────

  const updateMapping = useCallback((headerIndex: number, entityField: string) => {
    setMappings((prev) => {
      const next = [...prev];
      next[headerIndex] = { ...next[headerIndex], entityField };
      return next;
    });
  }, []);

  // ─── Import rows ─────────────────────────────────────────────────

  const runImport = useCallback(async () => {
    if (!sheetData) return;

    const activeMappings = mappings.filter((m) => m.entityField !== 'skip');
    if (activeMappings.length === 0) {
      setImportError('Please map at least one column before importing.');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportComplete(false);

    const rows = sheetData.rows;
    setImportTotal(rows.length);
    setImportProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Build record from mappings
      const record: Record<string, string> = {};
      for (const mapping of mappings) {
        if (mapping.entityField === 'skip') continue;
        const headerIndex = sheetData.headers.indexOf(mapping.sheetHeader);
        if (headerIndex >= 0 && headerIndex < row.length) {
          const value = row[headerIndex];
          if (value !== undefined && value !== '') {
            record[mapping.entityField] = value;
          }
        }
      }

      // Skip empty rows (no mapped values)
      if (Object.keys(record).length === 0) {
        setImportProgress(i + 1);
        continue;
      }

      try {
        const res = await fetch(`/api/data/${entityType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      setImportProgress(i + 1);
      setImportedCount(successCount);
    }

    setIsImporting(false);
    setImportComplete(true);

    if (failCount > 0) {
      setImportError(`${failCount} row${failCount === 1 ? '' : 's'} failed to import.`);
    }

    if (successCount > 0) {
      onImportComplete(successCount);
    }
  }, [sheetData, mappings, entityType, onImportComplete]);

  // ─── Computed values ──────────────────────────────────────────────

  const mappedFieldCount = mappings.filter((m) => m.entityField !== 'skip').length;
  const previewRows = sheetData ? sheetData.rows.slice(0, 5) : [];

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import from Google Sheets"
      subtitle={`Step ${step} of ${totalSteps} — ${
        step === 1 ? 'Select Spreadsheet' :
        step === 2 ? 'Map Columns' :
        step === 3 ? 'Preview' :
        'Import'
      }`}
      maxWidth="max-w-3xl"
      configColors={colors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 420 }}>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: s === step ? 32 : 16,
                backgroundColor: s <= step ? buttonBg : borderColor,
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 px-5 py-4 overflow-y-auto">

          {/* ──────────── STEP 1: Select Spreadsheet ──────────── */}
          {step === 1 && (
            <div className="space-y-4">
              {!isConnected && !isLoadingSheets && (
                <div className="text-center py-8 space-y-4">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                    style={{ backgroundColor: `${buttonBg}15` }}
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={buttonBg} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.186-9.186l-5.636 5.636a4.5 4.5 0 00-1.242 7.244" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: textColor }}>
                      Connect Google Account
                    </p>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      Link your Google account to import data from Google Sheets
                    </p>
                  </div>
                  <a
                    href="/api/integrations/google/connect"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Connect Google
                  </a>
                </div>
              )}

              {isLoadingSheets && (
                <div className="flex items-center justify-center py-12">
                  <div className="space-y-3 text-center">
                    <div
                      className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                      style={{ borderColor: `${buttonBg}40`, borderTopColor: 'transparent' }}
                    />
                    <p className="text-xs" style={{ color: mutedColor }}>Loading spreadsheets...</p>
                  </div>
                </div>
              )}

              {loadError && (
                <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  {loadError}
                </div>
              )}

              {isConnected && !isLoadingSheets && spreadsheets.length === 0 && !loadError && (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: mutedColor }}>
                    No spreadsheets found in your Google Drive.
                  </p>
                </div>
              )}

              {isConnected && !isLoadingSheets && spreadsheets.length > 0 && (
                <>
                  <p className="text-sm" style={{ color: mutedColor }}>
                    Select a spreadsheet to import into <span className="font-medium" style={{ color: textColor }}>{formatFieldLabel(entityType)}</span>
                  </p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {spreadsheets.map((sheet) => (
                      <button
                        key={sheet.id}
                        onClick={() => selectSpreadsheet(sheet.id, sheet.name)}
                        disabled={isLoadingData}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm disabled:opacity-50"
                        style={{
                          borderColor,
                          backgroundColor: selectedSheetId === sheet.id ? `${buttonBg}08` : cardBg,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#E8F5E9' }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0F9D58">
                            <path d="M19 11V9h-6V3H7l-4 4v14c0 .55.45 1 1 1h10v-2H5V7.83L7.83 5H11v6h8v2h-2v2h2v-2h2v-2h-2z" />
                            <path d="M19 13h-6v8h8v-6c0-1.1-.9-2-2-2zm0 6h-4v-4h4v4z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                            {sheet.name}
                          </p>
                          <p className="text-xs" style={{ color: mutedColor }}>
                            Modified {formatRelativeTime(sheet.modifiedTime)}
                          </p>
                        </div>
                        {isLoadingData && selectedSheetId === sheet.id && (
                          <div
                            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
                            style={{ borderColor: `${buttonBg}40`, borderTopColor: 'transparent' }}
                          />
                        )}
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ──────────── STEP 2: Column Mapping ──────────── */}
          {step === 2 && sheetData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: textColor }}>
                    {selectedSheetName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: mutedColor }}>
                    {sheetData.totalRows} row{sheetData.totalRows === 1 ? '' : 's'} found — {mappedFieldCount} column{mappedFieldCount === 1 ? '' : 's'} mapped
                  </p>
                </div>
              </div>

              {/* Sheet tab selector (if multiple tabs) */}
              {sheetData.sheetNames.length > 1 && (
                <div className="flex gap-1 flex-wrap">
                  {sheetData.sheetNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => switchTab(name)}
                      disabled={isLoadingData}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: name === selectedTab ? buttonBg : `${buttonBg}10`,
                        color: name === selectedTab ? buttonText : buttonBg,
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: `${buttonBg}40`, borderTopColor: 'transparent' }}
                  />
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {mappings.map((mapping, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                      style={{ borderColor, backgroundColor: mapping.entityField !== 'skip' ? `${buttonBg}04` : 'transparent' }}
                    >
                      {/* Sheet header name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                          {mapping.sheetHeader}
                        </p>
                        {sheetData.rows.length > 0 && (
                          <p className="text-xs truncate mt-0.5" style={{ color: mutedColor }}>
                            e.g. &quot;{sheetData.rows[0][i] || ''}&quot;
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={mutedColor} viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>

                      {/* Entity field dropdown */}
                      <select
                        value={mapping.entityField}
                        onChange={(e) => updateMapping(i, e.target.value)}
                        className="w-44 px-3 py-2 rounded-lg border text-sm outline-none appearance-none cursor-pointer"
                        style={{
                          borderColor,
                          backgroundColor: pageBg,
                          color: mapping.entityField === 'skip' ? mutedColor : textColor,
                        }}
                      >
                        <option value="skip">Skip</option>
                        {entityFields.map((field) => (
                          <option key={field} value={field}>
                            {formatFieldLabel(field)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──────────── STEP 3: Preview ──────────── */}
          {step === 3 && sheetData && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium" style={{ color: textColor }}>
                  Preview Import
                </p>
                <p className="text-xs mt-0.5" style={{ color: mutedColor }}>
                  Showing first {Math.min(previewRows.length, 5)} of {sheetData.totalRows} rows with mapped columns only
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border" style={{ borderColor }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: pageBg }}>
                      {mappings
                        .filter((m) => m.entityField !== 'skip')
                        .map((m) => (
                          <th
                            key={m.entityField}
                            className="text-left px-3 py-2.5 text-xs font-semibold whitespace-nowrap"
                            style={{ color: textColor, borderColor }}
                          >
                            {formatFieldLabel(m.entityField)}
                            <span className="font-normal ml-1" style={{ color: mutedColor }}>
                              ({m.sheetHeader})
                            </span>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIdx) => {
                      const activeMappings = mappings.filter((m) => m.entityField !== 'skip');
                      return (
                        <tr
                          key={rowIdx}
                          className="border-t"
                          style={{ borderColor }}
                        >
                          {activeMappings.map((m) => {
                            const headerIndex = sheetData.headers.indexOf(m.sheetHeader);
                            const cellValue = headerIndex >= 0 && headerIndex < row.length ? row[headerIndex] : '';
                            return (
                              <td
                                key={m.entityField}
                                className="px-3 py-2.5 text-sm whitespace-nowrap max-w-48 truncate"
                                style={{ color: textColor }}
                              >
                                {cellValue || <span style={{ color: mutedColor }}>--</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {previewRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={mappings.filter((m) => m.entityField !== 'skip').length || 1}
                          className="text-center py-6 text-sm"
                          style={{ color: mutedColor }}
                        >
                          No data rows found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {sheetData.totalRows > 5 && (
                <p className="text-xs text-center" style={{ color: mutedColor }}>
                  ... and {sheetData.totalRows - 5} more row{sheetData.totalRows - 5 === 1 ? '' : 's'}
                </p>
              )}
            </div>
          )}

          {/* ──────────── STEP 4: Import ──────────── */}
          {step === 4 && (
            <div className="space-y-4">
              {!isImporting && !importComplete && (
                <div className="text-center py-6 space-y-4">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                    style={{ backgroundColor: `${buttonBg}15` }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke={buttonBg} viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: textColor }}>
                      Ready to Import
                    </p>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      {sheetData?.totalRows || 0} row{(sheetData?.totalRows || 0) === 1 ? '' : 's'} will be imported into {formatFieldLabel(entityType)} with {mappedFieldCount} mapped column{mappedFieldCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    onClick={runImport}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    Start Import
                  </button>
                </div>
              )}

              {isImporting && (
                <div className="py-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: textColor }}>
                      Importing row {importProgress} of {importTotal}...
                    </p>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      {importedCount} successfully imported
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${buttonBg}20` }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: importTotal > 0 ? `${(importProgress / importTotal) * 100}%` : '0%',
                        backgroundColor: buttonBg,
                      }}
                    />
                  </div>
                </div>
              )}

              {importComplete && (
                <div className="text-center py-6 space-y-4">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                    style={{ backgroundColor: '#ECFDF5' }}
                  >
                    <svg className="w-7 h-7" fill="none" stroke="#10B981" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textColor }}>
                      Import Complete
                    </p>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      {importedCount} record{importedCount === 1 ? '' : 's'} imported into {formatFieldLabel(entityType)}
                    </p>
                  </div>

                  {importError && (
                    <div
                      className="rounded-xl border px-4 py-3 text-sm text-left"
                      style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626' }}
                    >
                      {importError}
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — hidden during import progress and completion */}
        {!(step === 4 && (isImporting || importComplete)) && (
          <div
            className="flex items-center justify-between px-5 py-3.5 border-t shrink-0"
            style={{ borderColor }}
          >
            <button
              onClick={step > 1 ? () => setStep(step - 1) : handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
              style={{ borderColor, color: textColor }}
            >
              {step > 1 ? 'Back' : 'Cancel'}
            </button>

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={mappedFieldCount === 0}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                Next
              </button>
            )}

            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </CenterModal>
  );
}
