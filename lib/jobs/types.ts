import { ArtifactType, RunStatus } from "@prisma/client";

export { ArtifactType, RunStatus };

export const JOB_STEPS = [
  "fetching",
  "mapping",
  "excel",
  "ppt",
  "uploading",
] as const;

export type JobStep = (typeof JOB_STEPS)[number];

export const WORKFLOW_IDS = {
  COSTCO_PRODUCT_REPORT: "costco-product-report",
} as const;

export type WorkflowId =
  (typeof WORKFLOW_IDS)[keyof typeof WORKFLOW_IDS];
