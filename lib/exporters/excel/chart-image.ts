import { PNG } from "pngjs";
import type { SummaryRow } from "@/lib/exporters/excel/summary-config";
import type { PivotChartMetric, ProductPivotRow } from "@/lib/pivot/product-pivot";
import { getPivotChartValue } from "@/lib/pivot/product-pivot";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 420;
const MARGIN = 48;
const BAR_GAP = 16;
const BAR_COLOR = { r: 37, g: 99, b: 235 };
const AXIS_COLOR = { r: 148, g: 163, b: 184 };
const BACKGROUND_COLOR = { r: 255, g: 255, b: 255 };

function setPixel(
  data: Buffer,
  width: number,
  x: number,
  y: number,
  color: { r: number; g: number; b: number },
) {
  if (x < 0 || y < 0 || x >= width) {
    return;
  }

  const offset = (width * y + x) << 2;
  data[offset] = color.r;
  data[offset + 1] = color.g;
  data[offset + 2] = color.b;
  data[offset + 3] = 255;
}

function fillRect(
  data: Buffer,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: { r: number; g: number; b: number },
) {
  const left = Math.max(0, Math.min(x0, x1));
  const right = Math.min(width - 1, Math.max(x0, x1));
  const top = Math.max(0, Math.min(y0, y1));
  const bottom = Math.min(height - 1, Math.max(y0, y1));

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      setPixel(data, width, x, y, color);
    }
  }
}

/** Renders a column chart PNG for the Summary sheet. */
export function renderSummaryColumnChartPng(
  rows: SummaryRow[],
): Buffer | null {
  if (rows.length === 0) {
    return null;
  }

  return renderColumnChartPng(
    rows.map((row) => ({
      label: row.groupLabel,
      value: row.sumValue,
    })),
  );
}

/** Renders a column chart PNG for the Pivot sheet. */
export function renderPivotColumnChartPng(
  rows: ProductPivotRow[],
  metric: PivotChartMetric,
): Buffer | null {
  if (rows.length === 0) {
    return null;
  }

  return renderColumnChartPng(
    rows.map((row) => ({
      label: row.groupLabel,
      value: getPivotChartValue(row, metric),
    })),
  );
}

function renderColumnChartPng(
  points: Array<{ label: string; value: number }>,
): Buffer | null {
  if (points.length === 0) {
    return null;
  }

  const rows = points;

  const png = new PNG({ width: CHART_WIDTH, height: CHART_HEIGHT });

  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = BACKGROUND_COLOR.r;
    png.data[i + 1] = BACKGROUND_COLOR.g;
    png.data[i + 2] = BACKGROUND_COLOR.b;
    png.data[i + 3] = 255;
  }

  const plotLeft = MARGIN;
  const plotRight = CHART_WIDTH - MARGIN;
  const plotTop = MARGIN;
  const plotBottom = CHART_HEIGHT - MARGIN;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  fillRect(
    png.data,
    CHART_WIDTH,
    CHART_HEIGHT,
    plotLeft,
    plotBottom,
    plotRight,
    plotBottom + 1,
    AXIS_COLOR,
  );
  fillRect(
    png.data,
    CHART_WIDTH,
    CHART_HEIGHT,
    plotLeft,
    plotTop,
    plotLeft + 1,
    plotBottom,
    AXIS_COLOR,
  );

  const maxCount = Math.max(...rows.map((row) => row.value), 1);
  const barCount = rows.length;
  const totalGap = BAR_GAP * (barCount + 1);
  const barWidth = Math.max(12, Math.floor((plotWidth - totalGap) / barCount));

  rows.forEach((row, index) => {
    const barHeight = Math.round((row.value / maxCount) * plotHeight);
    const x = plotLeft + BAR_GAP + index * (barWidth + BAR_GAP);
    const y = plotBottom - barHeight;
    fillRect(
      png.data,
      CHART_WIDTH,
      CHART_HEIGHT,
      x,
      y,
      x + barWidth,
      plotBottom,
      BAR_COLOR,
    );
  });

  return PNG.sync.write(png);
}
