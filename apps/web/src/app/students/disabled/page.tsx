"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  X,
  Eye,
  UserCheck,
  UserX,
  Columns,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  AlertCircle,
  Check,
  RotateCcw,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { StudentServiceDisableDropdown } from "@/components/students/student-service-disable-dropdown";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export interface DisabledStudentRecord {
  id: string;
  fullName: string;
  fullNameNepali?: string;
  rollNumber: string;
  admissionNumber: string;
  class: string;
  batch: string;
  mobile: string;
  email: string;
  guardianName: string;
  guardianMobile: string;
  disabledDateBS: string;
  disabledDateAD: string;
  disabledReason: string;
  disabledServices?: string[];
  disabledBy?: string;
  status: "Inactive";
}

const SAMPLE_DISABLED_STUDENTS: DisabledStudentRecord[] = [
  {
    id: "STU-1005",
    fullName: "Suman Shrestha",
    fullNameNepali: "सुमन श्रेष्ठ",
    rollNumber: "105",
    admissionNumber: "ADM-2083-005",
    class: "Grade 10-A",
    batch: "2083/84",
    mobile: "+977-9841122334",
    email: "suman.shrestha@gmail.com",
    guardianName: "Balaram Shrestha",
    guardianMobile: "+977-9801122334",
    disabledDateBS: "2083-02-15",
    disabledDateAD: "2026-05-28",
    disabledReason: "Temporarily suspended due to extended absence abroad",
    disabledServices: ["BILLING", "EXAMINATION", "LIBRARY"],
    disabledBy: "Administrator",
    status: "Inactive",
  },
  {
    id: "STU-1006",
    fullName: "Binita Gurung",
    fullNameNepali: "बिनिता गुरुङ",
    rollNumber: "106",
    admissionNumber: "ADM-2083-006",
    class: "Grade 9-B",
    batch: "2083/84",
    mobile: "+977-9865544332",
    email: "binita.gurung@gmail.com",
    guardianName: "Hari Gurung",
    guardianMobile: "+977-9845544332",
    disabledDateBS: "2083-03-01",
    disabledDateAD: "2026-06-14",
    disabledReason: "Medical leave - pending clearance certificate",
    disabledServices: ["EXAMINATION", "TRANSPORT", "HOSTEL"],
    disabledBy: "Principal",
    status: "Inactive",
  },
  {
    id: "STU-1007",
    fullName: "Dipesh Tamang",
    fullNameNepali: "दिपेश तामाङ",
    rollNumber: "107",
    admissionNumber: "ADM-2083-007",
    class: "Grade 8-A",
    batch: "2083/84",
    mobile: "+977-9812998877",
    email: "dipesh.tamang@gmail.com",
    guardianName: "Kishor Tamang",
    guardianMobile: "+977-9851998877",
    disabledDateBS: "2083-03-10",
    disabledDateAD: "2026-06-23",
    disabledReason: "Fee default hold pending parent consultation",
    disabledServices: ["BILLING"],
    disabledBy: "Finance Officer",
    status: "Inactive",
  },
];

interface ColumnConfig {
  key: keyof DisabledStudentRecord | "actions" | "select" | "index";
  label: string;
  minWidth?: number;
  pinned?: "left" | "right";
  visibleByDefault?: boolean;
}

const DISABLED_COLUMNS: ColumnConfig[] = [
  { key: "select", label: "", minWidth: 40, pinned: "left", visibleByDefault: true },
  { key: "index", label: "#", minWidth: 40, pinned: "left", visibleByDefault: true },
  { key: "fullName", label: "Student Name", minWidth: 160, pinned: "left", visibleByDefault: true },
  { key: "rollNumber", label: "Roll No.", minWidth: 90, visibleByDefault: true },
  { key: "admissionNumber", label: "Admission No.", minWidth: 130, visibleByDefault: true },
  { key: "class", label: "Class", minWidth: 100, visibleByDefault: true },
  { key: "mobile", label: "Mobile", minWidth: 120, visibleByDefault: true },
  { key: "guardianName", label: "Guardian Name", minWidth: 140, visibleByDefault: true },
  { key: "disabledDateBS", label: "Disabled Date (BS)", minWidth: 130, visibleByDefault: true },
  { key: "disabledReason", label: "Disable Reason", minWidth: 200, visibleByDefault: true },
  { key: "status", label: "Status", minWidth: 95, visibleByDefault: true },
  { key: "actions", label: "Actions", minWidth: 110, pinned: "right", visibleByDefault: true },
];

