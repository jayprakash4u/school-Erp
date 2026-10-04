"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ChevronRight,
  Layers,
  Building,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  Sliders,
  Plus,
  Percent,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AssignmentScope = "program" | "class" | "student";

interface FeeStructureOption {
  id: string;
  name: string;
  code: string;
  totalAmount: number;
  installments: number;
  items: { head: string; amount: number; frequency: string }[];
}

const SAMPLE_STRUCTURES: FeeStructureOption[] = [
  {
    id: "fs-1",
    name: "General Secondary Standard Fee Plan (Grade 8-10)",
    code: "SEC-STD-2083",
    totalAmount: 67000,
    installments: 4,
    items: [
      { head: "Tuition Fee", amount: 48000, frequency: "Monthly (4,000 x 12)" },
      { head: "Annual Development & Maintenance", amount: 8000, frequency: "Annual" },
      { head: "Examination Fee", amount: 5000, frequency: "Per Term (2,500 x 2)" },
      { head: "Computer Lab & STEM", amount: 4000, frequency: "Annual" },
      { head: "Library & Sports Resource", amount: 2000, frequency: "Annual" },
    ],
  },
  {
    id: "fs-2",
    name: "+2 Science Stream Package (Physics/Chemistry/Bio)",
    code: "SCI-1112-2083",
    totalAmount: 92000,
    installments: 3,
    items: [
      { head: "Tuition Fee", amount: 60000, frequency: "Monthly (5,000 x 12)" },
      { head: "Advanced Science Laboratory", amount: 16000, frequency: "Annual" },
      { head: "Board Exam & Registration", amount: 7000, frequency: "Annual" },
      { head: "Digital Library & Journals", amount: 4000, frequency: "Annual" },
      { head: "Co-curricular & Seminars", amount: 5000, frequency: "Annual" },
    ],
  },
  {
    id: "fs-3",
    name: "+2 Management & Commerce Package",
    code: "MGT-1112-2083",
    totalAmount: 78000,
    installments: 3,
    items: [
      { head: "Tuition Fee", amount: 54000, frequency: "Monthly (4,500 x 12)" },
      { head: "Computer & Business Lab", amount: 9000, frequency: "Annual" },
      { head: "Board Exam & Registration", amount: 7000, frequency: "Annual" },
      { head: "Library & Case Studies", amount: 4000, frequency: "Annual" },
      { head: "Student Leadership Council", amount: 4000, frequency: "Annual" },
    ],
  },
  {
    id: "fs-4",
    name: "Primary Wing Complete Package (Grade 1-5)",
    code: "PRI-STD-2083",
    totalAmount: 46000,
    installments: 4,
    items: [
      { head: "Tuition Fee", amount: 36000, frequency: "Monthly (3,000 x 12)" },
      { head: "Activity & Arts Material", amount: 5000, frequency: "Annual" },
      { head: "Sports & Physical Ed", amount: 3000, frequency: "Annual" },
      { head: "Evaluation & Term Reports", amount: 2000, frequency: "Annual" },
    ],
  },
];

interface AssignmentLog {
  id: string;
  scope: AssignmentScope;
  targetName: string;
  structureName: string;
  academicYear: string;
  studentsCount: number;
  totalAnnualFee: number;
  assignedBy: string;
  assignedDate: string;
  status: "Active" | "Scheduled";
}

const INITIAL_LOGS: AssignmentLog[] = [
  {
    id: "asg-101",
    scope: "class",
    targetName: "Grade 10 - Section A & B",
    structureName: "General Secondary Standard Fee Plan (Grade 8-10)",
    academicYear: "2026-2027 (2083 BS)",
    studentsCount: 78,
    totalAnnualFee: 67000,
    assignedBy: "Accounts Admin",
    assignedDate: "2026-09-15",
    status: "Active",
  },
  {
    id: "asg-102",
    scope: "program",
    targetName: "Ten Plus Two (+2) Science - Year 1",
    structureName: "+2 Science Stream Package (Physics/Chemistry/Bio)",
    academicYear: "2026-2027 (2083 BS)",
    studentsCount: 124,
    totalAnnualFee: 92000,
    assignedBy: "Finance Director",
    assignedDate: "2026-09-12",
    status: "Active",
  },
  {
    id: "asg-103",
    scope: "student",
    targetName: "Aarav Sharma (STU-10245, Grade 8-A)",
    structureName: "General Secondary Standard Fee Plan (Grade 8-10)",
    academicYear: "2026-2027 (2083 BS)",
    studentsCount: 1,
    totalAnnualFee: 60300, // 10% sibling discount
    assignedBy: "Cashier Counter",
    assignedDate: "2026-09-20",
    status: "Active",
  },
];

