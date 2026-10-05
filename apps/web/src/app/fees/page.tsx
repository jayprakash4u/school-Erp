"use client";

import * as React from "react";
import Link from "next/link";
import {
  Coins,
  Receipt,
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
  Sliders,
  Calendar,
  AlertTriangle,
  Settings,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Wallet,
  CheckCircle2,
  CheckSquare,
  BookOpen,
  Users,
  FileSignature,
  Building2,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

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
                Integrated institutional platform for school fee collection, fee configuration, and double-entry accounting
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
              href={ROUTES.FEES.COUNTER_CLOSING}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-white border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--neutral-50)] shadow-xs transition-colors"
            >
              <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Counter Closing</span>
            </Link>
            <Link
              href={ROUTES.FEES.ACCOUNTS.EXPENSES}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-white border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--neutral-50)] shadow-xs transition-colors"
            >
              <DollarSign className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>Record Expense</span>
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
                ₹18,45,200
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
                ₹4,12,850
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
                Operating Expenses (MTD)
              </span>
              <p className="text-xl font-bold text-rose-600">
                ₹6,25,000
              </p>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                Across 7 expense heads
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Bank & Cash Liquidity
              </span>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                ₹48,50,000
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Reconciled with GL
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 3-Column Section Architecture matching the Mega Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Billing & Collection */}
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                  <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Billing & Collection
                  </h2>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] font-semibold">
                  Counter Operations
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                {[
                  { title: "Fee Collection", desc: "Cashier payment counter & instant receipting", href: ROUTES.FEES.COLLECTION, icon: Receipt },
                  { title: "Fee Dues & Inquiry", desc: "Student account dues, fines & inquiry", href: ROUTES.FEES.DUE_LIST, icon: AlertCircle },
                  { title: "Invoices & Receipts", desc: "Batch billing & payment receipts list", href: ROUTES.FEES.INVOICES, icon: FileText },
                  { title: "Payment History", desc: "Filter, search and reprint transactions", href: ROUTES.FEES.HISTORY, icon: History },
                  { title: "Online Payments", desc: "UPI, gateway & digital bank sync", href: ROUTES.FEES.ONLINE_PAYMENT, icon: CreditCard },
                  { title: "Refunds & Adjustments", desc: "Fee reversals & credit notes", href: ROUTES.FEES.REFUNDS, icon: RotateCcw },
                  { title: "Scholarships & Concessions", desc: "Merit aid & sibling fee waivers", href: ROUTES.FEES.SETUP.SCHOLARSHIPS, icon: Percent },
                  { title: "Counter Closing", desc: "Cashier shift closing & currency tally", href: ROUTES.FEES.COUNTER_CLOSING, icon: CheckSquare },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group p-2.5 rounded-[6px] border border-[var(--border-light)] hover:border-[var(--brand-primary)] hover:bg-[var(--neutral-50)] transition-all flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded bg-[var(--bg-secondary)] text-[var(--brand-primary)] group-hover:bg-white transition-colors shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors truncate">
                            {item.title}
                          </span>
                          <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Fee Configuration */}
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Fee Configuration
                  </h2>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] font-semibold">
                  Fee Structures
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                {[
                  { title: "Fee Structures", desc: "Master fee heads & package slabs", href: ROUTES.FEES.STRUCTURE, icon: Sliders },
                  { title: "Program Fee Setup", desc: "Total, annual & semester fee setup", href: ROUTES.FEES.SETUP.PROGRAM_FEE, icon: Layers },
                  { title: "Class Fee Setup", desc: "Grade-wise annual & monthly fees", href: ROUTES.FEES.SETUP.CLASS_FEE, icon: Building },
                  { title: "Student Custom Fee", desc: "Individual exceptions & special concessions", href: ROUTES.FEES.SETUP.STUDENT_CUSTOM, icon: UserCheck },
                  { title: "Student Fee Schedule", desc: "Term-wise scheduled collection dates", href: ROUTES.FEES.SETUP.STUDENT_SCHEDULE, icon: Calendar },
                  { title: "Miscellaneous Fees", desc: "Exams, sports, library & one-off charges", href: ROUTES.FEES.SETUP.ASSIGN_MISC, icon: Tag },
                  { title: "Installment Plans", desc: "Quarterly, bi-monthly & monthly plans", href: ROUTES.FEES.SETUP.INSTALLMENTS, icon: Calendar },
                  { title: "Fine & Late Fee Rules", desc: "Grace periods & penalty slabs", href: ROUTES.FEES.SETUP.FINES, icon: AlertTriangle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group p-2.5 rounded-[6px] border border-[var(--border-light)] hover:border-amber-500 hover:bg-[var(--neutral-50)] transition-all flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded bg-[var(--bg-secondary)] text-amber-700 group-hover:bg-white transition-colors shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-amber-800 transition-colors truncate">
                            {item.title}
                          </span>
                          <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Accounts & Finance */}
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Accounts & Finance
                  </h2>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] font-semibold">
                  Institutional Ledger
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                {[
                  { title: "Chart of Accounts", desc: "Assets, Liabilities, Equity, Income, Expenses", href: ROUTES.FEES.ACCOUNTS.CHART_OF_ACCOUNTS, icon: Grid },
                  { title: "General Ledger", desc: "Double-entry accounting journal & trail", href: ROUTES.FEES.ACCOUNTS.GENERAL_LEDGER, icon: BookOpen },
                  { title: "Party Ledgers", desc: "Student, Employee, Supplier, Other ledgers", href: ROUTES.FEES.ACCOUNTS.PARTY_LEDGERS, icon: Users },
                  { title: "Journal Entries", desc: "Manual adjustment vouchers (Debit = Credit)", href: ROUTES.FEES.ACCOUNTS.JOURNAL_ENTRIES, icon: FileSignature },
                  { title: "Cash & Bank Books", desc: "Counter cash, bank registers & BRS", href: ROUTES.FEES.ACCOUNTS.CASH_BANK_BOOKS, icon: Building2 },
                  { title: "Expense Management", desc: "Record bills, categories & pending payments", href: ROUTES.FEES.ACCOUNTS.EXPENSES, icon: DollarSign },
                  { title: "Financial Reports", desc: "Trial balance, P&L, balance sheet, payables", href: ROUTES.FEES.REPORTS, icon: BarChart2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group p-2.5 rounded-[6px] border border-[var(--border-light)] hover:border-blue-500 hover:bg-[var(--neutral-50)] transition-all flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded bg-[var(--bg-secondary)] text-blue-700 group-hover:bg-white transition-colors shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-blue-800 transition-colors truncate">
                            {item.title}
                          </span>
                          <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Other Setup Section */}
              <div className="p-3 pt-2 border-t border-[var(--border-default)] bg-neutral-50/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1 pb-1">
                  Other Setup
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <Link
                    href={ROUTES.FEES.SETUP.INVOICE_SETUP}
                    className="p-1.5 rounded hover:bg-white text-neutral-700 hover:text-[var(--brand-primary)] truncate font-medium"
                  >
                    Invoice & Receipt Setup
                  </Link>
                  <Link
                    href={ROUTES.FEES.SETUP.INVOICE_TEMPLATE}
                    className="p-1.5 rounded hover:bg-white text-neutral-700 hover:text-[var(--brand-primary)] truncate font-medium"
                  >
                    Template Designer
                  </Link>
                  <Link
                    href={ROUTES.FEES.SETUP.SETTINGS}
                    className="p-1.5 rounded hover:bg-white text-neutral-700 hover:text-[var(--brand-primary)] truncate font-medium"
                  >
                    Payment Settings
                  </Link>
                  <Link
                    href={ROUTES.FEES.ACCOUNTS.SETTINGS}
                    className="p-1.5 rounded hover:bg-white text-neutral-700 hover:text-[var(--brand-primary)] truncate font-medium"
                  >
                    Accounting Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
