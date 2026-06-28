import type { CanonicalProduct } from "@/lib/validations/product";
import { buildCostcoProductReportWorkbook } from "@/lib/exporters/excel";
import { buildCostcoOngoingProductsPpt } from "@/lib/exporters/ppt";

const PRODUCT_COUNT = 200;
const MAX_DURATION_MS = 5 * 60 * 1000;

function buildMockProducts(count: number): CanonicalProduct[] {
  const categories = ["Water", "Snacks", "Oils", "Baking", "Frozen"];

  return Array.from({ length: count }, (_, index) => ({
    productName: `Benchmark Coconut Product ${index + 1}`,
    originalPrice: 10 + (index % 50),
    promotionalPrice: 8 + (index % 40) * 0.5,
    manufacturer: index % 2 === 0 ? "Kirkland Signature" : "Vita Coco",
    expiryDate: null,
    sku: `SKU-${1000 + index}`,
    category: categories[index % categories.length] ?? "Other",
  }));
}

const products = buildMockProducts(PRODUCT_COUNT);
const startedAt = performance.now();

const excelResult = await buildCostcoProductReportWorkbook({
  products,
  searchTerm: "coconut-benchmark",
  generatedAt: new Date("2026-06-28T12:00:00.000Z"),
});

const pptResult = await buildCostcoOngoingProductsPpt({
  products,
  searchTerm: "coconut-benchmark",
  generatedAt: new Date("2026-06-28T12:00:00.000Z"),
});

const elapsedMs = performance.now() - startedAt;
const elapsedSeconds = (elapsedMs / 1000).toFixed(1);

console.log(
  `Pipeline export benchmark: ${PRODUCT_COUNT} products in ${elapsedSeconds}s`,
);
console.log(
  `Excel: ${(excelResult.buffer.byteLength / 1024).toFixed(1)} KB, PPT: ${(pptResult.buffer.byteLength / 1024).toFixed(1)} KB`,
);

if (elapsedMs > MAX_DURATION_MS) {
  console.error(
    `FAILED: exceeded ${MAX_DURATION_MS / 1000}s budget (${elapsedSeconds}s)`,
  );
  process.exit(1);
}

console.log(`PASSED: under ${MAX_DURATION_MS / 1000}s budget`);
