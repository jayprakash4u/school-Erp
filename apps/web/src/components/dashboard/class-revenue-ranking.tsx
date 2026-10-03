"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassRevenueItem {
  rank: number;
  className: string;
  amount: string;
  href: string;
}

const CLASS_REVENUE_DATA: ClassRevenueItem[] = [
  { rank: 1, className: "Grade 10 (Secondary)", amount: "NPR 345,000", href: "/fees/collection?class=10" },
  { rank: 2, className: "Grade 9 (Secondary)", amount: "NPR 310,000", href: "/fees/collection?class=9" },
  { rank: 3, className: "Grade 11 (+2 Science)", amount: "NPR 290,000", href: "/fees/collection?class=11" },
  { rank: 4, className: "Grade 12 (+2 Mgmt)", amount: "NPR 275,000", href: "/fees/collection?class=12" },
  { rank: 5, className: "Grade 8 (Lower Sec)", amount: "NPR 240,000", href: "/fees/collection?class=8" },
  { rank: 6, className: "Grade 7 (Lower Sec)", amount: "NPR 210,000", href: "/fees/collection?class=7" },
  { rank: 7, className: "Primary Wing (Grades 1-5)", amount: "NPR 475,000", href: "/fees/collection?level=primary" },
];

export function ClassRevenueRanking() {
  return (
    <div className="rounded-[6px] border border-[var(--border-default)] bg-white shadow-xs overflow-hidden">
      {/* Card Header matching ERP Brand Design */}
      <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Class Revenue
        </h3>
        <Link
          href="/fees/reports"
          className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
        >
          <span>All Classes</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Numbered Rows with Brand Primary Red Badges */}
      <div className="divide-y divide-[var(--border-light)] text-xs">
        {CLASS_REVENUE_DATA.map((item) => (
          <Link
            key={item.rank}
            href={item.href}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--neutral-50)] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Brand Red Solid Number Badge */}
              <div className="h-5 w-5 rounded-[3px] bg-[var(--brand-primary)] text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                {item.rank}
              </div>
              <span className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--brand-primary)] transition-colors">
                {item.className}
              </span>
            </div>

            <span className="font-mono font-bold text-[var(--neutral-800)] text-right shrink-0">
              {item.amount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
