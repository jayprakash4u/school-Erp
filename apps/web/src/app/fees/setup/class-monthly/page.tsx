"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  DollarSign,
  ArrowRight,
  Sliders,
  Calendar,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ClassMonthlyFeeRecord {
  id: string;
  className: string;
  sectionCode: string;
  monthlyTuition: number;
  computerLabFee: number;
  scienceLabFee: number;
  activityFee: number;
  totalMonthlyAmount: number;
  billingDayOfMonth: number;
  autoInvoiceEnabled: boolean;
  status: "Active" | "Draft";
}

const DEFAULT_CLASS_MONTHLY: ClassMonthlyFeeRecord[] = [
  {
    id: "cmf-1",
    className: "Grade 10",
    sectionCode: "Section A, B",
    monthlyTuition: 4500,
    computerLabFee: 600,
    scienceLabFee: 500,
    activityFee: 400,
    totalMonthlyAmount: 6000,
    billingDayOfMonth: 1,
    autoInvoiceEnabled: true,
    status: "Active",
  },
  {
    id: "cmf-2",
    className: "Grade 9",
    sectionCode: "Section A, B",
    monthlyTuition: 4200,
    computerLabFee: 500,
    scienceLabFee: 500,
    activityFee: 300,
    totalMonthlyAmount: 5500,
    billingDayOfMonth: 1,
    autoInvoiceEnabled: true,
    status: "Active",
  },
  {
    id: "cmf-3",
    className: "Grade 8",
    sectionCode: "Section A, B, C",
    monthlyTuition: 3800,
    computerLabFee: 500,
    scienceLabFee: 300,
    activityFee: 300,
    totalMonthlyAmount: 4900,
    billingDayOfMonth: 1,
    autoInvoiceEnabled: true,
    status: "Active",
  },
  {
    id: "cmf-4",
    className: "Grade 6-7",
    sectionCode: "Middle Wing",
    monthlyTuition: 3400,
    computerLabFee: 400,
    scienceLabFee: 200,
    activityFee: 300,
    totalMonthlyAmount: 4300,
    billingDayOfMonth: 1,
    autoInvoiceEnabled: true,
    status: "Active",
  },
  {
    id: "cmf-5",
    className: "Grade 1-5 (Primary)",
    sectionCode: "Primary Wing",
    monthlyTuition: 2800,
    computerLabFee: 300,
    scienceLabFee: 0,
    activityFee: 300,
    totalMonthlyAmount: 3400,
    billingDayOfMonth: 1,
    autoInvoiceEnabled: true,
    status: "Active",
  },
];

export default function ClassMonthlyFeePage() {
  const [records, setRecords] = React.useState<ClassMonthlyFeeRecord[]>(DEFAULT_CLASS_MONTHLY);
  const [search, setSearch] = React.useState("");
  const [selectedRecord, setSelectedRecord] = React.useState<ClassMonthlyFeeRecord | null>(records[0]);

  const filtered = records.filter((r) =>
    r.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fee Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Class Monthly Fee
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Class Monthly Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure classroom monthly recurring tuition heads, laboratory surcharges, and automated monthly billing schedules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.CLASS_ANNUAL}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              &larr; Class Annual Fee
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search class monthly fees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4">Sections</th>
                    <th className="py-2.5 px-4 text-right">Monthly Tuition</th>
                    <th className="py-2.5 px-4 text-right">Labs & Activities</th>
                    <th className="py-2.5 px-4 text-right">Total Monthly Fee</th>
                    <th className="py-2.5 px-4 text-center">Auto Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {filtered.map((r) => {
                    const isSelected = selectedRecord?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRecord(r)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-rose-50/40 font-medium" : "hover:bg-[var(--neutral-50)]/60"
                        )}
                      >
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{r.className}</td>
                        <td className="py-3 px-4 text-neutral-600">{r.sectionCode}</td>
                        <td className="py-3 px-4 text-right font-mono">NPR {r.monthlyTuition.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-600">
                          NPR {(r.computerLabFee + r.scienceLabFee + r.activityFee).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[var(--brand-primary)]">
                          NPR {r.totalMonthlyAmount.toLocaleString()}/mo
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active (Day {r.billingDayOfMonth})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Detail Card */}
          <div className="lg:col-span-4 space-y-4">
            {selectedRecord && (
              <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Monthly Fee Breakdown
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedRecord.className}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">{selectedRecord.sectionCode}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Monthly Tuition Fee:</span>
                    <span className="font-mono">NPR {selectedRecord.monthlyTuition.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Computer Lab Fee:</span>
                    <span className="font-mono">NPR {selectedRecord.computerLabFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Science Practical Surcharge:</span>
                    <span className="font-mono">NPR {selectedRecord.scienceLabFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Activity & Sports Maintenance:</span>
                    <span className="font-mono">NPR {selectedRecord.activityFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-default)] flex justify-between font-bold text-[var(--text-primary)]">
                    <span>Total Monthly Bill:</span>
                    <span className="text-sm font-extrabold text-[var(--brand-primary)] font-mono">
                      NPR {selectedRecord.totalMonthlyAmount.toLocaleString()} / month
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Auto-billing Active</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Invoices are automatically generated on Day {selectedRecord.billingDayOfMonth} of every month for all active students.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
