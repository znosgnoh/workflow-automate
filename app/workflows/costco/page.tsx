import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CostcoSearchForm } from "@/components/workflows/costco-search-form";
import { RunProgress } from "@/components/workflows/run-progress";
import { RunProgressSkeleton } from "@/components/ui/skeleton";

type CostcoWorkflowPageProps = {
  searchParams: Promise<{ runId?: string }>;
};

function SearchFormFallback() {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted">Loading search form…</p>
      </CardContent>
    </Card>
  );
}

export default async function CostcoWorkflowPage({
  searchParams,
}: CostcoWorkflowPageProps) {
  const { runId } = await searchParams;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted">
          <Link
            href="/"
            className="hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Dashboard
          </Link>
          <span aria-hidden> / </span>
          <span>Costco Product Report</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Costco Product Report
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Search Costco products by keyword. The pipeline fetches data, exports
          Excel, and updates your PowerPoint slide.
        </p>
        <Link
          href="/workflows/costco/history"
          className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View run history
        </Link>
      </header>

      <Suspense fallback={<SearchFormFallback />}>
        <CostcoSearchForm />
      </Suspense>

      {runId ? (
        <Suspense fallback={<RunProgressSkeleton />}>
          <RunProgress runId={runId} />
        </Suspense>
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
