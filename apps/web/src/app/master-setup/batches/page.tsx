"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface BatchItem {
  id: string;
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

const DEFAULT_BATCHES: BatchItem[] = [
  {
    id: "1",
    name: "Batch 2083/84",
    year: "2083",
    startDate: "2026-04-14",
    endDate: "2027-04-13",
    isCurrent: true,
  },
  {
    id: "2",
    name: "Batch 2082/83",
    year: "2082",
    startDate: "2025-04-14",
    endDate: "2026-04-13",
  },
  {
    id: "3",
    name: "Batch 2081/82",
    year: "2081",
    startDate: "2024-04-14",
    endDate: "2025-04-13",
  },
];

export default function BatchSetupPage() {
  const [batches, setBatches] = React.useState<BatchItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<BatchItem | null>(null);

  // Form State matching screenshot
  const [formData, setFormData] = React.useState({
    name: "",
    year: "2026",
    startDate: "2026-04-14",
    endDate: "2027-04-13",
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_batches_v3");
    if (saved) {
      try {
        setBatches(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setBatches(DEFAULT_BATCHES);
  }, []);

  const saveBatches = (newItems: BatchItem[]) => {
    setBatches(newItems);
    localStorage.setItem("erp_master_batches_v3", JSON.stringify(newItems));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    setFormData({
      name: "",
      year: new Date().getFullYear().toString(),
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BatchItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      year: item.year,
      startDate: item.startDate,
      endDate: item.endDate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    saveBatches(batches.filter((b) => b.id !== id));
  };

  const validateBatchForm = () => {
    const errors: { name?: string; year?: string; startDate?: string; endDate?: string } = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = "Batch name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Batch name must be at least 2 characters.";
    } else {
      const isDuplicate = batches.some(
        (b) =>
          b.name.toLowerCase() === trimmedName.toLowerCase() &&
          b.id !== editingItem?.id
      );
      if (isDuplicate) {
        errors.name = `Batch "${trimmedName}" already exists.`;
      }
    }

    const trimmedYear = formData.year.trim();
    if (!trimmedYear) {
      errors.year = "Year is required.";
    } else if (!/^\d{4}$/.test(trimmedYear)) {
      errors.year = "Please enter a valid 4-digit year (e.g. 2083 or 2026).";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required.";
    }
    if (!formData.endDate) {
      errors.endDate = "End date is required.";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = "End date cannot be earlier than start date.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBatchForm()) {
      return;
    }

    if (editingItem) {
      const updated = batches.map((b) =>
        b.id === editingItem.id
          ? {
              ...b,
              name: formData.name.trim(),
              year: formData.year.trim(),
              startDate: formData.startDate,
              endDate: formData.endDate,
            }
          : b
      );
      saveBatches(updated);
    } else {
      const newItem: BatchItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        year: formData.year.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      saveBatches([...batches, newItem]);
    }
    setIsModalOpen(false);
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.year.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      <ErpHeader />
      <ErpTopNav activeModuleId="master-setup" />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb matching screenshot: Setup > Batch Setup */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">Batch Setup</span>
        </div>

        {/* Card Header matching screenshot */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Batches
                </h1>
                <p className="text-xs text-[var(--neutral-500)]">
                  Create and manage academic batches
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {batches.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search batches..."
                    className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-48 sm:w-56"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Batch</span>
              </button>
            </div>
          </div>

          {/* Table / Empty state */}
          {filteredBatches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Batch Name</th>
                    <th className="py-2.5 px-4">Academic Year</th>
                    <th className="py-2.5 px-4">Start Date</th>
                    <th className="py-2.5 px-4">End Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredBatches.map((batch, index) => (
                    <tr key={batch.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)] font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {batch.name}
                          </span>
                          {batch.isCurrent && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-red-50 text-[var(--brand-primary)] border border-red-200">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{batch.year}</td>
                      <td className="py-3 px-4 text-[var(--neutral-600)] font-mono">{batch.startDate}</td>
                      <td className="py-3 px-4 text-[var(--neutral-600)] font-mono">{batch.endDate}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(batch)}
                            title="Edit"
                            className="p-1.5 rounded text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(batch.id)}
                            title="Delete"
                            className="p-1.5 rounded text-[var(--neutral-600)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          ) : (
            <div className="py-16 text-center space-y-3">
              <CalendarDays className="h-10 w-10 text-[var(--neutral-400)] mx-auto" />
              <p className="text-xs font-medium text-[var(--neutral-500)]">
                No batches found. Click &ldquo;+ Add Batch&rdquo; to create one.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal matching screenshot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItem ? "Edit Batch" : "Add New Batch"}
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  {editingItem ? "Update batch information" : "Create a new academic batch"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[var(--neutral-400)] hover:text-black transition-colors rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form matching screenshot */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Batch Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g., Batch 2024, Spring 2024"
                  className={cn(
                    "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                    formErrors.name
                      ? "border-red-500 bg-red-50/10"
                      : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                  )}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Year <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => {
                    setFormData({ ...formData, year: e.target.value });
                    if (formErrors.year) setFormErrors({ ...formErrors, year: undefined });
                  }}
                  placeholder="2026"
                  className={cn(
                    "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                    formErrors.year
                      ? "border-red-500 bg-red-50/10"
                      : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                  )}
                />
                {formErrors.year && (
                  <p className="text-[11px] text-red-600 font-medium">{formErrors.year}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: undefined });
                    }}
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      formErrors.startDate
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.startDate && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.startDate}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: undefined });
                    }}
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
                      formErrors.endDate
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.endDate && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer Buttons matching screenshot */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--neutral-700)] bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] rounded-[4px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] hover:bg-red-700 text-white rounded-[4px] shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
