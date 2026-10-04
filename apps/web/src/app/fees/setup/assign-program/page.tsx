"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  Calendar,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ProgramFeeAssignment {
  id: string;
  programName: string;
  faculty: string;
  batch: string;
  academicYear: string;
  totalAnnualFee: number;
  installments: number;
  feeHeads: { headName: string; amount: number }[];
  status: "Active" | "Draft" | "Archived";
  assignedClassesCount: number;
}

const DEFAULT_PROGRAM_ASSIGNMENTS: ProgramFeeAssignment[] = [
  {
    id: "pfa-1",
    programName: "Secondary School (Grades 9-10)",
    faculty: "General Academic",
    batch: "2083/84",
    academicYear: "2026/27",
    totalAnnualFee: 68000,
    installments: 4,
    feeHeads: [
      { headName: "Tuition Fee", amount: 36000 },
      { headName: "Annual Development Fee", amount: 12000 },
      { headName: "Science & Computer Lab", amount: 10000 },
      { headName: "Exam Fee", amount: 6000 },
      { headName: "Library & Extra Curricular", amount: 4000 },
    ],
    status: "Active",
    assignedClassesCount: 4,
  },
  {
    id: "pfa-2",
    programName: "+2 Science Stream",
    faculty: "Science",
    batch: "2083/84",
    academicYear: "2026/27",
    totalAnnualFee: 95000,
    installments: 3,
    feeHeads: [
      { headName: "Tuition Fee", amount: 50000 },
      { headName: "Laboratory Practical", amount: 20000 },
      { headName: "Annual Registration", amount: 15000 },
      { headName: "Board Exam Prep", amount: 10000 },
    ],
    status: "Active",
    assignedClassesCount: 2,
  },
  {
    id: "pfa-3",
    programName: "+2 Management Stream",
    faculty: "Management",
    batch: "2083/84",
    academicYear: "2026/27",
    totalAnnualFee: 78000,
    installments: 3,
    feeHeads: [
      { headName: "Tuition Fee", amount: 45000 },
      { headName: "Computer Application Lab", amount: 12000 },
      { headName: "Annual Charges", amount: 13000 },
      { headName: "Exam & Materials", amount: 8000 },
    ],
    status: "Active",
    assignedClassesCount: 2,
  },
  {
    id: "pfa-4",
    programName: "Primary School (Grades 1-5)",
    faculty: "Basic Education",
    batch: "2083/84",
    academicYear: "2026/27",
    totalAnnualFee: 48000,
    installments: 4,
    feeHeads: [
      { headName: "Tuition Fee", amount: 28000 },
      { headName: "Activity & Sports", amount: 8000 },
      { headName: "Annual Development", amount: 8000 },
      { headName: "Assessment Fee", amount: 4000 },
    ],
    status: "Active",
    assignedClassesCount: 10,
  },
];

