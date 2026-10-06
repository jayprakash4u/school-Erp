"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserPlus,
  Users,
  CalendarCheck,
  Building,
  Building2,
  BookOpen,
  Clock,
  FileCheck,
  CreditCard,
  Coins,
  Sliders,
  AlertCircle,
  FilePlus,
  Percent,
  PieChart,
  Calendar,
  FileSpreadsheet,
  Award,
  Briefcase,
  DollarSign,
  BookMarked,
  ArrowRight,
  ArrowLeftRight,
  Layers,
  Tag,
  Settings,
  MapPin,
  Home,
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

interface QuickAccessColumn {
  title: string;
  items: QuickAccessItem[];
}

const QUICK_MENU_COLUMNS: QuickAccessColumn[] = [
  {
    title: "Students",
    items: [
      { title: "Student Registration", href: "/students/admission", icon: UserPlus },
      { title: "Our Students", href: "/students", icon: Users },
      { title: "Upgrade Class", href: "/students/upgrade-class", icon: ArrowRight },
      { title: "Change Section", href: "/students/change-section", icon: ArrowLeftRight },
      { title: "Student Attendance", href: "/attendance", icon: CalendarCheck },
      { title: "Transfer Certificate", href: "/documents", icon: FileCheck },
      { title: "ID Card Generation", href: "/documents/id-cards", icon: CreditCard },
    ],
  },
  {
    title: "Fee & Accounts",
    items: [
      { title: "Fee Collection", href: "/fees/collection", icon: Coins },
      { title: "Fee Structure", href: "/fees/structure", icon: Sliders },
      { title: "Student Due List", href: "/fees/due-list", icon: AlertCircle },
      { title: "Receipts & Invoices", href: "/fees/invoices", icon: FilePlus },
      { title: "Scholarships", href: "/fees/discounts", icon: Percent },
      { title: "Online Payment", href: "/fees/online-payment", icon: CreditCard },
      { title: "Financial Reports", href: "/fees/reports", icon: PieChart },
    ],
  },
  {
    title: "Academics & Exams",
    items: [
      { title: "Classes & Sections", href: "/academics/classes", icon: Building },
      { title: "Subjects & Syllabus", href: "/academics/subjects", icon: BookOpen },
      { title: "Class Timetable", href: "/academics/timetable", icon: Clock },
      { title: "Exam Schedule", href: "/examinations/schedule", icon: Calendar },
      { title: "Marks Entry", href: "/examinations/marks", icon: FileSpreadsheet },
      { title: "Report Cards", href: "/examinations/report-cards", icon: Award },
      { title: "Library Issue / Return", href: "/library/issue-return", icon: BookMarked },
    ],
  },
  {
    title: "Master Setup & HR",
    items: [
      { title: "General Setup", href: "/master-setup/general", icon: Settings },
      { title: "Class Setup", href: "/master-setup/classes", icon: Building },
      { title: "Department Setup", href: "/master-setup/departments", icon: Building2 },
      { title: "Designation Setup", href: "/master-setup/designations", icon: Award },
      { title: "Subject Mapping", href: "/master-setup/subject-mapping", icon: Layers },
      { title: "Document Numbering", href: "/master-setup/document-numbering", icon: Tag },
      { title: "Batches", href: "/master-setup/batches", icon: Calendar },
      { title: "Location", href: "/master-setup/locations", icon: MapPin },
      { title: "Staff Payroll", href: "/staff/payroll", icon: DollarSign },
    ],
  },
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
        "absolute right-0 top-full mt-2 z-50 pt-1 select-none animate-in fade-in-0 zoom-in-98 duration-150",
        className
      )}
    >
      {/* Invisible hover bridge */}
      <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

      {/* Main Container matching menusub option modal style */}
      <div className="relative w-[760px] max-w-[95vw] rounded-[6px] bg-white border border-[var(--border-default)] shadow-2xl p-4 sm:p-5 text-[var(--text-primary)]">
        {/* Top Caret Arrow pointing to the Quick Menu button */}
        <div className="absolute right-6 -top-[5.5px] w-2.5 h-2.5 bg-white border-t border-l border-[var(--border-default)] rotate-45 z-30" />

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
          {QUICK_MENU_COLUMNS.map((column, colIdx) => (
            <div
              key={column.title}
              className={cn(
                "space-y-0.5",
                colIdx > 0 && "sm:border-l sm:border-[var(--border-light)] sm:pl-3"
              )}
            >
              {/* Column Title */}
              <div className="px-2 pb-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-500)] border-b border-[var(--border-light)]">
                {column.title}
              </div>

              {/* Column Items */}
              {column.items.map((item) => {
                const SubIcon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onClose}
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
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--neutral-500)] relative z-20">
          <span className="text-[11px]">Quick access to common operations</span>
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
    </div>
  );
}


