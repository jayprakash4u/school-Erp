"use client";

import * as React from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface DocNumberingConfig {
  id: string;
  docType: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextNumber: number;
  resetCycle: "Academic Year" | "Fiscal Year" | "None";
}

const DEFAULT_DOC_CONFIGS: DocNumberingConfig[] = [];

const DOC_TYPES_OPTIONS = [
  "Student Registration / Admission",
  "Fee Payment Receipt",
  "Student Fee Invoice",
  "Transfer Certificate (TC)",
  "Character Certificate",
  "Examination Admit Card",
  "Staff Employee Code",
  "Expense & Payment Voucher",
  "Library Accession Code",
  "Transport Gate Pass",
];

export default function DocumentNumberingPage() {
  const [configs, setConfigs] = React.useState<DocNumberingConfig[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<DocNumberingConfig | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<{
    docType: string;
    prefix: string;
    suffix: string;
    padding: number;
    nextNumber: number;
    resetCycle: DocNumberingConfig["resetCycle"];
  }>({
    docType: DOC_TYPES_OPTIONS[0],
    prefix: "ADM-2083-",
    suffix: "",
    padding: 4,
    nextNumber: 1,
    resetCycle: "Academic Year",
  });

  const [formErrors, setFormErrors] = React.useState<{
    docType?: string;
    padding?: string;
    nextNumber?: string;
    prefix?: string;
  }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_doc_numbering_configs_v6");
    if (saved) {
      try {
        setConfigs(JSON.parse(saved));
        return;
      } catch (e) {
        setConfigs(DEFAULT_DOC_CONFIGS);
      }
    } else {
      setConfigs(DEFAULT_DOC_CONFIGS);
    }
  }, []);

  const saveConfigs = (newConfigs: DocNumberingConfig[]) => {
    setConfigs(newConfigs);
    localStorage.setItem("erp_master_doc_numbering_configs_v6", JSON.stringify(newConfigs));
  };

  const generatePreview = (prefix: string, nextNum: number, padding: number, suffix: string) => {
    const safePadding = Math.min(Math.max(Number(padding) || 1, 1), 10);
    const padded = String(Math.max(Number(nextNum) || 1, 1)).padStart(safePadding, "0");
    return `${prefix || ""}${padded}${suffix || ""}`;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    setFormData({
      docType: DOC_TYPES_OPTIONS[0],
      prefix: "DOC-2083-",
      suffix: "",
      padding: 4,
      nextNumber: 1,
      resetCycle: "Academic Year",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DocNumberingConfig) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      docType: item.docType,
      prefix: item.prefix,
      suffix: item.suffix,
      padding: item.padding,
      nextNumber: item.nextNumber,
      resetCycle: item.resetCycle,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;
    saveConfigs(configs.filter((c) => c.id !== id));
  };

  const validateDocNumberingForm = () => {
    const errors: {
      docType?: string;
      padding?: string;
      nextNumber?: string;
      prefix?: string;
    } = {};

    const trimmedDocType = formData.docType.trim();
    if (!trimmedDocType) {
      errors.docType = "Document type is required.";
    } else {
      const isDuplicate = configs.some(
        (c) =>
          c.docType.toLowerCase() === trimmedDocType.toLowerCase() &&
          c.id !== editingItem?.id
      );
      if (isDuplicate) {
        errors.docType = `Configuration for "${trimmedDocType}" already exists.`;
      }
    }

    const padNum = Number(formData.padding);
    if (!padNum || isNaN(padNum) || padNum < 1 || padNum > 10) {
      errors.padding = "Padding digits must be between 1 and 10.";
    }

    const nextNum = Number(formData.nextNumber);
    if (!nextNum || isNaN(nextNum) || nextNum < 1) {
      errors.nextNumber = "Starting number must be at least 1.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDocNumberingForm()) {
      return;
    }

    if (editingItem) {
      const updated = configs.map((c) =>
        c.id === editingItem.id
          ? {
              ...c,
              docType: formData.docType.trim(),
              prefix: formData.prefix.trim(),
              suffix: formData.suffix.trim(),
              padding: Number(formData.padding) || 1,
              nextNumber: Number(formData.nextNumber) || 1,
              resetCycle: formData.resetCycle,
            }
          : c
      );
      saveConfigs(updated);
    } else {
      const newItem: DocNumberingConfig = {
        id: `doc-${Date.now()}`,
        docType: formData.docType.trim(),
        prefix: formData.prefix.trim(),
        suffix: formData.suffix.trim(),
        padding: Number(formData.padding) || 1,
        nextNumber: Number(formData.nextNumber) || 1,
        resetCycle: formData.resetCycle,
      };
      saveConfigs([...configs, newItem]);
    }
    setIsModalOpen(false);
  };

  const filteredConfigs = configs.filter(
    (c) =>
      c.docType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prefix.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      <ErpHeader />
      <ErpTopNav activeModuleId="master-setup" />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb matching screenshot: Setup > Document Numbering */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">Document Numbering</span>
        </div>

        {/* Card matching screenshot */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden min-h-[420px] flex flex-col">
          {/* Card Header matching screenshot */}
          <div className="px-6 py-5 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                Document Numbering
              </h1>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                Manage document numbering configurations for different document types
              </p>
            </div>

            <div className="flex items-center gap-3">
              {configs.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search configurations..."
                    className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-48 sm:w-56"
                  />
                </div>
              )}

              {/* Top right + Add Configuration button matching screenshot */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Configuration</span>
              </button>
            </div>
          </div>

          {/* Table / Empty State matching screenshot */}
          {filteredConfigs.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Document Type</th>
                    <th className="py-2.5 px-4">Prefix</th>
                    <th className="py-2.5 px-4 text-center">Digits (Padding)</th>
                    <th className="py-2.5 px-4 text-center">Next Serial Number</th>
                    <th className="py-2.5 px-4">Reset Cycle</th>
                    <th className="py-2.5 px-4">Live Sample Preview</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredConfigs.map((item, index) => {
                    const sample = generatePreview(item.prefix, item.nextNumber, item.padding, item.suffix);
                    return (
                      <tr key={item.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                        <td className="py-3 px-4 text-center text-[var(--neutral-500)] font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                          {item.docType}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                          {item.prefix || "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-medium">
                          {item.padding} digits
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                          {item.nextNumber}
                        </td>
                        <td className="py-3 px-4 text-[var(--neutral-600)] font-medium">
                          {item.resetCycle}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {sample}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              title="Edit"
                              className="p-1.5 rounded text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                              className="p-1.5 rounded text-[var(--neutral-600)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State matching screenshot exactly */
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
              <div className="p-3.5 rounded-full bg-[var(--neutral-100)] text-[var(--neutral-400)]">
                <FileText className="h-10 w-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  No document numbering configurations found
                </h3>
                <p className="text-xs text-[var(--neutral-400)] mt-1">
                  Create numbering rules to automate prefixes, digit sequences, and serial formatting.
                </p>
              </div>

              {/* + Create First Configuration button matching screenshot */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Create First Configuration</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Add/Edit Document Numbering Configuration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItem ? "Edit Configuration" : "Add Configuration"}
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  Define auto-incrementing serial structure
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Document Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.docType}
                  onChange={(e) => {
                    setFormData({ ...formData, docType: e.target.value });
                    if (formErrors.docType) setFormErrors({ ...formErrors, docType: undefined });
                  }}
                  className={cn(
                    "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none cursor-pointer transition-colors",
                    formErrors.docType
                      ? "border-red-500 bg-red-50/10"
                      : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                  )}
                >
                  {DOC_TYPES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {formErrors.docType && (
                  <p className="text-[11px] text-red-600 font-medium">{formErrors.docType}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    placeholder="e.g., ADM-2083-"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    placeholder="e.g., -NP"
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Digits (Padding) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.padding}
                    onChange={(e) => {
                      setFormData({ ...formData, padding: parseInt(e.target.value) || 0 });
                      if (formErrors.padding) setFormErrors({ ...formErrors, padding: undefined });
                    }}
                    placeholder="4"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      formErrors.padding
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.padding && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.padding}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Start / Next Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nextNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, nextNumber: parseInt(e.target.value) || 0 });
                      if (formErrors.nextNumber) setFormErrors({ ...formErrors, nextNumber: undefined });
                    }}
                    placeholder="1"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      formErrors.nextNumber
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.nextNumber && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.nextNumber}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Auto-Reset Cycle
                </label>
                <select
                  value={formData.resetCycle}
                  onChange={(e) => setFormData({ ...formData, resetCycle: e.target.value as any })}
                  className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                >
                  <option value="Academic Year">Academic Year</option>
                  <option value="Fiscal Year">Fiscal Year</option>
                  <option value="None">Continuous (No Reset)</option>
                </select>
              </div>

              {/* Real-time Live Preview Box */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-[4px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Live Sample Preview
                  </div>
                  <div className="text-xs text-amber-700">Next generated serial:</div>
                </div>
                <div className="font-mono font-bold text-sm px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-[4px] shadow-2xs">
                  {generatePreview(formData.prefix, formData.nextNumber, formData.padding, formData.suffix)}
                </div>
              </div>

              {/* Modal Footer Buttons */}
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
                  {editingItem ? "Save Changes" : "Create Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
