"use client";

import * as React from "react";
import Link from "next/link";
import {
  Grid,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  FolderTree,
  DollarSign,
  Download,
  Printer,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

interface AccountHead {
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  balance: number;
  subAccounts?: {
    code: string;
    name: string;
    balance: number;
  }[];
}

export default function ChartOfAccountsPage() {
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const accounts: AccountHead[] = [
    // 1000 - Assets
    {
      code: "1000",
      name: "Current & Liquid Assets",
      type: "Asset",
      balance: 4850000,
      subAccounts: [
        { code: "1001", name: "Cash in Hand (Counter Petty Cash)", balance: 142000 },
        { code: "1010", name: "State Bank of India - Operations A/C", balance: 3208000 },
        { code: "1020", name: "HDFC Bank - Fee Collection A/C", balance: 1500000 },
      ],
    },
    {
      code: "1500",
      name: "Fixed & Property Assets",
      type: "Asset",
      balance: 18500000,
      subAccounts: [
        { code: "1501", name: "School Building & Campus Infrastructure", balance: 12000000 },
        { code: "1510", name: "School Transport Fleet (12 Buses)", balance: 4500000 },
        { code: "1520", name: "Computer Lab & Robotics Equipment", balance: 2000000 },
      ],
    },

    // 2000 - Liabilities
    {
      code: "2000",
      name: "Current Liabilities & Payables",
      type: "Liability",
      balance: 680000,
      subAccounts: [
        { code: "2001", name: "Staff Salary Payable (Current Month)", balance: 450000 },
        { code: "2010", name: "Accounts Payable (Vendors & Suppliers)", balance: 230000 },
      ],
    },

    // 3000 - Equity
    {
      code: "3000",
      name: "Institutional Capital & Reserves",
      type: "Equity",
      balance: 15000000,
      subAccounts: [
        { code: "3001", name: "Trust Capital Fund", balance: 12000000 },
        { code: "3010", name: "Retained Earnings / Surplus Reserves", balance: 3000000 },
      ],
    },

    // 4000 - Income
    {
      code: "4000",
      name: "Student Fee & Institutional Revenue",
      type: "Income",
      balance: 14250000,
      subAccounts: [
        { code: "4001", name: "Tuition & Term Fee Income", balance: 9500000 },
        { code: "4010", name: "Annual Development & Admission Fees", balance: 2800000 },
        { code: "4020", name: "Transport Facility Fee", balance: 1250000 },
        { code: "4030", name: "Examination & Lab Head Income", balance: 700000 },
      ],
    },

    // 5000 - Expenses
    {
      code: "5000",
      name: "Operating & Administrative Expenses",
      type: "Expense",
      balance: 6250000,
      subAccounts: [
        { code: "5100", name: "Teaching & Non-Teaching Staff Salaries", balance: 4200000 },
        { code: "5200", name: "Electricity, Water & Utilities", balance: 380000 },
        { code: "5300", name: "Transport Diesel & Maintenance", balance: 520000 },
        { code: "5400", name: "Stationery, Exam Printing & Books", balance: 290000 },
        { code: "5500", name: "Campus Repairs & Building Maintenance", balance: 460000 },
        { code: "5600", name: "Internet, Telecom & Software Licenses", balance: 180000 },
        { code: "5700", name: "Lab Consumables & Sports Equipment", balance: 220000 },
      ],
    },
  ];

  const filteredAccounts = accounts.filter((acc) => {
    if (activeFilter !== "all" && acc.type.toLowerCase() !== activeFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchHead = acc.name.toLowerCase().includes(q) || acc.code.includes(q);
      const matchSub = acc.subAccounts?.some((s) => s.name.toLowerCase().includes(q) || s.code.includes(q));
      return matchHead || matchSub;
    }
    return true;
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
          <span className="font-semibold text-[var(--text-primary)]">Chart of Accounts</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Grid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Chart of Accounts (COA)
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Standard double-entry accounting hierarchy: Assets, Liabilities, Equity, Income, and Expenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Add New Account Head modal")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Account Head</span>
            </button>
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-[6px] border border-[var(--border-default)] text-xs">
            {["all", "asset", "liability", "equity", "income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`px-3 py-1.5 rounded font-semibold capitalize transition-colors ${
                  activeFilter === t
                    ? "bg-[var(--brand-primary)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-neutral-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search account code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[6px] border border-[var(--border-default)] bg-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        {/* Account Hierarchy Tree / Table */}
        <div className="space-y-4">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.code}
              className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden"
            >
              {/* Primary Head Header */}
              <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--brand-primary)] px-2 py-0.5 rounded bg-red-50 border border-red-200">
                    {acc.code}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{acc.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                      acc.type === "Asset"
                        ? "bg-blue-50 text-blue-700"
                        : acc.type === "Liability"
                        ? "bg-amber-50 text-amber-700"
                        : acc.type === "Equity"
                        ? "bg-purple-50 text-purple-700"
                        : acc.type === "Income"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {acc.type}
                  </span>
                </div>

                <div className="text-xs font-bold text-[var(--text-primary)]">
                  Total: ₹{acc.balance.toLocaleString()}
                </div>
              </div>

              {/* Sub-Accounts List */}
              {acc.subAccounts && acc.subAccounts.length > 0 && (
                <div className="divide-y divide-[var(--border-light)] text-xs">
                  {acc.subAccounts.map((sub) => (
                    <div
                      key={sub.code}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors pl-8"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-neutral-400 font-mono text-[11px]">{sub.code}</span>
                        <span className="text-[var(--text-primary)] font-medium">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-[var(--text-secondary)]">
                          ₹{sub.balance.toLocaleString()}
                        </span>
                        <Link
                          href={`${ROUTES.FEES.ACCOUNTS.GENERAL_LEDGER}?account=${sub.code}`}
                          className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                        >
                          View Ledger <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
