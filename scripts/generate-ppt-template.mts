import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs") as typeof import("pptxgenjs").default;

const templatePath = path.join(
  process.cwd(),
  "templates",
  "costco-ongoing-products.pptx",
);

await mkdir(path.dirname(templatePath), { recursive: true });

const pptx = new PptxGenJS();
pptx.author = "workflow-automate";
pptx.title = "Costco Ongoing Products";

const slide = pptx.addSlide();
slide.addText("Ongoing Costco Products", {
  x: 0.5,
  y: 0.3,
  w: 9,
  h: 0.6,
  fontSize: 24,
  bold: true,
  color: "1F2937",
});

slide.addTable(
  [
    [
      { text: "Product Name", options: { bold: true, fill: { color: "E5E7EB" } } },
      { text: "Original Price", options: { bold: true, fill: { color: "E5E7EB" } } },
      { text: "Promotional Price", options: { bold: true, fill: { color: "E5E7EB" } } },
      { text: "Manufacturer", options: { bold: true, fill: { color: "E5E7EB" } } },
      { text: "Expiry Date", options: { bold: true, fill: { color: "E5E7EB" } } },
    ],
    [
      { text: "{{DATA_ROW}}" },
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
    ],
  ],
  {
    x: 0.4,
    y: 1.1,
    w: 9.2,
    colW: [3.2, 1.3, 1.5, 2.0, 1.2],
    border: { type: "solid", color: "D1D5DB", pt: 1 },
    fontSize: 10,
  },
);

const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
await writeFile(templatePath, buffer);
console.log(`Wrote ${templatePath}`);
