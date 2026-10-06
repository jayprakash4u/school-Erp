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
  Users,
  Power,
  Trash2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type DepartmentType = "Academic" | "Administrative" | "Other";

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  type: DepartmentType;
  hodName: string;
  employeeCount: number;
  status: "Active" | "Inactive";
}

const DEFAULT_EMPLOYEES = [
  "Dr. Raj Sharma",
  "Prof. Sita Rai",
  "Ramesh Karki",
  "Sunita Gurung",
  "Gopal Adhikari",
  "Anita Sharma",
  "Prem Bahadur Thapa",
  "Roshan Manandhar",
];

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-1",
    name: "Computer Science & Engineering",
    code: "CSE",
    type: "Academic",
    hodName: "Dr. Raj Sharma",
    employeeCount: 25,
    status: "Active",
  },
  {
    id: "dept-2",
    name: "Management Studies",
    code: "MGT",
    type: "Academic",
    hodName: "Prof. Sita Rai",
    employeeCount: 18,
    status: "Active",
  },
  {
    id: "dept-3",
    name: "Civil Engineering",
    code: "CIV",
    type: "Academic",
    hodName: "",
    employeeCount: 0,
    status: "Active",
  },
  {
    id: "dept-4",
    name: "Administration",
    code: "ADM",
    type: "Administrative",
    hodName: "",
    employeeCount: 12,
    status: "Active",
  },
];

export default function DepartmentSetupPage() {
  const [departments, setDepartments] = React.useState<DepartmentItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [typeFilter, setTypeFilter] = React.useState<string>("All");

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<DepartmentItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Safeguard modal for Delete / Deactivate
  const [deleteBlockedItem, setDeleteBlockedItem] = React.useState<DepartmentItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<DepartmentItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    type: DepartmentType;
    hodName: string;
    status: "Active" | "Inactive";
  }>({
    name: "",
    code: "",
    type: "Academic",
    hodName: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    code?: string;
  }>({});

  // Load persisted data or default
  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_departments_simple_v1");
    if (saved) {
      try {
        setDepartments(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to load departments from storage", e);
      }
    }
    setDepartments(DEFAULT_DEPARTMENTS);
  }, []);

  const saveDepartments = (items: DepartmentItem[]) => {
    setDepartments(items);
    localStorage.setItem("erp_master_departments_simple_v1", JSON.stringify(items));
  };

  // Close actions dropdown on outside click
  React.useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    setFormData({
      name: "",
      code: "",
      type: "Academic",
      hodName: "",
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingItem(dept);
    setFormErrors({});
    setFormData({
      name: dept.name,
      code: dept.code,
      type: dept.type,
      hodName: dept.hodName,
      status: dept.status,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = (dept: DepartmentItem) => {
    const nextStatus: "Active" | "Inactive" = dept.status === "Active" ? "Inactive" : "Active";
    const updated = departments.map((d) => (d.id === dept.id ? { ...d, status: nextStatus } : d));
    saveDepartments(updated);
  };

  const handleDeleteRequest = (dept: DepartmentItem) => {
    // Check if department has historical employee assignments
    if (dept.employeeCount > 0) {
      setDeleteBlockedItem(dept);
    } else {
      setDeleteConfirmItem(dept);
    }
  };

  const handleConfirmDelete = (id: string) => {
    const updated = departments.filter((d) => d.id !== id);
    saveDepartments(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Department Name is required";
    }
    if (!formData.code.trim()) {
      errors.code = "Department Code is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      const updated = departments.map((d) =>
        d.id === editingItem.id
          ? {
              ...d,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              type: formData.type,
              hodName: formData.hodName.trim(),
              status: formData.status,
            }
          : d
      );
      saveDepartments(updated);
    } else {
      const newItem: DepartmentItem = {
        id: `dept-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        hodName: formData.hodName.trim(),
        employeeCount: 0,
        status: formData.status,
      };
      saveDepartments([...departments, newItem]);
    }

    setIsFormOpen(false);
  };

  // Filtered dataset
  const filteredDepartments = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hodName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    const matchesType = typeFilter === "All" || d.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* 1. Global ERP Top Header */}
      <ErpHeader />

      {/* 2. Global ERP 2-Row Top Navigation Menu */}
      <ErpTopNav activeModuleId="master-setup" />

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Departments</span>
        </div>

        {/* Page Title & Main Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Departments</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Manage departments used across your institution.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
              >
                <option value="All">All Types</option>
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Data Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                  <th className="py-2.5 px-4">Department Name</th>
                  <th className="py-2.5 px-4 w-[110px]">Code</th>
                  <th className="py-2.5 px-4 w-[130px]">Type</th>
                  <th className="py-2.5 px-4">Head of Department</th>
                  <th className="py-2.5 px-4 w-[100px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[var(--text-secondary)]">
                      No departments found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {dept.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                        {dept.code}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {dept.type}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)]">
                        {dept.hodName ? dept.hodName : <span className="text-[var(--neutral-400)]">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
                            dept.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          )}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === dept.id ? null : dept.id);
                          }}
                          className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Actions Menu Dropdown */}
                        {activeMenuId === dept.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-8 z-30 w-44 bg-[var(--bg-primary)] rounded-md border border-[var(--border-default)] shadow-lg py-1 text-xs text-left animate-in fade-in-50 zoom-in-95"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenEdit(dept);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)] cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>Edit</span>
                            </button>

                            <Link
                              href={`/staff?department=${encodeURIComponent(dept.id)}`}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)]"
                            >
                              <Users className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>View Employees ({dept.employeeCount})</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleToggleStatus(dept);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)] cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>{dept.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>

                            <div className="my-1 border-t border-[var(--border-light)]" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDeleteRequest(dept);
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

          {/* Table Footer Counter */}
          <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>Showing {filteredDepartments.length} departments</span>
            <span>
              1–{filteredDepartments.length} of {filteredDepartments.length}
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Department Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Department" : "Add Department"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-[var(--neutral-400)] hover:text-[var(--neutral-700)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              {/* Department Name */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className={cn(
                    "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                    formErrors.name ? "border-rose-400" : "border-[var(--border-default)]"
                  )}
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>}
              </div>

              {/* Department Code */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CSE"
                  className={cn(
                    "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                    formErrors.code ? "border-rose-400" : "border-[var(--border-default)]"
                  )}
                />
                {formErrors.code && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.code}</p>}
              </div>

              {/* Department Type */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Department Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as DepartmentType })}
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Head of Department */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Head of Department</label>
                <select
                  value={formData.hodName}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value="">Select employee...</option>
                  {DEFAULT_EMPLOYEES.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safeguard: Cannot Delete when employees assigned */}
      {deleteBlockedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-sm rounded-lg border border-[var(--border-default)] shadow-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Cannot Delete Department</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">{deleteBlockedItem.name}</strong> currently has{" "}
              <strong className="text-[var(--text-primary)]">{deleteBlockedItem.employeeCount} employees</strong>{" "}
              assigned. To protect historical records, deactivate the department instead of deleting it.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteBlockedItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(deleteBlockedItem);
                  setDeleteBlockedItem(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md cursor-pointer"
              >
                Deactivate Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (0 employees) */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-sm rounded-lg border border-[var(--border-default)] shadow-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Department</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-[var(--text-primary)]">{deleteConfirmItem.name}</strong> (
              {deleteConfirmItem.code})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
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
