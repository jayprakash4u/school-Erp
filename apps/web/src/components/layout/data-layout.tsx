import * as React from "react";
import { cn } from "@/lib/utils";
import { PageHeader, BreadcrumbItem } from "./page-header";

export interface DataLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataLayout({
  title,
  description,
  breadcrumbs,
  headerActions,
  toolbar,
  children,
  className,
}: DataLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      {toolbar && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-2xs">
          {toolbar}
        </div>
      )}

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-2xs overflow-hidden">
        {children}
      </div>
    </div>
  );
}
