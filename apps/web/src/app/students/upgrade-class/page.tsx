"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  Info,
  CheckSquare,
  Square,
  AlertCircle,
  Search,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface StudentUpgradeItem {
  id: string;
  rollNumber: string;
  name: string;
  currentClass: string;
  currentSection: string;
  gpa: string;
  status: "Passed" | "Conditional" | "Failed";
  newRollNumber: string;
  selected: boolean;
}

const DEMO_STUDENTS: StudentUpgradeItem[] = [
  {
    id: "1",
    rollNumber: "101",
    name: "Aarav Sharma",
    currentClass: "Grade 9",
    currentSection: "Section A",
    gpa: "3.85 GPA",
    status: "Passed",
    newRollNumber: "101",
    selected: true,
  },
  {
    id: "2",
    rollNumber: "102",
    name: "Pooja Shrestha",
    currentClass: "Grade 9",
    currentSection: "Section A",
    gpa: "3.90 GPA",
    status: "Passed",
    newRollNumber: "102",
    selected: true,
  },
  {
    id: "3",
    rollNumber: "103",
    name: "Rohan Chaudhary",
    currentClass: "Grade 9",
    currentSection: "Section A",
    gpa: "3.60 GPA",
    status: "Passed",
    newRollNumber: "103",
    selected: true,
  },
  {
    id: "4",
    rollNumber: "104",
    name: "Ananya Yadav",
    currentClass: "Grade 9",
    currentSection: "Section A",
    gpa: "3.95 GPA",
    status: "Passed",
    newRollNumber: "104",
    selected: true,
  },
  {
    id: "5",
    rollNumber: "105",
    name: "Karan Adhikari",
    currentClass: "Grade 9",
    currentSection: "Section A",
    gpa: "3.40 GPA",
    status: "Passed",
    newRollNumber: "105",
    selected: true,
  },
];

