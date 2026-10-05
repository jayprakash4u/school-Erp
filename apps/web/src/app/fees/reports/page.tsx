"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  ChevronRight,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Printer,
  Receipt,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

type ReportCategory = "fee_collection" | "accounts_expenses" | "payables";

interface ReportCardItem {
  title: string;
  desc: string;
  category: string;
  frequency: string;
  tag: "Fee" | "Accounts" | "Payables";
}

export default function FeeFinancialReportsPage() {
  const [activeCategory, setActiveCategory] = React.useState<ReportCategory>("fee_collection");
  const [searchQuery, setSearchQuery] = React.useState("");

  const feeCollectionReports: ReportCardItem[] = [
    {
      title: "Daily Collection Report",
      desc: "Cashier-wise and counter-wise daily collection breakdown, payment mode splits (Cash, Card, UPI, Cheque), and shift summary.",
      category: "Billing & Audit",
      frequency: "Daily",
      tag: "Fee",
    },
    {
      title: "Fee Collection by Class / Fee Head",
      desc: "Comprehensive collection matrix categorized by grade level and individual fee heads (Tuition, Annual Dev, Transport, Exam).",
      category: "Class Analysis",
      frequency: "Monthly / Term",
      tag: "Fee",
    },
    {
      title: "Student Outstanding / Defaulters Report",
      desc: "Aging statement of outstanding student dues (>30, >60, >90 days overdue) with guardian contact details for SMS reminders.",
      category: "Receivables",
      frequency: "Weekly",
      tag: "Fee",
    },
    {
      title: "Refund & Discount Report",
      desc: "Audited statement of all fee concessions, merit scholarships, siblings discounts, and student fee refunds issued.",
      category: "Concessions",
      frequency: "Monthly",
      tag: "Fee",
    },
  ];

  const accountsExpensesReports: ReportCardItem[] = [
    {
      title: "Expense Report by Category",
      desc: "Head-wise operational spending analysis (Salaries, Electricity, Diesel, Stationery, Lab, Repairs) vs allocated budgets.",
      category: "Expenditure",
      frequency: "Monthly",
      tag: "Accounts",
    },
    {
      title: "Institutional Income Statement",
      desc: "Consolidated revenue streams from fee heads, admissions, sports, transport, canteen leases, and bank interest.",
      category: "Revenue",
      frequency: "Monthly",
      tag: "Accounts",
    },
    {
      title: "Cash Book & Bank Book Statement",
      desc: "Complete chronological journal of petty cash movements, counter drawer closings, and bank account registers.",
      category: "Liquidity",
      frequency: "Daily / Monthly",
      tag: "Accounts",
    },
    {
      title: "General Ledger Statement",
      desc: "Double-entry posting register covering all chart of accounts (1000s to 5000s) with opening/closing balances.",
      category: "Audit Ledger",
      frequency: "Fiscal Term",
      tag: "Accounts",
    },
    {
      title: "Trial Balance",
      desc: "Real-time summary of all debit and credit account balances validating mathematical equality across the institution.",
      category: "Financial Audit",
      frequency: "Monthly / Annual",
      tag: "Accounts",
    },
    {
      title: "Profit & Loss (Income & Expenditure) Statement",
      desc: "Standard institutional financial performance report showing net operating surplus or deficit for the fiscal period.",
      category: "Financial Statements",
      frequency: "Quarterly / Annual",
      tag: "Accounts",
    },
    {
      title: "Balance Sheet",
      desc: "Comprehensive statement of institutional Assets, Liabilities, and Trust Equity / Capital Reserves as of a given date.",
      category: "Financial Statements",
      frequency: "Annual",
      tag: "Accounts",
    },
  ];

  const payablesReports: ReportCardItem[] = [
    {
      title: "Employee Payables Statement",
      desc: "Staff salary payables, approved overtime, festival advances outstanding, and reimbursement claims pending settlement.",
      category: "Payroll Payables",
      frequency: "Monthly",
      tag: "Payables",
    },
    {
      title: "Supplier & Vendor Payables Aging",
      desc: "Vendor bills, stationery invoices, fuel suppliers, and maintenance contractor payables broken down by aging buckets.",
      category: "Vendor Liabilities",
      frequency: "Monthly",
      tag: "Payables",
    },
    {
      title: "Party Ledger Statements",
      desc: "Consolidated financial statements for third parties, property tenants, transportation fleets, and canteen caterers.",
      category: "Third Parties",
      frequency: "On Demand",
      tag: "Payables",
    },
  ];

  const currentList =
    activeCategory === "fee_collection"
      ? feeCollectionReports
      : activeCategory === "accounts_expenses"
      ? accountsExpensesReports
      : payablesReports;

  const filteredReports = currentList.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--text-secondary)]">Accounts & Finance</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">Financial Reports</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Financial Reports & Statements Hub
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Institution-wide collection analytics, double-entry financial statements, trial balance, and payables aging
              </p>
            </div>
          </div>
        </div>

        {/* Report Category Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveCategory("fee_collection")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeCategory === "fee_collection"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Fee & Collection Reports</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-semibold">
              4
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("accounts_expenses")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeCategory === "accounts_expenses"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Accounts & Expenses</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-semibold">
              7
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("payables")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeCategory === "payables"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Payables & Party Statements</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-neutral-100 text-[10px] text-neutral-600 font-semibold">
              3
            </span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reports by title, category, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[var(--border-default)] bg-white focus:outline-none focus:border-[var(--brand-primary)] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Calendar className="h-3.5 w-3.5" />
            <span>Fiscal Year: FY 2026-2027</span>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((r, idx) => (
            <div
              key={idx}
              className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex flex-col justify-between space-y-4 hover:border-[var(--brand-primary)]/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {r.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                    {r.frequency}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">{r.title}</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                <button
                  onClick={() => alert(`Generating statement: ${r.title}... Downloading PDF & Excel.`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--red-50)] text-[var(--brand-primary)] text-xs font-semibold border border-[var(--border-default)] transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Generate Report</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[var(--text-primary)]"
                  title="Print Report"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
