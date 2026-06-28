import { waitUntil } from "@vercel/functions";
import { processRun } from "@/lib/jobs/processor";
import { logRunError } from "@/lib/utils/sanitize-error";

export function enqueueRun(runId: string) {
  const task = processRun(runId);

  if (process.env.VERCEL) {
    waitUntil(task);
    return;
  }

  void task.catch((error) => {
    logRunError({ runId, step: "enqueue" }, error);
  });
}
