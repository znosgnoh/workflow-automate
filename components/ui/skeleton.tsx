import { cn } from "@/lib/utils/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800/80",
        className,
      )}
      {...props}
    />
  );
}

export function RunProgressSkeleton() {
  return (
    <CardSkeleton className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
      <RunResultsSkeleton />
    </CardSkeleton>
  );
}

function CardSkeleton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        className,
      )}
      aria-busy="true"
      aria-label="Loading run status"
    >
      {children}
    </div>
  );
}

export function RunResultsSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading run results"
    >
      <Skeleton className="h-4 w-56" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-44 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="space-y-2 rounded-lg border border-border p-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}
