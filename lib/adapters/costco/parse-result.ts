import type {
  CostcoRawProduct,
  CostcoSearchResultItem,
} from "@/lib/adapters/costco/types";

function firstNumber(values: Array<string | number> | undefined): number | null {
  if (!values?.length) return null;
  const value = values[0];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstString(values: Array<string | number> | undefined): string | null {
  if (!values?.length) return null;
  return String(values[0]);
}

function rollupKey(
  rollup: Record<string, Array<string | number>> | undefined,
  key: string,
) {
  return rollup?.[key];
}

function warehousePriceKey(warehouseId: string, field: string) {
  return `inventory(${warehouseId}, ${field})`;
}

export function parseCostcoSearchResult(
  item: CostcoSearchResultItem,
  warehouseId: string,
): CostcoRawProduct {
  const product = item.product ?? {};
  const rollup = item.variantRollupValues ?? {};
  const categoryNames = product.attributes?.category_names?.text ?? [];
  const warehousePrice = rollupKey(
    rollup,
    warehousePriceKey(warehouseId, "price"),
  );
  const warehouseOriginal = rollupKey(
    rollup,
    warehousePriceKey(warehouseId, "originalPrice"),
  );
  const onlinePromoText = rollupKey(
    rollup,
    "inventory(847, attributes.promotion_short_text)",
  );

  const originalPrice =
    firstNumber(warehouseOriginal) ??
    firstNumber(rollupKey(rollup, "originalPrice")) ??
    firstNumber(rollupKey(rollup, "price"));

  const promotionalPrice =
    firstNumber(warehousePrice) ??
    firstNumber(rollupKey(rollup, "price")) ??
    originalPrice;

  const sku =
    firstString(rollupKey(rollup, "variantId")) ??
    product.variants?.[0]?.id ??
    item.id;

  return {
    itemId: item.id,
    title: product.title ?? "Unknown product",
    manufacturer: product.brands?.[0] ?? null,
    category: categoryNames.at(-1) ?? product.categories?.[0] ?? null,
    sku,
    originalPrice,
    promotionalPrice,
    expiryDate: null,
    promotionText: firstString(onlinePromoText),
    productUrl: product.uri ?? null,
    warehouseAvailability: firstString(
      rollupKey(rollup, warehousePriceKey(warehouseId, "attributes.availability")),
    ),
  };
}
