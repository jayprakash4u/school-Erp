"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  X,
  RotateCcw,
  Trash2,
  Columns,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  AlertTriangle,
  Check,
  Archive,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export interface DeletedStudentRecord {
  id: string;
  fullName: string;
  fullNameNepali?: string;
  rollNumber: string;
  admissionNumber: string;
  class: string;
  batch: string;
  mobile: string;
  guardianName: string;
  guardianMobile: string;
  deletedDateBS: string;
  deletedDateAD: string;
  deletedReason: string;
  deletedBy?: string;
  status: "Deleted";
}

const SAMPLE_DELETED_STUDENTS: DeletedStudentRecord[] = [
  {
    id: "STU-1008",
    fullName: "Prajwal Karki",
    fullNameNepali: "प्रज्वल कार्की",
    rollNumber: "108",
    admissionNumber: "ADM-2083-008",
    class: "Grade 10-B",
    batch: "2083/84",
    mobile: "+977-9841887766",
    guardianName: "Surya Karki",
    guardianMobile: "+977-9801887766",
    deletedDateBS: "2083-01-20",
    deletedDateAD: "2026-05-03",
    deletedReason: "Transferred to Pokhara International Academy with Transfer Certificate",
    deletedBy: "Super Admin",
    status: "Deleted",
  },
  {
    id: "STU-1009",
    fullName: "Sandhya Adhikari",
    fullNameNepali: "सन्ध्या अधिकारी",
    rollNumber: "109",
    admissionNumber: "ADM-2083-009",
    class: "Grade 9-A",
    batch: "2083/84",
    mobile: "+977-9861239988",
    guardianName: "Bhim Adhikari",
    guardianMobile: "+977-9841239988",
    deletedDateBS: "2083-02-05",
    deletedDateAD: "2026-05-18",
    deletedReason: "Family relocated to Australia - Admission officially cancelled",
    deletedBy: "Principal",
    status: "Deleted",
  },
  {
    id: "STU-1010",
    fullName: "Sanjay Magar",
    fullNameNepali: "सञ्जय मगर",
    rollNumber: "110",
    admissionNumber: "ADM-2083-010",
    class: "Grade 8-B",
    batch: "2083/84",
    mobile: "+977-9803344556",
    guardianName: "Gopal Magar",
    guardianMobile: "+977-9853344556",
    deletedDateBS: "2083-02-18",
    deletedDateAD: "2026-05-31",
    deletedReason: "Duplicate registration entry created during online intake",
    deletedBy: "Administrator",
    status: "Deleted",
  },
];

interface ColumnConfig {
  key: keyof DeletedStudentRecord | "actions" | "select" | "index";
  label: string;
  minWidth?: number;
  pinned?: "left" | "right";
  visibleByDefault?: boolean;
}

const DELETED_COLUMNS: ColumnConfig[] = [
  { key: "select", label: "", minWidth: 40, pinned: "left", visibleByDefault: true },
  { key: "index", label: "#", minWidth: 40, pinned: "left", visibleByDefault: true },
  { key: "fullName", label: "Student Name", minWidth: 160, pinned: "left", visibleByDefault: true },
  { key: "rollNumber", label: "Roll No.", minWidth: 90, visibleByDefault: true },
  { key: "admissionNumber", label: "Admission No.", minWidth: 130, visibleByDefault: true },
  { key: "class", label: "Class", minWidth: 100, visibleByDefault: true },
  { key: "mobile", label: "Mobile", minWidth: 120, visibleByDefault: true },
  { key: "guardianName", label: "Guardian Name", minWidth: 140, visibleByDefault: true },
  { key: "deletedDateBS", label: "Deleted Date (BS)", minWidth: 130, visibleByDefault: true },
  { key: "deletedReason", label: "Deletion Reason", minWidth: 220, visibleByDefault: true },
  { key: "status", label: "Status", minWidth: 95, visibleByDefault: true },
  { key: "actions", label: "Actions", minWidth: 100, pinned: "right", visibleByDefault: true },
];

