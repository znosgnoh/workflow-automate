import type { CanonicalProduct } from "@/lib/validations/product";

export type PptSortField = "productName" | "manufacturer" | "category";

export type CostcoPptConfig = {
  slideFileName: string;
  placeholderMarker: string;
  maxRows: number;
  sortBy: PptSortField;
  sortOrder: "asc" | "desc";
};

export const DEFAULT_COSTCO_PPT_CONFIG: CostcoPptConfig = {
  slideFileName: "ppt/slides/slide1.xml",
  placeholderMarker: "{{DATA_ROW}}",
  maxRows: 25,
  sortBy: "productName",
  sortOrder: "asc",
};

export function selectProductsForPptSlide(
  products: CanonicalProduct[],
  config: CostcoPptConfig = DEFAULT_COSTCO_PPT_CONFIG,
): CanonicalProduct[] {
  const sorted = [...products].sort((left, right) => {
    const leftValue = (left[config.sortBy] ?? "").toString().toLowerCase();
    const rightValue = (right[config.sortBy] ?? "").toString().toLowerCase();
    const comparison = leftValue.localeCompare(rightValue);

    return config.sortOrder === "asc" ? comparison : comparison * -1;
  });

  return sorted.slice(0, config.maxRows);
}

export function formatPptCurrency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatPptDate(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

export function productToPptRowValues(product: CanonicalProduct): string[] {
  return [
    product.productName,
    formatPptCurrency(product.originalPrice),
    formatPptCurrency(product.promotionalPrice),
    product.manufacturer ?? "—",
    formatPptDate(product.expiryDate),
  ];
}
