'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';
import CustomSelect from '@/components/ui/CustomSelect';

interface CSVImportProps {
  entityType: string;
  targetColumns: string[];
  configColors: DashboardColors;
  onImportComplete: () => void;
  onClose: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing';

export default function CSVImport({
  entityType,
  targetColumns,
  configColors,
  onImportComplete,
  onClose,
}: CSVImportProps) {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, errors: 0 });

  const buttonBg = configColors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);
  const cardBg = configColors.cards || '#FFFFFF';
  const borderColor = configColors.borders || '#E5E7EB';
  const textColor = configColors.text || '#1A1A1A';
  const headingColor = configColors.headings || '#1A1A1A';

  // Parse CSV file
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const rows = result.data as string[][];
        if (rows.length < 2) {
          toast.error('CSV file must have at least a header row and one data row');
          return;
        }

        const headers = rows[0].map(h => h.trim()).filter(Boolean);
        const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim()));

        setCsvHeaders(headers);
        setCsvData(dataRows);

        // Auto-map columns by name similarity
        const autoMapping: Record<string, string> = {};
        headers.forEach(header => {
          const normalized = header.toLowerCase().replace(/[\s_-]+/g, '_');
          const match = targetColumns.find(col => {
            const colNorm = col.toLowerCase().replace(/[\s_-]+/g, '_');
            return colNorm === normalized || colNorm.includes(normalized) || normalized.includes(colNorm);
          });
          if (match) {
            autoMapping[header] = match;
          }
        });
        setColumnMapping(autoMapping);
        setStep('mapping');
      },
      error: () => {
        toast.error('Failed to parse CSV file');
      },
    });
  }, [targetColumns]);

  // Handle drag-and-drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Please drop a .csv file');
      return;
    }
    // Create a synthetic change event
    const input = document.createElement('input');
    input.type = 'file';
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    handleFileSelect({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
  }, [handleFileSelect]);

  // Update column mapping
  const handleMappingChange = (csvHeader: string, targetColumn: string) => {
    setColumnMapping(prev => {
      const next = { ...prev };
      if (targetColumn === '') {
        delete next[csvHeader];
      } else {
        next[csvHeader] = targetColumn;
      }
      return next;
    });
  };

  // Run the import
  const handleImport = async () => {
    const mappedColumns = Object.entries(columnMapping);
    if (mappedColumns.length === 0) {
      toast.error('Map at least one column before importing');
      return;
    }

    setStep('importing');
    const total = csvData.length;
    setImportProgress({ done: 0, total, errors: 0 });

    let done = 0;
    let errors = 0;
    const batchSize = 10;

    for (let i = 0; i < csvData.length; i += batchSize) {
      const batch = csvData.slice(i, i + batchSize);
      const records = batch.map(row => {
        const record: Record<string, unknown> = {};
        mappedColumns.forEach(([csvHeader, targetCol]) => {
          const csvIndex = csvHeaders.indexOf(csvHeader);
          if (csvIndex >= 0 && row[csvIndex] !== undefined) {
            const val = row[csvIndex].trim();
            // Basic type coercion
            if (val === '') {
              record[targetCol] = null;
            } else if (!isNaN(Number(val)) && targetCol.includes('cents') || targetCol.includes('amount') || targetCol.includes('price') || targetCol.includes('rate')) {
              record[targetCol] = Number(val);
            } else {
              record[targetCol] = val;
            }
          }
        });
        return record;
      });

      // Import each record
      const results = await Promise.allSettled(
        records.map(record =>
          fetch(`/api/data/${entityType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          }).then(res => {
            if (!res.ok) throw new Error('Failed');
            return res.json();
          })
        )
      );

      done += records.length;
      errors += results.filter(r => r.status === 'rejected').length;
      setImportProgress({ done, total, errors });
    }

    if (errors === 0) {
      toast.success(`Imported ${total} records successfully`);
    } else {
      toast.error(`Imported ${total - errors} records, ${errors} failed`);
    }

    onImportComplete();
  };

  // Preview data (mapped columns only)
  const mappedEntries = Object.entries(columnMapping);
  const previewRows = csvData.slice(0, 5);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] md:max-h-[80vh] z-50 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: cardBg }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor }}
        >
          <h2 className="text-lg font-semibold" style={{ color: headingColor }}>
            Import CSV &mdash; {entityType}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:opacity-70" style={{ color: textColor }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderColor }}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9CA3AF' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium mb-1" style={{ color: headingColor }}>
                Drop a CSV file here or click to browse
              </p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                First row should be column headers
              </p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: textColor }}>
                Found <strong>{csvData.length}</strong> rows and <strong>{csvHeaders.length}</strong> columns.
                Map CSV columns to {entityType} fields:
              </p>

              <div className="space-y-2">
                {csvHeaders.map(header => (
                  <div key={header} className="flex items-center gap-3">
                    <span className="text-sm w-40 truncate font-medium" style={{ color: headingColor }}>
                      {header}
                    </span>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9CA3AF' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <CustomSelect
                      value={columnMapping[header] || ''}
                      onChange={value => handleMappingChange(header, value)}
                      options={targetColumns.map(col => ({
                        value: col,
                        label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      }))}
                      placeholder="-- Skip --"
                      className="flex-1"
                      buttonColor={buttonBg}
                      style={{
                        borderColor,
                        backgroundColor: configColors.background || '#F9FAFB',
                        color: textColor,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Preview */}
              {mappedEntries.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2" style={{ color: headingColor }}>Preview (first 5 rows)</h4>
                  <div className="overflow-auto rounded-lg border" style={{ borderColor }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: configColors.background || '#F9FAFB' }}>
                          {mappedEntries.map(([, target]) => (
                            <th key={target} className="px-3 py-2 text-left font-medium" style={{ color: '#6B7280' }}>
                              {target.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="border-t" style={{ borderColor }}>
                            {mappedEntries.map(([csvHeader, target]) => {
                              const idx = csvHeaders.indexOf(csvHeader);
                              return (
                                <td key={target} className="px-3 py-2" style={{ color: textColor }}>
                                  {idx >= 0 ? row[idx] || '-' : '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'importing' && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: borderColor }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${importProgress.total > 0 ? (importProgress.done / importProgress.total) * 100 : 0}%`,
                      backgroundColor: buttonBg,
                    }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: headingColor }}>
                Importing... {importProgress.done} / {importProgress.total}
              </p>
              {importProgress.errors > 0 && (
                <p className="text-xs text-red-500 mt-1">{importProgress.errors} errors</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
          >
            Cancel
          </button>
          {step === 'mapping' && (
            <button
              onClick={handleImport}
              disabled={mappedEntries.length === 0}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: buttonBg, color: buttonText }}
            >
              Import {csvData.length} Records
            </button>
          )}
        </div>
      </div>
    </>
  );
}
