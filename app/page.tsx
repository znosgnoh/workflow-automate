import { WorkflowCard } from "@/components/workflows/workflow-card";

export default function DashboardPage() {
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
            />
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="recent-heading"
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2
          id="recent-heading"
          className="text-sm font-medium uppercase tracking-wide text-muted"
        >
          Recent activity
        </h2>
        <p className="mt-3 text-sm text-muted">
          No runs yet. Open a workflow above to get started.
        </p>
      </section>
    </div>
  );
}
