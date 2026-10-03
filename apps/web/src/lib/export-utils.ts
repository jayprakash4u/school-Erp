/**
 * Utilities for exporting ERP data to CSV and handling document printing
 */

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string = "erp-export.csv",
  columnLabels?: Partial<Record<keyof T, string>>
): void {
  if (!data || !data.length) {
    console.warn("No data available to export");
    return;
  }

  const keys = Object.keys(data[0]) as (keyof T)[];
  const headerRow = keys
    .map((key) => {
      const label = columnLabels?.[key] || String(key);
      return `"${label.replace(/"/g, '""')}"`;
    })
    .join(",");

  const rows = data.map((row) =>
    keys
      .map((key) => {
        const val = row[key];
        if (val === null || val === undefined) return '""';
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headerRow, ...rows].join("\r\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Triggers standard browser print dialog for an element or whole page
 */
export function printElement(elementId?: string): void {
  if (typeof window === "undefined") return;

  if (!elementId) {
    window.print();
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Print element with id #${elementId} not found`);
    return;
  }

  window.print();
}
