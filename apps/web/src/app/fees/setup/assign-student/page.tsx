"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Filter,
  GraduationCap,
  Percent,
  Award,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface StudentFeeAssignment {
  id: string;
  studentId: string;
  admissionNo: string;
  studentName: string;
  classSection: string;
  baseFee: number;
  scholarshipName?: string;
  discountPercentage: number;
  discountAmount: number;
  netPayableFee: number;
  customAdjustments: string;
  status: "Active" | "Suspended";
}

const DEFAULT_STUDENT_ASSIGNMENTS: StudentFeeAssignment[] = [
  {
    id: "sfa-1",
    studentId: "STU-1001",
    admissionNo: "ADM-2083-042",
    studentName: "Aarav Sharma",
    classSection: "Grade 10 - Section A",
    baseFee: 78000,
    scholarshipName: "Merit Scholarship (Top 5%)",
    discountPercentage: 50,
    discountAmount: 39000,
    netPayableFee: 39000,
    customAdjustments: "50% Tuition Waiver",
    status: "Active",
  },
  {
    id: "sfa-2",
    studentId: "STU-1002",
    admissionNo: "ADM-2083-059",
    studentName: "Pooja Thapa",
    classSection: "Grade 10 - Section B",
    baseFee: 78000,
    scholarshipName: "Sibling Concession",
    discountPercentage: 20,
    discountAmount: 15600,
    netPayableFee: 62400,
    customAdjustments: "Elder sibling in Grade 12",
    status: "Active",
  },
  {
    id: "sfa-3",
    studentId: "STU-1003",
    admissionNo: "ADM-2083-112",
    studentName: "Bikash Adhikari",
    classSection: "Grade 9 - Section A",
    baseFee: 72000,
    discountPercentage: 0,
    discountAmount: 0,
    netPayableFee: 72000,
    customAdjustments: "Standard Class Fee Rate",
    status: "Active",
  },
  {
    id: "sfa-4",
    studentId: "STU-1004",
    admissionNo: "ADM-2083-088",
    studentName: "Sneha Shrestha",
    classSection: "Grade 8 - Section B",
    baseFee: 64100,
    scholarshipName: "Underprivileged Support",
    discountPercentage: 100,
    discountAmount: 64100,
    netPayableFee: 0,
    customAdjustments: "100% Full Free-ship",
    status: "Active",
  },
];

