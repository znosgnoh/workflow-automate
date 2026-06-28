import { prisma } from "@/lib/prisma";
import type { WorkflowId } from "@/lib/jobs/types";

export async function getWorkflowDashboardSummary(workflowId: WorkflowId) {
  const latestRun = await prisma.workflowRun.findFirst({
    where: { workflowId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      searchTerm: true,
      status: true,
      createdAt: true,
      completedAt: true,
      productCount: true,
      artifacts: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          url: true,
          filename: true,
        },
      },
    },
  });

  return { latestRun };
}
