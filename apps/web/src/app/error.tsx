"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log unexpected client error to monitoring service (e.g. Sentry / Application Insights)
    console.error("Unhandled ERP Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-lg p-8 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)] shadow-xl space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--error-50)] text-[var(--error-600)] border border-[var(--error-200)]">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--error-600)]">
            Application Error
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Something went wrong
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            An unexpected error occurred while processing this module. Our system administrators have been notified.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md text-left overflow-x-auto">
            <p className="font-mono text-xs text-[var(--error-700)] break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="font-mono text-[10px] text-[var(--text-tertiary)] mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="sm" onClick={() => reset()} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
          <Link
            href={ROUTES.DASHBOARD}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full sm:w-auto")}
          >
            <Home className="h-4 w-4 mr-1.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
