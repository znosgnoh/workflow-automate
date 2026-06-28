import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ArtifactDownloadLinksProps = {
  artifacts: Array<{
    id: string;
    type: string;
    url: string;
    filename: string;
  }>;
  compact?: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  xlsx: "Excel (.xlsx)",
  pptx: "PowerPoint (.pptx)",
};

export function ArtifactDownloadLinks({
  artifacts,
  compact = false,
}: ArtifactDownloadLinksProps) {
  if (artifacts.length === 0) {
    return compact ? (
      <span className="text-xs text-muted">—</span>
    ) : (
      <p className="text-sm text-muted">Downloads will appear when files are ready.</p>
    );
  }

  return (
    <div className={cn(!compact && "space-y-2")}>
      {!compact ? (
        <h3 className="text-sm font-semibold text-foreground">Downloads</h3>
      ) : null}
      <ul className={cn("flex flex-wrap gap-2", compact && "max-w-xs")}>
        {artifacts.map((artifact) => {
          const label = TYPE_LABELS[artifact.type] ?? artifact.filename;

          return (
            <li key={artifact.id}>
              <a
                href={artifact.url}
                download={artifact.filename}
                aria-label={`Download ${label}`}
                className={buttonStyles({
                  variant: compact ? "outline" : "secondary",
                  size: compact ? "sm" : "default",
                  className: compact ? "w-full justify-center" : undefined,
                })}
              >
                {compact ? artifact.type.toUpperCase() : label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
