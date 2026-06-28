import { ArtifactType, Prisma, RunStatus } from "@prisma/client";
import { getCostcoProductSource } from "@/lib/adapters/costco";
import { buildCostcoProductReportWorkbook } from "@/lib/exporters/excel";
import { buildCostcoOngoingProductsPpt } from "@/lib/exporters/ppt";
import { mapCostcoProducts } from "@/lib/mappers/field-mapper";
import { serializeProductsForStorage } from "@/lib/jobs/product-storage";
import { prisma } from "@/lib/prisma";
import { JOB_STEPS, type JobStep } from "@/lib/jobs/types";
import { storeRunArtifacts } from "@/lib/storage/store-artifact";
import {
  logRunError,
  sanitizeErrorForUser,
} from "@/lib/utils/sanitize-error";

async function setStep(runId: string, step: JobStep) {
  await prisma.workflowRun.update({
    where: { id: runId },
    data: { currentStep: step },
  });
}

export async function processRun(runId: string) {
  let currentStep: JobStep | undefined;

  try {
    const run = await prisma.workflowRun.findUnique({ where: { id: runId } });

    if (!run) {
      throw new Error("Workflow run not found");
    }

    currentStep = JOB_STEPS[0];

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: RunStatus.running,
        currentStep,
        error: null,
      },
    });

    currentStep = "fetching";
    await setStep(runId, currentStep);
    const source = getCostcoProductSource();
    const rawProducts = await source.search({ query: run.searchTerm });

    currentStep = "mapping";
    await setStep(runId, currentStep);
    const { products, skippedCount, warnings } = mapCostcoProducts(rawProducts);

    if (warnings.length > 0) {
      console.warn(`Run ${runId} mapping warnings:`, warnings.slice(0, 20));
    }

    if (skippedCount > 0) {
      console.warn(`Run ${runId}: skipped ${skippedCount} invalid products`);
    }

    const generatedAt = new Date();

    currentStep = "excel";
    await setStep(runId, currentStep);
    const excelResult = await buildCostcoProductReportWorkbook({
      products,
      searchTerm: run.searchTerm,
      generatedAt,
    });

    currentStep = "ppt";
    await setStep(runId, currentStep);
    const pptResult = await buildCostcoOngoingProductsPpt({
      products,
      searchTerm: run.searchTerm,
      generatedAt,
    });

    currentStep = "uploading";
    await setStep(runId, currentStep);
    await storeRunArtifacts(runId, [
      {
        type: ArtifactType.xlsx,
        buffer: excelResult.buffer,
        filename: excelResult.filename,
      },
      {
        type: ArtifactType.pptx,
        buffer: pptResult.buffer,
        filename: pptResult.filename,
      },
    ]);

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: RunStatus.completed,
        currentStep: null,
        completedAt: generatedAt,
        productCount: products.length,
        products: serializeProductsForStorage(
          products,
        ) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logRunError({ runId, step: currentStep }, error);

    const message = sanitizeErrorForUser(error);

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: RunStatus.failed,
        error: message,
        currentStep: null,
        completedAt: new Date(),
      },
    });
  }
}
