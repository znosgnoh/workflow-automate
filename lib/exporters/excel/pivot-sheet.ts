import type ExcelJS from "exceljs";
import type { CanonicalProduct } from "@/lib/validations/product";
import { renderPivotColumnChartPng } from "@/lib/exporters/excel/chart-image";
import {
  averageColumnFormula,
  averageIfGroupFormula,
  countIfGroupFormula,
  countProductsFormula,
  sumColumnFormula,
  sumIfGroupFormula,
} from "@/lib/exporters/excel/sheet-formulas";
import {
  buildProductPivot,
  getPivotChartTitle,
  getPivotGroupHeader,
  type PivotChartMetric,
  type PivotGroupByField,
} from "@/lib/pivot/product-pivot";

const PIVOT_SHEET_NAME = "Pivot";
const CURRENCY_NUM_FMT = '"$"#,##0.00';

export type CostcoPivotConfig = {
  groupBy: PivotGroupByField;
  chartMetric: PivotChartMetric;
};

export const DEFAULT_COSTCO_PIVOT_CONFIG: CostcoPivotConfig = {
  groupBy: "category",
  chartMetric: "productCount",
};

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function applyCurrencyFormat(
  row: ExcelJS.Row,
  columnIndexes: number[],
) {
  for (const columnIndex of columnIndexes) {
    row.getCell(columnIndex).numFmt = CURRENCY_NUM_FMT;
  }
}

export function addPivotSheet(
  workbook: ExcelJS.Workbook,
  products: CanonicalProduct[],
  config: CostcoPivotConfig = DEFAULT_COSTCO_PIVOT_CONFIG,
) {
  const sheet = workbook.addWorksheet(PIVOT_SHEET_NAME);
  const pivotRows = buildProductPivot(products, config.groupBy);
  const groupHeader = getPivotGroupHeader(config.groupBy);
  const productCount = products.length;

  if (pivotRows.length === 0) {
    sheet.addRow(["No data available for this search."]);
    sheet.getCell("A1").font = { italic: true };
    return sheet;
  }

  sheet.addRow([
    groupHeader,
    "Product Count",
    "Total Original Price",
    "Total Promo Price",
    "Avg Original Price",
    "Avg Promo Price",
  ]);
  styleHeaderRow(sheet);

  for (const row of pivotRows) {
    const excelRowNumber = sheet.rowCount + 1;
    const groupCell = `$A$${excelRowNumber}`;
    sheet.addRow([row.groupLabel]);
    const excelRow = sheet.getRow(excelRowNumber);

    excelRow.getCell(2).value = {
      formula: countIfGroupFormula(config.groupBy, groupCell, productCount),
    };
    excelRow.getCell(3).value = {
      formula: sumIfGroupFormula(
        config.groupBy,
        groupCell,
        "originalPrice",
        productCount,
      ),
    };
    excelRow.getCell(4).value = {
      formula: sumIfGroupFormula(
        config.groupBy,
        groupCell,
        "promotionalPrice",
        productCount,
      ),
    };
    excelRow.getCell(5).value = {
      formula: averageIfGroupFormula(
        config.groupBy,
        groupCell,
        "originalPrice",
        productCount,
      ),
    };
    excelRow.getCell(6).value = {
      formula: averageIfGroupFormula(
        config.groupBy,
        groupCell,
        "promotionalPrice",
        productCount,
      ),
    };

    applyCurrencyFormat(excelRow, [3, 4, 5, 6]);
  }

  const totalRowNumber = sheet.rowCount + 1;
  sheet.addRow(["Grand Total"]);
  const totalRow = sheet.getRow(totalRowNumber);
  totalRow.font = { bold: true };

  totalRow.getCell(2).value = {
    formula: countProductsFormula(productCount),
  };
  totalRow.getCell(3).value = {
    formula: sumColumnFormula("originalPrice", productCount),
  };
  totalRow.getCell(4).value = {
    formula: sumColumnFormula("promotionalPrice", productCount),
  };
  totalRow.getCell(5).value = {
    formula: averageColumnFormula("originalPrice", productCount),
  };
  totalRow.getCell(6).value = {
    formula: averageColumnFormula("promotionalPrice", productCount),
  };
  applyCurrencyFormat(totalRow, [3, 4, 5, 6]);

  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 14;
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 18;
  sheet.getColumn(5).width = 18;
  sheet.getColumn(6).width = 16;

  const chartPng = renderPivotColumnChartPng(pivotRows, config.chartMetric);
  if (!chartPng) {
    return sheet;
  }

  const imageId = workbook.addImage({
    base64: chartPng.toString("base64"),
    extension: "png",
  });

  sheet.addImage(imageId, {
    tl: { col: 7, row: 1 },
    ext: { width: 560, height: 320 },
  });

  sheet.getCell("H1").value = getPivotChartTitle(
    config.groupBy,
    config.chartMetric,
  );
  sheet.getCell("H1").font = { bold: true };

  sheet.getCell("A1").note =
    "Pivot values are Excel formulas linked to the Data sheet. Recalculate if you edit source rows.";

  return sheet;
}