export default function DisabledStudentsPage() {
  const [students, setStudents] = React.useState<DisabledStudentRecord[]>(SAMPLE_DISABLED_STUDENTS);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedClass, setSelectedClass] = React.useState<string>("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [recordsPerPage, setRecordsPerPage] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = React.useState<boolean>(false);
  const [studentToUndisable, setStudentToUndisable] = React.useState<DisabledStudentRecord | null>(null);
  const [activeDisableDropdownStudentId, setActiveDisableDropdownStudentId] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleDisableServices = (studentId: string, serviceIdsToDisable: string[]) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const current = s.disabledServices || [];
        const next = Array.from(new Set([...current, ...serviceIdsToDisable]));
        return {
          ...s,
          disabledServices: next,
        };
      })
    );
  };

  const handleEnableService = (studentId: string, serviceId: string) => {
    setStudents((prev) => {
      const target = prev.find((s) => s.id === studentId);
      if (!target) return prev;
      const current = target.disabledServices || [];
      const next = current.filter((id) => id !== serviceId);
      if (next.length === 0) {
        setSuccessMessage(`All services enabled for ${target.fullName}. Student restored to Active Directory.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        return prev.filter((s) => s.id !== studentId);
      }
      return prev.map((s) => (s.id === studentId ? { ...s, disabledServices: next } : s));
    });
  };

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    DISABLED_COLUMNS.forEach((col) => {
      init[col.key] = col.visibleByDefault ?? true;
    });
    return init;
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showAllColumns = () => {
    const allTrue: Record<string, boolean> = {};
    DISABLED_COLUMNS.forEach((col) => {
      allTrue[col.key] = true;
    });
    setVisibleColumns(allTrue);
  };

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stu.fullNameNepali && stu.fullNameNepali.includes(searchQuery)) ||
      stu.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.mobile.includes(searchQuery) ||
      stu.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.disabledReason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === "ALL" || stu.class.includes(selectedClass);

    return matchesSearch && matchesClass;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / recordsPerPage));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleSelectAll = () => {
    if (selectedStudentIds.length === paginatedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(paginatedStudents.map((s) => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmUndisable = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    setStudentToUndisable(null);
    setSuccessMessage(`Student ${target?.fullName || ""} has been re-enabled and restored to active enrollment.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleBulkUndisable = () => {
    if (selectedStudentIds.length === 0) return;
    const count = selectedStudentIds.length;
    setStudents((prev) => prev.filter((s) => !selectedStudentIds.includes(s.id)));
    setSelectedStudentIds([]);
    setSuccessMessage(`${count} student(s) successfully re-enabled and restored to the active directory.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const activeColumnsList = DISABLED_COLUMNS.filter((col) => visibleColumns[col.key]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none pb-16">
      {/* 1. Global ERP Header */}
      <ErpHeader />

      {/* 2. Global ERP Top Navigation */}
      <ErpTopNav activeModuleId="students" />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 w-full mx-auto p-3 sm:p-4 space-y-3">
        {/* Page Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.STUDENTS.ROOT}
              className="p-2 rounded-[4px] border border-[var(--border-default)] bg-white text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors shadow-2xs"
              title="Back to Students Directory"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
                  <UserX className="h-4 w-4" />
                </div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Disabled Students Directory
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  {students.length} Inactive
                </span>
              </div>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                List of deactivated student enrollments. View profiles or un-disable records to restore active status.
              </p>
            </div>
          </div>

          {/* Bulk Action Button */}
          {selectedStudentIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkUndisable}
              className="px-3.5 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Un-disable ({selectedStudentIds.length}) Selected</span>
            </button>
          )}
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[6px] flex items-center justify-between gap-2 text-xs text-emerald-800 animate-in fade-in-0 duration-150">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="p-1 text-emerald-600 hover:text-emerald-900 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Filters & Column Controls */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-[6px] border border-[var(--border-default)] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Class Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 px-3 text-xs font-semibold bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer shadow-xs min-w-[150px]"
              >
                <option value="ALL">All Classes</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 10-A">Grade 10-A</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 9-B">Grade 9-B</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 8-A">Grade 8-A</option>
              </select>
            </div>

            {/* Column Visibility Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
                title="Customize Columns"
                className={cn(
                  "h-8 px-2.5 rounded-[4px] border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer",
                  isColumnDropdownOpen
                    ? "bg-[var(--red-50)] text-[var(--brand-primary)] border-[var(--brand-primary)]"
                    : "bg-white text-[var(--neutral-700)] border-[var(--border-default)] hover:bg-[var(--neutral-50)]"
                )}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Columns</span>
              </button>

              {isColumnDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-98 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)] mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Toggle Columns
                    </span>
                    <button
                      type="button"
                      onClick={showAllColumns}
                      className="text-[10px] text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer"
                    >
                      Show All
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                    {DISABLED_COLUMNS.filter((c) => c.key !== "select" && c.key !== "actions").map(
                      (col) => (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 px-1.5 py-1 text-xs text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] rounded cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(visibleColumns[col.key])}
                            onChange={() => toggleColumn(col.key)}
                            className="rounded border-[var(--neutral-300)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-3.5 w-3.5"
                          />
                          <span className="truncate">{col.label}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-light)]">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search disabled students (Name, Roll, Admission No, Phone, Reason)..."
                className="w-full h-8 pl-3 pr-8 text-xs bg-white border border-[var(--border-default)] rounded-[4px] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-black"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="h-8 px-3.5 rounded-[4px] border border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--red-50)]/50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Disabled Students Data Table */}
        <div className="bg-[var(--bg-primary)] rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto custom-scrollbar min-h-[360px]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)] sticky top-0 z-10">
                  {visibleColumns["select"] && (
                    <th className="py-2.5 px-3 w-10 text-center bg-[var(--neutral-50)]">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="cursor-pointer text-[var(--neutral-500)] hover:text-black"
                      >
                        {selectedStudentIds.length === paginatedStudents.length &&
                        paginatedStudents.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  )}

                  {visibleColumns["index"] && (
                    <th className="py-2.5 px-3 w-10 text-center bg-[var(--neutral-50)]">#</th>
                  )}

                  {DISABLED_COLUMNS.filter(
                    (col) =>
                      col.key !== "select" &&
                      col.key !== "index" &&
                      col.key !== "actions" &&
                      visibleColumns[col.key]
                  ).map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      className="py-2.5 px-3 text-[10px] font-bold text-[var(--neutral-700)] border-r border-[var(--border-light)]"
                    >
                      {col.label}
                    </th>
                  ))}

                  {visibleColumns["actions"] && (
                    <th className="py-2.5 px-3 w-28 text-right bg-[var(--neutral-50)] sticky right-0 shadow-l">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-default)]">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, idx) => {
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <tr
                        key={student.id}
                        className={cn(
                          "hover:bg-[var(--neutral-50)]/80 transition-colors",
                          isSelected && "bg-[var(--red-50)]/40",
                          activeDisableDropdownStudentId === student.id ? "relative z-40" : ""
                        )}
                      >
                        {visibleColumns["select"] && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectOne(student.id)}
                              className="cursor-pointer text-[var(--neutral-500)] hover:text-black"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        )}

                        {visibleColumns["index"] && (
                          <td className="py-2.5 px-3 text-center text-[var(--neutral-500)] font-medium">
                            {(currentPage - 1) * recordsPerPage + idx + 1}
                          </td>
                        )}

                        {visibleColumns["fullName"] && (
                          <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)] border-r border-[var(--border-light)]">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {student.fullName.charAt(0)}
                              </div>
                              <span className="text-[var(--text-primary)]">
                                {student.fullName}
                              </span>
                            </div>
                          </td>
                        )}

                        {visibleColumns["rollNumber"] && (
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700 border-r border-[var(--border-light)]">
                            {student.rollNumber}
                          </td>
                        )}

                        {visibleColumns["admissionNumber"] && (
                          <td className="py-2.5 px-3 font-mono text-[11px] border-r border-[var(--border-light)]">
                            {student.admissionNumber}
                          </td>
                        )}

                        {visibleColumns["class"] && (
                          <td className="py-2.5 px-3 font-medium border-r border-[var(--border-light)]">
                            <span className="px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[11px] font-semibold text-[var(--neutral-800)]">
                              {student.class}
                            </span>
                          </td>
                        )}

                        {visibleColumns["mobile"] && (
                          <td className="py-2.5 px-3 font-mono text-[11px] border-r border-[var(--border-light)]">
                            {student.mobile}
                          </td>
                        )}

                        {visibleColumns["guardianName"] && (
                          <td className="py-2.5 px-3 font-medium border-r border-[var(--border-light)]">
                            {student.guardianName}
                          </td>
                        )}

                        {visibleColumns["disabledDateBS"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.disabledDateBS}
                          </td>
                        )}

                        {visibleColumns["disabledReason"] && (
                          <td className="py-2.5 px-3 text-[var(--neutral-600)] border-r border-[var(--border-light)] max-w-xs truncate" title={student.disabledReason}>
                            {student.disabledReason}
                          </td>
                        )}

                        {visibleColumns["status"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {student.status}
                              </span>
                              {student.disabledServices && student.disabledServices.length > 0 && (
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {student.disabledServices.map((srv) => (
                                    <span
                                      key={srv}
                                      className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                                    >
                                      {srv}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        {/* ACTIONS: ONLY VIEW & UN-DISABLE AS REQUESTED */}
                        {visibleColumns["actions"] && (
                          <td
                            className={cn(
                              "py-2.5 px-3 text-right sticky right-0 bg-[var(--bg-primary)] shadow-l",
                              activeDisableDropdownStudentId === student.id ? "z-40" : "z-10"
                            )}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              {/* 1. View Profile */}
                              <Link
                                href={`/students/${student.id}`}
                                title="View Profile"
                                className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>

                              {/* 2. Un-disable / Enable Option with dropdown toggle */}
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={() => setStudentToUndisable(student)}
                                  title="Un-disable / Fully Enable Student"
                                  className="px-2 py-1 rounded-[4px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Enable</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={activeColumnsList.length + 2}
                      className="py-16 text-center text-xs text-[var(--neutral-500)]"
                    >
                      No disabled student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-medium">
              <span>
                Total Rows: <strong className="text-[var(--text-primary)]">{filteredStudents.length}</strong>
              </span>
              {selectedStudentIds.length > 0 && (
                <span className="text-emerald-700 font-semibold">
                  ({selectedStudentIds.length} selected)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span>Records per page:</span>
                <select
                  value={recordsPerPage}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 font-semibold text-[var(--text-primary)]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Undisable Confirmation Modal */}
      {studentToUndisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-lg border border-[var(--border-default)] shadow-2xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900">Enable Student Record</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Are you sure you want to un-disable student{" "}
                  <strong className="text-neutral-900">{studentToUndisable.fullName}</strong> (Roll:{" "}
                  {studentToUndisable.rollNumber}, Class: {studentToUndisable.class})? This will restore their active enrollment in the student directory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-light)]">
              <button
                type="button"
                onClick={() => setStudentToUndisable(null)}
                className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmUndisable(studentToUndisable.id)}
                className="px-3.5 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Confirm Enable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
