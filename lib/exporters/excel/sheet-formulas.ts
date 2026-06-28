import {
  getDataColumnRange,
  getGroupCriteriaRange,
} from "@/lib/exporters/excel/data-sheet-columns";

export function countIfGroupFormula(
  groupBy: "category" | "manufacturer",
  groupCell: string,
  productCount: number,
): string {
  const criteriaRange = getGroupCriteriaRange(groupBy, productCount);
  return `COUNTIF(${criteriaRange},${groupCell})`;
}

export function sumIfGroupFormula(
  groupBy: "category" | "manufacturer",
  groupCell: string,
  valueColumn: "originalPrice" | "promotionalPrice",
  productCount: number,
): string {
  const criteriaRange = getGroupCriteriaRange(groupBy, productCount);
  const sumRange = getDataColumnRange(valueColumn, productCount);
  return `SUMIF(${criteriaRange},${groupCell},${sumRange})`;
}

export function averageIfGroupFormula(
  groupBy: "category" | "manufacturer",
  groupCell: string,
  valueColumn: "originalPrice" | "promotionalPrice",
  productCount: number,
): string {
  const criteriaRange = getGroupCriteriaRange(groupBy, productCount);
  const averageRange = getDataColumnRange(valueColumn, productCount);
  return `IFERROR(AVERAGEIF(${criteriaRange},${groupCell},${averageRange}),"")`;
}

export function sumColumnFormula(
  column: "originalPrice" | "promotionalPrice",
  productCount: number,
): string {
  return `SUM(${getDataColumnRange(column, productCount)})`;
}

export function averageColumnFormula(
  column: "originalPrice" | "promotionalPrice",
  productCount: number,
): string {
  return `IFERROR(AVERAGE(${getDataColumnRange(column, productCount)}),"")`;
}

export function countProductsFormula(productCount: number): string {
  return `COUNTA(${getDataColumnRange("productName", productCount)})`;
}
