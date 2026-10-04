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
  Filter,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  DollarSign,
  Building,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface MiscFeeItem {
  id: string;
  feeName: string;
  category: "Sports" | "Lab/Practical" | "Excursion/Tour" | "Exam/Board" | "Uniform/Books" | "Other";
  amount: number;
  targetScope: "All Students" | "Specific Classes" | "Selected Individuals";
  targetClasses?: string[];
  dueDate: string;
  isMandatory: boolean;
  assignedCount: number;
  status: "Active" | "Closed";
}

const DEFAULT_MISC_FEES: MiscFeeItem[] = [
  {
    id: "mfc-1",
    feeName: "Annual Sports Meet & Kit Fee",
    category: "Sports",
    amount: 1500,
    targetScope: "All Students",
    dueDate: "2026-11-15",
    isMandatory: true,
    assignedCount: 450,
    status: "Active",
  },
  {
    id: "mfc-2",
    feeName: "SEE Board Registration Fee",
    category: "Exam/Board",
    amount: 3200,
    targetScope: "Specific Classes",
    targetClasses: ["Grade 10"],
    dueDate: "2026-10-30",
    isMandatory: true,
    assignedCount: 124,
    status: "Active",
  },
  {
    id: "mfc-3",
    feeName: "Science Educational Tour (Pokhara)",
    category: "Excursion/Tour",
    amount: 6500,
    targetScope: "Specific Classes",
    targetClasses: ["Grade 9", "Grade 10"],
    dueDate: "2026-12-05",
    isMandatory: false,
    assignedCount: 92,
    status: "Active",
  },
  {
    id: "mfc-4",
    feeName: "Robotics & STEM Workshop Kit",
    category: "Lab/Practical",
    amount: 2500,
    targetScope: "Specific Classes",
    targetClasses: ["Grade 7", "Grade 8"],
    dueDate: "2026-11-20",
    isMandatory: false,
    assignedCount: 65,
    status: "Active",
  },
  {
    id: "mfc-5",
    feeName: "Transfer Certificate (TC) Fee",
    category: "Other",
    amount: 1000,
    targetScope: "Selected Individuals",
    dueDate: "On-demand",
    isMandatory: true,
    assignedCount: 14,
    status: "Active",
  },
];

