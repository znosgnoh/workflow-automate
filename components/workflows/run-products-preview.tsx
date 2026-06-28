import type { StoredProduct } from "@/lib/jobs/product-storage";

function formatPrice(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

type RunProductsPreviewProps = {
  products: StoredProduct[];
};

export function RunProductsPreview({ products }: RunProductsPreviewProps) {
  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
        No products matched this search.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">
          Product preview ({products.length})
        </h3>
        <p className="text-xs text-muted">Mapped from Costco search API</p>
      </div>
      <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="sticky top-0 bg-card">
            <tr>
              <th className="px-3 py-2 font-medium text-muted">Product</th>
              <th className="px-3 py-2 font-medium text-muted">Original</th>
              <th className="px-3 py-2 font-medium text-muted">Promo</th>
              <th className="hidden px-3 py-2 font-medium text-muted sm:table-cell">
                Manufacturer
              </th>
              <th className="hidden px-3 py-2 font-medium text-muted md:table-cell">
                Category
              </th>
              <th className="hidden px-3 py-2 font-medium text-muted lg:table-cell">
                SKU
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={`${product.sku ?? "na"}-${product.productName}`}>
                <td className="max-w-xs px-3 py-2 align-top font-medium">
                  {product.productName}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top text-muted">
                  {formatPrice(product.originalPrice)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top">
                  {formatPrice(product.promotionalPrice)}
                </td>
                <td className="hidden px-3 py-2 align-top text-muted sm:table-cell">
                  {product.manufacturer ?? "—"}
                </td>
                <td className="hidden px-3 py-2 align-top text-muted md:table-cell">
                  {product.category ?? "—"}
                </td>
                <td className="hidden px-3 py-2 align-top text-muted lg:table-cell">
                  {product.sku ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
