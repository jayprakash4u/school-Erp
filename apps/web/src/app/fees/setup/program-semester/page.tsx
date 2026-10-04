"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
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
  Calendar,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface SemesterFeeEntry {
  semesterNumber: number;
  semesterTitle: string;
  tuitionFee: number;
  labCharge: number;
  examRegistration: number;
  totalSemesterFee: number;
  dueMonth: string;
}

interface ProgramSemesterStructure {
  id: string;
  programCode: string;
  programName: string;
  totalProgramFee: number;
  semestersCount: number;
  semesters: SemesterFeeEntry[];
  status: "Active" | "Draft";
}

const DEFAULT_SEMESTER_STRUCTURES: ProgramSemesterStructure[] = [
  {
    id: "pss-1",
    programCode: "BCA-TU",
    programName: "Bachelor of Computer Application (BCA)",
    totalProgramFee: 400000,
    semestersCount: 8,
    semesters: [
      { semesterNumber: 1, semesterTitle: "1st Semester (Freshman Fall)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Kartik 2083" },
      { semesterNumber: 2, semesterTitle: "2nd Semester (Freshman Spring)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Chaitra 2083" },
      { semesterNumber: 3, semesterTitle: "3rd Semester (Sophomore Fall)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Kartik 2084" },
      { semesterNumber: 4, semesterTitle: "4th Semester (Sophomore Spring)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Chaitra 2084" },
      { semesterNumber: 5, semesterTitle: "5th Semester (Junior Fall)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Kartik 2085" },
      { semesterNumber: 6, semesterTitle: "6th Semester (Junior Spring)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Chaitra 2085" },
      { semesterNumber: 7, semesterTitle: "7th Semester (Senior Project Fall)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Kartik 2086" },
      { semesterNumber: 8, semesterTitle: "8th Semester (Internship Spring)", tuitionFee: 30000, labCharge: 12000, examRegistration: 8000, totalSemesterFee: 50000, dueMonth: "Chaitra 2086" },
    ],
    status: "Active",
  },
  {
    id: "pss-2",
    programCode: "BBA-TU",
    programName: "Bachelor of Business Administration (BBA)",
    totalProgramFee: 450000,
    semestersCount: 8,
    semesters: [
      { semesterNumber: 1, semesterTitle: "1st Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Kartik 2083" },
      { semesterNumber: 2, semesterTitle: "2nd Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Chaitra 2083" },
      { semesterNumber: 3, semesterTitle: "3rd Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Kartik 2084" },
      { semesterNumber: 4, semesterTitle: "4th Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Chaitra 2084" },
      { semesterNumber: 5, semesterTitle: "5th Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Kartik 2085" },
      { semesterNumber: 6, semesterTitle: "6th Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Chaitra 2085" },
      { semesterNumber: 7, semesterTitle: "7th Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Kartik 2086" },
      { semesterNumber: 8, semesterTitle: "8th Semester", tuitionFee: 35000, labCharge: 13000, examRegistration: 8250, totalSemesterFee: 56250, dueMonth: "Chaitra 2086" },
    ],
    status: "Active",
  },
];

export default function ProgramSemesterFeePage() {
  const [structures, setStructures] = React.useState<ProgramSemesterStructure[]>(DEFAULT_SEMESTER_STRUCTURES);
  const [selectedStructure, setSelectedStructure] = React.useState<ProgramSemesterStructure>(structures[0]);
  const [search, setSearch] = React.useState("");

  const filtered = structures.filter((s) =>
    s.programName.toLowerCase().includes(search.toLowerCase()) ||
    s.programCode.toLowerCase().includes(search.toLowerCase())
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
            Program Semester Fee
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Program Semester Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage semester-by-semester charging terms, university exam registration dues, and lab component schedules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.PROGRAM_TOTAL}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              &larr; Program Total
            </Link>
            <Link
              href={ROUTES.FEES.SETUP.PROGRAM_ANNUAL}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              Program Annual &rarr;
            </Link>
          </div>
        </div>

        {/* Selection & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Selection */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search semester programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((item) => {
                const isSelected = selectedStructure.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedStructure(item)}
                    className={cn(
                      "p-4 rounded-[8px] border transition-all cursor-pointer",
                      isSelected
                        ? "bg-white border-[var(--brand-primary)] shadow-xs"
                        : "bg-white/80 border-[var(--border-default)] hover:border-neutral-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {item.programName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                        {item.programCode}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-tertiary)]">
                        {item.semestersCount} Semesters
                      </span>
                      <span className="font-mono font-bold text-[var(--brand-primary)]">
                        NPR {item.totalProgramFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Semester Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Semester-wise Fee Schedule
                  </span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedStructure.programName} ({selectedStructure.programCode})
                  </h2>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 bg-rose-50 text-[var(--brand-primary)] rounded border border-rose-100">
                  Total NPR {selectedStructure.totalProgramFee.toLocaleString()}
                </span>
              </div>

              <div className="rounded-[6px] border border-[var(--border-default)] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2.5 px-3">Sem</th>
                      <th className="py-2.5 px-3">Semester Title</th>
                      <th className="py-2.5 px-3">Tuition (NPR)</th>
                      <th className="py-2.5 px-3">Lab (NPR)</th>
                      <th className="py-2.5 px-3">Exam Reg</th>
                      <th className="py-2.5 px-3 text-right">Sem Total (NPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {selectedStructure.semesters.map((sem) => (
                      <tr key={sem.semesterNumber} className="hover:bg-[var(--neutral-50)]/50">
                        <td className="py-2.5 px-3 font-bold text-[var(--brand-primary)]">
                          Sem {sem.semesterNumber}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                          {sem.semesterTitle}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{sem.tuitionFee.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono">{sem.labCharge.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono">{sem.examRegistration.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--brand-primary)]">
                          NPR {sem.totalSemesterFee.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  Average per Semester: <strong>NPR {(selectedStructure.totalProgramFee / selectedStructure.semestersCount).toLocaleString()}</strong>
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Automatic semester invoice billing runs on term commencement
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