export default function AssignFeeToStudentPage() {
  const [assignments, setAssignments] = React.useState<StudentFeeAssignment[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<StudentFeeAssignment | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    studentName: "",
    admissionNo: "",
    classSection: "Grade 10 - Section A",
    baseFee: "78000",
    scholarshipName: "",
    discountPercentage: "0",
    customAdjustments: "",
    status: "Active" as "Active" | "Suspended",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_fee_student_assignments");
    if (saved) {
      try {
        setAssignments(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setAssignments(DEFAULT_STUDENT_ASSIGNMENTS);
  }, []);

  const saveAssignments = (data: StudentFeeAssignment[]) => {
    setAssignments(data);
    localStorage.setItem("erp_fee_student_assignments", JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      studentName: "",
      admissionNo: "",
      classSection: "Grade 10 - Section A",
      baseFee: "78000",
      scholarshipName: "",
      discountPercentage: "0",
      customAdjustments: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StudentFeeAssignment) => {
    setEditingItem(item);
    setFormData({
      studentName: item.studentName,
      admissionNo: item.admissionNo,
      classSection: item.classSection,
      baseFee: item.baseFee.toString(),
      scholarshipName: item.scholarshipName || "",
      discountPercentage: item.discountPercentage.toString(),
      customAdjustments: item.customAdjustments,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this individual student fee assignment?")) {
      const updated = assignments.filter((a) => a.id !== id);
      saveAssignments(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim()) return;

    const base = Number(formData.baseFee) || 0;
    const discPct = Number(formData.discountPercentage) || 0;
    const discAmt = (base * discPct) / 100;
    const net = Math.max(0, base - discAmt);

    if (editingItem) {
      const updated = assignments.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              studentName: formData.studentName,
              admissionNo: formData.admissionNo || item.admissionNo,
              classSection: formData.classSection,
              baseFee: base,
              scholarshipName: formData.scholarshipName || undefined,
              discountPercentage: discPct,
              discountAmount: discAmt,
              netPayableFee: net,
              customAdjustments: formData.customAdjustments || (discPct > 0 ? `${discPct}% Special Waiver` : "Standard Class Rate"),
              status: formData.status,
            }
          : item
      );
      saveAssignments(updated);
    } else {
      const newItem: StudentFeeAssignment = {
        id: `sfa-${Date.now()}`,
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        admissionNo: formData.admissionNo || `ADM-2083-${Math.floor(100 + Math.random() * 900)}`,
        studentName: formData.studentName,
        classSection: formData.classSection,
        baseFee: base,
        scholarshipName: formData.scholarshipName || undefined,
        discountPercentage: discPct,
        discountAmount: discAmt,
        netPayableFee: net,
        customAdjustments: formData.customAdjustments || (discPct > 0 ? `${discPct}% Special Waiver` : "Standard Class Rate"),
        status: formData.status,
      };
      saveAssignments([newItem, ...assignments]);
    }
    setIsModalOpen(false);
  };

  const filtered = assignments.filter((item) =>
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.classSection.toLowerCase().includes(searchQuery.toLowerCase())
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
            Assign Fee to Student
          </span>
        </div>

        {/* Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-200">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Assign Fee to Student
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage customized student fee profiles, personalized fee waivers, sibling discounts, and special payment terms
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Student Fee</span>
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
              placeholder="Search student name, admission no, or class..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          <div className="text-xs text-[var(--text-tertiary)]">
            <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> individual records
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Student Details</th>
                  <th className="py-2.5 px-4">Class & Section</th>
                  <th className="py-2.5 px-4">Base Fee (NPR)</th>
                  <th className="py-2.5 px-4">Applied Scholarship / Concession</th>
                  <th className="py-2.5 px-4">Waiver Amount</th>
                  <th className="py-2.5 px-4">Net Payable (NPR)</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                      No custom student fee assignments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{item.studentName}</div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{item.admissionNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                          {item.classSection}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        NPR {item.baseFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {item.scholarshipName ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                              <Award className="h-3 w-3" />
                              {item.scholarshipName}
                            </span>
                            <div className="text-[10px] text-[var(--text-tertiary)]">
                              {item.discountPercentage}% concession
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)]">None (Standard)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-amber-600">
                        {item.discountAmount > 0 ? `- NPR ${item.discountAmount.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--brand-primary)]">
                        NPR {item.netPayableFee.toLocaleString()}
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
                  <UserCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {editingItem ? "Edit Student Fee Assignment" : "Assign Fee to Student"}
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
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Admission No.</label>
                    <input
                      type="text"
                      value={formData.admissionNo}
                      onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                      placeholder="e.g. ADM-2083-042"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Class & Section</label>
                    <select
                      value={formData.classSection}
                      onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                      <option value="Grade 10 - Section B">Grade 10 - Section B</option>
                      <option value="Grade 9 - Section A">Grade 9 - Section A</option>
                      <option value="Grade 8 - Section A">Grade 8 - Section A</option>
                      <option value="Grade 1 - Section A">Grade 1 - Section A</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Base Fee (NPR)</label>
                    <input
                      type="number"
                      required
                      value={formData.baseFee}
                      onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                      placeholder="78000"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                    Scholarship & Waiver Details
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Scholarship / Scheme</label>
                      <input
                        type="text"
                        value={formData.scholarshipName}
                        onChange={(e) => setFormData({ ...formData, scholarshipName: e.target.value })}
                        placeholder="e.g. Merit Scholarship"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[var(--text-tertiary)]">Concession / Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                        placeholder="50"
                        className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[var(--text-tertiary)]">Adjustment Remarks</label>
                    <input
                      type="text"
                      value={formData.customAdjustments}
                      onChange={(e) => setFormData({ ...formData, customAdjustments: e.target.value })}
                      placeholder="e.g. Approved by Principal / Board Committee"
                      className="w-full h-7 px-2 bg-white rounded border border-[var(--border-default)] text-xs"
                    />
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
                    {editingItem ? "Save Changes" : "Assign Student Fee"}
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
