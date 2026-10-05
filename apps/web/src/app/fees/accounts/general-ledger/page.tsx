"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ChevronRight,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

interface LedgerEntry {
  id: string;
  date: string;
  voucherNo: string;
  accountHead: string;
  particulars: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export default function GeneralLedgerPage() {
  const [selectedAccount, setSelectedAccount] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const ledgerEntries: LedgerEntry[] = [
    {
      id: "GL-01",
      date: "2026-10-04",
      voucherNo: "REC-8921",
      accountHead: "4001 - Tuition Fee Income",
      particulars: "Term 2 Fee Collection - Aarav Sharma (Grade 10-A)",
      debit: 0,
      credit: 45000,
      runningBalance: 9545000,
    },
    {
      id: "GL-02",
      date: "2026-10-04",
      voucherNo: "PV-2026-091",
      accountHead: "5200 - Electricity & Power",
      particulars: "Power Bill for Main Block (State Electricity Board)",
      debit: 48500,
      credit: 0,
      runningBalance: 380000,
    },
    {
      id: "GL-03",
      date: "2026-10-03",
      voucherNo: "REC-8840",
      accountHead: "4001 - Tuition Fee Income",
      particulars: "Student Fee Payment - Ananya Gupta (Grade 6-A)",
      debit: 0,
      credit: 24000,
      runningBalance: 9500000,
    },
    {
      id: "GL-04",
      date: "2026-10-03",
      voucherNo: "PV-2026-092",
      accountHead: "5300 - Transport Fuel",
      particulars: "Diesel Supply Refill (Metro Fuel)",
      debit: 32400,
      credit: 0,
      runningBalance: 520000,
    },
    {
      id: "GL-05",
      date: "2026-10-01",
      voucherNo: "JV-SAL-09",
      accountHead: "5100 - Staff Salaries",
      particulars: "September 2026 Payroll Posting",
      debit: 1200000,
      credit: 0,
      runningBalance: 4200000,
    },
  ];

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
          <span className="font-semibold text-[var(--text-primary)]">General Ledger</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                General Ledger (GL)
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Audit trail of all double-entry debit and credit postings across institution accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Ledger</span>
            </button>
            <button
              onClick={() => alert("Exporting General Ledger to Excel/CSV...")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export GL</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-[8px] border border-[var(--border-default)] shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)] font-medium"
            >
              <option value="all">All Chart of Accounts Heads</option>
              <option value="4001">4001 - Tuition Fee Income</option>
              <option value="5100">5100 - Staff Salaries</option>
              <option value="5200">5200 - Electricity & Power</option>
              <option value="5300">5300 - Transport Fuel</option>
              <option value="1010">1010 - SBI Operations A/C</option>
              <option value="1001">1001 - Cash in Hand</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span>Period: Current Academic Term (Oct 2026)</span>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search voucher or narration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[6px] border border-[var(--border-default)] bg-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-neutral-50/70 text-[var(--text-tertiary)] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Account Head</th>
                  <th className="py-2.5 px-3">Narration / Particulars</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {ledgerEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">{row.date}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[var(--brand-primary)] font-semibold">{row.voucherNo}</td>
                    <td className="py-3 px-3 font-medium text-[var(--text-primary)]">{row.accountHead}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] max-w-md truncate">{row.particulars}</td>
                    <td className="py-3 px-3 text-right font-medium text-rose-700">
                      {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[var(--text-primary)]">
                      ₹{row.runningBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
