"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Coins,
  UserPlus,
  ArrowRight,
  ArrowLeftRight,
  CalendarCheck,
  FileSpreadsheet,
  Sliders,
  AlertCircle,
  FileText,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickPill {
  title: string;
  href: string;
  className: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const QUICK_PILLS: QuickPill[] = [
  { title: "Collect Fee", href: "/fees/collection", className: "bg-[var(--brand-primary)] hover:bg-red-700 text-white", icon: Coins },
  { title: "New Admission", href: "/students/admission", className: "bg-[var(--brand-secondary)] hover:bg-black text-white", icon: UserPlus },
  { title: "Upgrade Class", href: "/students/upgrade-class", className: "bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-200)] hover:bg-[var(--red-100)]", icon: ArrowRight },
  { title: "Change Section", href: "/students/change-section", className: "bg-white text-[var(--neutral-800)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]", icon: ArrowLeftRight },
  { title: "Attendance", href: "/attendance", icon: CalendarCheck, className: "bg-white text-[var(--neutral-800)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]" },
  { title: "Exam Schedule", href: "/examinations/schedule", className: "bg-white text-[var(--neutral-800)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]" },
  { title: "Marks Entry", href: "/examinations/marks", icon: FileSpreadsheet, className: "bg-white text-[var(--neutral-800)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]" },
  { title: "Due List", href: "/fees/due-list", icon: AlertCircle, className: "bg-[var(--yellow-50)] text-[var(--yellow-900)] border border-[var(--yellow-300)] hover:bg-[var(--yellow-100)]" },
  { title: "Master Setup", href: "/master-setup", icon: Sliders, className: "bg-[var(--neutral-100)] text-[var(--neutral-800)] border border-[var(--border-default)] hover:bg-[var(--neutral-200)]" },
  { title: "ID Cards", href: "/documents/id-cards", icon: CreditCard, className: "bg-white text-[var(--neutral-800)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]" },
  { title: "Reports", href: "/reports", icon: FileText, className: "bg-white text-[var(--neutral-800)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]" },
];

export function QuickPillNavigation() {
  return (
    <div className="rounded-[6px] border border-[var(--border-default)] bg-white shadow-xs p-4 space-y-3">
      {/* Header with + icon in brand primary color */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Quick Navigation
        </h3>
        <Link
          href="/master-setup"
          title="Customize navigation"
          className="h-6 w-6 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white flex items-center justify-center shadow-2xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Pill buttons in clean ERP brand palette */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PILLS.map((pill) => {
          const Icon = pill.icon;
          return (
            <Link
              key={pill.title}
              href={pill.href}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold transition-all shadow-2xs select-none",
                pill.className
              )}
            >
              {Icon && <Icon className="h-3 w-3 shrink-0" />}
              <span>{pill.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
