import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const variantStyles = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:bg-accent/60",
  secondary:
    "border border-border bg-background text-foreground hover:bg-background/80",
  outline:
    "border border-border bg-transparent text-accent hover:border-accent hover:bg-accent/5",
  ghost: "text-foreground hover:bg-background/80",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
} as const;

const sizeStyles = {
  default: "min-h-11 px-4 py-2.5 text-sm",
  sm: "min-h-9 px-3 py-1.5 text-xs",
  lg: "min-h-12 px-5 py-3 text-base",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

export function buttonStyles({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "default",
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  },
);
