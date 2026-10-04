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

  const col1Category = module.categories[0];
  const col2Category = module.categories[1];
  const col1Items = col1Category?.items || [];
  const col2Items = col2Category?.items || [];
  const hasTwoCols = col2Items.length > 0;
  const footerAction = module.footerAction;

  return (
    <div
      className={cn(
        "absolute top-full z-50 pt-2",
        className
      )}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      {/* Invisible hover bridge to prevent premature mouseleave */}
      <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

      {/* Main Submenu Modal Container - Single or Dual Column */}
      <div
        className={cn(
          "relative rounded-[8px] bg-white border border-[var(--border-default)] shadow-2xl overflow-hidden text-[var(--text-primary)] select-none animate-in fade-in-0 zoom-in-98 duration-150",
          hasTwoCols ? "w-[560px] max-w-[95vw]" : "w-[240px]"
        )}
      >
        {/* Top Triangular Caret Arrow */}
        <div
          className="absolute -top-[5.5px] w-2.5 h-2.5 bg-white border-t border-l border-[var(--border-default)] rotate-45 z-30"
          style={{ left: `${Math.max(8, Math.min(92, caretLeftPercent))}%` }}
        />

        {/* Submenu Layout */}
        {hasTwoCols ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 relative z-20">
            {/* Column 1 - Operations (Primary / Prominent) */}
            <div className="p-3 sm:p-4 space-y-1 bg-white flex flex-col justify-between">
              <div>
                {col1Category?.title && (
                  <div className="flex items-center gap-1.5 px-2.5 pb-2 mb-1 border-b border-[var(--border-default)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      {col1Category.title}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {col1Items.map((item) => {
                    const SubIcon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => {
                          onSelectSubItem?.(module, item.title, item.href);
                          onClose();
                        }}
                        className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-[var(--neutral-800)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
                      >
                        {SubIcon && (
                          <SubIcon className="h-3.5 w-3.5 text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)] shrink-0 transition-colors" />
                        )}
                        <span className="truncate font-medium">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Column 1 Secondary Items (e.g. Financial Reports) */}
              {col1Category?.secondaryItems && col1Category.secondaryItems.length > 0 && (
                <div className="pt-2 mt-2 border-t border-[var(--border-default)] space-y-0.5">
                  {col1Category.secondaryTitle && (
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2.5 pb-1">
                      {col1Category.secondaryTitle}
                    </div>
                  )}
                  {col1Category.secondaryItems.map((item) => {
                    const SubIcon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => {
                          onSelectSubItem?.(module, item.title, item.href);
                          onClose();
                        }}
                        className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
                      >
                        {SubIcon && (
                          <SubIcon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 transition-colors" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2 - Setup / Configuration (Visually Quieter & Secondary) */}
            <div className="p-3 sm:p-4 space-y-1 bg-[var(--neutral-50)]/50 sm:border-l sm:border-[var(--border-light)] flex flex-col justify-between">
              <div>
                {col2Category?.title && (
                  <div className="flex items-center gap-1.5 px-2.5 pb-2 mb-1 border-b border-[var(--border-default)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-400)] shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      {col2Category.title}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {col2Items.map((item) => {
                    const SubIcon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => {
                          onSelectSubItem?.(module, item.title, item.href);
                          onClose();
                        }}
                        className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-white transition-colors"
                      >
                        {SubIcon && (
                          <SubIcon className="h-3.5 w-3.5 text-[var(--neutral-400)] group-hover:text-[var(--neutral-700)] shrink-0 transition-colors" />
                        )}
                        <span className="truncate font-normal">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Column 2 Secondary Items (e.g. Miscellaneous Fees, Installment Plans, Fines, Settings) */}
              {col2Category?.secondaryItems && col2Category.secondaryItems.length > 0 && (
                <div className="pt-2 mt-2 border-t border-[var(--border-default)] space-y-0.5">
                  {col2Category.secondaryTitle && (
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2.5 pb-1">
                      {col2Category.secondaryTitle}
                    </div>
                  )}
                  {col2Category.secondaryItems.map((item) => {
                    const SubIcon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => {
                          onSelectSubItem?.(module, item.title, item.href);
                          onClose();
                        }}
                        className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-white transition-colors"
                      >
                        {SubIcon && (
                          <SubIcon className="h-3.5 w-3.5 text-[var(--neutral-400)] group-hover:text-[var(--neutral-700)] shrink-0 transition-colors" />
                        )}
                        <span className="truncate font-normal">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single Column Layout */
          <div className="p-3 space-y-1 relative z-20">
            {col1Category?.title && (
              <div className="flex items-center gap-1.5 px-2.5 pb-2 mb-1 border-b border-[var(--border-default)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {col1Category.title}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {col1Items.map((item) => {
                const SubIcon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => {
                      onSelectSubItem?.(module, item.title, item.href);
                      onClose();
                    }}
                    className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-[var(--neutral-800)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
                  >
                    {SubIcon && (
                      <SubIcon className="h-3.5 w-3.5 text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)] shrink-0 transition-colors" />
                    )}
                    <span className="truncate font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Action Bar (Separated Financial Reports / Overview) */}
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

