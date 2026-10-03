"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  receiptNo: string;
  studentName: string;
  className: string;
  amount: string;
  mode: string;
  time: string;
  status: "Completed" | "Pending";
}

const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    receiptNo: "REC-2083-0412",
    studentName: "Aarav Sharma",
    className: "Grade 10 - A",
    amount: "NPR 18,500",
    mode: "eSewa",
    time: "10 mins ago",
    status: "Completed",
  },
  {
    id: "tx-2",
    receiptNo: "REC-2083-0411",
    studentName: "Pooja Shrestha",
    className: "Grade 9 - B",
    amount: "NPR 14,200",
    mode: "Counter Cash",
    time: "25 mins ago",
    status: "Completed",
  },
  {
    id: "tx-3",
    receiptNo: "REC-2083-0410",
    studentName: "Bikash Adhikari",
    className: "Grade 11 - Science",
    amount: "NPR 22,000",
    mode: "Fonepay QR",
    time: "1 hour ago",
    status: "Completed",
  },
  {
    id: "tx-4",
    receiptNo: "REC-2083-0409",
    studentName: "Sneha Thapa",
    className: "Grade 8 - A",
    amount: "NPR 12,800",
    mode: "Counter Cash",
    time: "2 hours ago",
    status: "Completed",
  },
];

export function RecentActivityTable() {
  return (
    <div className="rounded-[6px] border border-[var(--border-default)] bg-white shadow-xs overflow-hidden">
      {/* Card Header matching ERP style */}
      <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Recent Fee Collections & Receipts
          </h3>
        </div>
        <Link
          href="/fees/invoices"
          className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
        >
          <span>All Receipts</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
              <th className="py-2.5 px-4">Receipt #</th>
              <th className="py-2.5 px-4">Student</th>
              <th className="py-2.5 px-4">Class</th>
              <th className="py-2.5 px-4">Amount</th>
              <th className="py-2.5 px-4">Mode</th>
              <th className="py-2.5 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {RECENT_TRANSACTIONS.map((tx) => (
              <tr key={tx.id} className="hover:bg-[var(--neutral-50)]/70 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                  {tx.receiptNo}
                </td>
                <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                  {tx.studentName}
                </td>
                <td className="py-3 px-4 text-[var(--neutral-600)]">
                  {tx.className}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                  {tx.amount}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--neutral-100)] text-[var(--neutral-700)] border border-[var(--border-default)]">
                    {tx.mode}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-[var(--neutral-400)] text-[11px]">
                  {tx.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