export default function AssignMiscFeePage() {
  const [fees, setFees] = React.useState<MiscFeeItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<MiscFeeItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    feeName: "",
    category: "Sports" as MiscFeeItem["category"],
    amount: "",
    targetScope: "All Students" as MiscFeeItem["targetScope"],
    targetClasses: "Grade 10, Grade 9",
    dueDate: "2026-11-15",
    isMandatory: true,
    status: "Active" as "Active" | "Closed",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_fee_misc_assignments");
    if (saved) {
      try {
        setFees(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setFees(DEFAULT_MISC_FEES);
  }, []);

  const saveFees = (data: MiscFeeItem[]) => {
    setFees(data);
    localStorage.setItem("erp_fee_misc_assignments", JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      feeName: "",
      category: "Sports",
      amount: "",
      targetScope: "All Students",
      targetClasses: "Grade 10, Grade 9",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isMandatory: true,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MiscFeeItem) => {
    setEditingItem(item);
    setFormData({
      feeName: item.feeName,
      category: item.category,
      amount: item.amount.toString(),
      targetScope: item.targetScope,
      targetClasses: item.targetClasses ? item.targetClasses.join(", ") : "Grade 10",
      dueDate: item.dueDate,
      isMandatory: item.isMandatory,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this miscellaneous fee?")) {
      const updated = fees.filter((f) => f.id !== id);
      saveFees(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.feeName.trim()) return;

    const amt = Number(formData.amount) || 0;
    const clsArr = formData.targetClasses.split(",").map((c) => c.trim()).filter(Boolean);

    if (editingItem) {
      const updated = fees.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              feeName: formData.feeName,
              category: formData.category,
              amount: amt,
              targetScope: formData.targetScope,
              targetClasses: formData.targetScope === "Specific Classes" ? clsArr : undefined,
              dueDate: formData.dueDate,
              isMandatory: formData.isMandatory,
              status: formData.status,
            }
          : item
      );
      saveFees(updated);
    } else {
      const newItem: MiscFeeItem = {
        id: `mfc-${Date.now()}`,
        feeName: formData.feeName,
        category: formData.category,
        amount: amt,
        targetScope: formData.targetScope,
        targetClasses: formData.targetScope === "Specific Classes" ? clsArr : undefined,
        dueDate: formData.dueDate,
        isMandatory: formData.isMandatory,
        assignedCount: formData.targetScope === "All Students" ? 450 : 60,
        status: formData.status,
      };
      saveFees([newItem, ...fees]);
    }
    setIsModalOpen(false);
  };

  const filtered = fees.filter((item) =>
    item.feeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fee & Accounts
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Assign Miscellaneous Fee
          </span>
        </div>

        {/* Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs border border-purple-200">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Assign Miscellaneous Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Create and allocate one-time charges, event costs, board exam registrations, educational tours, and certificate fees
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Miscellaneous Fee</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search miscellaneous fee name or category..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          <div className="text-xs text-[var(--text-tertiary)]">
            <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> active miscellaneous heads
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Fee Head Title</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Amount (NPR)</th>
                  <th className="py-2.5 px-4">Assigned Target</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Mandatory</th>
                  <th className="py-2.5 px-4">Students</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                      No miscellaneous fee heads found. Click &quot;New Miscellaneous Fee&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {item.feeName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-medium text-neutral-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        NPR {item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {item.targetScope}
                          </span>
                          {item.targetClasses && (
                            <div className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[150px]">
                              {item.targetClasses.join(", ")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {item.dueDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium",
                            item.isMandatory
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          )}
                        >
                          {item.isMandatory ? "Compulsory" : "Optional"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] font-medium">
                          <Users className="h-3 w-3 text-neutral-400" />
                          {item.assignedCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-600 hover:text-[var(--brand-primary)] transition-colors"
                            title="Edit Misc Fee"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded hover:bg-red-50 text-neutral-600 hover:text-red-600 transition-colors"
                            title="Delete Misc Fee"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in-0">
            <div className="bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-98 duration-150">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {editingItem ? "Edit Miscellaneous Fee" : "Add Miscellaneous Fee"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Fee Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.feeName}
                    onChange={(e) => setFormData({ ...formData, feeName: e.target.value })}
                    placeholder="e.g. SEE Board Registration Fee or Annual Sports Kit"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="Sports">Sports</option>
                      <option value="Lab/Practical">Lab / Practical</option>
                      <option value="Excursion/Tour">Excursion / Tour</option>
                      <option value="Exam/Board">Exam / Board Registration</option>
                      <option value="Uniform/Books">Uniform / Books</option>
                      <option value="Other">Other Miscellaneous</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">
                      Amount (NPR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="1500"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Target Scope</label>
                    <select
                      value={formData.targetScope}
                      onChange={(e) => setFormData({ ...formData, targetScope: e.target.value as any })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="All Students">All Students</option>
                      <option value="Specific Classes">Specific Classes</option>
                      <option value="Selected Individuals">Selected Individuals</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    />
                  </div>
                </div>

                {formData.targetScope === "Specific Classes" && (
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">
                      Target Classes (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={formData.targetClasses}
                      onChange={(e) => setFormData({ ...formData, targetClasses: e.target.value })}
                      placeholder="Grade 9, Grade 10"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="mandatory"
                    checked={formData.isMandatory}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                    className="rounded border-[var(--border-default)]"
                  />
                  <label htmlFor="mandatory" className="text-xs text-[var(--text-secondary)]">
                    Compulsory Fee (Automatically added to student monthly fee invoice)
                  </label>
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-[6px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-hover)] transition-colors"
                  >
                    {editingItem ? "Save Changes" : "Assign Misc Fee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
