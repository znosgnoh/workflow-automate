export type PivotGroupByField = "category" | "manufacturer";

export type PivotChartMetric =
  | "productCount"
  | "totalPromotionalPrice"
  | "totalOriginalPrice"
  | "avgPromotionalPrice"
  | "avgOriginalPrice";

export type ProductPivotInput = {
  originalPrice: number | null;
  promotionalPrice: number | null;
  manufacturer: string | null;
  category: string | null;
};

export type ProductPivotRow = {
  groupLabel: string;
  productCount: number;
  totalOriginalPrice: number;
  totalPromotionalPrice: number;
  avgOriginalPrice: number | null;
  avgPromotionalPrice: number | null;
  pricedOriginalCount: number;
  pricedPromotionalCount: number;
};

export const PIVOT_GROUP_BY_OPTIONS: Array<{
  value: PivotGroupByField;
  label: string;
}> = [
  { value: "category", label: "Category" },
  { value: "manufacturer", label: "Manufacturer" },
];

export const PIVOT_CHART_METRIC_OPTIONS: Array<{
  value: PivotChartMetric;
  label: string;
}> = [
  { value: "productCount", label: "Product count" },
  { value: "totalPromotionalPrice", label: "Total promo price" },
  { value: "totalOriginalPrice", label: "Total original price" },
  { value: "avgPromotionalPrice", label: "Avg promo price" },
  { value: "avgOriginalPrice", label: "Avg original price" },
];

const UNCATEGORIZED_LABEL = "(Uncategorized)";
const UNKNOWN_MANUFACTURER_LABEL = "(Unknown manufacturer)";

function resolveGroupLabel(
  product: ProductPivotInput,
  groupBy: PivotGroupByField,
): string {
  const value = product[groupBy];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  return groupBy === "category"
    ? UNCATEGORIZED_LABEL
    : UNKNOWN_MANUFACTURER_LABEL;
}

function resolvePrice(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildProductPivot(
  products: ProductPivotInput[],
  groupBy: PivotGroupByField,
): ProductPivotRow[] {
  const buckets = new Map<
    string,
    {
      productCount: number;
      totalOriginalPrice: number;
      totalPromotionalPrice: number;
      pricedOriginalCount: number;
      pricedPromotionalCount: number;
    }
  >();

  for (const product of products) {
    const groupLabel = resolveGroupLabel(product, groupBy);
    const existing = buckets.get(groupLabel) ?? {
      productCount: 0,
      totalOriginalPrice: 0,
      totalPromotionalPrice: 0,
      pricedOriginalCount: 0,
      pricedPromotionalCount: 0,
    };

    existing.productCount += 1;

    const originalPrice = resolvePrice(product.originalPrice);
    if (originalPrice !== null) {
      existing.totalOriginalPrice += originalPrice;
      existing.pricedOriginalCount += 1;
    }

    const promotionalPrice = resolvePrice(product.promotionalPrice);
    if (promotionalPrice !== null) {
      existing.totalPromotionalPrice += promotionalPrice;
      existing.pricedPromotionalCount += 1;
    }

    buckets.set(groupLabel, existing);
  }

  return [...buckets.entries()]
    .map(([groupLabel, bucket]) => ({
      groupLabel,
      productCount: bucket.productCount,
      totalOriginalPrice: bucket.totalOriginalPrice,
      totalPromotionalPrice: bucket.totalPromotionalPrice,
      pricedOriginalCount: bucket.pricedOriginalCount,
      pricedPromotionalCount: bucket.pricedPromotionalCount,
      avgOriginalPrice:
        bucket.pricedOriginalCount > 0
          ? bucket.totalOriginalPrice / bucket.pricedOriginalCount
          : null,
      avgPromotionalPrice:
        bucket.pricedPromotionalCount > 0
          ? bucket.totalPromotionalPrice / bucket.pricedPromotionalCount
          : null,
    }))
    .sort((left, right) => {
      if (right.productCount !== left.productCount) {
        return right.productCount - left.productCount;
      }
      return left.groupLabel.localeCompare(right.groupLabel);
    });
}

export function getPivotChartValue(
  row: ProductPivotRow,
  metric: PivotChartMetric,
): number {
  const value = row[metric];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function getPivotGroupHeader(groupBy: PivotGroupByField): string {
  return groupBy === "category" ? "Category" : "Manufacturer";
}

export function getPivotChartTitle(
  groupBy: PivotGroupByField,
  metric: PivotChartMetric,
): string {
  const groupLabel = getPivotGroupHeader(groupBy);
  const metricLabel =
    PIVOT_CHART_METRIC_OPTIONS.find((option) => option.value === metric)
      ?.label ?? metric;

  return `${metricLabel} by ${groupLabel}`;
}
