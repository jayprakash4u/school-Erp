import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-md p-8 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)] shadow-lg space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
          <FileQuestion className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            404 Error
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Page Not Found
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The ERP module, record, or route you are attempting to access does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={ROUTES.HOME}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full sm:w-auto")}
          >
            <Home className="h-4 w-4 mr-1.5" />
            Home
          </Link>
          <Link
            href={ROUTES.DASHBOARD}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "w-full sm:w-auto")}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Go to Dashboard
          </Link>
        </div>

        <div className="border-t border-[var(--border-default)] pt-4 text-[11px] text-[var(--text-tertiary)]">
          School ERP Enterprise System • Multi-Tenant Platform
        </div>
      </div>
    </div>
  );
}
