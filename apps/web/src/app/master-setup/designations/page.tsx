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
  AlertTriangle,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type EmployeeType = "Teaching" | "Non-Teaching" | "Administrative" | "Support";

export interface DesignationItem {
  id: string;
  name: string;
  code: string;
  employeeType: EmployeeType;
  description?: string;
  employeeCount?: number;
  status: "Active" | "Inactive";
}

const DEFAULT_DESIGNATIONS: DesignationItem[] = [
  {
    id: "desig-1",
    name: "Principal",
    code: "PRI",
    employeeType: "Administrative",
    description: "Executive head and chief institutional administrator.",
    employeeCount: 1,
    status: "Active",
  },
  {
    id: "desig-2",
    name: "Vice Principal",
    code: "VP",
    employeeType: "Administrative",
    description: "Assistant institutional administrator and academic supervisor.",
    employeeCount: 2,
    status: "Active",
  },
  {
    id: "desig-3",
    name: "HOD",
    code: "HOD",
    employeeType: "Teaching",
    description: "Head of Academic Department & faculty lead.",
    employeeCount: 4,
    status: "Active",
  },
  {
    id: "desig-4",
    name: "Professor",
    code: "PROF",
    employeeType: "Teaching",
    description: "Senior academic rank for undergraduate and postgraduate studies.",
    employeeCount: 6,
    status: "Active",
  },
  {
    id: "desig-5",
    name: "Associate Professor",
    code: "ASP",
    employeeType: "Teaching",
    description: "Mid-to-senior faculty rank.",
    employeeCount: 8,
    status: "Active",
  },
  {
    id: "desig-6",
    name: "Assistant Professor",
    code: "AP",
    employeeType: "Teaching",
    description: "Entry-level tenure-track faculty.",
    employeeCount: 12,
    status: "Active",
  },
  {
    id: "desig-7",
    name: "Lecturer",
    code: "LEC",
    employeeType: "Teaching",
    description: "College level subject teacher and lecturer.",
    employeeCount: 14,
    status: "Active",
  },
  {
    id: "desig-8",
    name: "Teacher",
    code: "TCH",
    employeeType: "Teaching",
    description: "School level class teacher and instructor.",
    employeeCount: 26,
    status: "Active",
  },
  {
    id: "desig-9",
    name: "Accountant",
    code: "ACC",
    employeeType: "Non-Teaching",
    description: "Finance, fee collection, billing and ledger bookkeeping.",
    employeeCount: 3,
    status: "Active",
  },
  {
    id: "desig-10",
    name: "Librarian",
    code: "LIB",
    employeeType: "Non-Teaching",
    description: "Central library records and book circulation supervisor.",
    employeeCount: 2,
    status: "Active",
  },
  {
    id: "desig-11",
    name: "Lab Assistant",
    code: "LAB",
    employeeType: "Support",
    description: "Science, computer lab technician and inventory caretaker.",
    employeeCount: 4,
    status: "Active",
  },
];