export default function AssignFeeToProgramPage() {
  const [assignments, setAssignments] = React.useState<ProgramFeeAssignment[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<ProgramFeeAssignment | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    programName: "",
    faculty: "General Academic",
    batch: "2083/84",
    academicYear: "2026/27",
    totalAnnualFee: "",
    installments: "4",
    status: "Active" as "Active" | "Draft" | "Archived",
    tuitionFee: "",
    labFee: "",
    examFee: "",
    otherFee: "",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_fee_program_assignments");
    if (saved) {
      try {
        setAssignments(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setAssignments(DEFAULT_PROGRAM_ASSIGNMENTS);
  }, []);

  const saveAssignments = (data: ProgramFeeAssignment[]) => {
    setAssignments(data);
    localStorage.setItem("erp_fee_program_assignments", JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      programName: "",
      faculty: "General Academic",
      batch: "2083/84",
      academicYear: "2026/27",
      totalAnnualFee: "",
      installments: "4",
      status: "Active",
      tuitionFee: "",
      labFee: "",
      examFee: "",
      otherFee: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProgramFeeAssignment) => {
    setEditingItem(item);
    const tuition = item.feeHeads.find(h => h.headName.toLowerCase().includes("tuition"))?.amount || 0;
    const lab = item.feeHeads.find(h => h.headName.toLowerCase().includes("lab"))?.amount || 0;
    const exam = item.feeHeads.find(h => h.headName.toLowerCase().includes("exam"))?.amount || 0;
    const other = item.totalAnnualFee - tuition - lab - exam;

    setFormData({
      programName: item.programName,
      faculty: item.faculty,
      batch: item.batch,
      academicYear: item.academicYear,
      totalAnnualFee: item.totalAnnualFee.toString(),
      installments: item.installments.toString(),
      status: item.status,
      tuitionFee: tuition ? tuition.toString() : "",
      labFee: lab ? lab.toString() : "",
      examFee: exam ? exam.toString() : "",
      otherFee: other > 0 ? other.toString() : "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this program fee assignment?")) {
      const updated = assignments.filter((a) => a.id !== id);
      saveAssignments(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programName.trim()) return;

    const t = Number(formData.tuitionFee) || 0;
    const l = Number(formData.labFee) || 0;
    const ex = Number(formData.examFee) || 0;
    const o = Number(formData.otherFee) || 0;
    const total = t + l + ex + o || Number(formData.totalAnnualFee) || 0;

    const heads = [
      { headName: "Tuition Fee", amount: t },
      { headName: "Laboratory & Practical", amount: l },
      { headName: "Examination Fee", amount: ex },
      { headName: "Other Annual Charges", amount: o },
    ].filter(h => h.amount > 0);

    if (editingItem) {
      const updated = assignments.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              programName: formData.programName,
              faculty: formData.faculty,
              batch: formData.batch,
              academicYear: formData.academicYear,
              totalAnnualFee: total,
              installments: Number(formData.installments) || 4,
              status: formData.status,
              feeHeads: heads.length > 0 ? heads : [{ headName: "General Program Fee", amount: total }],
            }
          : item
      );
      saveAssignments(updated);
    } else {
      const newItem: ProgramFeeAssignment = {
        id: `pfa-${Date.now()}`,
        programName: formData.programName,
        faculty: formData.faculty,
        batch: formData.batch,
        academicYear: formData.academicYear,
        totalAnnualFee: total,
        installments: Number(formData.installments) || 4,
        status: formData.status,
        assignedClassesCount: 1,
        feeHeads: heads.length > 0 ? heads : [{ headName: "General Program Fee", amount: total }],
      };
      saveAssignments([newItem, ...assignments]);
    }
    setIsModalOpen(false);
  };

  const filtered = assignments.filter((item) =>
    item.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            Assign Fee to Program
          </span>
        </div>

        {/* Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs border border-indigo-200">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Assign Fee to Program
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure baseline fee structures, annual amounts, and installment splits per academic program
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Program Fee</span>
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
              placeholder="Search program, faculty or batch..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          <div className="text-xs text-[var(--text-tertiary)]">
            Showing <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> configured programs
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Program & Faculty</th>
                  <th className="py-2.5 px-4">Batch / Session</th>
                  <th className="py-2.5 px-4">Annual Fee (NPR)</th>
                  <th className="py-2.5 px-4">Installment Split</th>
                  <th className="py-2.5 px-4">Fee Heads Breakdown</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                      No program fee assignments found. Click &quot;New Program Fee&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{item.programName}</div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{item.faculty}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[11px] font-medium text-[var(--text-secondary)]">
                          <Calendar className="h-3 w-3 text-[var(--brand-primary)]" />
                          {item.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                        NPR {item.totalAnnualFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-[var(--text-secondary)] font-medium">
                          {item.installments} Installments
                        </span>
                        <div className="text-[10px] text-[var(--text-tertiary)]">
                          ~NPR {Math.round(item.totalAnnualFee / item.installments).toLocaleString()} / term
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.feeHeads.map((h, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] text-[var(--neutral-700)]"
                            >
                              {h.headName}: NPR {h.amount.toLocaleString()}
                            </span>
                          ))}
                        </div>
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
                  <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {editingItem ? "Edit Program Fee Assignment" : "Assign Fee to Program"}
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
                    Program / Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.programName}
                    onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                    placeholder="e.g. Secondary Level (Grades 9-10) or +2 Science"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Faculty Stream</label>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      placeholder="e.g. Science / Management"
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

                {/* Fee Heads Breakdown */}
                <div className="p-3 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                    Fee Heads Breakdown (Annual)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Tuition Fee (NPR)</label>
                      <input
                        type="number"
                        value={formData.tuitionFee}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                        placeholder="35000"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Lab & Practical (NPR)</label>
                      <input
                        type="number"
                        value={formData.labFee}
                        onChange={(e) => setFormData({ ...formData, labFee: e.target.value })}
                        placeholder="10000"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Exam & Assessment (NPR)</label>
                      <input
                        type="number"
                        value={formData.examFee}
                        onChange={(e) => setFormData({ ...formData, examFee: e.target.value })}
                        placeholder="6000"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Other Annual (NPR)</label>
                      <input
                        type="number"
                        value={formData.otherFee}
                        onChange={(e) => setFormData({ ...formData, otherFee: e.target.value })}
                        placeholder="8000"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Installments Plan</label>
                    <select
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="1">1 (Full Annual Payment)</option>
                      <option value="2">2 (Bi-annual / Semester)</option>
                      <option value="3">3 (Trimester / Term)</option>
                      <option value="4">4 (Quarterly)</option>
                      <option value="12">12 (Monthly)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
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
                    {editingItem ? "Save Changes" : "Create Assignment"}
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
