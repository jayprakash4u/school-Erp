"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    console.error("Fatal Root ERP Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] text-[#f8fafc] font-sans antialiased">
        <div className="w-full max-w-md p-8 bg-[#1e293b] rounded-2xl border border-[#334155] shadow-2xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/80 text-red-400 border border-red-800/50">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Fatal System Exception
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Critical App Failure
            </h1>
            <p className="text-xs text-slate-400">
              The application encountered a root layout crash. Attempting a reset may restore state.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => reset()}
              className="w-full justify-center bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
