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

export interface SectionItem {
  id: string;
  name: string;
  code: string;
  defaultCapacity: number;
  roomNumber?: string;
  status: "Active" | "Inactive";
}

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: "sec-1", name: "Section A", code: "A", defaultCapacity: 45, roomNumber: "Room 101", status: "Active" },
  { id: "sec-2", name: "Section B", code: "B", defaultCapacity: 45, roomNumber: "Room 102", status: "Active" },
  { id: "sec-3", name: "Section C", code: "C", defaultCapacity: 40, roomNumber: "Room 103", status: "Active" },
  { id: "sec-4", name: "Section D", code: "D", defaultCapacity: 40, roomNumber: "Room 104", status: "Active" },
  { id: "sec-5", name: "Section E", code: "E", defaultCapacity: 35, roomNumber: "Room 105", status: "Inactive" },
];

export default function SectionsSetupPage() {
  const [sections, setSections] = React.useState<SectionItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("Active");

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<SectionItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<SectionItem | null>(null);

  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    defaultCapacity: number;
    roomNumber: string;
    status: "Active" | "Inactive";
  }>({
    name: "",
    code: "",
    defaultCapacity: 40,
    roomNumber: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{ name?: string; code?: string }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_sections_v1");
    if (saved) {
      try {
        setSections(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setSections(DEFAULT_SECTIONS);
      }
    } else {
      setSections(DEFAULT_SECTIONS);
    }
  }, []);

  const saveSections = (items: SectionItem[]) => {
    setSections(items);
    localStorage.setItem("erp_master_sections_v1", JSON.stringify(items));
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
      defaultCapacity: 40,
      roomNumber: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SectionItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      code: item.code,
      defaultCapacity: item.defaultCapacity,
      roomNumber: item.roomNumber || "",
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: SectionItem) => {
    const nextStatus: "Active" | "Inactive" = item.status === "Active" ? "Inactive" : "Active";
    const updated = sections.map((s) => (s.id === item.id ? { ...s, status: nextStatus } : s));
    saveSections(updated);
  };

  const handleConfirmDelete = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    saveSections(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!formData.name.trim()) errors.name = "Section name is required";
    if (!formData.code.trim()) errors.code = "Section code is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      const updated = sections.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              defaultCapacity: Number(formData.defaultCapacity),
              roomNumber: formData.roomNumber.trim() || undefined,
              status: formData.status,
            }
          : s
      );
      saveSections(updated);
    } else {
      const newItem: SectionItem = {
        id: `sec-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        defaultCapacity: Number(formData.defaultCapacity),
        roomNumber: formData.roomNumber.trim() || undefined,
        status: formData.status,
      };
      saveSections([...sections, newItem]);
    }

    setIsModalOpen(false);
  };

  const filteredSections = sections.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <span className="text-[var(--text-primary)] font-semibold">Sections</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Sections Setup
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Manage class divisions, student capacity, and room allocations.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Section</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search sections..."
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
                  <th className="py-2.5 px-4 w-[110px]">Section Code</th>
                  <th className="py-2.5 px-4">Section Name</th>
                  <th className="py-2.5 px-4 text-center w-[140px]">Default Capacity</th>
                  <th className="py-2.5 px-4">Room Allocation</th>
                  <th className="py-2.5 px-4 w-[100px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredSections.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[var(--text-primary)]">
                      {item.defaultCapacity} Students
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {item.roomNumber || "—"}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-md rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)] shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Section" : "Add Section"}
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
                  Section Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Section A"
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Section Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Default Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.defaultCapacity}
                    onChange={(e) => setFormData({ ...formData, defaultCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Room Number / Space
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. Room 101"
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
                  Save Section
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
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Section</h3>
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
