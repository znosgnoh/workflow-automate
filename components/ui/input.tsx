import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground",
        "min-h-11 placeholder:text-muted",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-60",
        hasError ? "border-red-500 dark:border-red-400" : "border-border",
        className,
      )}
      {...props}
    />
  );
});

export type InputFieldProps = {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
  inputProps?: Omit<InputProps, "id">;
};

export function InputField({
  id,
  label,
  error,
  hint,
  inputProps,
}: InputFieldProps) {
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={id}
        hasError={Boolean(error)}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