export default function UnifiedFeeAssignmentPage() {
  const [scope, setScope] = React.useState<AssignmentScope>("class");
  const [selectedStructureId, setSelectedStructureId] = React.useState<string>("fs-1");
  const [academicYear, setAcademicYear] = React.useState("2026-2027 (2083 BS)");

  // Program fields
  const [selectedProgram, setSelectedProgram] = React.useState("10plus2-sci");
  const [programYear, setProgramYear] = React.useState("Year 1");

  // Class fields
  const [selectedClass, setSelectedClass] = React.useState("Grade 8");
  const [selectedSection, setSelectedSection] = React.useState("All Sections");

  // Student fields
  const [studentSearch, setStudentSearch] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<{
    id: string;
    name: string;
    admissionNo: string;
    grade: string;
  } | null>({
    id: "STU-10245",
    name: "Aarav Sharma",
    admissionNo: "ADM-2083-042",
    grade: "Grade 8 - Section A",
  });

  // Concession & installments
  const [concession, setConcession] = React.useState("none");
  const [installmentPlan, setInstallmentPlan] = React.useState("default");

  // Logs state
  const [logs, setLogs] = React.useState<AssignmentLog[]>(INITIAL_LOGS);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const activeStructure =
    SAMPLE_STRUCTURES.find((s) => s.id === selectedStructureId) || SAMPLE_STRUCTURES[0];

  // Calculate discount
  const discountMultiplier = concession === "sibling10" ? 0.9 : concession === "merit15" ? 0.85 : concession === "staff25" ? 0.75 : 1.0;
  const netAmount = Math.round(activeStructure.totalAmount * discountMultiplier);

  const handleAssignFee = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = "";
    let studentsCount = 1;

    if (scope === "program") {
      const progName =
        selectedProgram === "10plus2-sci"
          ? "Ten Plus Two (+2) Science"
          : selectedProgram === "10plus2-mgt"
          ? "Ten Plus Two (+2) Management"
          : "B.Sc. Computer Science & IT";
      targetName = `${progName} - ${programYear}`;
      studentsCount = 65;
    } else if (scope === "class") {
      targetName = `${selectedClass} - ${selectedSection}`;
      studentsCount = selectedSection === "All Sections" ? 82 : 41;
    } else {
      targetName = selectedStudent
        ? `${selectedStudent.name} (${selectedStudent.admissionNo}, ${selectedStudent.grade})`
        : "Selected Student";
      studentsCount = 1;
    }

    const newLog: AssignmentLog = {
      id: `asg-${Date.now().toString().slice(-4)}`,
      scope,
      targetName,
      structureName: activeStructure.name,
      academicYear,
      studentsCount,
      totalAnnualFee: netAmount,
      assignedBy: "Accounts Admin",
      assignedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setLogs([newLog, ...logs]);
    setToastMessage(`Successfully assigned "${activeStructure.name}" to ${targetName}!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link
            href={ROUTES.FEES.ROOT}
            className="hover:text-[var(--brand-primary)] transition-colors"
          >
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={ROUTES.FEES.SETUP.ROOT}
            className="hover:text-[var(--brand-primary)] transition-colors"
          >
            Fee Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Fee Assignment
          </span>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in-0 duration-150">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Fee Assignment
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Assign fee structures and master charging schedules across programs, classes, or individual students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.STRUCTURE}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--neutral-700)] flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="h-3.5 w-3.5 text-neutral-500" />
              <span>Manage Fee Structures</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Assignment Builder Form (Left 7 cols) + Live Preview & Summary (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Assignment Form */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-5">
              {/* Step 1: Assignment Scope Toggle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Assign Fees Based On
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setScope("program")}
                    className={cn(
                      "py-2 px-3 rounded-[4px] text-xs font-bold transition-all flex items-center justify-center gap-2",
                      scope === "program"
                        ? "bg-white text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Program / Stream</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("class")}
                    className={cn(
                      "py-2 px-3 rounded-[4px] text-xs font-bold transition-all flex items-center justify-center gap-2",
                      scope === "class"
                        ? "bg-white text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Building className="h-3.5 w-3.5" />
                    <span>Class / Grade</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("student")}
                    className={cn(
                      "py-2 px-3 rounded-[4px] text-xs font-bold transition-all flex items-center justify-center gap-2",
                      scope === "student"
                        ? "bg-white text-[var(--brand-primary)] shadow-xs border border-[var(--border-default)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Single Student</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAssignFee} className="space-y-4">
                {/* Academic Session & Fee Structure Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Academic Year / Session <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    >
                      <option value="2026-2027 (2083 BS)">2026-2027 (2083 BS) - Current Session</option>
                      <option value="2027-2028 (2084 BS)">2027-2028 (2084 BS) - Next Session</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Fee Structure <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedStructureId}
                      onChange={(e) => setSelectedStructureId(e.target.value)}
                      className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--brand-primary)]"
                    >
                      {SAMPLE_STRUCTURES.map((fs) => (
                        <option key={fs.id} value={fs.id}>
                          {fs.name} (NPR {fs.totalAmount.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Target Selection based on Active Tab */}
                <div className="p-4 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      {scope === "program" && <Layers className="h-3.5 w-3.5 text-[var(--brand-primary)]" />}
                      {scope === "class" && <Building className="h-3.5 w-3.5 text-[var(--brand-primary)]" />}
                      {scope === "student" && <UserCheck className="h-3.5 w-3.5 text-[var(--brand-primary)]" />}
                      <span>
                        {scope === "program" && "Select Target Program / Faculty"}
                        {scope === "class" && "Select Target Class & Sections"}
                        {scope === "student" && "Search & Select Student"}
                      </span>
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {scope === "program" && "Applies to all students enrolled in this program"}
                      {scope === "class" && "Batch maps to all class rosters"}
                      {scope === "student" && "Creates individual student account schedule"}
                    </span>
                  </div>

                  {/* Program Fields */}
                  {scope === "program" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Faculty / Degree Program
                        </label>
                        <select
                          value={selectedProgram}
                          onChange={(e) => setSelectedProgram(e.target.value)}
                          className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                        >
                          <option value="10plus2-sci">Ten Plus Two (+2) Science</option>
                          <option value="10plus2-mgt">Ten Plus Two (+2) Management</option>
                          <option value="bsc-csit">B.Sc. Computer Science & IT</option>
                          <option value="bba">Bachelor of Business Administration (BBA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Academic Year / Term
                        </label>
                        <select
                          value={programYear}
                          onChange={(e) => setProgramYear(e.target.value)}
                          className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                        >
                          <option value="Year 1">Year 1 (Freshman Batch)</option>
                          <option value="Year 2">Year 2 (Sophomore Batch)</option>
                          <option value="All Years">All Active Batches</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Class Fields */}
                  {scope === "class" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Class / Grade
                        </label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                        >
                          <option value="Grade 8">Grade 8 (Middle School)</option>
                          <option value="Grade 9">Grade 9 (Secondary)</option>
                          <option value="Grade 10">Grade 10 (SEE Board Batch)</option>
                          <option value="Grade 11 - Science">Grade 11 - Science</option>
                          <option value="Grade 12 - Science">Grade 12 - Science</option>
                          <option value="Grade 11 - Management">Grade 11 - Management</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Section
                        </label>
                        <select
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                        >
                          <option value="All Sections">All Sections (A, B, C)</option>
                          <option value="Section A">Section A only</option>
                          <option value="Section B">Section B only</option>
                          <option value="Section C">Section C only</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Student Search Field */}
                  {scope === "student" && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Lookup Student by Name or Admission No.
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Type student name or admission number (e.g. Aarav, STU-10245)..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                          />
                        </div>
                      </div>

                      {/* Selected Student Card */}
                      {selectedStudent && (
                        <div className="p-3 rounded-[6px] bg-white border border-[var(--brand-primary)]/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold text-xs flex items-center justify-center">
                              {selectedStudent.name[0]}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--text-primary)]">
                                {selectedStudent.name}
                              </div>
                              <div className="text-[10px] text-[var(--text-tertiary)]">
                                {selectedStudent.admissionNo} • {selectedStudent.grade}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified Active
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Discounts & Installments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Scholarship / Concession Waiver
                    </label>
                    <select
                      value={concession}
                      onChange={(e) => setConcession(e.target.value)}
                      className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    >
                      <option value="none">None / Standard Rate (100%)</option>
                      <option value="sibling10">Sibling Concession (10% Discount)</option>
                      <option value="merit15">Academic Merit Scholarship (15% Discount)</option>
                      <option value="staff25">Staff Child Concession (25% Discount)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Installment Billing Schedule
                    </label>
                    <select
                      value={installmentPlan}
                      onChange={(e) => setInstallmentPlan(e.target.value)}
                      className="w-full h-9 rounded-[4px] border border-[var(--border-default)] bg-white px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    >
                      <option value="default">Structure Default ({activeStructure.installments} Installments)</option>
                      <option value="full">Single Lump-sum Annual Payment</option>
                      <option value="monthly">Monthly Split (12 Installments)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
                  <div className="text-xs text-[var(--text-tertiary)]">
                    Charges will be posted to student ledgers for session {academicYear}
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span>Assign Fee Structure</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Fee Structure Preview & Breakdown */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Structure Breakdown Preview
                  </h3>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {activeStructure.code}
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeStructure.installments} Installments
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {activeStructure.name}
                </h4>
              </div>

              {/* Items List */}
              <div className="rounded-[6px] border border-[var(--border-default)] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                      <th className="py-2 px-3">Fee Head</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3 text-right">Amount (NPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {activeStructure.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[var(--neutral-50)]/50">
                        <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{item.head}</td>
                        <td className="py-2 px-3 text-[11px] text-[var(--text-tertiary)]">{item.frequency}</td>
                        <td className="py-2 px-3 text-right font-mono font-medium">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary Box */}
              <div className="p-3.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Gross Total Annual Fee:</span>
                  <span className="font-mono font-semibold">NPR {activeStructure.totalAmount.toLocaleString()}</span>
                </div>
                {concession !== "none" && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Applied Concession Discount:</span>
                    <span className="font-mono">
                      - NPR {(activeStructure.totalAmount - netAmount).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-[var(--border-default)] flex justify-between items-center">
                  <span className="font-bold text-[var(--text-primary)]">Net Payable per Student:</span>
                  <span className="text-base font-extrabold text-[var(--brand-primary)] font-mono">
                    NPR {netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Fee Assignments Log Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden space-y-0">
          <div className="p-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--bg-secondary)]/50">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Active Fee Assignment Registry
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                History of fee plans mapped to batches, classrooms, and individual students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Total Assigned Records: <strong>{logs.length}</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Scope</th>
                  <th className="py-2.5 px-4">Assigned Target</th>
                  <th className="py-2.5 px-4">Fee Structure</th>
                  <th className="py-2.5 px-4">Academic Session</th>
                  <th className="py-2.5 px-4">Students</th>
                  <th className="py-2.5 px-4">Annual Fee</th>
                  <th className="py-2.5 px-4">Assigned Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          log.scope === "program" && "bg-indigo-50 text-indigo-700 border border-indigo-200",
                          log.scope === "class" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                          log.scope === "student" && "bg-blue-50 text-blue-700 border border-blue-200"
                        )}
                      >
                        {log.scope}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{log.targetName}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{log.structureName}</td>
                    <td className="py-3 px-4 text-[var(--text-tertiary)]">{log.academicYear}</td>
                    <td className="py-3 px-4 font-semibold">{log.studentsCount} Students</td>
                    <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                      NPR {log.totalAnnualFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-tertiary)]">{log.assignedDate}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Details"
                          className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[var(--brand-primary)]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Revoke Assignment"
                          onClick={() => setLogs(logs.filter((l) => l.id !== log.id))}
                          className="p-1 rounded hover:bg-rose-50 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
