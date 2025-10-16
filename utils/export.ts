const escapeCsvCell = (cell: any): string => {
    const cellString = String(cell ?? '');
    if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
        // Enclose in double quotes and escape existing double quotes
        return `"${cellString.replace(/"/g, '""')}"`;
    }
    return cellString;
};

export const exportToCsv = (filename: string, data: any[]): void => {
    if (!data || data.length === 0) {
        console.error("No data provided to export.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => escapeCsvCell(row[header])).join(',')
        )
    ];

    const csvString = csvRows.join('\n');
    // Prepend a BOM to ensure Excel opens with UTF-8 encoding for Thai characters
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};