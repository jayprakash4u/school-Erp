"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Layers,
  DollarSign,
  ArrowRight,
  Sliders,
  Calendar,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ClassAnnualFeeRecord {
  id: string;
  className: string;
  sectionCode: string;
  academicYear: string;
  annualTuition: number;
  annualDevelopment: number;
  termExams: number;
  coCurricular: number;
  totalAnnualFee: number;
  installments: number;
  studentsCount: number;
  status: "Active" | "Draft";
}

const DEFAULT_CLASS_ANNUAL: ClassAnnualFeeRecord[] = [
  {
    id: "caf-1",
    className: "Grade 10",
    sectionCode: "All Sections (A, B)",
    academicYear: "2026-2027 (2083 BS)",
    annualTuition: 48000,
    annualDevelopment: 12000,
    termExams: 8000,
    coCurricular: 7000,
    totalAnnualFee: 75000,
    installments: 4,
    studentsCount: 84,
    status: "Active",
  },
  {
    id: "caf-2",
    className: "Grade 9",
    sectionCode: "All Sections (A, B)",
    academicYear: "2026-2027 (2083 BS)",
    annualTuition: 44000,
    annualDevelopment: 10000,
    termExams: 7000,
    coCurricular: 7000,
    totalAnnualFee: 68000,
    installments: 4,
    studentsCount: 78,
    status: "Active",
  },
  {
    id: "caf-3",
    className: "Grade 8",
    sectionCode: "All Sections (A, B, C)",
    academicYear: "2026-2027 (2083 BS)",
    annualTuition: 40000,
    annualDevelopment: 9000,
    termExams: 7000,
    coCurricular: 6000,
    totalAnnualFee: 62000,
    installments: 4,
    studentsCount: 112,
    status: "Active",
  },
  {
    id: "caf-4",
    className: "Grade 1-5 (Primary Wing)",
    sectionCode: "Primary Classes",
    academicYear: "2026-2027 (2083 BS)",
    annualTuition: 32000,
    annualDevelopment: 7000,
    termExams: 5000,
    coCurricular: 4000,
    totalAnnualFee: 48000,
    installments: 4,
    studentsCount: 190,
    status: "Active",
  },
];

export default function ClassAnnualFeePage() {
  const [records, setRecords] = React.useState<ClassAnnualFeeRecord[]>(DEFAULT_CLASS_ANNUAL);
  const [search, setSearch] = React.useState("");
  const [selectedRecord, setSelectedRecord] = React.useState<ClassAnnualFeeRecord | null>(records[0]);

  const filtered = records.filter(
    (r) =>
      r.className.toLowerCase().includes(search.toLowerCase()) ||
      r.academicYear.toLowerCase().includes(search.toLowerCase())
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
            Class Annual Fee
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Class Annual Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage classroom and grade-level annual billing packages, term examination allocations, and development fees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.CLASS_MONTHLY}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              Class Monthly Fee &rarr;
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
                placeholder="Search class annual fees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-4">Class / Grade</th>
                    <th className="py-2.5 px-4">Sections</th>
                    <th className="py-2.5 px-4">Academic Session</th>
                    <th className="py-2.5 px-4">Students</th>
                    <th className="py-2.5 px-4 text-right">Total Annual Fee</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
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
                        <td className="py-3 px-4 text-neutral-600">{r.academicYear}</td>
                        <td className="py-3 px-4">{r.studentsCount} Students</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[var(--brand-primary)]">
                          NPR {r.totalAnnualFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r.status}
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
                    Annual Fee Breakdown
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedRecord.className}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">{selectedRecord.sectionCode}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Annual Tuition Fee:</span>
                    <span className="font-mono">NPR {selectedRecord.annualTuition.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Annual Development Fee:</span>
                    <span className="font-mono">NPR {selectedRecord.annualDevelopment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Term Examination Charges:</span>
                    <span className="font-mono">NPR {selectedRecord.termExams.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Sports & Extra-Curricular:</span>
                    <span className="font-mono">NPR {selectedRecord.coCurricular.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-default)] flex justify-between font-bold text-[var(--text-primary)]">
                    <span>Total Annual Gross:</span>
                    <span className="text-sm font-extrabold text-[var(--brand-primary)] font-mono">
                      NPR {selectedRecord.totalAnnualFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-neutral-600">
                  <span>Billing Split: <strong>{selectedRecord.installments} Equal Installments</strong> (NPR {(selectedRecord.totalAnnualFee / selectedRecord.installments).toLocaleString()} per installment)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
