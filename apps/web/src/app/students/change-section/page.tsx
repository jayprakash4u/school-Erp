"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Search,
  Check,
  ArrowLeftRight,
  AlertCircle,
  X,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface StudentSectionItem {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  currentSection: string;
  selected: boolean;
}

const DEMO_SECTION_STUDENTS: StudentSectionItem[] = [
  {
    id: "1",
    rollNumber: "101",
    name: "Aarav Sharma",
    class: "Grade 10",
    currentSection: "Section A",
    selected: true,
  },
  {
    id: "2",
    rollNumber: "102",
    name: "Pooja Shrestha",
    class: "Grade 10",
    currentSection: "Section A",
    selected: true,
  },
  {
    id: "3",
    rollNumber: "103",
    name: "Rohan Chaudhary",
    class: "Grade 10",
    currentSection: "Section A",
    selected: false,
  },
  {
    id: "4",
    rollNumber: "104",
    name: "Ananya Yadav",
    class: "Grade 10",
    currentSection: "Section A",
    selected: true,
  },
  {
    id: "5",
    rollNumber: "105",
    name: "Karan Adhikari",
    class: "Grade 10",
    currentSection: "Section A",
    selected: false,
  },
];

export default function ChangeSectionPage() {
  const router = useRouter();
  const [sourceBatch, setSourceBatch] = React.useState<string>("2083/84");
  const [selectedClass, setSelectedClass] = React.useState<string>("Grade 10");
  const [sourceSection, setSourceSection] = React.useState<string>("Section A");
  const [targetSection, setTargetSection] = React.useState<string>("Section B");
  const [students, setStudents] = React.useState<StudentSectionItem[]>(DEMO_SECTION_STUDENTS);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const selectedCount = students.filter((s) => s.selected).length;

  const handleSelectAll = () => {
    setFormError(null);
    const allSelected = students.every((s) => s.selected);
    setStudents(students.map((s) => ({ ...s, selected: !allSelected })));
  };

  const handleToggleStudent = (id: string) => {
    setFormError(null);
    setStudents(
      students.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleChangeSection = () => {
    setFormError(null);
    if (!selectedClass) {
      setFormError("Please select a class before transferring students.");
      return;
    }
    if (selectedCount === 0) {
      setFormError("Please select at least one student to move to the new section.");
      return;
    }
    if (sourceSection === targetSection) {
      setFormError(`Target section must be different from the source section (${sourceSection}).`);
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
              Change Section
            </h1>
            <p className="text-xs text-[var(--neutral-500)]">
              Move students between sections or assign sections to students
            </p>
          </div>
        </div>

        {/* 4. "How it works" Instructional Guide Card matching reference */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <FileSpreadsheet className="h-4 w-4 text-[var(--brand-primary)]" />
            <span>How it works</span>
          </div>
          <ol className="text-xs text-[var(--neutral-600)] space-y-1 pl-6 list-decimal leading-relaxed">
            <li>Select source batch, class/semester and optionally filter by source section</li>
            <li>Select the target section (within the same class)</li>
            <li>Enter academic year and change reason</li>
            <li>Choose students and click &ldquo;Change Section&rdquo; to complete</li>
          </ol>
        </div>

        {/* 5. Dual Side-by-Side Selection Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Select Class/Semester Card */}
          <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
            <div className="border-b border-[var(--border-default)] pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Users className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Select Class/Semester</span>
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                Select the class containing students to move
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
                  <option value="2083/84">2083/84 (Current Active Session)</option>
                  <option value="2082/83">2082/83</option>
                </select>
                <span className="text-[10px] text-[var(--neutral-400)] block">
                  Only students from the selected batch will be shown
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Class/Semester <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 7">Grade 7</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Source Section
                  </label>
                  <select
                    value={sourceSection}
                    onChange={(e) => setSourceSection(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Section A">Section A (Current)</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Target Section Card */}
          <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
            <div className="border-b border-[var(--border-default)] pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <ArrowRight className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Target Section</span>
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                Select the new section for selected students
              </p>
            </div>

            <div className="space-y-3.5">
              {selectedClass ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Target Section <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={targetSection}
                    onChange={(e) => {
                      setFormError(null);
                      setTargetSection(e.target.value);
                    }}
                    className={cn(
                      "w-full h-8 px-2 text-xs bg-white border rounded-[4px] focus:outline-none font-medium transition-colors",
                      sourceSection === targetSection
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  >
                    <option value="Section B">Section B (Lotus - 32/40 capacity)</option>
                    <option value="Section C">Section C (Rose - 28/40 capacity)</option>
                    <option value="Section A">Section A (Sunflower)</option>
                    <option value="Unassigned">Remove section assignment</option>
                  </select>
                  {sourceSection === targetSection ? (
                    <p className="text-[11px] text-red-600 font-medium">
                      Target section must be different from source section ({sourceSection}).
                    </p>
                  ) : (
                    <span className="text-[10px] text-[var(--neutral-400)] block">
                      Students will be reassigned to {targetSection} within {selectedClass}
                    </span>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-red-600 font-medium">
                  Please select a class first
                </div>
              )}
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

        {/* 6. Students Checklist Table */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-secondary)]/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Students in {selectedClass} ({sourceSection})
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
                placeholder="Search students..."
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
                  <th className="py-2.5 px-4 w-20">Roll No</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Current Section</th>
                  <th className="py-2.5 px-4">New Target Section</th>
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
                      {stu.class}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[11px] font-medium text-[var(--neutral-700)]">
                        {stu.currentSection}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {stu.selected ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 w-fit">
                          <ArrowLeftRight className="h-3 w-3" />
                          <span>{targetSection}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--neutral-400)] italic">No change</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. Bottom Action Bar matching screenshot */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={ROUTES.STUDENTS.ROOT}
            className="px-4 py-2 rounded-[4px] border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] transition-colors cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleChangeSection}
            disabled={selectedCount === 0}
            className="px-5 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Change Section for {selectedCount} Selected Students</span>
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
                Section Changed Successfully!
              </h2>
              <p className="text-xs text-[var(--neutral-500)]">
                {selectedCount} students in {selectedClass} have been transferred from {sourceSection} to {targetSection}.
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
