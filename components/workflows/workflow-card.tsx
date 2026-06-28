import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatRelativeTime,
  formatRunStatusLabel,
} from "@/lib/utils/format";

type WorkflowLastRun = {
  searchTerm: string;
  status: string;
  createdAt: Date;
};

type WorkflowCardProps = {
  id: string;
  name: string;
  description: string;
  href: string;
  lastRun?: WorkflowLastRun | null;
};

export function WorkflowCard({
  id,
  name,
  description,
  href,
  lastRun = null,
}: WorkflowCardProps) {
  return (
    <Card
      id={id}
      className="flex h-full flex-col transition-shadow hover:shadow-md"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">{name}</h3>
          {lastRun ? <StatusBadge status={lastRun.status} /> : null}
        </div>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </CardHeader>

      <CardContent className="flex-1">
        {lastRun ? (
          <dl className="space-y-1 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted">Last search</dt>
              <dd className="font-medium text-foreground">
                &ldquo;{lastRun.searchTerm}&rdquo;
              </dd>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted">Started</dt>
              <dd className="text-foreground">
                {formatRelativeTime(lastRun.createdAt)}
              </dd>
            </div>
          </dl>
        ) : (
          <Badge variant="pending">No runs yet</Badge>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <p className="text-xs text-muted">
          {lastRun
            ? `Status: ${formatRunStatusLabel(lastRun.status)}`
            : "Run your first report to see activity here."}
        </p>
        <Link href={href} className={buttonStyles({ variant: "primary" })}>
          Open workflow
        </Link>
      </CardFooter>
    </Card>
  );
}
