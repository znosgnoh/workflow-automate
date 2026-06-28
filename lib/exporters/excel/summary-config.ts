import type { CanonicalProduct } from "@/lib/validations/product";

export type SummaryGroupByField = "category" | "manufacturer";

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
  chartTitle: "Products by Category",
};

export type SummaryRow = {
  groupLabel: string;
  productCount: number;
  sumValue: number;
};

function resolveGroupLabel(
  product: CanonicalProduct,
  groupBy: SummaryGroupByField,
): string {
  const value = product[groupBy];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  return "(Uncategorized)";
}

function resolveSumValue(
  product: CanonicalProduct,
  sumField: SummarySumField,
): number {
  const value = product[sumField];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function aggregateProductsForSummary(
  products: CanonicalProduct[],
  config: CostcoSummaryConfig = DEFAULT_COSTCO_SUMMARY_CONFIG,
): SummaryRow[] {
  const buckets = new Map<string, SummaryRow>();

  for (const product of products) {
    const groupLabel = resolveGroupLabel(product, config.groupBy);
    const existing = buckets.get(groupLabel);

    if (existing) {
      existing.productCount += 1;
      existing.sumValue += resolveSumValue(product, config.sumField);
      continue;
    }

    buckets.set(groupLabel, {
      groupLabel,
      productCount: 1,
      sumValue: resolveSumValue(product, config.sumField),
    });
  }

  return [...buckets.values()].sort((left, right) => {
    if (right.productCount !== left.productCount) {
      return right.productCount - left.productCount;
    }
    return left.groupLabel.localeCompare(right.groupLabel);
  });
}
