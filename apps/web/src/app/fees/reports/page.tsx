"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  ChevronRight,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Printer,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function FeeFinancialReportsPage() {
  const reportsList = [
    { title: "Daily Cash Collection Summary", desc: "Cashier-wise daily collection breakdown & counter audit statement", type: "Daily Audit" },
    { title: "Class-Wise Fee Collection Matrix", desc: "Comparative collection vs due summary for all grades (Playgroup to 12)", type: "Class Summary" },
    { title: "Head-Wise Revenue Statement", desc: "Breakdown by Tuition, Lab, Exam, Transport, and Annual Dev Heads", type: "Revenue Breakdown" },
    { title: "Outstanding Defaulters Audit List", desc: "Filtered list of students with aging analysis (>30 days, >60 days overdue)", type: "Defaulters" },
    { title: "Scholarship & Fee Waiver Audit", desc: "Total institutional discounts & concession expense statement", type: "Scholarships" },
    { title: "Monthly Tax / Fiscal Year Ledger", desc: "Complete academic year reconciliation and ledger export", type: "Fiscal Ledger" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Financial Reports & Summary
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fee & Financial Reports
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Audit statements, revenue trend charts, class-wise receivables, and fiscal year financial exports
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportsList.map((r, idx) => (
            <div key={idx} className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{r.type}</span>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">{r.title}</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                <button
                  onClick={() => alert(`Generating ${r.title}...`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--red-50)] text-[var(--brand-primary)] text-xs font-semibold border border-[var(--border-default)] transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[var(--text-primary)]"
                  title="Print"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
