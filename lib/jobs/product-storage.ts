import type { CanonicalProduct } from "@/lib/validations/product";

export type StoredProduct = {
  productName: string;
  originalPrice: number | null;
  promotionalPrice: number | null;
  manufacturer: string | null;
  expiryDate: string | null;
  sku: string | null;
  category: string | null;
  link: string | null;
};

export function serializeProductsForStorage(
  products: CanonicalProduct[],
): StoredProduct[] {
  return products.map((product) => ({
    productName: product.productName,
    originalPrice: product.originalPrice,
    promotionalPrice: product.promotionalPrice,
    manufacturer: product.manufacturer,
    expiryDate: product.expiryDate?.toISOString() ?? null,
    sku: product.sku,
    category: product.category,
    link: product.link,
  }));
}

export function parseStoredProducts(value: unknown): StoredProduct[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .filter((item) => typeof item.productName === "string")
    .map((item) => ({
      productName: item.productName as string,
      originalPrice:
        typeof item.originalPrice === "number" ? item.originalPrice : null,
      promotionalPrice:
        typeof item.promotionalPrice === "number"
          ? item.promotionalPrice
          : null,
      manufacturer:
        typeof item.manufacturer === "string" ? item.manufacturer : null,
      expiryDate: typeof item.expiryDate === "string" ? item.expiryDate : null,
      sku: typeof item.sku === "string" ? item.sku : null,
      category: typeof item.category === "string" ? item.category : null,
      link: typeof item.link === "string" ? item.link : null,
    }));
}
