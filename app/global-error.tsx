"use client";

import { useEffect } from "react";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error("Global error:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <main className="w-full max-w-md space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-xl font-semibold">Application error</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Workflow Automate encountered an unexpected error. Please refresh
            the page or try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
