import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_TEMPLATE_RELATIVE_PATH =
  "templates/costco-ongoing-products.pptx";

export class PptTemplateNotFoundError extends Error {
  readonly templatePath: string;

  constructor(templatePath: string) {
    super(
      `PowerPoint template not found at "${templatePath}". ` +
        "Place your template at templates/costco-ongoing-products.pptx " +
        "or set PPT_TEMPLATE_PATH in .env.local. " +
        "To generate the default starter template, run: npm run generate:ppt-template",
    );
    this.name = "PptTemplateNotFoundError";
    this.templatePath = templatePath;
  }
}

export function resolvePptTemplatePath(): string {
  const configured = process.env.PPT_TEMPLATE_PATH?.trim();
  const projectRoot = path.join(/* turbopackIgnore: true */ process.cwd());

  if (!configured) {
    return path.join(projectRoot, DEFAULT_TEMPLATE_RELATIVE_PATH);
  }

  return path.isAbsolute(configured)
    ? configured
    : path.join(projectRoot, configured);
}

export async function loadPptTemplate(): Promise<Buffer> {
  const templatePath = resolvePptTemplatePath();

  try {
    return await readFile(templatePath);
  } catch {
    throw new PptTemplateNotFoundError(templatePath);
  }
}
