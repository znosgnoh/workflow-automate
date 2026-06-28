import { JOB_STEPS, type JobStep } from "@/lib/jobs/types";

export const JOB_STEP_LABELS: Record<JobStep, string> = {
  fetching: "Fetching",
  mapping: "Mapping",
  excel: "Building Excel",
  ppt: "Building PPT",
  uploading: "Uploading",
};

export function getJobStepLabel(step: JobStep): string {
  return JOB_STEP_LABELS[step];
}

export function getActiveStepIndex(
  status: string,
  currentStep: string | null,
): number {
  if (status === "completed") {
    return JOB_STEPS.length;
  }

  if (status === "failed") {
    return -1;
  }

  if (status === "pending") {
    return 0;
  }

  if (!currentStep) {
    return 0;
  }

  const index = JOB_STEPS.indexOf(currentStep as JobStep);
  return index === -1 ? 0 : index;
}
