"use client";

import * as React from "react";
import Link from "next/link";
import {
  Grid,
  Search,
  ChevronRight,
  Download,
  Calendar,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function StudentFeeLedgerPage() {
  const [search, setSearch] = React.useState("");

  const ledgerEntries = [
    { date: "2083-04-15", desc: "Admission & Annual Registration Fee", debit: 18000, credit: 0, balance: 18000 },
    { date: "2083-04-16", desc: "Payment Received (Cash - Receipt #REC-101)", debit: 0, credit: 18000, balance: 0 },
    { date: "2083-05-01", desc: "Monthly Tuition Fee (Baisakh)", debit: 4500, credit: 0, balance: 4500 },
    { date: "2083-05-08", desc: "Payment Received (eSewa - #ESW-9041)", debit: 0, credit: 4500, balance: 0 },
    { date: "2083-06-01", desc: "Monthly Tuition Fee (Jestha) + Terminal Exam", debit: 6500, credit: 0, balance: 6500 },
    { date: "2083-06-10", desc: "Payment Received (Cash - Receipt #REC-304)", debit: 0, credit: 6500, balance: 0 },
    { date: "2083-07-01", desc: "Monthly Tuition Fee (Ashwin) + Lab Charges", debit: 14500, credit: 0, balance: 14500 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fee & Accounts
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Student Fee Ledger
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Grid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Student Financial Ledger
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Complete debit/credit account statement, historical billing transactions, and outstanding balance summary
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
            <span className="font-bold text-xs">Statement: Aarav Sharma (Grade 10 - Section A | ADM-2083-042)</span>
            <span className="text-xs font-bold text-rose-600">Net Due Balance: NPR 14,500</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold bg-neutral-50/50">
                <th className="py-2.5 px-4">Date (BS)</th>
                <th className="py-2.5 px-4">Description / Particulars</th>
                <th className="py-2.5 px-4 text-right">Debit / Billed (NPR)</th>
                <th className="py-2.5 px-4 text-right">Credit / Paid (NPR)</th>
                <th className="py-2.5 px-4 text-right">Running Balance (NPR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {ledgerEntries.map((e, idx) => (
                <tr key={idx} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                  <td className="py-2.5 px-4 text-neutral-600">{e.date}</td>
                  <td className="py-2.5 px-4 font-medium">{e.desc}</td>
                  <td className="py-2.5 px-4 text-right text-rose-600 font-medium">
                    {e.debit > 0 ? e.debit.toLocaleString() : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-600 font-medium">
                    {e.credit > 0 ? e.credit.toLocaleString() : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-neutral-900">
                    {e.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
