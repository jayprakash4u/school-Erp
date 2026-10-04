"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sliders,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Calendar,
  Eye,
  ExternalLink,
  Filter,
  DollarSign,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type ViewTab = "all" | "programs" | "classes" | "students";

interface ProgramFeeData {
  id: string;
  code: string;
  name: string;
  totalFee: number;
  duration: string;
  annualConfigured: boolean;
  annualYears: { name: string; amount: number }[];
  semesterConfigured: boolean;
  semesters: { name: string; amount: number }[];
  enrolledStudents: number;
}

interface ClassFeeData {
  id: string;
  className: string;
  annualFee: number | null;
  annualInstallments?: number;
  monthlyFee: number | null;
  monthlyDay?: number;
  studentsCount: number;
}

interface StudentFeeData {
  id: string;
  studentId: string;
  admissionNo: string;
  name: string;
  grade: string;
  standardFee: number;
  customFee: number | null;
  waiverPercent?: number;
  customScheduleConfigured: boolean;
  scheduleMilestonesCount?: number;
}

const PROGRAM_RECORDS: ProgramFeeData[] = [
  {
    id: "p-bca",
    code: "BCA-TU",
    name: "Bachelor of Computer Application (BCA)",
    totalFee: 400000,
    duration: "4 Years (8 Semesters)",
    annualConfigured: true,
    annualYears: [
      { name: "Year 1", amount: 110000 },
      { name: "Year 2", amount: 100000 },
      { name: "Year 3", amount: 100000 },
      { name: "Year 4", amount: 90000 },
    ],
    semesterConfigured: true,
    semesters: [
      { name: "Semester 1", amount: 50000 },
      { name: "Semester 2", amount: 50000 },
      { name: "Semester 3", amount: 50000 },
      { name: "Semester 4", amount: 50000 },
      { name: "Semester 5", amount: 50000 },
      { name: "Semester 6", amount: 50000 },
      { name: "Semester 7", amount: 50000 },
      { name: "Semester 8", amount: 50000 },
    ],
    enrolledStudents: 140,
  },
  {
    id: "p-bba",
    code: "BBA-TU",
    name: "Bachelor of Business Administration (BBA)",
    totalFee: 350000,
    duration: "4 Years (8 Semesters)",
    annualConfigured: true,
    annualYears: [
      { name: "Year 1", amount: 90000 },
      { name: "Year 2", amount: 90000 },
      { name: "Year 3", amount: 85000 },
      { name: "Year 4", amount: 85000 },
    ],
    semesterConfigured: false,
    semesters: [],
    enrolledStudents: 120,
  },
  {
    id: "p-sci",
    code: "SCI-1112",
    name: "Ten Plus Two (+2) Science",
    totalFee: 180000,
    duration: "2 Years (Grade 11-12)",
    annualConfigured: true,
    annualYears: [
      { name: "Grade 11", amount: 95000 },
      { name: "Grade 12", amount: 85000 },
    ],
    semesterConfigured: false,
    semesters: [],
    enrolledStudents: 210,
  },
];

const CLASS_RECORDS: ClassFeeData[] = [
  {
    id: "c-10",
    className: "Class 10 (Grade 10 - SEE Batch)",
    annualFee: 80000,
    annualInstallments: 4,
    monthlyFee: null,
    studentsCount: 84,
  },
  {
    id: "c-9",
    className: "Class 9 (Grade 9)",
    annualFee: 75000,
    annualInstallments: 4,
    monthlyFee: 7000,
    monthlyDay: 1,
    studentsCount: 78,
  },
  {
    id: "c-8",
    className: "Class 8 (Grade 8)",
    annualFee: 62000,
    annualInstallments: 4,
    monthlyFee: 4900,
    monthlyDay: 1,
    studentsCount: 112,
  },
  {
    id: "c-pri",
    className: "Primary Wing (Class 1 to 5)",
    annualFee: 48000,
    annualInstallments: 4,
    monthlyFee: 3400,
    monthlyDay: 1,
    studentsCount: 190,
  },
];

