import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CanonicalProduct } from "@/lib/validations/product";
import { buildCostcoProductReportWorkbook } from "@/lib/exporters/excel";

function sampleProducts(count: number): CanonicalProduct[] {
  const categories = ["Water", "Snacks", "Oils", "Baking"];
  return Array.from({ length: count }, (_, index) => ({
    productName: `Sample Coconut Product ${index + 1}`,
    originalPrice: 10 + index,
    promotionalPrice: 8 + index * 0.5,
    manufacturer: index % 2 === 0 ? "Kirkland Signature" : "Vita Coco",
    expiryDate: null,
    sku: `SKU-${1000 + index}`,
    category: categories[index % categories.length] ?? "Other",
  }));
}

async function writeFixture(name: string, products: CanonicalProduct[]) {
  const result = await buildCostcoProductReportWorkbook({
    products,
    searchTerm: "coconut",
    generatedAt: new Date("2026-06-28T12:00:00.000Z"),
  });
  const directory = path.join(process.cwd(), "output", "fixtures");
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, `${name}-${result.filename}`);
  await writeFile(filePath, result.buffer);
  console.log(`Wrote ${filePath} (${result.productCount} products)`);
}

await writeFixture("empty", []);
await writeFixture("single", sampleProducts(1));
await writeFixture("multi", sampleProducts(50));
