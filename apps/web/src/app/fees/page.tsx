"use client";

import * as React from "react";
import Link from "next/link";
import {
  Coins,
  Receipt,
  FilePlus,
  Grid,
  History,
  AlertCircle,
  CreditCard,
  RotateCcw,
  Percent,
  FileText,
  Layers,
  Building,
  UserCheck,
  Tag,
  Award,
  Sliders,
  Calendar,
  AlertTriangle,
  Settings,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function FeesOverviewPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-sm">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fees & Finance
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Central hub for student billing, cashier collections, installment schedules, and financial reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.COLLECTION}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover,var(--brand-primary))] shadow-xs transition-colors"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Collect Fee</span>
            </Link>
            <Link
              href={ROUTES.FEES.SETUP.ASSIGN}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-white border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--neutral-50)] shadow-xs transition-colors"
            >
              <Layers className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>Assign Fee</span>
            </Link>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Collection (This Month)
              </span>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                NPR 1,845,200
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" /> +12.4% vs last month
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Outstanding Due
              </span>
              <p className="text-xl font-bold text-amber-600">
                NPR 412,850
              </p>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                48 students overdue
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Scholarships & Concessions
              </span>
              <p className="text-xl font-bold text-indigo-600">
                NPR 285,000
              </p>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                32 recipients active
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Invoices Issued
              </span>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                1,420
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> 94% collection rate
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 2-Column Split: Fee Management (Operations) VS Fee Setup (Configuration) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Fee Management */}
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Fee Management
                </h2>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                Day-to-day Operations
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Fee Collection", desc: "Cashier payment counter & receipting", href: ROUTES.FEES.COLLECTION, icon: Receipt },
                { title: "Fee Dues", desc: "Student account dues & inquiry", href: ROUTES.FEES.DUE_LIST, icon: AlertCircle },
                { title: "Invoices & Receipts", desc: "Batch billing & payment receipts", href: ROUTES.FEES.INVOICES, icon: FileText },
                { title: "Student Ledger", desc: "Complete debit/credit transaction history", href: ROUTES.FEES.LEDGER, icon: Grid },
                { title: "Payment History", desc: "Filter and reprint past transactions", href: ROUTES.FEES.HISTORY, icon: History },
                { title: "Online Payments", desc: "eSewa, Khalti & bank sync", href: ROUTES.FEES.ONLINE_PAYMENT, icon: CreditCard },
                { title: "Refunds & Adjustments", desc: "Fee reversals & credit notes", href: ROUTES.FEES.REFUNDS, icon: RotateCcw },
                { title: "Scholarships & Concessions", desc: "Merit aid & student waivers", href: ROUTES.FEES.SETUP.SCHOLARSHIPS, icon: Percent },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group p-3 rounded-[6px] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-all flex items-start gap-3"
                  >
                    <div className="p-2 rounded-[4px] bg-[var(--bg-secondary)] text-[var(--brand-primary)] group-hover:bg-white transition-colors shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors truncate">
                          {item.title}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[var(--neutral-400)] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 2: Fee Setup */}
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--neutral-500)]" />
                <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Fee Setup
                </h2>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                Master Configuration
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Fee Structure", desc: "Master fee heads & package slabs", href: ROUTES.FEES.STRUCTURE, icon: Sliders },
                { title: "Fee Assignment", desc: "Map fees to programs, classes, or students", href: ROUTES.FEES.SETUP.ASSIGN, icon: Layers },
                { title: "Miscellaneous Fees", desc: "Exams, sports & one-off event fees", href: ROUTES.FEES.SETUP.ASSIGN_MISC, icon: Tag },
                { title: "Installment Plans", desc: "Quarterly, trimester & monthly schedules", href: ROUTES.FEES.SETUP.INSTALLMENTS, icon: Calendar },
                { title: "Fine & Late Fee Rules", desc: "Grace periods & penalty slabs", href: ROUTES.FEES.SETUP.FINES, icon: AlertTriangle },
                { title: "Payment Settings", desc: "Bank accounts & digital payment keys", href: ROUTES.FEES.SETUP.SETTINGS, icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group p-3 rounded-[6px] border border-[var(--border-default)] hover:border-[var(--neutral-400)] hover:bg-[var(--neutral-50)] transition-all flex items-start gap-3"
                  >
                    <div className="p-2 rounded-[4px] bg-[var(--bg-secondary)] text-[var(--neutral-600)] group-hover:bg-white transition-colors shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--neutral-900)] transition-colors truncate">
                          {item.title}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[var(--neutral-400)] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Financial Reports Link Banner */}
        <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[6px] bg-rose-50 text-[var(--brand-primary)] border border-rose-100">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">
                Financial Reports & Audit Summary
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Comprehensive collection audits, outstanding dues matrix, daily cashier closure sheets, and ledger reconciliations
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.FEES.REPORTS}
            className="px-4 py-2 rounded-[4px] bg-[var(--bg-secondary)] hover:bg-[var(--neutral-100)] text-xs font-bold text-[var(--brand-primary)] flex items-center gap-1.5 transition-colors"
          >
            <span>View Financial Reports</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
