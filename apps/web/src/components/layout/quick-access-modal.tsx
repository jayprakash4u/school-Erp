"use client";

import * as React from "react";
import Link from "next/link";
import {
  Zap,
  X,
  Home,
  UserPlus,
  Users,
  CalendarCheck,
  Building,
  BookOpen,
  Clock,
  FileCheck,
  History,
  CreditCard,
  Coins,
  Sliders,
  AlertCircle,
  FilePlus,
  Percent,
  PieChart,
  RotateCcw,
  AlertTriangle,
  Calendar,
  FileSpreadsheet,
  Award,
  Megaphone,
  Briefcase,
  DollarSign,
  BookMarked,
  Bus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface QuickAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface QuickAccessItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COLUMN_1_STUDENT_ITEMS: QuickAccessItem[] = [
  { title: "New Admission", href: "/students/admission", icon: UserPlus },
  { title: "Student Directory", href: "/students", icon: Users },
  { title: "Student Attendance", href: "/attendance", icon: CalendarCheck },
  { title: "Classes & Sections", href: "/academics/classes", icon: Building },
  { title: "Subjects & Syllabus", href: "/academics/subjects", icon: BookOpen },
  { title: "Class Timetable", href: "/academics/timetable", icon: Clock },
  { title: "Transfer Certificate (TC)", href: "/students/tc", icon: FileCheck },
  { title: "Student History", href: "/students/history", icon: History },
  { title: "ID Card Generation", href: "/documents/id-cards", icon: CreditCard },
];

const COLUMN_2_FINANCE_ITEMS: QuickAccessItem[] = [
  { title: "Fee Collection", href: "/fees/collection", icon: Coins },
  { title: "Fee Structure", href: "/fees/structure", icon: Sliders },
  { title: "Online Payment Portal", href: "/fees/online-payment", icon: CreditCard },
  { title: "Payment Due List", href: "/fees/due-list", icon: AlertCircle },
  { title: "Receipt Generation", href: "/fees/invoices", icon: FilePlus },
  { title: "Scholarships & Concessions", href: "/fees/discounts", icon: Percent },
  { title: "Financial Ledger Summary", href: "/fees/reports", icon: PieChart },
  { title: "Refunds & Adjustments", href: "/fees/refunds", icon: RotateCcw },
  { title: "Fine Management", href: "/fees/fines", icon: AlertTriangle },
];

const COLUMN_3_ADMIN_ITEMS: QuickAccessItem[] = [
  { title: "Exam Schedule", href: "/examinations/schedule", icon: Calendar },
  { title: "Marks Entry Portal", href: "/examinations/marks", icon: FileSpreadsheet },
  { title: "Report Cards Generator", href: "/examinations/report-cards", icon: Award },
  { title: "Notice & SMS Broadcast", href: "/communication/notices", icon: Megaphone },
  { title: "Staff & Teacher Directory", href: "/staff", icon: Briefcase },
  { title: "Staff Payroll & Salaries", href: "/staff/payroll", icon: DollarSign },
  { title: "Library Issue / Return", href: "/library/issue-return", icon: BookMarked },
  { title: "Transport Routes", href: "/transport/routes", icon: Bus },
  { title: "System Master Setup", href: "/master-setup", icon: Sliders },
];

export function QuickAccessModal({ isOpen, onClose, className }: QuickAccessModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={cn(
        "absolute right-0 top-full mt-2 z-50 w-[720px] max-w-[95vw] rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-98 duration-150 select-none",
        className
      )}
    >
      {/* 1. Modal Top Banner Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--brand-secondary)] text-white border-b border-[var(--neutral-800)]">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--brand-accent)] fill-[var(--brand-accent)]" />
          <span className="text-xs font-bold tracking-tight uppercase">
            Quick Access Menu
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick access menu"
          className="p-1 rounded-[4px] text-[var(--neutral-400)] hover:text-white hover:bg-[var(--neutral-800)] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. 3-Column Parallel Actions Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-default)]">
        {/* Column 1: Student & Academic */}
        <div className="space-y-0.5 md:pr-3 pb-3 md:pb-0">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            Student & Academic
          </div>
          {COLUMN_1_STUDENT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 transition-colors" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Column 2: Finance & Accounts */}
        <div className="space-y-0.5 md:px-3 py-3 md:py-0">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            Finance & Accounts
          </div>
          {COLUMN_2_FINANCE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 transition-colors" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Column 3: Exams, HR & Setup */}
        <div className="space-y-0.5 md:pl-3 pt-3 md:pt-0">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            Exams, HR & Setup
          </div>
          {COLUMN_3_ADMIN_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 transition-colors" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Modal Bottom Footer Bar */}
      <div className="flex items-center justify-center py-2.5 bg-[var(--bg-secondary)] border-t border-[var(--border-default)]">
        <Link
          href={ROUTES.DASHBOARD}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
