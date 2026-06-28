import { prisma } from "@/lib/prisma";
import type { WorkflowId } from "@/lib/jobs/types";

type ListRunsInput = {
  workflowId?: WorkflowId;
  limit?: number;
};

export async function listWorkflowRuns({
  workflowId,
  limit = 20,
}: ListRunsInput = {}) {
  return prisma.workflowRun.findMany({
    where: workflowId ? { workflowId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      artifacts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getLatestWorkflowRun(workflowId: WorkflowId) {
  return prisma.workflowRun.findFirst({
    where: { workflowId },
    orderBy: { createdAt: "desc" },
  });
}
