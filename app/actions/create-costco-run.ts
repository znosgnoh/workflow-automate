"use server";

import { createWorkflowRun } from "@/lib/jobs/create-run";
import { enqueueRun } from "@/lib/jobs/enqueue-run";
import { WORKFLOW_IDS } from "@/lib/jobs/types";
import { createCostcoRunSchema } from "@/lib/validations/costco-run";

export type CreateCostcoRunResult =
  | { ok: true; runId: string }
  | { ok: false; error: string };

export async function createCostcoRun(
  input: unknown,
): Promise<CreateCostcoRunResult> {
  const parsed = createCostcoRunSchema.safeParse(input);

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid search term";
    return { ok: false, error: message };
  }

  try {
    const run = await createWorkflowRun({
      workflowId: WORKFLOW_IDS.COSTCO_PRODUCT_REPORT,
      searchTerm: parsed.data.searchTerm,
    });

    enqueueRun(run.id);
    return { ok: true, runId: run.id };
  } catch {
    return {
      ok: false,
      error: "Could not start the workflow run. Please try again.",
    };
  }
}
