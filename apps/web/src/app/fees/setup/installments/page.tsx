"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Clock,
  Percent,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface InstallmentPlanItem {
  id: string;
  name: string;
  numberOfInstallments: number;
  frequency: string;
  dueDay: number;
  penaltyGraceDays: number;
  status: "Active" | "Inactive";
}

const DEFAULT_PLANS: InstallmentPlanItem[] = [
  { id: "ip-1", name: "Quarterly 4-Term Plan", numberOfInstallments: 4, frequency: "Quarterly", dueDay: 10, penaltyGraceDays: 7, status: "Active" },
  { id: "ip-2", name: "Trimester 3-Term Plan", numberOfInstallments: 3, frequency: "Every 4 Months", dueDay: 15, penaltyGraceDays: 10, status: "Active" },
  { id: "ip-3", name: "Standard 12-Month Plan", numberOfInstallments: 12, frequency: "Monthly", dueDay: 7, penaltyGraceDays: 5, status: "Active" },
  { id: "ip-4", name: "Semester 2-Term Plan", numberOfInstallments: 2, frequency: "Bi-Annual", dueDay: 15, penaltyGraceDays: 15, status: "Active" },
];

export default function InstallmentsSetupPage() {
  const [plans, setPlans] = React.useState<InstallmentPlanItem[]>(DEFAULT_PLANS);

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
            Installment Plans
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-xs border border-cyan-200">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Installment Plans & Schedules
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure annual payment splits, due date intervals, and billing cycle frequencies
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">Plan Name</th>
                <th className="py-2.5 px-4">Number of Splits</th>
                <th className="py-2.5 px-4">Interval Frequency</th>
                <th className="py-2.5 px-4">Monthly Due Day</th>
                <th className="py-2.5 px-4">Grace Days</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{p.name}</td>
                  <td className="py-3 px-4">{p.numberOfInstallments} Installments</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{p.frequency}</td>
                  <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{p.dueDay}th of the month</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{p.penaltyGraceDays} days grace</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
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
