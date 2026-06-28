import { prisma } from "@/lib/prisma";
import { parseStoredProducts } from "@/lib/jobs/product-storage";

export async function getWorkflowRun(runId: string) {
  return prisma.workflowRun.findUnique({
    where: { id: runId },
    include: {
      artifacts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export type WorkflowRunDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkflowRun>>
>;

export function serializeWorkflowRun(run: WorkflowRunDetail) {
  return {
    id: run.id,
    workflowId: run.workflowId,
    searchTerm: run.searchTerm,
    status: run.status,
    currentStep: run.currentStep,
    error: run.error,
    productCount: run.productCount,
    products: parseStoredProducts(run.products),
    createdAt: run.createdAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    artifacts: run.artifacts.map((artifact) => ({
      id: artifact.id,
      type: artifact.type,
      url: artifact.url,
      filename: artifact.filename,
      createdAt: artifact.createdAt.toISOString(),
    })),
  };
}
