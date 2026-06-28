/** Column letters on the Data worksheet used by summary/pivot formulas. */
export const DATA_SHEET_NAME = "Data";

export const DATA_SHEET_COLUMNS = {
  productName: "A",
  link: "B",
  originalPrice: "C",
  promotionalPrice: "D",
  manufacturer: "E",
  expiryDate: "F",
  sku: "G",
  category: "H",
} as const;

export function getDataSheetLastRow(productCount: number): number {
  return Math.max(2, productCount + 1);
}

export function getDataColumnRange(
  column: keyof typeof DATA_SHEET_COLUMNS,
  productCount: number,
): string {
  const lastRow = getDataSheetLastRow(productCount);
  const col = DATA_SHEET_COLUMNS[column];
  return `${DATA_SHEET_NAME}!$${col}$2:$${col}$${lastRow}`;
}

export function getGroupColumnLetter(
  groupBy: "category" | "manufacturer",
): string {
  return groupBy === "category"
    ? DATA_SHEET_COLUMNS.category
    : DATA_SHEET_COLUMNS.manufacturer;
}

export function getGroupCriteriaRange(
  groupBy: "category" | "manufacturer",
  productCount: number,
): string {
  const column = getGroupColumnLetter(groupBy);
  const lastRow = getDataSheetLastRow(productCount);
  return `${DATA_SHEET_NAME}!$${column}$2:$${column}$${lastRow}`;
}
