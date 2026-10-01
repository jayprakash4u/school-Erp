"use client";

import * as React from "react";
import Link from "next/link";
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

  const col1Items = module.categories[0]?.items || [];
  const col2Items = module.categories[1]?.items || [];

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

      {/* Main Submenu Modal Container */}
      <div className="relative w-[480px] max-w-[95vw] rounded-[6px] bg-white border border-[var(--border-default)] shadow-2xl p-4 sm:p-5 text-[var(--text-primary)] select-none animate-in fade-in-0 zoom-in-98 duration-150">
        {/* Top Triangular Caret Arrow */}
        <div
          className="absolute -top-[5.5px] w-2.5 h-2.5 bg-white border-t border-l border-[var(--border-default)] rotate-45 z-30"
          style={{ left: `${Math.max(8, Math.min(92, caretLeftPercent))}%` }}
        />

        {/* 2-Column Submenu Layout without header name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 relative z-20">
          {/* Column 1 */}
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
                    <SubIcon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 transition-colors" />
                  )}
                  <span className="truncate font-normal">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-0.5 sm:border-l sm:border-[var(--border-light)] sm:pl-3">
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
                  className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs text-[var(--neutral-800)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
                >
                  {SubIcon && (
                    <SubIcon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 transition-colors" />
                  )}
                  <span className="truncate font-normal">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
