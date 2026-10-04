"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  Calendar,
  DollarSign,
  ArrowRight,
  Info,
  Sliders,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ProgramTotalRecord {
  id: string;
  programCode: string;
  programName: string;
  degreeLevel: "Undergraduate (Bachelor)" | "+2 High School" | "Master" | "Diploma";
  durationYears: number;
  totalSemesters: number;
  totalProgramFee: number;
  annualFeeEquivalent: number;
  semesterFeeEquivalent: number;
  headsBreakdown: { head: string; amount: number }[];
  status: "Active" | "Draft";
  enrolledStudentsCount: number;
}

const DEFAULT_PROGRAM_TOTALS: ProgramTotalRecord[] = [
  {
    id: "prog-1",
    programCode: "BCA-TU",
    programName: "Bachelor of Computer Application (BCA)",
    degreeLevel: "Undergraduate (Bachelor)",
    durationYears: 4,
    totalSemesters: 8,
    totalProgramFee: 400000,
    annualFeeEquivalent: 100000,
    semesterFeeEquivalent: 50000,
    headsBreakdown: [
      { head: "Tuition Total (8 Semesters)", amount: 240000 },
      { head: "Computer & AI Lab Infrastructure", amount: 60000 },
      { head: "University Affiliation & Board", amount: 40000 },
      { head: "Library & Digital Journals Access", amount: 30000 },
      { head: "Project & Internship Supervision", amount: 30000 },
    ],
    status: "Active",
    enrolledStudentsCount: 140,
  },
  {
    id: "prog-2",
    programCode: "SCI-1112",
    programName: "Ten Plus Two (+2) Science",
    degreeLevel: "+2 High School",
    durationYears: 2,
    totalSemesters: 4,
    totalProgramFee: 180000,
    annualFeeEquivalent: 90000,
    semesterFeeEquivalent: 45000,
    headsBreakdown: [
      { head: "Tuition Total (2 Years)", amount: 110000 },
      { head: "Physics/Chemistry/Bio Laboratory", amount: 35000 },
      { head: "NEB Board Registration & Exam", amount: 15000 },
      { head: "Co-curricular & Field Excursions", amount: 20000 },
    ],
    status: "Active",
    enrolledStudentsCount: 210,
  },
  {
    id: "prog-3",
    programCode: "BBA-TU",
    programName: "Bachelor of Business Administration (BBA)",
    degreeLevel: "Undergraduate (Bachelor)",
    durationYears: 4,
    totalSemesters: 8,
    totalProgramFee: 450000,
    annualFeeEquivalent: 112500,
    semesterFeeEquivalent: 56250,
    headsBreakdown: [
      { head: "Tuition Total (8 Semesters)", amount: 270000 },
      { head: "Business Analytics & IT Lab", amount: 60000 },
      { head: "University Affiliation & Board", amount: 40000 },
      { head: "Case Studies & Seminars", amount: 45000 },
      { head: "Executive Placement & Corporate Immersion", amount: 35000 },
    ],
    status: "Active",
    enrolledStudentsCount: 120,
  },
  {
    id: "prog-4",
    programCode: "MGT-1112",
    programName: "Ten Plus Two (+2) Management",
    degreeLevel: "+2 High School",
    durationYears: 2,
    totalSemesters: 4,
    totalProgramFee: 140000,
    annualFeeEquivalent: 70000,
    semesterFeeEquivalent: 35000,
    headsBreakdown: [
      { head: "Tuition Total (2 Years)", amount: 90000 },
      { head: "Accounting & Computer Lab", amount: 20000 },
      { head: "NEB Board Registration & Exam", amount: 14000 },
      { head: "Co-curricular & Seminars", amount: 16000 },
    ],
    status: "Active",
    enrolledStudentsCount: 180,
  },
];

