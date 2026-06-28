import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { RunHistoryTable } from "@/components/workflows/run-history-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function HistoryTableFallback() {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function CostcoHistoryPage() {
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
          <Link
            href="/workflows/costco"
            className="hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Costco Product Report
          </Link>
          <span aria-hidden> / </span>
          <span>History</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Run history
        </h1>
        <p className="text-sm text-muted">
          Recent Costco report runs, downloads, and status.
        </p>
        <Link
          href="/workflows/costco"
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          New search
        </Link>
      </header>

      <Suspense fallback={<HistoryTableFallback />}>
        <RunHistoryTable />
      </Suspense>
    </div>
  );
}
