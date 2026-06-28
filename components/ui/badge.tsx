import { cn } from "@/lib/utils/cn";

const variantStyles = {
  default: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
  pending:
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
  running: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
  completed:
    "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100",
  failed: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
} as const;

export type BadgeVariant = keyof typeof variantStyles;

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant] ?? variantStyles.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
