"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  Layers,
  DollarSign,
  ArrowRight,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ProgramAnnualSplit {
  yearName: string;
  tuitionFee: number;
  labAndExam: number;
  developmentFee: number;
  totalAnnualAmount: number;
  installmentsCount: number;
}

interface ProgramAnnualPlan {
  id: string;
  programCode: string;
  programName: string;
  academicSession: string;
  totalProgramFee: number;
  years: ProgramAnnualSplit[];
  status: "Active" | "Draft";
}

const DEFAULT_ANNUAL_PLANS: ProgramAnnualPlan[] = [
  {
    id: "pap-1",
    programCode: "BCA-TU",
    programName: "Bachelor of Computer Application (BCA)",
    academicSession: "2026-2027 (2083 BS)",
    totalProgramFee: 400000,
    years: [
      { yearName: "Year 1 (1st & 2nd Sem)", tuitionFee: 60000, labAndExam: 30000, developmentFee: 20000, totalAnnualAmount: 110000, installmentsCount: 2 },
      { yearName: "Year 2 (3rd & 4th Sem)", tuitionFee: 60000, labAndExam: 25000, developmentFee: 15000, totalAnnualAmount: 100000, installmentsCount: 2 },
      { yearName: "Year 3 (5th & 6th Sem)", tuitionFee: 60000, labAndExam: 25000, developmentFee: 15000, totalAnnualAmount: 100000, installmentsCount: 2 },
      { yearName: "Year 4 (7th & 8th Sem)", tuitionFee: 60000, labAndExam: 20000, developmentFee: 10000, totalAnnualAmount: 90000, installmentsCount: 2 },
    ],
    status: "Active",
  },
  {
    id: "pap-2",
    programCode: "SCI-1112",
    programName: "Ten Plus Two (+2) Science",
    academicSession: "2026-2027 (2083 BS)",
    totalProgramFee: 180000,
    years: [
      { yearName: "Grade 11 (Science Stream)", tuitionFee: 55000, labAndExam: 25000, developmentFee: 15000, totalAnnualAmount: 95000, installmentsCount: 3 },
      { yearName: "Grade 12 (Science Stream)", tuitionFee: 55000, labAndExam: 20000, developmentFee: 10000, totalAnnualAmount: 85000, installmentsCount: 3 },
    ],
    status: "Active",
  },
  {
    id: "pap-3",
    programCode: "BBA-TU",
    programName: "Bachelor of Business Administration (BBA)",
    academicSession: "2026-2027 (2083 BS)",
    totalProgramFee: 450000,
    years: [
      { yearName: "Year 1 (1st & 2nd Sem)", tuitionFee: 65000, labAndExam: 35000, developmentFee: 20000, totalAnnualAmount: 120000, installmentsCount: 2 },
      { yearName: "Year 2 (3rd & 4th Sem)", tuitionFee: 65000, labAndExam: 30000, developmentFee: 15000, totalAnnualAmount: 110000, installmentsCount: 2 },
      { yearName: "Year 3 (5th & 6th Sem)", tuitionFee: 65000, labAndExam: 30000, developmentFee: 15000, totalAnnualAmount: 110000, installmentsCount: 2 },
      { yearName: "Year 4 (7th & 8th Sem)", tuitionFee: 65000, labAndExam: 30000, developmentFee: 15000, totalAnnualAmount: 110000, installmentsCount: 2 },
    ],
    status: "Active",
  },
];

export default function ProgramAnnualFeePage() {
  const [plans, setPlans] = React.useState<ProgramAnnualPlan[]>(DEFAULT_ANNUAL_PLANS);
  const [selectedPlan, setSelectedPlan] = React.useState<ProgramAnnualPlan>(plans[0]);
  const [search, setSearch] = React.useState("");

  const filtered = plans.filter((p) =>
    p.programName.toLowerCase().includes(search.toLowerCase()) ||
    p.programCode.toLowerCase().includes(search.toLowerCase())
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
            Program Annual Fee
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Program Annual Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage year-by-year fee splits, admission weighting, and annual installment breakdowns derived from Program Total Fees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.PROGRAM_TOTAL}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              &larr; Program Total Fee
            </Link>
            <Link
              href={ROUTES.FEES.SETUP.PROGRAM_SEMESTER}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              Program Semester Fee &rarr;
            </Link>
          </div>
        </div>

        {/* Selection & Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Plan Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search annual programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={cn(
                      "p-4 rounded-[8px] border transition-all cursor-pointer",
                      isSelected
                        ? "bg-white border-[var(--brand-primary)] shadow-xs"
                        : "bg-white/80 border-[var(--border-default)] hover:border-neutral-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {plan.programName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                        {plan.programCode}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-tertiary)]">
                        {plan.years.length} Academic Years
                      </span>
                      <span className="font-mono font-bold text-[var(--brand-primary)]">
                        NPR {plan.totalProgramFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Year-by-Year Annual Breakdown Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--border-default)] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Annual Fee Distribution Schedule
                  </span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedPlan.programName} ({selectedPlan.programCode})
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-tertiary)] block">Total Program Contract</span>
                  <span className="text-sm font-extrabold text-[var(--brand-primary)] font-mono">
                    NPR {selectedPlan.totalProgramFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Year Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlan.years.map((yr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-secondary)]/40 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">
                          {yr.yearName}
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[var(--border-default)] text-neutral-600">
                        {yr.installmentsCount} Installments
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Tuition Fee:</span>
                        <span className="font-mono">NPR {yr.tuitionFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Lab & Practical Exam:</span>
                        <span className="font-mono">NPR {yr.labAndExam.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Annual Development:</span>
                        <span className="font-mono">NPR {yr.developmentFee.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-default)] flex justify-between font-bold text-[var(--text-primary)]">
                        <span>Year Total:</span>
                        <span className="font-mono text-[var(--brand-primary)]">
                          NPR {yr.totalAnnualAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Check Footer */}
              <div className="p-3.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Yearly sum matches 100% of Program Total Fee (NPR {selectedPlan.totalProgramFee.toLocaleString()})
                  </span>
                </div>
                <button className="text-xs font-bold text-emerald-800 hover:underline">
                  Edit Year Slabs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