export default function ProgramTotalFeePage() {
  const [programs, setPrograms] = React.useState<ProgramTotalRecord[]>(DEFAULT_PROGRAM_TOTALS);
  const [search, setSearch] = React.useState("");
  const [selectedProgram, setSelectedProgram] = React.useState<ProgramTotalRecord | null>(programs[0]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const filtered = programs.filter(
    (p) =>
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
            Program Total Fee
          </span>
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in-0 duration-150">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">&times;</button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Program Total Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure baseline whole-program master package totals across multi-year and semester degree programs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.PROGRAM_ANNUAL}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              Program Annual Fee &rarr;
            </Link>
            <Link
              href={ROUTES.FEES.SETUP.PROGRAM_SEMESTER}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              Program Semester Fee &rarr;
            </Link>
            <button
              onClick={() => {
                const newCode = `DEG-${Math.floor(100 + Math.random() * 900)}`;
                const newP: ProgramTotalRecord = {
                  id: Date.now().toString(),
                  programCode: newCode,
                  programName: "New Degree / Diploma Program",
                  degreeLevel: "Undergraduate (Bachelor)",
                  durationYears: 4,
                  totalSemesters: 8,
                  totalProgramFee: 380000,
                  annualFeeEquivalent: 95000,
                  semesterFeeEquivalent: 47500,
                  headsBreakdown: [
                    { head: "Tuition Total", amount: 240000 },
                    { head: "Lab & Practical", amount: 80000 },
                    { head: "Affiliation Fee", amount: 60000 },
                  ],
                  status: "Active",
                  enrolledStudentsCount: 0,
                };
                setPrograms([newP, ...programs]);
                setSelectedProgram(newP);
                setToastMessage(`Created new Program Total Fee for ${newCode}`);
              }}
              className="px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Define Program Total</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div className="p-4 rounded-[6px] bg-blue-50/60 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Financial Architecture Rule: Program Total Fee</p>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              Program Total Fee establishes the global master contractual fee for the entire degree (e.g. 4-Year BCA = NPR 400,000). The ERP uses this total to generate baseline split projections into <strong>Program Annual Fee</strong> (Year 1..4) and <strong>Program Semester Fee</strong> (Sem 1..8).
            </p>
          </div>
        </div>

        {/* Master List & Active Program Breakdown Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Programs Table */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search program by name or code (e.g. BCA, Science)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-4">Program</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4 text-right">Whole Total (NPR)</th>
                    <th className="py-2.5 px-4 text-right">Annual Avg</th>
                    <th className="py-2.5 px-4 text-right">Sem Avg</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {filtered.map((prog) => {
                    const isSelected = selectedProgram?.id === prog.id;
                    return (
                      <tr
                        key={prog.id}
                        onClick={() => setSelectedProgram(prog)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected
                            ? "bg-rose-50/40 font-medium"
                            : "hover:bg-[var(--neutral-50)]/60"
                        )}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)]">{prog.programName}</div>
                          <div className="text-[11px] text-[var(--text-tertiary)] font-mono">{prog.programCode} • {prog.degreeLevel}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {prog.durationYears} Yrs ({prog.totalSemesters} Sem)
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-[var(--brand-primary)]">
                          NPR {prog.totalProgramFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-600">
                          {prog.annualFeeEquivalent.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-600">
                          {prog.semesterFeeEquivalent.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {prog.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Program Details & Breakdown Column */}
          <div className="lg:col-span-5 space-y-4">
            {selectedProgram ? (
              <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Program Total Breakdown
                    </span>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      {selectedProgram.programName}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[var(--bg-secondary)] rounded border border-[var(--border-default)]">
                    {selectedProgram.programCode}
                  </span>
                </div>

                {/* KPI Overview Pills */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                    <span className="block text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Total Package</span>
                    <span className="text-xs font-bold text-[var(--brand-primary)] font-mono">
                      NPR {selectedProgram.totalProgramFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                    <span className="block text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Annual Split</span>
                    <span className="text-xs font-bold text-neutral-800 font-mono">
                      NPR {selectedProgram.annualFeeEquivalent.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                    <span className="block text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Sem Split</span>
                    <span className="text-xs font-bold text-neutral-800 font-mono">
                      NPR {selectedProgram.semesterFeeEquivalent.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Head-wise Structure */}
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                    Total Package Heads Breakdown
                  </h3>
                  <div className="rounded-[6px] border border-[var(--border-default)] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                          <th className="py-2 px-3">Fee Component</th>
                          <th className="py-2 px-3 text-right">Amount (NPR)</th>
                          <th className="py-2 px-3 text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-light)]">
                        {selectedProgram.headsBreakdown.map((h, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{h.head}</td>
                            <td className="py-2 px-3 text-right font-mono font-medium">{h.amount.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-mono text-[11px] text-[var(--text-tertiary)]">
                              {Math.round((h.amount / selectedProgram.totalProgramFee) * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Link Navigation */}
                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-tertiary)]">
                    {selectedProgram.enrolledStudentsCount} active students enrolled
                  </span>
                  <Link
                    href={ROUTES.FEES.SETUP.PROGRAM_ANNUAL}
                    className="font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                  >
                    <span>Configure Year Splits</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
