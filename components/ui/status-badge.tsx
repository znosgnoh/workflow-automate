import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { formatRunStatusLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const statusVariants: Record<string, BadgeVariant> = {
  pending: "pending",
  running: "running",
  completed: "completed",
  failed: "failed",
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariants[status] ?? "pending";

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {formatRunStatusLabel(status)}
    </Badge>
  );
}
