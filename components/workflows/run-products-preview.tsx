"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StoredProduct } from "@/lib/jobs/product-storage";

const PAGE_SIZE = 15;

type SortField = "promotionalPrice" | "originalPrice" | "productName";
type SortDirection = "asc" | "desc";

const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: "promotionalPrice", label: "Promo price" },
  { value: "originalPrice", label: "Original price" },
  { value: "productName", label: "Name" },
];

function formatPrice(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function compareProducts(
  left: StoredProduct,
  right: StoredProduct,
  field: SortField,
  direction: SortDirection,
): number {
  if (field === "productName") {
    const comparison = left.productName.localeCompare(right.productName);
    return direction === "asc" ? comparison : comparison * -1;
  }

  const leftValue = left[field];
  const rightValue = right[field];
  const leftNumber =
    leftValue ?? (direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
  const rightNumber =
    rightValue ?? (direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);

  if (leftNumber === rightNumber) {
    return left.productName.localeCompare(right.productName);
  }

  return direction === "asc" ? leftNumber - rightNumber : rightNumber - leftNumber;
}

type RunProductsPreviewProps = {
  products: StoredProduct[];
};

export function RunProductsPreview({ products }: RunProductsPreviewProps) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("promotionalPrice");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedProducts = useMemo(
    () =>
      [...products].sort((left, right) =>
        compareProducts(left, right, sortField, sortDirection),
      ),
    [products, sortField, sortDirection],
  );

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageProducts = sortedProducts.slice(pageStart, pageStart + PAGE_SIZE);

  function handleSortFieldChange(field: SortField) {
    setSortField(field);
    setPage(1);
  }

  function toggleSortDirection() {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    setPage(1);
  }

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
        No products matched this search.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Product preview ({products.length})
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="product-sort" className="text-xs text-muted">
            Sort by
          </label>
          <select
            id="product-sort"
            value={sortField}
            onChange={(event) =>
              handleSortFieldChange(event.target.value as SortField)
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
          >
            {sortDirection === "asc" ? "Low → high" : "High → low"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-background/80">
            <tr>
              <th className="px-3 py-2 font-medium text-muted">Product</th>
              <th className="px-3 py-2 font-medium text-muted">Link</th>
              <th className="px-3 py-2 font-medium text-muted">Original</th>
              <th className="px-3 py-2 font-medium text-muted">Promo</th>
              <th className="hidden px-3 py-2 font-medium text-muted sm:table-cell">
                Manufacturer
              </th>
              <th className="hidden px-3 py-2 font-medium text-muted md:table-cell">
                Category
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageProducts.map((product) => (
              <tr key={`${product.sku ?? "na"}-${product.productName}`}>
                <td className="max-w-xs px-3 py-2 align-top font-medium">
                  {product.productName}
                </td>
                <td className="px-3 py-2 align-top">
                  {product.link ? (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, sortedProducts.length)} of{" "}
          {sortedProducts.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
