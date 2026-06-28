import type { CostcoRawProduct } from "@/lib/adapters/costco/types";
import {
  canonicalProductSchema,
  type CanonicalProduct,
} from "@/lib/validations/product";

export type FieldMapResult = {
  products: CanonicalProduct[];
  skippedCount: number;
  warnings: string[];
};

export function mapCostcoProducts(
  rawProducts: CostcoRawProduct[],
): FieldMapResult {
  const products: CanonicalProduct[] = [];
  const warnings: string[] = [];
  let skippedCount = 0;

  for (const raw of rawProducts) {
    const candidate = {
      productName: raw.title,
      originalPrice: raw.originalPrice,
      promotionalPrice: raw.promotionalPrice,
      manufacturer: raw.manufacturer,
      expiryDate: raw.expiryDate,
      sku: raw.sku,
      category: raw.category,
      link: raw.productUrl,
    };

    const parsed = canonicalProductSchema.safeParse(candidate);

    if (!parsed.success) {
      skippedCount += 1;
      warnings.push(
        `Skipped item ${raw.itemId}: ${parsed.error.issues[0]?.message ?? "invalid product"}`,
      );
      continue;
    }

    if (raw.promotionText) {
      warnings.push(
        `Promotion on ${raw.sku ?? raw.itemId}: ${raw.promotionText}`,
      );
    }

    products.push(parsed.data);
  }

  return { products, skippedCount, warnings };
}
