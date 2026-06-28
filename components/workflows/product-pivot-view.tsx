"use client";

import { useMemo, useState } from "react";
import type { StoredProduct } from "@/lib/jobs/product-storage";
import {
  buildProductPivot,
  getPivotChartTitle,
  getPivotChartValue,
  getPivotGroupHeader,
  PIVOT_CHART_METRIC_OPTIONS,
  PIVOT_GROUP_BY_OPTIONS,
  type PivotChartMetric,
  type PivotGroupByField,
} from "@/lib/pivot/product-pivot";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatMetricValue(metric: PivotChartMetric, value: number | null) {
  if (value === null) return "—";

  if (metric === "productCount") {
    return value.toLocaleString();
  }

  return formatCurrency(value);
}

type PivotBarChartProps = {
  rows: ReturnType<typeof buildProductPivot>;
  metric: PivotChartMetric;
  groupBy: PivotGroupByField;
};

function PivotBarChart({ rows, metric, groupBy }: PivotBarChartProps) {
  const maxValue = Math.max(...rows.map((row) => getPivotChartValue(row, metric)), 1);
  const chartHeight = 220;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        {getPivotChartTitle(groupBy, metric)}
      </p>
      <div
        className="rounded-lg border border-border bg-background/60 p-4"
        role="img"
        aria-label="Pivot column chart"
      >
        <div
          className="flex items-end gap-3 overflow-x-auto pb-2"
          style={{ minHeight: chartHeight }}
        >
          {rows.map((row) => {
            const value = getPivotChartValue(row, metric);
            const heightPercent = Math.max(4, (value / maxValue) * 100);

            return (
              <div
                key={row.groupLabel}
                className="flex min-w-[72px] max-w-[120px] flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-foreground">
                  {formatMetricValue(metric, value)}
                </span>
                <div
                  className="flex w-full items-end justify-center"
                  style={{ height: chartHeight - 48 }}
                >
                  <div
                    className="w-full max-w-12 rounded-t-md bg-accent"
                    style={{ height: `${heightPercent}%` }}
                    title={`${row.groupLabel}: ${formatMetricValue(metric, value)}`}
                  />
                </div>
                <span
                  className="line-clamp-2 text-center text-[11px] leading-tight text-muted"
                  title={row.groupLabel}
                >
                  {row.groupLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type ProductPivotViewProps = {
  products: StoredProduct[];
};

export function ProductPivotView({ products }: ProductPivotViewProps) {
  const [groupBy, setGroupBy] = useState<PivotGroupByField>("category");
  const [chartMetric, setChartMetric] =
    useState<PivotChartMetric>("productCount");

  const pivotRows = useMemo(
    () => buildProductPivot(products, groupBy),
    [products, groupBy],
  );

  const groupHeader = getPivotGroupHeader(groupBy);

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
        No products matched this search.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Pivot chart ({products.length} products)
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="pivot-group-by" className="text-xs text-muted">
            Group by
          </label>
          <select
            id="pivot-group-by"
            value={groupBy}
            onChange={(event) =>
              setGroupBy(event.target.value as PivotGroupByField)
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {PIVOT_GROUP_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label htmlFor="pivot-chart-metric" className="text-xs text-muted">
            Chart metric
          </label>
          <select
            id="pivot-chart-metric"
            value={chartMetric}
            onChange={(event) =>
              setChartMetric(event.target.value as PivotChartMetric)
            }
            className="min-h-9 rounded-lg border border-border bg-background px-2 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {PIVOT_CHART_METRIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PivotBarChart
        rows={pivotRows}
        metric={chartMetric}
        groupBy={groupBy}
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-background/80">
            <tr>
              <th className="px-3 py-2 font-medium text-muted">{groupHeader}</th>
              <th className="px-3 py-2 font-medium text-muted">Count</th>
              <th className="px-3 py-2 font-medium text-muted">Total original</th>
              <th className="px-3 py-2 font-medium text-muted">Total promo</th>
              <th className="hidden px-3 py-2 font-medium text-muted sm:table-cell">
                Avg original
              </th>
              <th className="hidden px-3 py-2 font-medium text-muted md:table-cell">
                Avg promo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pivotRows.map((row) => (
              <tr key={row.groupLabel}>
                <td className="px-3 py-2 font-medium">{row.groupLabel}</td>
                <td className="px-3 py-2">{row.productCount}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">
                  {formatCurrency(row.totalOriginalPrice)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {formatCurrency(row.totalPromotionalPrice)}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-muted sm:table-cell">
                  {formatCurrency(row.avgOriginalPrice)}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 text-muted md:table-cell">
                  {formatCurrency(row.avgPromotionalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        Averages exclude products with missing prices. The downloaded Excel Pivot
        sheet uses formulas linked to the Data tab so totals stay in sync.
      </p>
    </div>
  );
}
