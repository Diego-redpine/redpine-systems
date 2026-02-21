'use client';

import { useState, useEffect, useCallback } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { ENTITY_FIELDS } from '@/lib/entity-fields';
import { getContrastText } from '@/lib/view-colors';

// --- Types ---

interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, string>; // name -> type
}

interface ColumnMapping {
  notionProperty: string;
  entityField: string; // 'skip' if unmapped
}

interface NotionRow {
  [key: string]: string | number | boolean | null;
}

interface NotionImportProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  colors: DashboardColors;
  onImportComplete: (count: number) => void;
}

// --- Entity field lists for mapping ---

const ENTITY_IMPORT_FIELDS: Record<string, string[]> = {
  clients: ['name', 'email', 'phone', 'type', 'status', 'notes', 'address'],
  contacts: ['name', 'email', 'phone', 'type'],
  products: ['name', 'description', 'price_cents', 'quantity', 'sku', 'category'],
  staff: ['name', 'email', 'phone', 'role', 'staff_model', 'notes'],
  leads: ['name', 'email', 'phone', 'source', 'stage', 'notes'],
  invoices: ['contact_id', 'amount_cents', 'status', 'due_date', 'notes'],
  appointments: ['title', 'description', 'start_time', 'end_time', 'location', 'status'],
  tasks: ['title', 'description', 'status', 'priority', 'due_date', 'assigned_to'],
  todos: ['title', 'description', 'status', 'priority', 'due_date'],
  projects: ['name', 'client', 'status', 'budget', 'deadline'],
  jobs: ['title', 'client', 'status', 'value', 'due_date'],
  vendors: ['name', 'email', 'phone', 'category', 'status'],
  expenses: ['description', 'amount', 'category', 'date', 'status'],
  payments: ['contact_id', 'amount', 'method', 'status'],
  estimates: ['contact_id', 'amount', 'status', 'valid_until'],
  notes: ['title', 'author', 'category'],
  reviews: ['customer', 'email', 'rating', 'comment', 'source', 'status'],
  contracts: ['title', 'client', 'value', 'status', 'end_date'],
  orders: ['order_number', 'customer', 'total', 'status'],
  inventory: ['name', 'sku', 'quantity', 'category', 'location'],
  equipment: ['name', 'type', 'serial_number', 'status', 'location'],
  assets: ['name', 'category', 'value', 'status', 'location'],
  documents: ['name', 'file_type', 'folder'],
  messages: ['subject', 'content', 'type'],
  memberships: ['client_name', 'client_email', 'plan_name', 'status', 'start_date'],
  tickets: ['subject', 'requester', 'priority', 'status'],
  campaigns: ['name', 'channel', 'status'],
};

/**
 * Get import-eligible fields for an entity type.
 * Falls back to table columns from entity-fields.ts if no explicit mapping.
 */
function getImportFields(entityType: string): string[] {
  if (ENTITY_IMPORT_FIELDS[entityType]) {
    return ENTITY_IMPORT_FIELDS[entityType];
  }
  // Fallback: use table column names from entity-fields.ts
  const entityConfig = ENTITY_FIELDS[entityType];
  if (entityConfig?.table) {
    return entityConfig.table.columns;
  }
  return ['name', 'description', 'status'];
}

/**
 * Auto-map Notion property names to entity fields by case-insensitive matching.
 */
function autoMap(
  notionProperties: string[],
  entityFields: string[]
): ColumnMapping[] {
  return notionProperties.map((prop) => {
    const normalized = prop.toLowerCase().replace(/[\s_-]+/g, '_');
    const match = entityFields.find(
      (field) => field.toLowerCase() === normalized
    );
    return {
      notionProperty: prop,
      entityField: match || 'skip',
    };
  });
}

// --- Step Components ---

function StepDots({
  current,
  total,
  buttonColor,
}: {
  current: number;
  total: number;
  buttonColor: string;
}) {
  return (
    <div className="flex items-center gap-2 justify-center mb-5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{
            backgroundColor: i <= current ? buttonColor : '#D1D5DB',
          }}
        />
      ))}
    </div>
  );
}

// ---- Main Component ----

