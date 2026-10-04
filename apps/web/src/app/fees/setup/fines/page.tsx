"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Clock,
  DollarSign,
  Percent,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function FinesSetupPage() {
  const fineRules = [
    {
      id: "fr-1",
      name: "Late Monthly Tuition Penalty (Slab 1)",
      graceDays: 7,
      fineType: "Fixed Amount",
      amountOrRate: "NPR 200 Flat",
      maxFine: "NPR 200",
      description: "Applied on 8th to 15th day of due date",
      status: "Active",
    },
    {
      id: "fr-2",
      name: "Late Monthly Tuition Penalty (Slab 2)",
      graceDays: 15,
      fineType: "Percentage per day",
      amountOrRate: "0.5% per day",
      maxFine: "NPR 1,500 Max",
      description: "Applied after 15 days overdue until cleared",
      status: "Active",
    },
    {
      id: "fr-3",
      name: "Term Exam Fee Late Submission",
      graceDays: 3,
      fineType: "Fixed Amount",
      amountOrRate: "NPR 500 Flat",
      maxFine: "NPR 500",
      description: "Applied for exam registration submitted after deadline",
      status: "Active",
    },
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
          <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Fine & Late Fee Rules
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs border border-orange-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fine & Late Fee Rules
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure grace periods, slab-based penalty calculations, and maximum cap limits
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">Rule Title</th>
                <th className="py-2.5 px-4">Grace Days</th>
                <th className="py-2.5 px-4">Calculation Mode</th>
                <th className="py-2.5 px-4">Rate / Amount</th>
                <th className="py-2.5 px-4">Max Cap Limit</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {fineRules.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{r.name}</td>
                  <td className="py-3 px-4">{r.graceDays} Days</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{r.fineType}</td>
                  <td className="py-3 px-4 font-semibold text-rose-600">{r.amountOrRate}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{r.maxFine}</td>
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{r.description}</td>
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
