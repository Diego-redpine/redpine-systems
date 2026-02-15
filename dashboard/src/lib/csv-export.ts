import Papa from 'papaparse';

function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return String(value);
}

/**
 * Export data as a CSV file download.
 * Uses papaparse to generate the CSV string.
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  columns: string[],
  filename: string
) {
  // Format column headers nicely
  const headers = columns.map((col) =>
    col
      .replace(/_/g, ' ')
      .replace(/\bid\b/gi, 'ID')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );

  // Format data rows
  const rows = data.map((record) => {
    const row: Record<string, string> = {};
    columns.forEach((col, i) => {
      row[headers[i]] = formatCSVValue(record[col]);
    });
    return row;
  });

  const csv = Papa.unparse(rows, { columns: headers });

  // Trigger browser download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
