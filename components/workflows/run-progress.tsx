"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { RunProgressSkeleton, RunResultsSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArtifactDownloadLinks } from "@/components/workflows/artifact-download-links";
import { RunProductsPreview } from "@/components/workflows/run-products-preview";
import { JOB_STEPS, type JobStep } from "@/lib/jobs/types";
import {
  getActiveStepIndex,
  getJobStepLabel,
} from "@/lib/jobs/step-labels";
import type { StoredProduct } from "@/lib/jobs/product-storage";
import { cn } from "@/lib/utils/cn";

type RunResponse = {
  id: string;
  status: string;
  currentStep: string | null;
  error: string | null;
  searchTerm: string;
  productCount: number | null;
  products: StoredProduct[];
  artifacts: Array<{
    id: string;
    type: string;
    url: string;
    filename: string;
  }>;
};

type RunProgressProps = {
  runId: string;
};

export function RunProgress({ runId }: RunProgressProps) {
  const [run, setRun] = useState<RunResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusAnnouncement, setStatusAnnouncement] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchRun(): Promise<boolean> {
      try {
        const response = await fetch(`/api/runs/${runId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            setLoadError("Run not found.");
            return true;
          }
          throw new Error("Failed to load run status");
        }

        const data = (await response.json()) as RunResponse;
        if (!cancelled) {
          setRun(data);
          setLoadError(null);

          if (data.status === "completed") {
            setStatusAnnouncement(
              `Run completed with ${data.productCount ?? data.products.length} products.`,
            );
          } else if (data.status === "failed") {
            setStatusAnnouncement("Run failed.");
          } else if (data.currentStep) {
            setStatusAnnouncement(
              `Now ${getJobStepLabel(data.currentStep as JobStep)}.`,
            );
          }

          return data.status === "completed" || data.status === "failed";
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load run status.");
        }
      }

      return false;
    }

    async function poll() {
      const isTerminal = await fetchRun();
      if (isTerminal && intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    void poll();
    intervalId = setInterval(() => {
      void poll();
    }, 1000);

    return () => {
      cancelled = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [runId]);

  const activeIndex = useMemo(() => {
    if (!run) {
      return -1;
    }

    return getActiveStepIndex(run.status, run.currentStep);
  }, [run]);

  const isRunActive = run?.status === "pending" || run?.status === "running";

  if (loadError) {
    return (
      <section
        role="alert"
        className="space-y-4 rounded-xl border border-red-200 bg-card p-6 dark:border-red-900"
      >
        <h2 className="text-lg font-semibold text-foreground">Run unavailable</h2>
        <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        <Link
          href="/workflows/costco"
          className={buttonStyles({ variant: "secondary" })}
        >
          Start a new search
        </Link>
      </section>
    );
  }

  if (!run) {
    return <RunProgressSkeleton />;
  }

  return (
    <section
      aria-labelledby="run-progress-heading"
      className="space-y-4 rounded-xl border border-border bg-card p-6"
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <h2 id="run-progress-heading" className="text-lg font-semibold">
          Run progress
        </h2>
        <StatusBadge status={run.status} />
        <span className="text-sm text-muted">
          Search:{" "}
          <span className="font-medium text-foreground">{run.searchTerm}</span>
        </span>
      </div>

      <ol className="space-y-2" aria-label="Pipeline steps">
        {JOB_STEPS.map((step, index) => {
          const isComplete =
            run.status === "completed" || index < activeIndex;
          const isCurrent =
            run.status !== "completed" &&
            run.status !== "failed" &&
            index === activeIndex &&
            (run.status === "pending" ||
              (run.status === "running" && run.currentStep === step));
          const stepLabel = getJobStepLabel(step);

          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                isCurrent && "bg-blue-50 dark:bg-blue-950/40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isComplete
                    ? "bg-green-700 text-white dark:bg-green-600"
                    : isCurrent
                      ? "bg-blue-700 text-white dark:bg-blue-600"
                      : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
                )}
              >
                {isComplete ? "✓" : index + 1}
              </span>
              <span
                className={cn(
                  isComplete || isCurrent ? "text-foreground" : "text-muted",
                )}
              >
                <span className="sr-only">
                  {isComplete
                    ? "Completed: "
                    : isCurrent
                      ? "Current step: "
                      : "Upcoming: "}
                </span>
                {stepLabel}
              </span>
            </li>
          );
        })}
      </ol>

      {run.status === "failed" ? (
        <div
          className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
          role="alert"
        >
          <p className="text-sm text-red-800 dark:text-red-200">
            {run.error ?? "The run failed. Please try again."}
          </p>
          <Link
            href="/workflows/costco"
            className={buttonStyles({ variant: "secondary" })}
          >
            Try again
          </Link>
        </div>
      ) : null}

      {isRunActive ? <RunResultsSkeleton /> : null}

      {run.status === "completed" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted" role="status">
            Run finished with{" "}
            <span className="font-medium text-foreground">
              {run.productCount ?? run.products.length} products
            </span>
            .
          </p>
          <ArtifactDownloadLinks artifacts={run.artifacts} />
          <RunProductsPreview products={run.products} />
        </div>
      ) : null}
    </section>
  );
}
