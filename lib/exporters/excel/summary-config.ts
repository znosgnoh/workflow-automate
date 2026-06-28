import type { CanonicalProduct } from "@/lib/validations/product";
import {
  buildProductPivot,
  type PivotGroupByField,
} from "@/lib/pivot/product-pivot";

export type SummaryGroupByField = PivotGroupByField;

export type SummarySumField = "promotionalPrice" | "originalPrice";

export type CostcoSummaryConfig = {
  groupBy: SummaryGroupByField;
  countLabel: string;
  sumField: SummarySumField;
  sumLabel: string;
  chartTitle: string;
};

export const DEFAULT_COSTCO_SUMMARY_CONFIG: CostcoSummaryConfig = {
  groupBy: "category",
  countLabel: "Product Count",
  sumField: "promotionalPrice",
  sumLabel: "Total Promotional Price",
  chartTitle: "Total promotional price by category",
};

export type SummaryRow = {
  groupLabel: string;
  productCount: number;
  sumValue: number;
};

export function aggregateProductsForSummary(
  products: CanonicalProduct[],
  config: CostcoSummaryConfig = DEFAULT_COSTCO_SUMMARY_CONFIG,
): SummaryRow[] {
  return buildProductPivot(products, config.groupBy).map((row) => ({
    groupLabel: row.groupLabel,
    productCount: row.productCount,
    sumValue:
      config.sumField === "promotionalPrice"
        ? row.totalPromotionalPrice
        : row.totalOriginalPrice,
  }));
}
