"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CostcoSearchForm } from "@/components/workflows/costco-search-form";
import { RunProgress } from "@/components/workflows/run-progress";

export function CostcoWorkflowWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingRunId, setPendingRunId] = useState<string | null>(null);

  const runId = searchParams.get("runId") ?? pendingRunId;

  function handleRunCreated(newRunId: string) {
    setPendingRunId(newRunId);
    router.push(`/workflows/costco?runId=${newRunId}`);
  }

  return (
    <div className="space-y-8">
      <CostcoSearchForm onRunCreated={handleRunCreated} />

      {runId ? (
        <RunProgress key={runId} runId={runId} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted">
              Submit a search term above to start a new report run.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
