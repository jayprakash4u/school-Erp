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
  Users,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { cn } from "@/lib/utils";

export interface EmployeeTypeItem {
  id: string;
  name: string;
  code: string;
  category: "Academic" | "Non-Academic" | "Administrative" | "Support";
  description?: string;
  status: "Active" | "Inactive";
}

const DEFAULT_EMPLOYEE_TYPES: EmployeeTypeItem[] = [
  { id: "type-1", name: "Teaching Staff", code: "TEACHING", category: "Academic", description: "Professors, Lecturers, School Teachers, Lab Instructors", status: "Active" },
  { id: "type-2", name: "Non-Teaching Staff", code: "NON-TEACHING", category: "Non-Academic", description: "Librarians, Lab Assistants, Technical Support Officers", status: "Active" },
  { id: "type-3", name: "Administrative", code: "ADMIN", category: "Administrative", description: "Principals, Accountants, Receptionists, Admission Officers", status: "Active" },
  { id: "type-4", name: "Support Staff", code: "SUPPORT", category: "Support", description: "Security, Drivers, Maintenance, Janitorial Staff", status: "Active" },
];

export default function EmployeeTypesSetupPage() {
  const [types, setTypes] = React.useState<EmployeeTypeItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("Active");

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<EmployeeTypeItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<EmployeeTypeItem | null>(null);

  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    category: "Academic" | "Non-Academic" | "Administrative" | "Support";
    description: string;
    status: "Active" | "Inactive";
  }>({
    name: "",
    code: "",
    category: "Academic",
    description: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{ name?: string; code?: string }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_employee_types_v1");
    if (saved) {
      try {
        setTypes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setTypes(DEFAULT_EMPLOYEE_TYPES);
      }
    } else {
      setTypes(DEFAULT_EMPLOYEE_TYPES);
    }
  }, []);

  const saveTypes = (items: EmployeeTypeItem[]) => {
    setTypes(items);
    localStorage.setItem("erp_master_employee_types_v1", JSON.stringify(items));
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
      category: "Academic",
      description: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EmployeeTypeItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category,
      description: item.description || "",
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: EmployeeTypeItem) => {
    const nextStatus: "Active" | "Inactive" = item.status === "Active" ? "Inactive" : "Active";
    const updated = types.map((t) => (t.id === item.id ? { ...t, status: nextStatus } : t));
    saveTypes(updated);
  };

  const handleConfirmDelete = (id: string) => {
    const updated = types.filter((t) => t.id !== id);
    saveTypes(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = "Type name is required";
    if (!formData.code.trim()) errors.code = "Type code is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      const updated = types.map((t) =>
        t.id === editingItem.id
          ? {
              ...t,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              category: formData.category,
              description: formData.description.trim() || undefined,
              status: formData.status,
            }
          : t
      );
      saveTypes(updated);
    } else {
      const newItem: EmployeeTypeItem = {
        id: `type-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        status: formData.status,
      };
      saveTypes([...types, newItem]);
    }

    setIsModalOpen(false);
  };

  const filteredTypes = types.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <ErpHeader />
      <ErpTopNav activeModuleId="master-setup" />

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href="/master-setup" className="hover:text-[var(--brand-primary)] transition-colors">
            Master Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--neutral-500)]">HR Setup</span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Employee Types</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Employee Types Setup
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Define workforce classifications (Teaching, Non-Teaching, Administrative, Support).
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Employee Type</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search employee types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Status:</span>
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

        {/* Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                  <th className="py-2.5 px-4 w-[120px]">Type Code</th>
                  <th className="py-2.5 px-4">Employee Type</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 w-[100px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredTypes.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-secondary)]">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {item.description || "—"}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)] shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Employee Type" : "Add Employee Type"}
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
                  Type Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Teaching Staff"
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Type Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. TEACHING"
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Non-Academic">Non-Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of staff roles..."
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs cursor-pointer"
                >
                  Save Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-sm rounded-lg border border-[var(--border-default)] shadow-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Employee Type</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deleteConfirmItem.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteConfirmItem.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md"
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