export default function UpgradeClassPage() {
  const router = useRouter();
  const [sourceBatch, setSourceBatch] = React.useState<string>("2082/83");
  const [sourceClass, setSourceClass] = React.useState<string>("Grade 9");
  const [targetBatch, setTargetBatch] = React.useState<string>("2083/84");
  const [targetClass, setTargetClass] = React.useState<string>("Grade 10");
  const [targetSection, setTargetSection] = React.useState<string>("Section A");
  const [students, setStudents] = React.useState<StudentUpgradeItem[]>(DEMO_STUDENTS);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [rollErrors, setRollErrors] = React.useState<Record<string, string>>({});

  const selectedCount = students.filter((s) => s.selected).length;

  const handleSelectAll = () => {
    setFormError(null);
    const allSelected = students.every((s) => s.selected);
    setStudents(students.map((s) => ({ ...s, selected: !allSelected })));
  };

  const handleToggleStudent = (id: string) => {
    setFormError(null);
    setRollErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStudents(
      students.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleNewRollChange = (id: string, val: string) => {
    setFormError(null);
    setRollErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStudents(
      students.map((s) => (s.id === id ? { ...s, newRollNumber: val } : s))
    );
  };

  const handleUpgrade = () => {
    setFormError(null);
    const newRollErrors: Record<string, string> = {};

    if (selectedCount === 0) {
      setFormError("Please select at least one student to upgrade.");
      return;
    }

    if (!targetClass) {
      setFormError("Please select a valid target class.");
      return;
    }

    if (sourceClass === targetClass && sourceBatch === targetBatch) {
      setFormError(
        "Target class and session cannot be identical to source class and session. Please select the next grade level or upcoming session."
      );
      return;
    }

    // Validate roll numbers of selected students
    const selectedStudents = students.filter((s) => s.selected);
    const rollSet = new Set<string>();

    for (const stu of selectedStudents) {
      const roll = stu.newRollNumber.trim();
      if (!roll) {
        newRollErrors[stu.id] = "Roll number is required";
      } else if (rollSet.has(roll)) {
        newRollErrors[stu.id] = "Duplicate roll number in target class";
      } else {
        rollSet.add(roll);
      }
    }

    if (Object.keys(newRollErrors).length > 0) {
      setRollErrors(newRollErrors);
      setFormError("Please resolve invalid or duplicate roll numbers for selected students before upgrading.");
      return;
    }

    setIsSuccessModalOpen(true);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none pb-16">
      {/* 1. Global ERP Header */}
      <ErpHeader />

      {/* 2. Global ERP 2-Row Top Navigation Bar */}
      <ErpTopNav activeModuleId="students" />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Page Top Header matching screenshot */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.STUDENTS.ROOT}
            className="p-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Student Promotion
            </h1>
            <p className="text-xs text-[var(--neutral-500)]">
              Promote students to next class or semester
            </p>
          </div>
        </div>

        {/* 4. "How it works" Instructional Guide Card matching reference */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <GraduationCap className="h-4 w-4 text-[var(--brand-primary)]" />
            <span>How it works</span>
          </div>
          <ol className="text-xs text-[var(--neutral-600)] space-y-1 pl-6 list-decimal leading-relaxed">
            <li>Select source batch, class/semester and optional section</li>
            <li>Select the target batch (optional), class/semester and optional section</li>
            <li>Enter academic year and upgrade reason</li>
            <li>Choose students to upgrade and optionally assign new roll numbers</li>
            <li>Click &ldquo;Upgrade Selected Students&rdquo; to complete the process</li>
          </ol>
        </div>

        {/* 5. Dual Side-by-Side Selection Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Source Class Card */}
          <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
            <div className="border-b border-[var(--border-default)] pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Users className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Source Class</span>
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                Select the class/semester to upgrade from
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Source Batch
                </label>
                <select
                  value={sourceBatch}
                  onChange={(e) => setSourceBatch(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="2082/83">2082/83 (Current Session)</option>
                  <option value="2081/82">2081/82 (Past Session)</option>
                  <option value="2080/81">2080/81</option>
                </select>
                <span className="text-[10px] text-[var(--neutral-400)] block">
                  Only students from the selected batch will be shown for upgrade
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Source Class/Semester <span className="text-red-600">*</span>
                </label>
                <select
                  value={sourceClass}
                  onChange={(e) => setSourceClass(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium"
                >
                  <option value="Grade 9">Grade 9 (Class 9)</option>
                  <option value="Grade 8">Grade 8 (Class 8)</option>
                  <option value="Grade 7">Grade 7 (Class 7)</option>
                  <option value="Grade 6">Grade 6 (Class 6)</option>
                  <option value="Grade 5">Grade 5 (Class 5)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Class Card */}
          <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
            <div className="border-b border-[var(--border-default)] pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <ArrowRight className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Target Class</span>
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                Select the class/semester to upgrade to
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Target Batch (Optional)
                </label>
                <select
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="2083/84">2083/84 (Upcoming Academic Session)</option>
                  <option value="2084/85">2084/85</option>
                </select>
                <span className="text-[10px] text-[var(--neutral-400)] block">
                  If selected, students will be assigned to this batch
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Target Class/Semester <span className="text-red-600">*</span>
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium"
                >
                  <option value="Grade 10">Grade 10 (Class 10 - SEE Batch)</option>
                  <option value="Grade 9">Grade 9 (Class 9)</option>
                  <option value="Grade 8">Grade 8 (Class 8)</option>
                  <option value="Grade 7">Grade 7 (Class 7)</option>
                  <option value="Grade 6">Grade 6 (Class 6)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-[6px] flex items-center justify-between gap-3 text-xs text-red-700 animate-in fade-in-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span className="font-medium">{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 6. Eligible Students Checklist Table */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-secondary)]/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Eligible Students ({sourceClass} • {sourceBatch})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--red-50)] text-[var(--brand-primary)] font-bold">
                {selectedCount} Selected
              </span>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter students by name or roll..."
                className="w-full h-7 pl-8 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                  <th className="py-2.5 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="cursor-pointer text-[var(--neutral-600)] hover:text-black"
                    >
                      {students.every((s) => s.selected) ? (
                        <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-4 w-20">Current Roll</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Current Class</th>
                  <th className="py-2.5 px-4">Exam Result</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 w-44">New Roll Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {filteredStudents.map((stu) => (
                  <tr
                    key={stu.id}
                    className={cn(
                      "hover:bg-[var(--neutral-50)] transition-colors",
                      stu.selected && "bg-[var(--red-50)]/30"
                    )}
                  >
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStudent(stu.id)}
                        className="cursor-pointer text-[var(--neutral-600)] hover:text-black"
                      >
                        {stu.selected ? (
                          <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[var(--neutral-700)]">
                      {stu.rollNumber}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[var(--text-primary)]">
                      {stu.name}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--neutral-600)]">
                      {stu.currentClass} ({stu.currentSection})
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-700">
                      {stu.gpa}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {stu.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="space-y-0.5">
                        <input
                          type="text"
                          disabled={!stu.selected}
                          value={stu.newRollNumber}
                          onChange={(e) => handleNewRollChange(stu.id, e.target.value)}
                          className={cn(
                            "w-24 h-7 px-2 text-xs font-mono font-bold bg-white border rounded-[4px] focus:outline-none disabled:bg-neutral-100 disabled:opacity-50 transition-colors",
                            rollErrors[stu.id]
                              ? "border-red-500 bg-red-50/10"
                              : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                          )}
                        />
                        {rollErrors[stu.id] && (
                          <p className="text-[10px] text-red-600 font-medium">{rollErrors[stu.id]}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. Bottom Sticky Action Navigation Bar matching screenshot */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={ROUTES.STUDENTS.ROOT}
            className="px-4 py-2 rounded-[4px] border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={selectedCount === 0}
            className="px-5 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Upgrade {selectedCount} Selected Students</span>
          </button>
        </div>
      </main>

      {/* 8. Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-md bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Students Upgraded Successfully!
              </h2>
              <p className="text-xs text-[var(--neutral-500)]">
                {selectedCount} students have been promoted from {sourceClass} ({sourceBatch}) to {targetClass} ({targetBatch}).
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push(ROUTES.STUDENTS.ROOT)}
                className="px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Go to Student Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
