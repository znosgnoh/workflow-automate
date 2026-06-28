import { buildPptFilename } from "@/lib/utils/filename";
import { loadPptTemplate } from "@/lib/exporters/ppt/template-loader";
import { updateOngoingProductsSlide } from "@/lib/exporters/ppt/slide-updater";
import {
  DEFAULT_COSTCO_PPT_CONFIG,
  type CostcoPptConfig,
} from "@/lib/exporters/ppt/ppt-config";
import type { CanonicalProduct } from "@/lib/validations/product";

export type BuildPptOptions = {
  products: CanonicalProduct[];
  searchTerm: string;
  generatedAt?: Date;
  pptConfig?: CostcoPptConfig;
};

export type BuildPptResult = {
  buffer: Buffer;
  filename: string;
  rowCount: number;
};

export async function buildCostcoOngoingProductsPpt(
  options: BuildPptOptions,
): Promise<BuildPptResult> {
  const generatedAt = options.generatedAt ?? new Date();
  const pptConfig = options.pptConfig ?? DEFAULT_COSTCO_PPT_CONFIG;
  const templateBuffer = await loadPptTemplate();
  const buffer = await updateOngoingProductsSlide(
    templateBuffer,
    options.products,
    pptConfig,
  );

  const rowCount = Math.min(
    options.products.length,
    pptConfig.maxRows,
  );

  return {
    buffer,
    filename: buildPptFilename(options.searchTerm, generatedAt),
    rowCount,
  };
}

export { PptTemplateNotFoundError } from "@/lib/exporters/ppt/template-loader";
