"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sliders,
  Layers,
  Building,
  UserCheck,
  Tag,
  Award,
  Calendar,
  AlertTriangle,
  Settings,
  ChevronRight,
  ArrowRight,
  Clock,
  CalendarCheck,
  Coins,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function FeeSetupHubPage() {
  const programWorkflows = [
    {
      title: "Program Total Fee",
      desc: "Define master whole-program total packages across multi-year and semester degree programs (e.g. BCA = NPR 400,000)",
      href: ROUTES.FEES.SETUP.PROGRAM_TOTAL,
      icon: Layers,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Program Annual Fee",
      desc: "Configure year-by-year fee distributions and annual billing splits derived from the program master total",
      href: ROUTES.FEES.SETUP.PROGRAM_ANNUAL,
      icon: Calendar,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Program Semester Fee",
      desc: "Manage semester-wise charging schedules, university exam registrations, and practical lab credit terms",
      href: ROUTES.FEES.SETUP.PROGRAM_SEMESTER,
      icon: Clock,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  const classWorkflows = [
    {
      title: "Class Annual Fee",
      desc: "Standard grade and classroom yearly packages including development, tuition, and term exam allocations",
      href: ROUTES.FEES.SETUP.CLASS_ANNUAL,
      icon: Building,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Class Monthly Fee",
      desc: "Configure recurring monthly tuition rates, lab fees, and automated monthly billing schedules",
      href: ROUTES.FEES.SETUP.CLASS_MONTHLY,
      icon: CalendarCheck,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
  ];

  const studentWorkflows = [
    {
      title: "Student Custom Fee",
      desc: "Individual student fee overrides, institutional grant approvals, and customized billing agreements",
      href: ROUTES.FEES.SETUP.STUDENT_CUSTOM,
      icon: UserCheck,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: "Student Fee Schedule",
      desc: "Define milestone payment installment dates and custom installment amounts for individual agreements",
      href: ROUTES.FEES.SETUP.STUDENT_SCHEDULE,
      icon: Sliders,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
  ];

  const policyWorkflows = [
    {
      title: "Invoice & Receipt Setup",
      desc: "Configure invoice numbering sequence, multi-copy printing (Student + Office copies), and locking rules",
      href: ROUTES.FEES.SETUP.INVOICE_SETUP,
      icon: Settings,
    },
    {
      title: "Invoice Template Designer",
      desc: "Customize document visuals, logo crest, visible student fields, fee columns, and bank payment QR codes",
      href: ROUTES.FEES.SETUP.INVOICE_TEMPLATE,
      icon: Award,
    },
    {
      title: "Miscellaneous Fees",
      desc: "One-off event fees, SEE board registrations, excursion tours, laboratory kits, and TC charges",
      href: ROUTES.FEES.SETUP.ASSIGN_MISC,
      icon: Tag,
    },
    {
      title: "Scholarships & Concessions",
      desc: "Define merit scholarships, sibling discounts, quota concessions, and financial aid policies",
      href: ROUTES.FEES.SETUP.SCHOLARSHIPS,
      icon: Award,
    },
    {
      title: "Installment Plans",
      desc: "Set due dates, billing cycles, semester splits, and automatic invoice schedule generators",
      href: ROUTES.FEES.SETUP.INSTALLMENTS,
      icon: Calendar,
    },
    {
      title: "Fine & Late Fee Rules",
      desc: "Grace period durations, fixed late fee penalties, and percentage interest calculations",
      href: ROUTES.FEES.SETUP.FINES,
      icon: AlertTriangle,
    },
    {
      title: "Payment & Bank Settings",
      desc: "Configure school bank account details, QR code endpoints, and digital payment gateways",
      href: ROUTES.FEES.SETUP.SETTINGS,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Fee Setup Hub
          </span>
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fee Setup & Business Workflows
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage degree program totals, year/semester splits, class-level rates, and individual student fee schedules
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Program & Degree Level Setups */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              1. Degree & Program Level Fee Models
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programWorkflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group p-5 rounded-[8px] bg-white border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2.5 rounded-[6px] border", item.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-[var(--border-light)] flex items-center justify-between text-[11px] text-[var(--brand-primary)] font-semibold">
                    <span>Open Setup</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Class & Grade Level Setups */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
            <Building className="h-4 w-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              2. Class & Grade Level Fee Models
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classWorkflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group p-5 rounded-[8px] bg-white border border-[var(--border-default)] hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2.5 rounded-[6px] border", item.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--neutral-400)] group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-[var(--border-light)] flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                    <span>Open Setup</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 3: Student Individual Customizations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
            <UserCheck className="h-4 w-4 text-rose-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              3. Individual Student Custom Overrides & Schedules
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentWorkflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group p-5 rounded-[8px] bg-white border border-[var(--border-default)] hover:border-rose-600 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2.5 rounded-[6px] border", item.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--neutral-400)] group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-rose-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-[var(--border-light)] flex items-center justify-between text-[11px] text-rose-600 font-semibold">
                    <span>Open Setup</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 4: Policies & Master Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
            <Settings className="h-4 w-4 text-neutral-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              4. Policies, Fines & Master Settings
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {policyWorkflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group p-4 rounded-[6px] bg-white border border-[var(--border-default)] hover:border-neutral-400 transition-all flex items-start gap-3"
                >
                  <div className="p-2 rounded bg-[var(--bg-secondary)] text-neutral-600 group-hover:bg-neutral-100 transition-colors shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-neutral-900 transition-colors">
                        {item.title}
                      </span>
                      <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
