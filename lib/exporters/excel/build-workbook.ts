import ExcelJS from "exceljs";
import type { CanonicalProduct } from "@/lib/validations/product";
import { buildExcelFilename } from "@/lib/utils/filename";
import { DATA_SHEET_NAME } from "@/lib/exporters/excel/data-sheet-columns";
import { renderSummaryColumnChartPng } from "@/lib/exporters/excel/chart-image";
import {
  aggregateProductsForSummary,
  DEFAULT_COSTCO_SUMMARY_CONFIG,
  type CostcoSummaryConfig,
} from "@/lib/exporters/excel/summary-config";
import {
  addPivotSheet,
  DEFAULT_COSTCO_PIVOT_CONFIG,
  type CostcoPivotConfig,
} from "@/lib/exporters/excel/pivot-sheet";
import {
  countIfGroupFormula,
  sumIfGroupFormula,
} from "@/lib/exporters/excel/sheet-formulas";
import {
  buildProductPivot,
  getPivotGroupHeader,
} from "@/lib/pivot/product-pivot";

const SUMMARY_SHEET_NAME = "Summary";

const DATA_COLUMNS = [
  { header: "Product Name", key: "productName", width: 42 },
  { header: "Link", key: "link", width: 48 },
  { header: "Original Price", key: "originalPrice", width: 16 },
  { header: "Promotional Price", key: "promotionalPrice", width: 18 },
  { header: "Manufacturer", key: "manufacturer", width: 24 },
  { header: "Expiry Date", key: "expiryDate", width: 14 },
  { header: "SKU", key: "sku", width: 14 },
  { header: "Category", key: "category", width: 20 },
] as const;

const CURRENCY_NUM_FMT = '"$"#,##0.00';
const DATE_NUM_FMT = "mm/dd/yyyy";

export type BuildWorkbookOptions = {
  products: CanonicalProduct[];
  searchTerm: string;
  generatedAt?: Date;
  summaryConfig?: CostcoSummaryConfig;
  pivotConfig?: CostcoPivotConfig;
};

export type BuildWorkbookResult = {
  buffer: Buffer;
  filename: string;
  productCount: number;
};

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function normalizeDataLabel(value: string | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function addDataSheet(workbook: ExcelJS.Workbook, products: CanonicalProduct[]) {
  const sheet = workbook.addWorksheet(DATA_SHEET_NAME);
  sheet.columns = DATA_COLUMNS.map((column) => ({ ...column }));

  for (const product of products) {
    sheet.addRow({
      productName: product.productName,
      link: product.link ?? "",
      originalPrice: product.originalPrice ?? undefined,
      promotionalPrice: product.promotionalPrice ?? undefined,
      manufacturer: normalizeDataLabel(
        product.manufacturer,
        "(Unknown manufacturer)",
      ),
      expiryDate: product.expiryDate ?? undefined,
      sku: product.sku ?? "",
      category: normalizeDataLabel(product.category, "(Uncategorized)"),
    });
  }

  styleHeaderRow(sheet);

  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    row.getCell("originalPrice").numFmt = CURRENCY_NUM_FMT;
    row.getCell("promotionalPrice").numFmt = CURRENCY_NUM_FMT;

    const expiryCell = row.getCell("expiryDate");
    if (expiryCell.value instanceof Date) {
      expiryCell.numFmt = DATE_NUM_FMT;
    }
  }

  return sheet;
}

function addSummarySheet(
  workbook: ExcelJS.Workbook,
  products: CanonicalProduct[],
  summaryConfig: CostcoSummaryConfig,
) {
  const sheet = workbook.addWorksheet(SUMMARY_SHEET_NAME);
  const pivotRows = buildProductPivot(products, summaryConfig.groupBy);
  const summaryRows = aggregateProductsForSummary(products, summaryConfig);
  const groupHeader = getPivotGroupHeader(summaryConfig.groupBy);
  const productCount = products.length;
  const sumField =
    summaryConfig.sumField === "promotionalPrice"
      ? "promotionalPrice"
      : "originalPrice";

  if (pivotRows.length === 0) {
    sheet.addRow(["No data available for this search."]);
    sheet.getCell("A1").font = { italic: true };
    return sheet;
  }

  sheet.addRow([groupHeader, summaryConfig.countLabel, summaryConfig.sumLabel]);
  styleHeaderRow(sheet);

  for (const row of pivotRows) {
    const excelRowNumber = sheet.rowCount + 1;
    const groupCell = `$A$${excelRowNumber}`;
    sheet.addRow([row.groupLabel]);
    const excelRow = sheet.getRow(excelRowNumber);

    excelRow.getCell(2).value = {
      formula: countIfGroupFormula(summaryConfig.groupBy, groupCell, productCount),
    };
    excelRow.getCell(3).value = {
      formula: sumIfGroupFormula(
        summaryConfig.groupBy,
        groupCell,
        sumField,
        productCount,
      ),
    };
    excelRow.getCell(3).numFmt = CURRENCY_NUM_FMT;
  }

  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 16;
  sheet.getColumn(3).width = 24;

  const chartPng = renderSummaryColumnChartPng(summaryRows);
  if (!chartPng) {
    return sheet;
  }

  const imageId = workbook.addImage({
    base64: chartPng.toString("base64"),
    extension: "png",
  });

  sheet.addImage(imageId, {
    tl: { col: 4, row: 1 },
    ext: { width: 520, height: 300 },
  });

  sheet.getCell("E1").value = summaryConfig.chartTitle;
  sheet.getCell("E1").font = { bold: true };

  return sheet;
}

export async function buildCostcoProductReportWorkbook(
  options: BuildWorkbookOptions,
): Promise<BuildWorkbookResult> {
  const generatedAt = options.generatedAt ?? new Date();
  const summaryConfig = options.summaryConfig ?? DEFAULT_COSTCO_SUMMARY_CONFIG;
  const pivotConfig = options.pivotConfig ?? DEFAULT_COSTCO_PIVOT_CONFIG;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "workflow-automate";
  workbook.created = generatedAt;

  addDataSheet(workbook, options.products);
  addSummarySheet(workbook, options.products, summaryConfig);
  addPivotSheet(workbook, options.products, pivotConfig);

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    buffer,
    filename: buildExcelFilename(options.searchTerm, generatedAt),
    productCount: options.products.length,
  };
}
