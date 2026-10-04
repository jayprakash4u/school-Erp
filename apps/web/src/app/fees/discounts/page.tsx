"use client";

import * as React from "react";
import Link from "next/link";
import {
  Percent,
  Search,
  ChevronRight,
  Plus,
  Award,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function DiscountsConcessionsPage() {
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
            Discounts & Concessions
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Discounts & Concessions Register
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                List of all approved fee waivers, sibling concessions, early-bird payment discounts, and special approvals
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Concession Scheme</th>
                <th className="py-2.5 px-4">Discount % / Amount</th>
                <th className="py-2.5 px-4">Approved By</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              <tr className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                <td className="py-3 px-4 font-medium">Aarav Sharma</td>
                <td className="py-3 px-4 text-neutral-600">Grade 10 - A</td>
                <td className="py-3 px-4 font-semibold text-indigo-700">Merit Scholarship (Top 5%)</td>
                <td className="py-3 px-4 font-bold text-emerald-700">50% (NPR 39,000 / yr)</td>
                <td className="py-3 px-4 text-neutral-600">Principal Office</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Active</span></td>
              </tr>
              <tr className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                <td className="py-3 px-4 font-medium">Pooja Thapa</td>
                <td className="py-3 px-4 text-neutral-600">Grade 10 - B</td>
                <td className="py-3 px-4 font-semibold text-indigo-700">Sibling Concession</td>
                <td className="py-3 px-4 font-bold text-emerald-700">20% (NPR 15,600 / yr)</td>
                <td className="py-3 px-4 text-neutral-600">Account Dept</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
