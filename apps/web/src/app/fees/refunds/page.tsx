"use client";

import * as React from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  ChevronRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function FeeRefundsPage() {
  const refunds = [
    { refundNo: "REF-2083-012", student: "Sneha Shrestha", class: "Grade 8 - B", amount: 3000, reason: "Excess Advance Deposit Claim", status: "Approved", date: "2026-09-29" },
    { refundNo: "REF-2083-011", student: "Kiran Dahal", class: "Grade 10 - B", amount: 5000, reason: "Caution Security Deposit on TC", status: "Completed", date: "2026-09-20" },
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
            Refunds & Adjustments
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fee Refunds & Deposit Adjustments
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Process security deposit returns, overpayment reversals, and credit note adjustments
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">Refund Ref</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Refund Amount (NPR)</th>
                <th className="py-2.5 px-4">Reason / Notes</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {refunds.map((r, idx) => (
                <tr key={idx} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{r.refundNo}</td>
                  <td className="py-3 px-4 font-medium">{r.student}</td>
                  <td className="py-3 px-4 text-neutral-600">{r.class}</td>
                  <td className="py-3 px-4 font-bold text-rose-600">NPR {r.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-neutral-600">{r.reason}</td>
                  <td className="py-3 px-4 text-neutral-600">{r.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {r.status}
                    </span>
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
