export type CSVHeader = { label: string; key: string };

export const generateCSV = (data: any[], headers: CSVHeader[]): string => {
  // Create CSV header row
  const headerRow = headers.map((h) => escapeCsvValue(h.label)).join(",");

  // Create CSV data rows
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header.key as string];
        return escapeCsvValue(val);
      })
      .join(",")
  );

  // Combine headers and rows
  // Add BOM for Excel UTF-8 compatibility
  return "\uFEFF" + [headerRow, ...dataRows].join("\n");
};

const escapeCsvValue = (val: any): string => {
  if (val === null || val === undefined) {
    return "";
  }
  const str = String(val);
  // If the string contains quotes, commas, or newlines, escape it
  if (str.includes("\"") || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
};
