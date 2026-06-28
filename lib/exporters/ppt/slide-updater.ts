import JSZip from "jszip";
import {
  DEFAULT_COSTCO_PPT_CONFIG,
  productToPptRowValues,
  selectProductsForPptSlide,
  type CostcoPptConfig,
} from "@/lib/exporters/ppt/ppt-config";
import type { CanonicalProduct } from "@/lib/validations/product";

const DATA_ROW_REGEX = /<a:tr[^>]*>[\s\S]*?\{\{DATA_ROW\}\}[\s\S]*?<\/a:tr>/;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectCellText(cellXml: string, value: string): string {
  if (!value) {
    return cellXml;
  }

  const runXml =
    `<a:r><a:rPr lang="en-US" sz="1000" dirty="0">` +
    `<a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:rPr>` +
    `<a:t>${escapeXml(value)}</a:t></a:r>`;

  if (cellXml.includes("<a:endParaRPr")) {
    return cellXml.replace("<a:endParaRPr", `${runXml}<a:endParaRPr`);
  }

  return cellXml.replace("</a:p>", `${runXml}</a:p>`);
}

function buildRowFromTemplate(rowTemplate: string, values: string[]): string {
  const cellMatches = rowTemplate.match(/<a:tc>[\s\S]*?<\/a:tc>/g) ?? [];

  if (cellMatches.length === 0) {
    throw new Error("PPT template data row is missing table cells.");
  }

  const firstCell = cellMatches[0];
  if (!firstCell) {
    throw new Error("PPT template data row is missing table cells.");
  }

  const rowPrefix = rowTemplate.slice(0, rowTemplate.indexOf(firstCell));
  const updatedCells = cellMatches.map((cell, index) =>
    injectCellText(cell, values[index] ?? ""),
  );

  return `${rowPrefix}${updatedCells.join("")}</a:tr>`;
}

function extractDataRowTemplate(
  slideXml: string,
  placeholderMarker: string,
): string {
  const markerIndex = slideXml.indexOf(placeholderMarker);

  if (markerIndex === -1) {
    throw new Error(
      `PPT template slide is missing the "${placeholderMarker}" placeholder row.`,
    );
  }

  const slice = slideXml.slice(0, markerIndex + placeholderMarker.length);
  const rowStart = slice.lastIndexOf("<a:tr");
  const rowEnd = slideXml.indexOf("</a:tr>", markerIndex);

  if (rowStart === -1 || rowEnd === -1) {
    throw new Error("PPT template data row could not be parsed.");
  }

  return slideXml.slice(rowStart, rowEnd + "</a:tr>".length);
}

function buildDataRows(
  rowTemplate: string,
  products: CanonicalProduct[],
  config: CostcoPptConfig,
): string {
  if (products.length === 0) {
    return buildRowFromTemplate(rowTemplate, [
      "No products found for this search.",
      "",
      "",
      "",
      "",
    ]);
  }

  return selectProductsForPptSlide(products, config)
    .map((product) =>
      buildRowFromTemplate(rowTemplate, productToPptRowValues(product)),
    )
    .join("");
}

export async function updateOngoingProductsSlide(
  templateBuffer: Buffer,
  products: CanonicalProduct[],
  config: CostcoPptConfig = DEFAULT_COSTCO_PPT_CONFIG,
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(templateBuffer);
  const slideFile = zip.file(config.slideFileName);

  if (!slideFile) {
    throw new Error(
      `PPT template is missing slide file "${config.slideFileName}".`,
    );
  }

  const slideXml = await slideFile.async("string");
  const rowTemplate = extractDataRowTemplate(
    slideXml,
    config.placeholderMarker,
  );
  const dataRows = buildDataRows(rowTemplate, products, config);
  const updatedSlideXml = slideXml.replace(DATA_ROW_REGEX, dataRows);

  if (updatedSlideXml === slideXml) {
    throw new Error("Failed to update PPT template product table.");
  }

  zip.file(config.slideFileName, updatedSlideXml);
  return zip.generateAsync({ type: "nodebuffer" });
}
