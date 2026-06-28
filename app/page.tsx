import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { getWorkflowDashboardSummary } from "@/lib/jobs/dashboard";
import { WORKFLOW_IDS } from "@/lib/jobs/types";
import {
  formatRelativeTime,
  formatRunStatusLabel,
} from "@/lib/utils/format";

export default async function DashboardPage() {
  const { latestRun } = await getWorkflowDashboardSummary(
    WORKFLOW_IDS.COSTCO_PRODUCT_REPORT,
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Run daily automation workflows from one place. Search Costco products,
          export Excel reports, and update PowerPoint slides.
        </p>
      </header>

      <section aria-labelledby="workflows-heading">
        <h2 id="workflows-heading" className="sr-only">
          Available workflows
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li>
            <WorkflowCard
              id="costco-product-report"
              name="Costco Product Report"
              description="Search by keyword, export Excel with pricing data, and refresh your ongoing-products slide."
              href="/workflows/costco"
              lastRun={
                latestRun
                  ? {
                      searchTerm: latestRun.searchTerm,
                      status: latestRun.status,
                      createdAt: latestRun.createdAt,
                    }
                  : null
              }
            />
          </li>
        </ul>
      </section>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Recent activity
          </h2>
          {latestRun ? (
            <div className="mt-3 space-y-2 text-sm text-foreground">
              <p>
                Latest search{" "}
                <span className="font-medium">
                  &ldquo;{latestRun.searchTerm}&rdquo;
                </span>{" "}
                is{" "}
                <span className="font-medium">
                  {formatRunStatusLabel(latestRun.status).toLowerCase()}
                </span>{" "}
                ({formatRelativeTime(latestRun.createdAt)}).
              </p>
              {latestRun.productCount !== null ? (
                <p className="text-muted">
                  {latestRun.productCount} product
                  {latestRun.productCount === 1 ? "" : "s"} mapped.
                </p>
              ) : null}
              <Link
                href={`/workflows/costco?runId=${latestRun.id}`}
                className="inline-flex min-h-11 items-center font-medium text-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                View latest run
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No runs yet.{" "}
              <Link
                href="/workflows/costco"
                className="font-medium text-accent hover:text-accent-hover"
              >
                Start a Costco search
              </Link>{" "}
              to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