const STUDENT_RECORDS: StudentFeeData[] = [
  {
    id: "s-1",
    studentId: "STU-10245",
    admissionNo: "ADM-2083-042",
    name: "Rahul Sharma",
    grade: "Grade 10 - Section A",
    standardFee: 100000,
    customFee: 80000,
    waiverPercent: 20,
    customScheduleConfigured: true,
    scheduleMilestonesCount: 5,
  },
  {
    id: "s-2",
    studentId: "STU-10246",
    admissionNo: "ADM-2083-059",
    name: "Priya Thapa",
    grade: "Grade 10 - Section B",
    standardFee: 75000,
    customFee: 67500,
    waiverPercent: 10,
    customScheduleConfigured: true,
    scheduleMilestonesCount: 3,
  },
  {
    id: "s-3",
    studentId: "STU-10248",
    admissionNo: "ADM-2083-099",
    name: "Sita Thapa",
    grade: "Grade 8 - Section A",
    standardFee: 62000,
    customFee: null,
    customScheduleConfigured: false,
  },
];

export default function FeeStructuresDirectoryPage() {
  const [academicYear, setAcademicYear] = React.useState("2026/27 (2083 BS)");
  const [activeTab, setActiveTab] = React.useState<ViewTab>("all");
  const [search, setSearch] = React.useState("");
  const [showCreateDropdown, setShowCreateDropdown] = React.useState(false);

  // Accordion expanded states
  const [expandedPrograms, setExpandedPrograms] = React.useState<Record<string, boolean>>({ "p-bca": true });

  const toggleProgramExpand = (id: string) => {
    setExpandedPrograms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPrograms = PROGRAM_RECORDS.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredClasses = CLASS_RECORDS.filter((c) => c.className.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = STUDENT_RECORDS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
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
          <span className="text-[var(--text-secondary)]">Fee Management</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Fee Structures
          </span>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fee Structures & Master Configurations
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Central directory to inspect, search, and manage all configured fee structures across Programs, Classes, and Students
              </p>
            </div>
          </div>

          {/* Create Fee Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create Fee Structure</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            </button>

            {showCreateDropdown && (
              <div
                className="absolute right-0 top-full mt-1.5 w-64 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xl p-2 z-50 animate-in fade-in-0 zoom-in-95 space-y-1 text-xs"
                onMouseLeave={() => setShowCreateDropdown(false)}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-2 py-1">
                  Choose Fee Setup Type
                </div>
                <Link
                  href={ROUTES.FEES.SETUP.PROGRAM_TOTAL}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <Layers className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Program Total Fee</span>
                </Link>
                <Link
                  href={ROUTES.FEES.SETUP.PROGRAM_ANNUAL}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Program Annual Fee</span>
                </Link>
                <Link
                  href={ROUTES.FEES.SETUP.PROGRAM_SEMESTER}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <Clock className="h-3.5 w-3.5 text-purple-600" />
                  <span>Program Semester Fee</span>
                </Link>
                <Link
                  href={ROUTES.FEES.SETUP.CLASS_ANNUAL}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <Building className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Class Annual Fee</span>
                </Link>
                <Link
                  href={ROUTES.FEES.SETUP.CLASS_MONTHLY}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <Calendar className="h-3.5 w-3.5 text-teal-600" />
                  <span>Class Monthly Fee</span>
                </Link>
                <Link
                  href={ROUTES.FEES.SETUP.STUDENT_CUSTOM}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <UserCheck className="h-3.5 w-3.5 text-rose-600" />
                  <span>Student Custom Fee</span>
                </Link>
                <Link
                  href={ROUTES.FEES.SETUP.STUDENT_SCHEDULE}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--neutral-50)] text-neutral-800 font-medium"
                >
                  <Sliders className="h-3.5 w-3.5 text-amber-600" />
                  <span>Student Fee Schedule</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls Row: Academic Year Selector + Search + View Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs">
              {(
                [
                  { id: "all", label: "All Configured Fees" },
                  { id: "programs", label: "Program Fees" },
                  { id: "classes", label: "Class Fees" },
                  { id: "students", label: "Student Fees" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-[4px] text-xs font-bold transition-all",
                    activeTab === t.id
                      ? "bg-[var(--brand-primary)] text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Academic Year Selector */}
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--text-primary)] shadow-xs focus:outline-none focus:border-[var(--brand-primary)]"
            >
              <option value="2026/27 (2083 BS)">Session: 2026/27 (2083 BS) - Active</option>
              <option value="2027/28 (2084 BS)">Session: 2027/28 (2084 BS) - Next</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search programs, classes or students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-[6px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] shadow-xs focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        {/* Content Section: Hierarchical Tree & Category Blocks */}
        <div className="space-y-6">
          {/* SECTION 1: PROGRAMS */}
          {(activeTab === "all" || activeTab === "programs") && filteredPrograms.length > 0 && (
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Degree & Program Level Fee Structures ({filteredPrograms.length})
                  </h2>
                </div>
                <Link
                  href={ROUTES.FEES.SETUP.PROGRAM_TOTAL}
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                >
                  <span>Program Setup &rarr;</span>
                </Link>
              </div>

              <div className="divide-y divide-[var(--border-light)]">
                {filteredPrograms.map((prog) => {
                  const isExpanded = expandedPrograms[prog.id];
                  return (
                    <div key={prog.id} className="p-4 space-y-3">
                      {/* Program Summary Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleProgramExpand(prog.id)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 mt-0.5"
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                !isExpanded && "-rotate-90"
                              )}
                            />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                {prog.name}
                              </h3>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] font-semibold">
                                {prog.code}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                              {prog.duration} • {prog.enrolledStudents} Enrolled Students
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:text-right pl-7 sm:pl-0">
                          <div>
                            <span className="text-[10px] text-[var(--text-tertiary)] block uppercase font-semibold">Total Program Fee</span>
                            <span className="text-sm font-extrabold text-[var(--brand-primary)] font-mono">
                              NPR {prog.totalFee.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1",
                                prog.annualConfigured
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-neutral-100 text-neutral-500"
                              )}
                            >
                              {prog.annualConfigured ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              <span>Annual {prog.annualConfigured ? "✓" : "None"}</span>
                            </span>

                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1",
                                prog.semesterConfigured
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-neutral-100 text-neutral-500"
                              )}
                            >
                              {prog.semesterConfigured ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              <span>Semester {prog.semesterConfigured ? "✓" : "None"}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hierarchical Sub-Breakdowns (Years & Semesters) */}
                      {isExpanded && (
                        <div className="ml-7 pt-3 border-t border-[var(--border-light)] grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-0 duration-150">
                          {/* Annual Breakdown Box */}
                          <div className="p-3 rounded-[6px] bg-[var(--bg-secondary)]/50 border border-[var(--border-default)] space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                <span>Annual Fee Breakdown</span>
                              </span>
                              <Link
                                href={ROUTES.FEES.SETUP.PROGRAM_ANNUAL}
                                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline"
                              >
                                Edit Annual &rarr;
                              </Link>
                            </div>
                            <div className="space-y-1 text-xs">
                              {prog.annualYears.map((yr, i) => (
                                <div key={i} className="flex justify-between text-neutral-600">
                                  <span>{yr.name}:</span>
                                  <span className="font-mono font-medium">NPR {yr.amount.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Semester Breakdown Box */}
                          <div className="p-3 rounded-[6px] bg-[var(--bg-secondary)]/50 border border-[var(--border-default)] space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-purple-600" />
                                <span>Semester Fee Breakdown</span>
                              </span>
                              <Link
                                href={ROUTES.FEES.SETUP.PROGRAM_SEMESTER}
                                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline"
                              >
                                {prog.semesterConfigured ? "Edit Semester →" : "+ Configure Semester"}
                              </Link>
                            </div>
                            {prog.semesterConfigured ? (
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                {prog.semesters.map((sem, i) => (
                                  <div key={i} className="flex justify-between text-neutral-600">
                                    <span className="truncate">{sem.name}:</span>
                                    <span className="font-mono font-medium">{sem.amount.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[var(--text-tertiary)] italic">
                                Semester split not configured for this program. Billed annually.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: CLASSES */}
          {(activeTab === "all" || activeTab === "classes") && filteredClasses.length > 0 && (
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Class & Grade Level Fee Structures ({filteredClasses.length})
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <Link href={ROUTES.FEES.SETUP.CLASS_ANNUAL} className="text-[var(--brand-primary)] hover:underline">
                    Class Annual Setup
                  </Link>
                  <span className="text-neutral-300">•</span>
                  <Link href={ROUTES.FEES.SETUP.CLASS_MONTHLY} className="text-[var(--brand-primary)] hover:underline">
                    Class Monthly Setup
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2.5 px-4">Class / Grade</th>
                      <th className="py-2.5 px-4">Students</th>
                      <th className="py-2.5 px-4 text-right">Annual Fee</th>
                      <th className="py-2.5 px-4 text-right">Monthly Fee</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredClasses.map((cls) => (
                      <tr key={cls.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{cls.className}</td>
                        <td className="py-3 px-4 text-neutral-600">{cls.studentsCount} Students</td>
                        <td className="py-3 px-4 text-right">
                          {cls.annualFee ? (
                            <div>
                              <span className="font-mono font-bold text-[var(--brand-primary)]">
                                NPR {cls.annualFee.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-[var(--text-tertiary)] block">
                                ({cls.annualInstallments} Installments)
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Not configured</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {cls.monthlyFee ? (
                            <div>
                              <span className="font-mono font-bold text-emerald-700">
                                NPR {cls.monthlyFee.toLocaleString()} / mo
                              </span>
                              <span className="text-[10px] text-[var(--text-tertiary)] block">
                                (Day {cls.monthlyDay} of month)
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">Not configured</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={cls.annualFee ? ROUTES.FEES.SETUP.CLASS_ANNUAL : ROUTES.FEES.SETUP.CLASS_MONTHLY}
                            className="font-bold text-[var(--brand-primary)] hover:underline"
                          >
                            Configure &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: INDIVIDUAL STUDENTS */}
          {(activeTab === "all" || activeTab === "students") && filteredStudents.length > 0 && (
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-rose-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Individual Student Overrides & Fee Schedules ({filteredStudents.length})
                  </h2>
                </div>
                <Link
                  href={ROUTES.FEES.SETUP.STUDENT_CUSTOM}
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                >
                  <span>Student Custom Setup &rarr;</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2.5 px-4">Student Details</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4 text-right">Standard Fee</th>
                      <th className="py-2.5 px-4 text-right">Custom Agreed Fee</th>
                      <th className="py-2.5 px-4 text-center">Custom Schedule</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)]">{stu.name}</div>
                          <div className="text-[11px] text-[var(--text-tertiary)] font-mono">{stu.admissionNo} • {stu.studentId}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{stu.grade}</td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-500">
                          NPR {stu.standardFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {stu.customFee ? (
                            <div>
                              <span className="font-mono font-bold text-[var(--brand-primary)]">
                                NPR {stu.customFee.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 block">
                                ({stu.waiverPercent}% Approved Waiver)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-500 font-medium">None (Standard)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {stu.customScheduleConfigured ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Configured ✓ ({stu.scheduleMilestonesCount} Milestones)
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Standard Schedule</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={ROUTES.FEES.SETUP.STUDENT_SCHEDULE}
                            className="font-bold text-[var(--brand-primary)] hover:underline"
                          >
                            Manage Schedule &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
