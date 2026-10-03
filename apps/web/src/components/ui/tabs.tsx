"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div
        className={cn(
          "inline-flex p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)]",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                isActive
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-2xs font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isActive
                      ? "bg-[var(--red-100)] text-[var(--brand-primary)]"
                      : "bg-[var(--neutral-200)] text-[var(--neutral-600)]"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("border-b border-[var(--border-default)]", className)}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                isActive
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--neutral-300)]",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px]",
                    isActive
                      ? "bg-[var(--red-100)] text-[var(--brand-primary)] font-semibold"
                      : "bg-[var(--neutral-100)] text-[var(--neutral-600)]"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
