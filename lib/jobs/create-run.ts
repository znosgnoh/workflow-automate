import { RunStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { WorkflowId } from "@/lib/jobs/types";

type CreateRunInput = {
  workflowId: WorkflowId;
  searchTerm: string;
};

export async function createWorkflowRun(input: CreateRunInput) {
  return prisma.workflowRun.create({
    data: {
      workflowId: input.workflowId,
      searchTerm: input.searchTerm,
      status: RunStatus.pending,
    },
  });
}
