"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createCostcoRun,
  type CreateCostcoRunResult,
} from "@/app/actions/create-costco-run";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputField } from "@/components/ui/input";

type ActiveRunStatus = "pending" | "running" | "completed" | "failed" | null;

export function CostcoSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRunId = searchParams.get("runId");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [runStatuses, setRunStatuses] = useState<
    Record<string, ActiveRunStatus>
  >({});
  const [isPending, startTransition] = useTransition();

  const activeRunStatus = activeRunId ? runStatuses[activeRunId] ?? null : null;

  useEffect(() => {
    if (!activeRunId) {
      return;
    }

    const runId = activeRunId;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function fetchActiveRunStatus() {
      try {
        const response = await fetch(`/api/runs/${runId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { status: ActiveRunStatus };
        if (!cancelled && data.status) {
          setRunStatuses((current) => ({
            ...current,
            [runId]: data.status,
          }));

          if (data.status === "completed" || data.status === "failed") {
            if (intervalId !== undefined) {
              clearInterval(intervalId);
              intervalId = undefined;
            }
          }
        }
      } catch {
        // Keep the last known status for this run.
      }
    }

    void fetchActiveRunStatus();
    intervalId = setInterval(() => {
      void fetchActiveRunStatus();
    }, 2500);

    return () => {
      cancelled = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [activeRunId]);

  const isRunInProgress =
    activeRunStatus === "pending" || activeRunStatus === "running";
  const isDisabled = isPending || isRunInProgress;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result: CreateCostcoRunResult = await createCostcoRun({
        searchTerm,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/workflows/costco?runId=${result.runId}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            id="searchTerm"
            label="Product search term"
            hint='Try a keyword like "coconut".'
            error={error}
            inputProps={{
              name: "searchTerm",
              type: "text",
              value: searchTerm,
              onChange: (event) => setSearchTerm(event.target.value),
              placeholder: 'e.g. "coconut"',
              disabled: isDisabled,
              autoComplete: "off",
            }}
          />

          {isRunInProgress ? (
            <p className="text-sm text-muted" role="status">
              A report is already running. Wait for it to finish or view progress
              below.
            </p>
          ) : null}

          <Button type="submit" disabled={isDisabled}>
            {isPending ? "Starting run…" : "Run report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