export default function DesignationSetupPage() {
  const [designations, setDesignations] = React.useState<DesignationItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<DesignationItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Safeguard modal for Delete / Deactivate
  const [deleteBlockedItem, setDeleteBlockedItem] = React.useState<DesignationItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<DesignationItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    employeeType: EmployeeType;
    description: string;
    status: "Active" | "Inactive";
  }>({
    name: "",
    code: "",
    employeeType: "Teaching",
    description: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    code?: string;
    employeeType?: string;
  }>({});

  // Load persisted data or default
  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_designations_final_v1");
    if (saved) {
      try {
        setDesignations(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to load designations from storage", e);
      }
    }
    setDesignations(DEFAULT_DESIGNATIONS);
  }, []);

  const saveDesignations = (items: DesignationItem[]) => {
    setDesignations(items);
    localStorage.setItem("erp_master_designations_final_v1", JSON.stringify(items));
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
      employeeType: "Teaching",
      description: "",
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (desig: DesignationItem) => {
    setEditingItem(desig);
    setFormErrors({});
    setFormData({
      name: desig.name,
      code: desig.code,
      employeeType: desig.employeeType,
      description: desig.description || "",
      status: desig.status,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = (desig: DesignationItem) => {
    const nextStatus: "Active" | "Inactive" = desig.status === "Active" ? "Inactive" : "Active";
    const updated = designations.map((d) => (d.id === desig.id ? { ...d, status: nextStatus } : d));
    saveDesignations(updated);
  };

  const handleDeleteRequest = (desig: DesignationItem) => {
    if ((desig.employeeCount || 0) > 0) {
      setDeleteBlockedItem(desig);
    } else {
      setDeleteConfirmItem(desig);
    }
  };

  const handleConfirmDelete = (id: string) => {
    const updated = designations.filter((d) => d.id !== id);
    saveDesignations(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Designation Name is required";
    }
    if (!formData.code.trim()) {
      errors.code = "Code is required";
    }
    if (!formData.employeeType) {
      errors.employeeType = "Employee Type is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      const updated = designations.map((d) =>
        d.id === editingItem.id
          ? {
              ...d,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              employeeType: formData.employeeType,
              description: formData.description.trim() || undefined,
              status: formData.status,
            }
          : d
      );
      saveDesignations(updated);
    } else {
      const newItem: DesignationItem = {
        id: `desig-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        employeeType: formData.employeeType,
        description: formData.description.trim() || undefined,
        employeeCount: 0,
        status: formData.status,
      };
      saveDesignations([...designations, newItem]);
    }

    setIsFormOpen(false);
  };

  // Filtered dataset
  const filteredDesignations = designations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.employeeType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* 1. Global ERP Top Header */}
      <ErpHeader />

      {/* 2. Global ERP 2-Row Top Navigation Menu */}
      <ErpTopNav activeModuleId="master-setup" />

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb Navigation & Top Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium mb-1">
              <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
                Master Setup
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <span className="text-[var(--text-primary)] font-semibold">Designations</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Manage employee designations used across your institution.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Designation</span>
            </button>
          </div>
        </div>

        {/* Search and Status Filter Bar */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search designations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-[var(--text-secondary)]">
            <span className="font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Designations Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                  <th className="py-2.5 px-4">Designation</th>
                  <th className="py-2.5 px-4 w-[120px]">Code</th>
                  <th className="py-2.5 px-4 w-[160px]">Employee Type</th>
                  <th className="py-2.5 px-4 w-[120px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredDesignations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[var(--text-secondary)]">
                      No designations found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDesignations.map((desig) => (
                    <tr key={desig.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {desig.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                        {desig.code}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {desig.employeeType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium",
                            desig.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              desig.status === "Active" ? "bg-emerald-500" : "bg-neutral-400"
                            )}
                          />
                          {desig.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === desig.id ? null : desig.id);
                          }}
                          className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Actions Menu Dropdown */}
                        {activeMenuId === desig.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-8 z-30 w-36 bg-[var(--bg-primary)] rounded-md border border-[var(--border-default)] shadow-lg py-1 text-xs text-left animate-in fade-in-50 zoom-in-95"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenEdit(desig);
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
                                handleToggleStatus(desig);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)] cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>{desig.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>

                            <div className="my-1 border-t border-[var(--border-light)]" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDeleteRequest(desig);
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
            <span>Showing {filteredDesignations.length} designations</span>
            <span>
              1–{filteredDesignations.length} of {filteredDesignations.length}
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Designation Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Designation" : "Add Designation"}
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
              {/* Designation Name */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Designation Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter designation name"
                  className={cn(
                    "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                    formErrors.name ? "border-rose-400" : "border-[var(--border-default)]"
                  )}
                />
                {formErrors.name && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.name}</p>}
              </div>

              {/* Code */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter code"
                  className={cn(
                    "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                    formErrors.code ? "border-rose-400" : "border-[var(--border-default)]"
                  )}
                />
                {formErrors.code && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.code}</p>}
              </div>

              {/* Employee Type */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Employee Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeType}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeType: e.target.value as EmployeeType })
                  }
                  className={cn(
                    "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                    formErrors.employeeType ? "border-rose-400" : "border-[var(--border-default)]"
                  )}
                >
                  <option value="Teaching">Teaching</option>
                  <option value="Non-Teaching">Non-Teaching</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Support">Support</option>
                </select>
                {formErrors.employeeType && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.employeeType}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
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
                  Save Designation
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
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Cannot Delete Designation</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">{deleteBlockedItem.name}</strong> currently has{" "}
              <strong className="text-[var(--text-primary)]">{deleteBlockedItem.employeeCount} employees</strong>{" "}
              assigned. To protect historical payroll and service records, deactivate the designation instead of deleting it.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteBlockedItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md cursor-pointer"
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
                Deactivate Designation
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
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Designation</h3>
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
