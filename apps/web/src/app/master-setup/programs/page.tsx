"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  X,
  ChevronRight,
  MoreVertical,
  Pencil,
  Power,
  Trash2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { cn } from "@/lib/utils";

export interface ProgramItem {
  id: string;
  name: string;
  code: string;
  department: string;
  durationYears: number;
  totalSemesters?: number;
  status: "Active" | "Inactive";
}

const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: "prog-1",
    name: "B.Tech Computer Science & Engineering",
    code: "BTECH-CSE",
    department: "Computer Science",
    durationYears: 4,
    totalSemesters: 8,
    status: "Active",
  },
  {
    id: "prog-2",
    name: "Bachelor of Business Administration (BBA)",
    code: "BBA",
    department: "Management",
    durationYears: 4,
    totalSemesters: 8,
    status: "Active",
  },
  {
    id: "prog-3",
    name: "Master of Business Administration (MBA)",
    code: "MBA",
    department: "Management",
    durationYears: 2,
    totalSemesters: 4,
    status: "Active",
  },
  {
    id: "prog-4",
    name: "+2 Science Stream",
    code: "PLUS2-SCI",
    department: "Science & Technology",
    durationYears: 2,
    totalSemesters: 2,
    status: "Active",
  },
  {
    id: "prog-5",
    name: "+2 Management Stream",
    code: "PLUS2-MGT",
    department: "Management",
    durationYears: 2,
    totalSemesters: 2,
    status: "Active",
  },
];

export default function ProgramsSetupPage() {
  const [programs, setPrograms] = React.useState<ProgramItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("All");
  const [statusFilter, setStatusFilter] = React.useState<string>("Active");

  const [availableDepartments, setAvailableDepartments] = React.useState<string[]>([
    "Computer Science",
    "Management",
    "Science & Technology",
    "Accounts",
  ]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<ProgramItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<ProgramItem | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    department: string;
    durationYears: number;
    totalSemesters: number;
    status: "Active" | "Inactive";
  }>({
    name: "",
    code: "",
    department: "Computer Science",
    durationYears: 4,
    totalSemesters: 8,
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    code?: string;
    department?: string;
  }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_programs_v1");
    if (saved) {
      try {
        setPrograms(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setPrograms(DEFAULT_PROGRAMS);
      }
    } else {
      setPrograms(DEFAULT_PROGRAMS);
    }

    // Load master departments
    const savedDepts = localStorage.getItem("erp_master_departments_simple_v1");
    if (savedDepts) {
      try {
        const parsed = JSON.parse(savedDepts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableDepartments(parsed.map((d: { name: string }) => d.name));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const savePrograms = (items: ProgramItem[]) => {
    setPrograms(items);
    localStorage.setItem("erp_master_programs_v1", JSON.stringify(items));
  };

  React.useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    setFormData({
      name: "",
      code: "",
      department: availableDepartments[0] || "Computer Science",
      durationYears: 4,
      totalSemesters: 8,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProgramItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      code: item.code,
      department: item.department,
      durationYears: item.durationYears,
      totalSemesters: item.totalSemesters || item.durationYears * 2,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: ProgramItem) => {
    const nextStatus: "Active" | "Inactive" = item.status === "Active" ? "Inactive" : "Active";
    const updated = programs.map((p) => (p.id === item.id ? { ...p, status: nextStatus } : p));
    savePrograms(updated);
  };

  const handleConfirmDelete = (id: string) => {
    const updated = programs.filter((p) => p.id !== id);
    savePrograms(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!formData.name.trim()) errors.name = "Program name is required";
    if (!formData.code.trim()) errors.code = "Program code is required";
    if (!formData.department.trim()) errors.department = "Department is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      const updated = programs.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              department: formData.department,
              durationYears: Number(formData.durationYears),
              totalSemesters: Number(formData.totalSemesters),
              status: formData.status,
            }
          : p
      );
      savePrograms(updated);
    } else {
      const newItem: ProgramItem = {
        id: `prog-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        department: formData.department,
        durationYears: Number(formData.durationYears),
        totalSemesters: Number(formData.totalSemesters),
        status: formData.status,
      };
      savePrograms([...programs, newItem]);
    }

    setIsModalOpen(false);
  };

  const filteredPrograms = programs.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === "All" || item.department === departmentFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <ErpHeader />
      <ErpTopNav activeModuleId="academics" />

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href="/master-setup" className="hover:text-[var(--brand-primary)] transition-colors">
            Master Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--neutral-500)]">Academic Setup</span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Programs</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Programs Setup
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Configure degree programs, courses of study, and academic streams.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Program</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-2.5">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search by program name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-light)]">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              >
                <option value="All">All Departments</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                  <th className="py-2.5 px-4 w-[120px]">Program Code</th>
                  <th className="py-2.5 px-4">Program Name</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 text-center w-[120px]">Duration</th>
                  <th className="py-2.5 px-4 text-center w-[120px]">Total Semesters</th>
                  <th className="py-2.5 px-4 w-[100px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[var(--text-secondary)]">
                      No programs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                        {item.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{item.department}</td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--text-primary)]">
                        {item.durationYears} {item.durationYears === 1 ? "Year" : "Years"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--text-secondary)]">
                        {item.totalSemesters || item.durationYears * 2}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium",
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              item.status === "Active" ? "bg-emerald-500" : "bg-neutral-400"
                            )}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                          className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-8 z-30 w-36 bg-[var(--bg-primary)] rounded-md border border-[var(--border-default)] shadow-lg py-1 text-xs text-left animate-in fade-in-50 zoom-in-95"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenEdit(item);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)] cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleToggleStatus(item);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)] cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>{item.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>

                            <div className="my-1 border-t border-[var(--border-light)]" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteConfirmItem(item);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] text-xs text-[var(--text-secondary)]">
            Showing {filteredPrograms.length} programs
          </div>
        </div>
      </main>

      {/* Add / Edit Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-lg rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)] shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Program" : "Add Program"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--neutral-400)] hover:text-[var(--neutral-700)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Program Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science & Engineering"
                  className={cn(
                    "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                    formErrors.name ? "border-rose-400" : "border-[var(--border-default)]"
                  )}
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Program Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. BTECH-CSE"
                    className={cn(
                      "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                      formErrors.code ? "border-rose-400" : "border-[var(--border-default)]"
                    )}
                  />
                  {formErrors.code && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.code}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Duration (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Total Semesters / Terms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.totalSemesters}
                    onChange={(e) => setFormData({ ...formData, totalSemesters: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })
                  }
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-sm rounded-lg border border-[var(--border-default)] shadow-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Program</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deleteConfirmItem.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteConfirmItem.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
