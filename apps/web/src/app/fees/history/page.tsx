"use client";

import * as React from "react";
import Link from "next/link";
import {
  History,
  Search,
  ChevronRight,
  Printer,
  Download,
  Calendar,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function PaymentHistoryPage() {
  const [search, setSearch] = React.useState("");

  const payments = [
    { receiptNo: "REC-2083-0941", date: "2026-10-04", student: "Aarav Sharma", class: "Grade 10 - A", amount: 14500, mode: "Cash Counter", cashier: "Admin Cashier" },
    { receiptNo: "REC-2083-0940", date: "2026-10-03", student: "Sneha Shrestha", class: "Grade 8 - B", amount: 6500, mode: "eSewa QR", cashier: "Online Sync" },
    { receiptNo: "REC-2083-0939", date: "2026-10-03", student: "Bikash Adhikari", class: "Grade 9 - A", amount: 8000, mode: "Bank Transfer", cashier: "Accountant" },
    { receiptNo: "REC-2083-0938", date: "2026-10-02", student: "Pooja Thapa", class: "Grade 10 - B", amount: 6000, mode: "Khalti", cashier: "Online Sync" },
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
            Payment History
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fee Payment Collection History
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Archive of all issued receipts, cashier collections, and online transaction settlements
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">Receipt No.</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Amount (NPR)</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4">Processed By</th>
                <th className="py-2.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {payments.map((p, idx) => (
                <tr key={idx} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{p.receiptNo}</td>
                  <td className="py-3 px-4 text-neutral-600">{p.date}</td>
                  <td className="py-3 px-4 font-medium">{p.student}</td>
                  <td className="py-3 px-4 text-neutral-600">{p.class}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">NPR {p.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 font-medium text-neutral-700">{p.mode}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{p.cashier}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 rounded hover:bg-neutral-100 text-neutral-600 hover:text-[var(--brand-primary)]">
                      <Printer className="h-3.5 w-3.5" />
                    </button>
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
