"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardContent className="space-y-4 pt-6">
        <h1 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted">
          We hit an unexpected error while loading this page. You can try again
          or return to the dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className={buttonStyles({ variant: "primary" })}
          >
            Try again
          </button>
          <Link href="/" className={buttonStyles({ variant: "secondary" })}>
            Back to dashboard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
