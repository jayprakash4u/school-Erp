"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  Coins,
  CalendarCheck,
  FileSpreadsheet,
  Megaphone,
  Briefcase,
  Sliders,
  LineChart,
  ArrowRight,
  GraduationCap,
  BookOpen,
  DollarSign,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { erpModules } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "new-admission",
    title: "New Admission",
    description: "Register new student profile",
    href: "/students/admission",
    category: "Students",
    icon: UserPlus,
  },
  {
    id: "collect-fee",
    title: "Collect Fee",
    description: "Invoice receipt & payment",
    href: "/fees/collection",
    category: "Finance",
    icon: Coins,
  },
  {
    id: "mark-attendance",
    title: "Student Attendance",
    description: "Daily roll-call & RFID sync",
    href: "/attendance",
    category: "Daily",
    icon: CalendarCheck,
  },
  {
    id: "exam-schedule",
    title: "Exam Schedule",
    description: "Timetable & marks entry",
    href: "/examinations/schedule",
    category: "Academic",
    icon: FileSpreadsheet,
  },
  {
    id: "notice-broadcast",
    title: "Notice Board",
    description: "SMS, Email & WhatsApp alert",
    href: "/communication/notices",
    category: "Broadcast",
    icon: Megaphone,
  },
  {
    id: "staff-directory",
    title: "Staff Directory",
    description: "Teacher records & payroll",
    href: "/staff",
    category: "HR",
    icon: Briefcase,
  },
  {
    id: "master-setup",
    title: "Master Setup",
    description: "Sessions, branches & lookups",
    href: "/master-setup",
    category: "Config",
    icon: Sliders,
  },
  {
    id: "analytics",
    title: "Analytics Hub",
    description: "Performance & revenue trends",
    href: "/analytics",
    category: "Insights",
    icon: LineChart,
  },
];

export function QuickNavigation() {
  const { toast } = useToast();
  const [filterQuery, setFilterQuery] = React.useState("");

  // Extract all sub-operations across all modules for live filtering
  const allNavShortcuts = React.useMemo(() => {
    const list: {
      moduleTitle: string;
      title: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }[] = [];

    erpModules.forEach((mod) => {
      mod.categories?.forEach((cat) => {
        cat.items.forEach((item) => {
          list.push({
            moduleTitle: mod.title,
            title: item.title,
            href: item.href,
            icon: item.icon || mod.icon,
          });
        });
      });
    });

    return list;
  }, []);

  const filteredShortcuts = React.useMemo(() => {
    if (!filterQuery.trim()) return [];
    const q = filterQuery.toLowerCase();
    return allNavShortcuts.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.moduleTitle.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [allNavShortcuts, filterQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Quick Actions Bar / Primary Launcher */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Quick Menu Launcher
            </h2>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
            Frequent Daily Operations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {PRIMARY_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className="group flex flex-col p-3 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--red-50)]/30 transition-all duration-150 shadow-2xs select-none"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-1.5 rounded-[4px] bg-[var(--bg-secondary)] text-[var(--brand-primary)] group-hover:bg-[var(--red-50)] transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)]">
                    {action.category}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors truncate block">
                    {action.title}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] truncate block">
                    {action.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. Categorized Quick Navigation Hub */}
      <section className="space-y-4">
        {/* Navigation Section Header with Live Filter Input */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Quick Navigation Hub
            </h2>
          </div>

          {/* Quick Search Shortcut Filter */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search shortcut (e.g. fee, admission, tc, marks)..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
        </div>

        {/* Live Filter Search Results (if user is typing) */}
        {filterQuery.trim() !== "" && (
          <div className="p-4 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--brand-primary)]/40 shadow-sm space-y-2.5 animate-in fade-in-0 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>Matching Shortcuts for &quot;{filterQuery}&quot;</span>
              <span className="text-[11px] text-[var(--brand-primary)] font-bold">
                {filteredShortcuts.length} results
              </span>
            </div>

            {filteredShortcuts.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-2">
                No matching navigation shortcuts found. Try searching for terms like &quot;student&quot;, &quot;fee&quot;, &quot;exam&quot;, or &quot;attendance&quot;.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {filteredShortcuts.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={idx}
                      href={s.href}
                      className="flex items-center justify-between p-2 rounded-[4px] bg-[var(--bg-secondary)] hover:bg-[var(--red-50)] text-xs text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors group border border-[var(--border-default)] hover:border-[var(--red-200)]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0" />
                        <span className="truncate font-medium">{s.title}</span>
                      </div>
                      <span className="text-[9px] text-[var(--text-tertiary)] shrink-0 ml-1">
                        {s.moduleTitle}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4 Standard Domain Pillars (Line Divided Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Pillar 1: Academic Management */}
          <div className="rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-2xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-bold text-[var(--text-primary)]">
                  Academic Management
                </h3>
              </div>
              <Link
                href="/academics"
                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
              >
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-3 divide-y divide-[var(--border-light)] flex-1 text-xs">
              <Link href="/academics/classes" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Classes & Sections</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/academics/subjects" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Subjects & Syllabus</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/academics/timetable" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Class Timetable</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/examinations/schedule" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Examination Schedule</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/examinations/marks" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Marks Entry Portal</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/examinations/report-cards" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Report Cards & Grading</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Students & Life */}
          <div className="rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-2xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-bold text-[var(--text-primary)]">
                  Student & Campus Life
                </h3>
              </div>
              <Link
                href="/students"
                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
              >
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-3 divide-y divide-[var(--border-light)] flex-1 text-xs">
              <Link href="/students" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Student Directory</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/students/admission" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Admission Registration</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/students/attendance" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Daily Attendance Logs</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/library/issue-return" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Library Circulation</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/transport/routes" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Transport Routes & Fleet</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/hostel/rooms" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Hostel & Bed Allocation</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Finance & Billing */}
          <div className="rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-2xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-bold text-[var(--text-primary)]">
                  Finance & Accounts
                </h3>
              </div>
              <Link
                href="/fees"
                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
              >
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-3 divide-y divide-[var(--border-light)] flex-1 text-xs">
              <Link href="/fees/collection" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Fee Collection Counter</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/fees/structure" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Fee Structure & Heads</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/fees/due-list" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Student Due List</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/fees/invoices" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Invoice Receipts Archive</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/fees/discounts" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Scholarships & Concessions</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/fees/reports" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Financial Ledger Reports</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
            </div>
          </div>

          {/* Pillar 4: Administration & Setup */}
          <div className="rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-2xs overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-bold text-[var(--text-primary)]">
                  Administration & Control
                </h3>
              </div>
              <Link
                href="/settings"
                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
              >
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-3 divide-y divide-[var(--border-light)] flex-1 text-xs">
              <Link href="/staff" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>HR & Staff Directory</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/staff/payroll" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Staff Payroll & Salary Slips</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/master-setup" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>System Master Setup</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/settings/roles-permissions" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Roles & RBAC Permissions</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/communication/notices" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>SMS & Notice Broadcast</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
              <Link href="/settings/audit-logs" className="flex items-center justify-between py-2 px-1 text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] rounded transition-colors">
                <span>Audit Logs & Security</span>
                <ArrowRight className="h-3 w-3 text-[var(--neutral-400)]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
