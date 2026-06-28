import { PptTemplateNotFoundError } from "@/lib/exporters/ppt/template-loader";

const SECRET_PATTERNS: RegExp[] = [
  /Bearer\s+\S+/gi,
  /postgresql:\/\/[^\s]+/gi,
  /BLOB_READ_WRITE_TOKEN[=:]\S+/gi,
  /COSTCO_[A-Z_]+[=:]\S+/gi,
  /sk-[a-zA-Z0-9_-]+/g,
];

const FRIENDLY_MESSAGES: Array<{ test: RegExp; message: string }> = [
  {
    test: /P1001|Can't reach database|ECONNREFUSED.*5432/i,
    message: "Database is temporarily unavailable. Please try again.",
  },
  {
    test: /PrismaClient|prisma\./i,
    message: "A database error occurred. Please try again.",
  },
  {
    test: /fetch failed|ENOTFOUND|ETIMEDOUT|ECONNREFUSED/i,
    message:
      "Could not reach the Costco product source. Check your connection and API credentials.",
  },
  {
    test: /BLOB_READ_WRITE_TOKEN/i,
    message: "File storage is not configured. Set BLOB_READ_WRITE_TOKEN or use STORAGE_MODE=local.",
  },
];

function redactSecrets(message: string): string {
  return SECRET_PATTERNS.reduce(
    (result, pattern) => result.replace(pattern, "[redacted]"),
    message,
  );
}

function firstLine(message: string): string {
  return message.split("\n")[0]?.trim() ?? message;
}

/**
 * Returns a safe, user-facing error string for WorkflowRun.error and API responses.
 * Never includes stack traces or secrets.
 */
export function sanitizeErrorForUser(error: unknown): string {
  if (error instanceof PptTemplateNotFoundError) {
    return error.message;
  }

  const rawMessage =
    error instanceof Error ? error.message : "Processing failed";
  const normalized = redactSecrets(firstLine(rawMessage));

  for (const { test, message } of FRIENDLY_MESSAGES) {
    if (test.test(normalized)) {
      return message;
    }
  }

  if (normalized.length > 500) {
    return `${normalized.slice(0, 497)}...`;
  }

  if (!normalized || normalized === "Processing failed") {
    return "The workflow run failed. Please try again.";
  }

  return normalized;
}

type RunLogContext = {
  runId: string;
  step?: string;
};

/**
 * Logs server-side run failures with context. Full stack traces stay in logs only.
 */
export function logRunError(
  { runId, step }: RunLogContext,
  error: unknown,
): void {
  const err = error instanceof Error ? error : new Error(String(error));

  console.error("[workflow-run]", {
    runId,
    step: step ?? "unknown",
    name: err.name,
    message: redactSecrets(err.message),
    stack: err.stack ? redactSecrets(err.stack) : undefined,
  });
}
