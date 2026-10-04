"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
  GraduationCap,
  DollarSign,
  Users,
  CheckSquare,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ClassFeeAssignment {
  id: string;
  className: string;
  sections: string[];
  batch: string;
  monthlyTuition: number;
  annualFee: number;
  examFeePerTerm: number;
  totalAnnualFee: number;
  studentCount: number;
  status: "Active" | "Inactive";
}

const DEFAULT_CLASS_ASSIGNMENTS: ClassFeeAssignment[] = [
  {
    id: "cfa-1",
    className: "Grade 10",
    sections: ["Section A", "Section B", "Section C"],
    batch: "2083/84",
    monthlyTuition: 4500,
    annualFee: 18000,
    examFeePerTerm: 2000,
    totalAnnualFee: 78000,
    studentCount: 124,
    status: "Active",
  },
  {
    id: "cfa-2",
    className: "Grade 9",
    sections: ["Section A", "Section B"],
    batch: "2083/84",
    monthlyTuition: 4200,
    annualFee: 16000,
    examFeePerTerm: 1800,
    totalAnnualFee: 72000,
    studentCount: 88,
    status: "Active",
  },
  {
    id: "cfa-3",
    className: "Grade 8",
    sections: ["Section A", "Section B", "Section C"],
    batch: "2083/84",
    monthlyTuition: 3800,
    annualFee: 14000,
    examFeePerTerm: 1500,
    totalAnnualFee: 64100,
    studentCount: 110,
    status: "Active",
  },
  {
    id: "cfa-4",
    className: "Grade 7",
    sections: ["Section A", "Section B"],
    batch: "2083/84",
    monthlyTuition: 3500,
    annualFee: 13000,
    examFeePerTerm: 1500,
    totalAnnualFee: 59500,
    studentCount: 75,
    status: "Active",
  },
  {
    id: "cfa-5",
    className: "Grade 1",
    sections: ["Section A", "Section B", "Section C", "Section D"],
    batch: "2083/84",
    monthlyTuition: 2800,
    annualFee: 10000,
    examFeePerTerm: 1200,
    totalAnnualFee: 47200,
    studentCount: 135,
    status: "Active",
  },
];

export default function AssignFeeToClassPage() {
  const [assignments, setAssignments] = React.useState<ClassFeeAssignment[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<ClassFeeAssignment | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    className: "",
    sections: "Section A, Section B",
    batch: "2083/84",
    monthlyTuition: "",
    annualFee: "",
    examFeePerTerm: "",
    status: "Active" as "Active" | "Inactive",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_fee_class_assignments");
    if (saved) {
      try {
        setAssignments(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setAssignments(DEFAULT_CLASS_ASSIGNMENTS);
  }, []);

  const saveAssignments = (data: ClassFeeAssignment[]) => {
    setAssignments(data);
    localStorage.setItem("erp_fee_class_assignments", JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      className: "",
      sections: "Section A, Section B",
      batch: "2083/84",
      monthlyTuition: "",
      annualFee: "",
      examFeePerTerm: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClassFeeAssignment) => {
    setEditingItem(item);
    setFormData({
      className: item.className,
      sections: item.sections.join(", "),
      batch: item.batch,
      monthlyTuition: item.monthlyTuition.toString(),
      annualFee: item.annualFee.toString(),
      examFeePerTerm: item.examFeePerTerm.toString(),
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this class fee assignment?")) {
      const updated = assignments.filter((a) => a.id !== id);
      saveAssignments(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className.trim()) return;

    const m = Number(formData.monthlyTuition) || 0;
    const a = Number(formData.annualFee) || 0;
    const ex = Number(formData.examFeePerTerm) || 0;
    const total = m * 12 + a + ex * 3;

    const secArr = formData.sections
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated = assignments.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              className: formData.className,
              sections: secArr.length > 0 ? secArr : ["Section A"],
              batch: formData.batch,
              monthlyTuition: m,
              annualFee: a,
              examFeePerTerm: ex,
              totalAnnualFee: total,
              status: formData.status,
            }
          : item
      );
      saveAssignments(updated);
    } else {
      const newItem: ClassFeeAssignment = {
        id: `cfa-${Date.now()}`,
        className: formData.className,
        sections: secArr.length > 0 ? secArr : ["Section A"],
        batch: formData.batch,
        monthlyTuition: m,
        annualFee: a,
        examFeePerTerm: ex,
        totalAnnualFee: total,
        studentCount: 30,
        status: formData.status,
      };
      saveAssignments([newItem, ...assignments]);
    }
    setIsModalOpen(false);
  };

  const filtered = assignments.filter((item) =>
    item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch.toLowerCase().includes(searchQuery.toLowerCase())
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
            Assign Fee to Class
          </span>
        </div>

        {/* Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-200">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Assign Fee to Class
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Map specific fee structures, monthly tuition rates, and term exams to class grades and sections
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Fee to Class</span>
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class or batch..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          <div className="text-xs text-[var(--text-tertiary)]">
            Configured for <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> classes
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Class & Grade</th>
                  <th className="py-2.5 px-4">Sections</th>
                  <th className="py-2.5 px-4">Batch</th>
                  <th className="py-2.5 px-4">Monthly Tuition</th>
                  <th className="py-2.5 px-4">Annual Dev Fee</th>
                  <th className="py-2.5 px-4">Term Exam Fee</th>
                  <th className="py-2.5 px-4">Est. Total Annual</th>
                  <th className="py-2.5 px-4">Students</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                      No class fee assignments found. Click &quot;Assign Fee to Class&quot; to configure one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        {item.className}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.sections.map((sec, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] text-neutral-700">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                          {item.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        NPR {item.monthlyTuition.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        NPR {item.annualFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        NPR {item.examFeePerTerm.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        NPR {item.totalAnnualFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] font-medium">
                          <Users className="h-3 w-3 text-neutral-400" />
                          {item.studentCount}
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
                            title="Edit Assignment"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded hover:bg-red-50 text-neutral-600 hover:text-red-600 transition-colors"
                            title="Delete Assignment"
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
                  <Building className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {editingItem ? "Edit Class Fee Assignment" : "Assign Fee to Class"}
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">
                      Class / Grade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      placeholder="e.g. Grade 10 or Playgroup"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Batch / Session</label>
                    <input
                      type="text"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      placeholder="e.g. 2083/84"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Applicable Sections (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                    placeholder="Section A, Section B, Section C"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                  />
                </div>

                {/* Class Rates Breakdown */}
                <div className="p-3 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                    Fee Rate Configuration
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Monthly Tuition (NPR)</label>
                      <input
                        type="number"
                        required
                        value={formData.monthlyTuition}
                        onChange={(e) => setFormData({ ...formData, monthlyTuition: e.target.value })}
                        placeholder="4500"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Annual Dev Fee (NPR)</label>
                      <input
                        type="number"
                        value={formData.annualFee}
                        onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
                        placeholder="15000"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Exam / Term (NPR)</label>
                      <input
                        type="number"
                        value={formData.examFeePerTerm}
                        onChange={(e) => setFormData({ ...formData, examFeePerTerm: e.target.value })}
                        placeholder="2000"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                    {editingItem ? "Save Changes" : "Assign to Class"}
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
