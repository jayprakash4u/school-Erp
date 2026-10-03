import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[var(--bg-primary)] rounded-lg border border-dashed border-[var(--border-strong)]",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--neutral-500)] mb-4">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>

      {description && (
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
