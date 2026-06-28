import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArtifactDownloadLinks } from "@/components/workflows/artifact-download-links";
import { listWorkflowRuns } from "@/lib/jobs/list-runs";
import { WORKFLOW_IDS } from "@/lib/jobs/types";
import { formatRelativeTime } from "@/lib/utils/format";

export async function RunHistoryTable() {
  const runs = await listWorkflowRuns({
    workflowId: WORKFLOW_IDS.COSTCO_PRODUCT_REPORT,
    limit: 20,
  });

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted">
            No runs yet. Start a search from the Costco workflow page.
          </p>
          <Link href="/workflows/costco" className={buttonStyles({ variant: "primary" })}>
            Run your first report
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {runs.map((run) => (
          <Card key={run.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">{run.searchTerm}</p>
                <StatusBadge status={run.status} />
              </div>
              <p className="text-sm text-muted">
                Started {formatRelativeTime(run.createdAt)}
              </p>
              <ArtifactDownloadLinks artifacts={run.artifacts} compact />
              <Link
                href={`/workflows/costco?runId=${run.id}`}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                View run
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background/60">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                Search term
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                Started
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                Downloads
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {runs.map((run) => (
              <tr key={run.id}>
                <td className="px-4 py-3 font-medium">{run.searchTerm}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={run.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatRelativeTime(run.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <ArtifactDownloadLinks artifacts={run.artifacts} compact />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/workflows/costco?runId=${run.id}`}
                    className="font-medium text-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