export default function DeletedStudentsPage() {
  const [students, setStudents] = React.useState<DeletedStudentRecord[]>(SAMPLE_DELETED_STUDENTS);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedClass, setSelectedClass] = React.useState<string>("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [recordsPerPage, setRecordsPerPage] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = React.useState<boolean>(false);
  const [studentToRestore, setStudentToRestore] = React.useState<DeletedStudentRecord | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    DELETED_COLUMNS.forEach((col) => {
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
    DELETED_COLUMNS.forEach((col) => {
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
      stu.deletedReason.toLowerCase().includes(searchQuery.toLowerCase());

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

  const handleConfirmRestore = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    setStudentToRestore(null);
    setSuccessMessage(`Student ${target?.fullName || ""} has been successfully restored to the Active Student Directory.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleBulkRestore = () => {
    if (selectedStudentIds.length === 0) return;
    const count = selectedStudentIds.length;
    setStudents((prev) => prev.filter((s) => !selectedStudentIds.includes(s.id)));
    setSelectedStudentIds([]);
    setSuccessMessage(`${count} student record(s) successfully restored to the Active Student Directory.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const activeColumnsList = DELETED_COLUMNS.filter((col) => visibleColumns[col.key]);

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
                <div className="p-1 rounded bg-red-50 text-red-600 border border-red-200">
                  <Trash2 className="h-4 w-4" />
                </div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Deleted Students Archive
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  {students.length} Deleted
                </span>
              </div>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                Archived & soft-deleted student records. Use the restore action to return records to the active student directory.
              </p>
            </div>
          </div>

          {/* Bulk Restore Action Button */}
          {selectedStudentIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkRestore}
              className="px-3.5 py-1.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restore ({selectedStudentIds.length}) Selected</span>
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
                <option value="Grade 10-B">Grade 10-B</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 9-A">Grade 9-A</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 8-B">Grade 8-B</option>
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
                    {DELETED_COLUMNS.filter((c) => c.key !== "select" && c.key !== "actions").map(
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
                placeholder="Search deleted archive (Name, Roll, Admission No, Phone, Reason)..."
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

        {/* Deleted Students Data Table */}
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

                  {DELETED_COLUMNS.filter(
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

                  {/* ACTIONS: ONLY RESTORE OPTION */}
                  {visibleColumns["actions"] && (
                    <th className="py-2.5 px-3 w-24 text-right bg-[var(--neutral-50)] sticky right-0 shadow-l">
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
                          isSelected && "bg-[var(--red-50)]/40"
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
                              <div className="h-6 w-6 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {student.fullName.charAt(0)}
                              </div>
                              <span className="line-through text-neutral-500 font-medium">
                                {student.fullName}
                              </span>
                            </div>
                          </td>
                        )}

                        {visibleColumns["rollNumber"] && (
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-500 border-r border-[var(--border-light)]">
                            {student.rollNumber}
                          </td>
                        )}

                        {visibleColumns["admissionNumber"] && (
                          <td className="py-2.5 px-3 font-mono text-[11px] border-r border-[var(--border-light)] text-neutral-500">
                            {student.admissionNumber}
                          </td>
                        )}

                        {visibleColumns["class"] && (
                          <td className="py-2.5 px-3 font-medium border-r border-[var(--border-light)]">
                            <span className="px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[11px] font-semibold text-[var(--neutral-600)]">
                              {student.class}
                            </span>
                          </td>
                        )}

                        {visibleColumns["mobile"] && (
                          <td className="py-2.5 px-3 font-mono text-[11px] border-r border-[var(--border-light)] text-neutral-500">
                            {student.mobile}
                          </td>
                        )}

                        {visibleColumns["guardianName"] && (
                          <td className="py-2.5 px-3 font-medium border-r border-[var(--border-light)] text-neutral-600">
                            {student.guardianName}
                          </td>
                        )}

                        {visibleColumns["deletedDateBS"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)] text-neutral-500">
                            {student.deletedDateBS}
                          </td>
                        )}

                        {visibleColumns["deletedReason"] && (
                          <td className="py-2.5 px-3 text-[var(--neutral-600)] border-r border-[var(--border-light)] max-w-xs truncate" title={student.deletedReason}>
                            {student.deletedReason}
                          </td>
                        )}

                        {visibleColumns["status"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              {student.status}
                            </span>
                          </td>
                        )}

                        {/* ACTIONS: ONLY RESTORE OPTION AS REQUESTED */}
                        {visibleColumns["actions"] && (
                          <td className="py-2.5 px-3 text-right sticky right-0 bg-[var(--bg-primary)] shadow-l">
                            <div className="inline-flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => setStudentToRestore(student)}
                                title="Restore Student Record"
                                className="px-2.5 py-1 rounded-[4px] bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
                                <span>Restore</span>
                              </button>
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
                      No deleted student records found in archive.
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
                <span className="text-blue-700 font-semibold">
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

      {/* Restore Confirmation Modal */}
      {studentToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-lg border border-[var(--border-default)] shadow-2xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900">Restore Student Record</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Are you sure you want to restore student{" "}
                  <strong className="text-neutral-900">{studentToRestore.fullName}</strong> (Roll:{" "}
                  {studentToRestore.rollNumber}, Class: {studentToRestore.class})? This will move the record from the deleted archive back to the Active Student Directory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-light)]">
              <button
                type="button"
                onClick={() => setStudentToRestore(null)}
                className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRestore(studentToRestore.id)}
                className="px-3.5 py-1.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Confirm Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
