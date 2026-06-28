import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type WorkflowCardProps = {
  id: string;
  name: string;
  description: string;
  href: string;
  lastRunLabel?: string;
};

export function WorkflowCard({
  id,
  name,
  description,
  href,
  lastRunLabel = "No runs yet",
}: WorkflowCardProps) {
  return (
    <article
      id={id}
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow",
        "hover:shadow-md",
      )}
    >
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">{lastRunLabel}</p>
        <Link
          href={href}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors",
            "hover:bg-accent-hover",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          Open workflow
        </Link>
      </div>
    </article>
  );
}
