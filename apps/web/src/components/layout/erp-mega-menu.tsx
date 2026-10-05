"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface ErpMegaMenuProps {
  module: NavItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectSubItem?: (module: NavItem, subTitle: string, href: string) => void;
  caretLeftPercent?: number;
  className?: string;
}

export function ErpMegaMenu({
  module,
  isOpen,
  onClose,
  onSelectSubItem,
  caretLeftPercent = 20,
  className,
}: ErpMegaMenuProps) {
  if (!isOpen || !module.categories || module.categories.length === 0) {
    return null;
  }

  const colCount = module.categories.length;
  const footerAction = module.footerAction;

  const widthClass =
    colCount >= 3
      ? "w-[94vw] sm:w-[560px] md:w-[840px] max-w-[95vw]"
      : colCount === 2
      ? "w-[94vw] sm:w-[560px] max-w-[95vw]"
      : "w-[94vw] sm:w-[240px] max-w-[95vw]";

  const gridClass =
    colCount >= 3
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : colCount === 2
      ? "grid grid-cols-1 sm:grid-cols-2"
      : "flex flex-col";

  return (
    <div className={cn("relative z-50 pt-1", className)}>
      {/* Main Submenu Container */}
      <div
        className={cn(
          "relative rounded-[8px] bg-white border border-[var(--border-default)] shadow-2xl overflow-y-auto max-h-[75vh] text-[var(--text-primary)] select-none animate-in fade-in-0 zoom-in-98 duration-150 custom-scrollbar",
          widthClass
        )}
      >
        {/* Top Triangular Caret Arrow */}
        <div
          className="absolute -top-[5.5px] w-2.5 h-2.5 bg-white border-t border-l border-[var(--border-default)] rotate-45 z-30"
          style={{ left: `${Math.max(6, Math.min(94, caretLeftPercent))}%` }}
        />

        {/* Dynamic Column Grid */}
        <div className={cn("relative z-20", gridClass)}>
          {module.categories.map((cat, colIdx) => {
            const isFirstCol = colIdx === 0;
            const isAlternate = colIdx % 2 === 1;

            return (
              <div
                key={cat.title || colIdx}
                className={cn(
                  "p-3 sm:p-4 space-y-1 flex flex-col justify-between",
                  isAlternate ? "bg-[var(--neutral-50)]/50" : "bg-white",
                  colIdx > 0 && "border-t sm:border-t-0 sm:border-l border-[var(--border-light)]"
                )}
              >
                <div>
                  {/* Category Header */}
                  {cat.title && (
                    <div className="flex items-center gap-1.5 px-2.5 pb-2 mb-1 border-b border-[var(--border-default)]">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          isFirstCol
                            ? "bg-[var(--brand-primary)]"
                            : colIdx === 1
                            ? "bg-amber-600"
                            : "bg-blue-600"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-wider",
                          isFirstCol
                            ? "font-bold text-[var(--text-primary)]"
                            : "font-semibold text-[var(--text-secondary)]"
                        )}
                      >
                        {cat.title}
                      </span>
                    </div>
                  )}

                  {/* Primary Items List */}
                  <div className="space-y-0.5">
                    {cat.items.map((item) => {
                      const SubIcon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => {
                            onSelectSubItem?.(module, item.title, item.href);
                            onClose();
                          }}
                          className={cn(
                            "group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs transition-colors",
                            isFirstCol
                              ? "text-[var(--neutral-800)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)]"
                              : "text-[var(--neutral-700)] hover:text-[var(--neutral-950)] hover:bg-white"
                          )}
                        >
                          {SubIcon && (
                            <SubIcon
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-colors",
                                isFirstCol
                                  ? "text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)]"
                                  : "text-[var(--neutral-400)] group-hover:text-[var(--neutral-700)]"
                              )}
                            />
                          )}
                          <span className={cn("truncate", isFirstCol ? "font-medium" : "font-normal")}>
                            {item.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Items in this Column (e.g., Other Setup or Payables) */}
                {cat.secondaryItems && cat.secondaryItems.length > 0 && (
                  <div className="pt-2.5 mt-2.5 border-t border-[var(--border-default)] space-y-0.5">
                    {cat.secondaryTitle && (
                      <div className="flex items-center gap-1.5 px-2.5 pb-1 mb-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-400)] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          {cat.secondaryTitle}
                        </span>
                      </div>
                    )}
                    {cat.secondaryItems.map((item) => {
                      const SubIcon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => {
                            onSelectSubItem?.(module, item.title, item.href);
                            onClose();
                          }}
                          className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[var(--neutral-700)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)]/60 transition-colors"
                        >
                          {SubIcon && (
                            <SubIcon className="h-3.5 w-3.5 text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)] shrink-0 transition-colors" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Action Bar (e.g. Quick overview link) */}
        {footerAction && (
          <div className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2.5">
            <Link
              href={footerAction.href}
              onClick={() => {
                onSelectSubItem?.(module, footerAction.title, footerAction.href);
                onClose();
              }}
              className="group flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover,var(--brand-primary))] transition-colors"
            >
              <div className="flex items-center gap-2">
                {footerAction.icon ? (
                  <footerAction.icon className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                ) : null}
                <span>{footerAction.title}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

