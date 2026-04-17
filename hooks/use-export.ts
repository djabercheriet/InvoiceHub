import { useCallback } from 'react';

export function useExport() {
  
  const exportToCsv = useCallback((data: any[], filename: string) => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Convert rows
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] ?? '';
          // Escape quotes and wrap in quotes if there's a comma or newline
          const escaped = String(value).replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportToPdf = useCallback(() => {
    // Basic native print triggering. 
    // This expects proper @media print CSS rules in the caller's page layout.
    window.print();
  }, []);

  return {
    exportToCsv,
    exportToPdf
  };
}
