import type { CanonicalProduct } from "@/lib/validations/product";

export type StoredProduct = {
  productName: string;
  originalPrice: number | null;
  promotionalPrice: number | null;
  manufacturer: string | null;
  expiryDate: string | null;
  sku: string | null;
  category: string | null;
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
  }));
}

export function parseStoredProducts(value: unknown): StoredProduct[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is StoredProduct =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as StoredProduct).productName === "string",
  );
}
