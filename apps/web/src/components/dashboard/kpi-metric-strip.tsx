"use client";

import * as React from "react";
import {
  GraduationCap,
  Users,
  Coins,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KpiCardItem {
  id: string;
  label: string;
  value: string;
  subText: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const KPI_CARDS: KpiCardItem[] = [
  {
    id: "total-students",
    label: "Total Students",
    value: "1,566",
    subText: "+24 new admissions",
    icon: GraduationCap,
    href: "/students",
  },
  {
    id: "total-staff",
    label: "Total Staff",
    value: "94",
    subText: "88 on duty today",
    icon: Users,
    href: "/staff",
  },
  {
    id: "fee-collected",
    label: "Fee Collected",
    value: "NPR 1,620,000",
    subText: "87.8% recovery rate",
    icon: Coins,
    href: "/fees/collection",
  },
  {
    id: "pending-fee",
    label: "Pending Fee",
    value: "NPR 225,000",
    subText: "27 students with dues",
    icon: AlertCircle,
    href: "/fees/due-list",
  },
];

export function KpiMetricStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {KPI_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            href={card.href}
            className="group rounded-[6px] border border-[var(--border-default)] bg-white px-3.5 py-3 shadow-2xs hover:shadow-xs hover:border-[var(--brand-primary)]/40 transition-all duration-150 flex items-center justify-between gap-3 select-none"
          >
            {/* Left: Info & Numbers */}
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] font-semibold text-[var(--neutral-500)] group-hover:text-[var(--neutral-800)] transition-colors truncate">
                {card.label}
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-tight truncate">
                {card.value}
              </div>
              <div className="text-[10px] text-[var(--neutral-400)] truncate">
                {card.subText}
              </div>
            </div>

            {/* Right: Compact Icon Tile */}
            <div className="h-9 w-9 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)] flex items-center justify-center shrink-0 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors duration-150 shadow-2xs">
              <Icon className="h-4 w-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
