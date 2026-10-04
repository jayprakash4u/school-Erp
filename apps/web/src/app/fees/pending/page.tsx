"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  ChevronRight,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function PendingApprovalsPage() {
  const [pending, setPending] = React.useState([
    { id: "1", txId: "TX-BANK-84920", student: "Kiran Dahal", class: "Grade 10 - B", amount: 9000, method: "Bank Deposit Slip", slipUrl: "slip_scan_01.jpg", date: "2026-10-04 09:30 AM" },
    { id: "2", txId: "TX-ESW-19284", student: "Rohan Neupane", class: "Grade 8 - B", amount: 4800, method: "eSewa Direct", slipUrl: "esewa_ref_84.jpg", date: "2026-10-04 08:15 AM" },
  ]);

  const handleApprove = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

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
            Pending Approvals
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Pending Online Payments & Bank Slips
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Verify parent deposit slip uploads, bank counter vouchers, and approve fee settlements
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">Transaction Ref</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Amount (NPR)</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4">Submitted At</th>
                <th className="py-2.5 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                    All submitted payments have been verified and settled!
                  </td>
                </tr>
              ) : (
                pending.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{p.txId}</td>
                    <td className="py-3 px-4 font-medium">{p.student}</td>
                    <td className="py-3 px-4 text-neutral-600">{p.class}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">NPR {p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-neutral-600">{p.method}</td>
                    <td className="py-3 px-4 text-neutral-500">{p.date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve & Issue</span>
                        </button>
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-600 text-[11px]"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