export default function NotionImport({
  isOpen,
  onClose,
  entityType,
  colors,
  onImportComplete,
}: NotionImportProps) {
  const [step, setStep] = useState(0);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);

  // Step 1 state
  const [selectedDb, setSelectedDb] = useState<NotionDatabase | null>(null);

  // Step 2 state
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const entityFields = getImportFields(entityType);

  // Step 3 state
  const [notionRows, setNotionRows] = useState<NotionRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);

  // Step 4 state
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const [importErrors, setImportErrors] = useState(0);

  const buttonColor = colors.buttons || '#3B82F6';
  const buttonText = getContrastText(buttonColor);
  const textColor = colors.text || '#1A1A1A';
  const borderColor = colors.borders || '#E5E7EB';

  // Fetch databases on mount
  const fetchDatabases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/integrations/notion/databases');
      if (!res.ok) {
        setError('Failed to load Notion databases');
        setLoading(false);
        return;
      }
      const json = await res.json();
      const payload = json.data;
      setConnected(payload.connected !== false);
      setDatabases(payload.databases || []);
    } catch {
      setError('Network error loading databases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setStep(0);
      setSelectedDb(null);
      setMappings([]);
      setNotionRows([]);
      setImportProgress(0);
      setImportTotal(0);
      setImportDone(false);
      setImportErrors(0);
      setError(null);
      fetchDatabases();
    }
  }, [isOpen, fetchDatabases]);

  // Step 1 -> 2: select a database and build column mapping
  function handleSelectDatabase(db: NotionDatabase) {
    setSelectedDb(db);
    const notionProps = Object.keys(db.properties);
    setMappings(autoMap(notionProps, entityFields));
    setStep(1);
  }

  // Step 2: update a mapping
  function handleMappingChange(index: number, entityField: string) {
    setMappings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], entityField };
      return next;
    });
  }

  // Step 2 -> 3: fetch rows for preview
  async function handleFetchPreview() {
    if (!selectedDb) return;
    setRowsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/integrations/notion/databases/${selectedDb.id}`
      );
      if (!res.ok) {
        setError('Failed to fetch database rows');
        setRowsLoading(false);
        return;
      }
      const json = await res.json();
      setNotionRows(json.data.rows || []);
      setStep(2);
    } catch {
      setError('Network error fetching rows');
    } finally {
      setRowsLoading(false);
    }
  }

  // Build mapped rows from Notion data
  function getMappedRows(rows: NotionRow[]): Record<string, string | number | boolean | null>[] {
    const activeMappings = mappings.filter((m) => m.entityField !== 'skip');
    return rows.map((row) => {
      const mapped: Record<string, string | number | boolean | null> = {};
      for (const m of activeMappings) {
        mapped[m.entityField] = row[m.notionProperty] ?? null;
      }
      return mapped;
    });
  }

  // Step 3 -> 4: run the import
  async function handleImport() {
    setStep(3);
    const mappedRows = getMappedRows(notionRows);
    setImportTotal(mappedRows.length);
    setImportProgress(0);
    setImportDone(false);
    setImportErrors(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < mappedRows.length; i++) {
      try {
        const res = await fetch(`/api/data/${entityType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedRows[i]),
        });
        if (res.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
      setImportProgress(i + 1);
      setImportErrors(errorCount);
    }

    setImportDone(true);
    onImportComplete(successCount);
  }

  // --- Render helpers ---

  function renderStep0() {
    if (loading) {
      return (
        <div className="flex flex-col items-center py-8 gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${buttonColor} transparent ${buttonColor} ${buttonColor}` }}
          />
          <p className="text-sm" style={{ color: textColor, opacity: 0.6 }}>
            Loading your Notion databases...
          </p>
        </div>
      );
    }

    if (!connected) {
      return (
        <div className="flex flex-col items-center py-8 gap-4">
          <svg
            className="w-12 h-12"
            style={{ color: textColor, opacity: 0.3 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"
            />
          </svg>
          <p className="text-sm text-center" style={{ color: textColor, opacity: 0.7 }}>
            Connect your Notion account to import data from your databases.
          </p>
          <a
            href="/api/integrations/notion/connect"
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            Connect Notion
          </a>
        </div>
      );
    }

    if (databases.length === 0) {
      return (
        <div className="flex flex-col items-center py-8 gap-3">
          <p className="text-sm" style={{ color: textColor, opacity: 0.6 }}>
            No databases found. Make sure you shared at least one database with the
            Notion integration.
          </p>
          <button
            onClick={fetchDatabases}
            className="text-sm font-medium underline"
            style={{ color: buttonColor }}
          >
            Refresh
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-xs mb-3" style={{ color: textColor, opacity: 0.6 }}>
          Select a Notion database to import from:
        </p>
        {databases.map((db) => (
          <button
            key={db.id}
            onClick={() => handleSelectDatabase(db)}
            className="w-full text-left p-4 rounded-xl border transition-colors hover:shadow-sm"
            style={{
              borderColor,
              backgroundColor: colors.cards || '#FFFFFF',
            }}
          >
            <p className="text-sm font-medium" style={{ color: textColor }}>
              {db.title}
            </p>
            <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.5 }}>
              {Object.keys(db.properties).length} properties
            </p>
          </button>
        ))}
      </div>
    );
  }

  function renderStep1() {
    const activeMappingCount = mappings.filter(
      (m) => m.entityField !== 'skip'
    ).length;

    return (
      <div>
        <p className="text-xs mb-4" style={{ color: textColor, opacity: 0.6 }}>
          Map Notion columns to {entityType} fields. Unmapped columns will be skipped.
        </p>
        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          {mappings.map((mapping, idx) => (
            <div
              key={mapping.notionProperty}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor }}
            >
              {/* Notion property name */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: textColor }}
                >
                  {mapping.notionProperty}
                </p>
                <p
                  className="text-xs"
                  style={{ color: textColor, opacity: 0.4 }}
                >
                  {selectedDb?.properties[mapping.notionProperty] || 'unknown'}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 shrink-0"
                style={{ color: textColor, opacity: 0.3 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>

              {/* Entity field dropdown */}
              <select
                value={mapping.entityField}
                onChange={(e) => handleMappingChange(idx, e.target.value)}
                className="flex-1 min-w-0 text-sm rounded-lg border px-2 py-1.5 bg-transparent"
                style={{ borderColor, color: textColor }}
              >
                <option value="skip">-- Skip --</option>
                {entityFields.map((field) => (
                  <option key={field} value={field}>
                    {field.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor }}>
          <button
            onClick={() => setStep(0)}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ color: textColor, opacity: 0.7 }}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
              {activeMappingCount} field{activeMappingCount !== 1 ? 's' : ''} mapped
            </span>
            <button
              onClick={handleFetchPreview}
              disabled={activeMappingCount === 0 || rowsLoading}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: buttonColor, color: buttonText }}
            >
              {rowsLoading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    const activeMappings = mappings.filter((m) => m.entityField !== 'skip');
    const previewRows = getMappedRows(notionRows.slice(0, 5));

    return (
      <div>
        <p className="text-xs mb-3" style={{ color: textColor, opacity: 0.6 }}>
          Preview of first {Math.min(5, previewRows.length)} rows ({notionRows.length} total):
        </p>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderColor }}>
                {activeMappings.map((m) => (
                  <th
                    key={m.entityField}
                    className="text-left px-3 py-2 border-b font-medium text-xs"
                    style={{ borderColor, color: textColor, opacity: 0.7 }}
                  >
                    {m.entityField.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="border-b last:border-b-0" style={{ borderColor }}>
                  {activeMappings.map((m) => (
                    <td
                      key={m.entityField}
                      className="px-3 py-2 text-xs truncate max-w-[180px]"
                      style={{ color: textColor }}
                    >
                      {row[m.entityField] !== null && row[m.entityField] !== undefined
                        ? String(row[m.entityField])
                        : '--'}
                    </td>
                  ))}
                </tr>
              ))}
              {previewRows.length === 0 && (
                <tr>
                  <td
                    colSpan={activeMappings.length}
                    className="px-3 py-6 text-center text-xs"
                    style={{ color: textColor, opacity: 0.5 }}
                  >
                    No rows found in this database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor }}>
          <button
            onClick={() => setStep(1)}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ color: textColor, opacity: 0.7 }}
          >
            Back
          </button>
          <button
            onClick={handleImport}
            disabled={notionRows.length === 0}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            Import {notionRows.length} row{notionRows.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    );
  }

  function renderStep3() {
    const percent =
      importTotal > 0 ? Math.round((importProgress / importTotal) * 100) : 0;

    if (importDone) {
      const successCount = importProgress - importErrors;
      return (
        <div className="flex flex-col items-center py-8 gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${buttonColor}15` }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: buttonColor }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: textColor }}>
              Import Complete
            </p>
            <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.6 }}>
              {successCount} row{successCount !== 1 ? 's' : ''} imported successfully
              {importErrors > 0 && (
                <span className="text-red-500">
                  {' '}({importErrors} failed)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            Done
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-8 gap-4">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: `${buttonColor} transparent ${buttonColor} ${buttonColor}`,
          }}
        />
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: textColor }}>
            Importing... {importProgress} / {importTotal}
          </p>
          {importErrors > 0 && (
            <p className="text-xs mt-1 text-red-500">
              {importErrors} error{importErrors !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: `${buttonColor}20` }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percent}%`,
              backgroundColor: buttonColor,
            }}
          />
        </div>
      </div>
    );
  }

  // --- Render ---

  const stepTitles = [
    'Select Database',
    'Map Columns',
    'Preview Data',
    'Import',
  ];

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import from Notion — ${stepTitles[step]}`}
      subtitle={`Importing into ${entityType.replace(/_/g, ' ')}`}
      maxWidth="max-w-xl"
      configColors={colors}
    >
      <StepDots current={step} total={4} buttonColor={buttonColor} />

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </CenterModal>
  );
}
