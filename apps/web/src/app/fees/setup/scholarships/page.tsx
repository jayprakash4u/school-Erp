"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Filter,
  Percent,
  DollarSign,
  Users,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ScholarshipScheme {
  id: string;
  name: string;
  code: string;
  category: "Merit Based" | "Need Based / Financial Aid" | "Sibling / Family" | "Staff Child" | "Sports / Cultural" | "Government / Quota";
  discountType: "Percentage" | "Fixed Amount";
  discountValue: number;
  applicableFeeHeads: string;
  maxRecipients?: number;
  currentRecipients: number;
  eligibilityCriteria: string;
  status: "Active" | "Inactive";
}

const DEFAULT_SCHOLARSHIPS: ScholarshipScheme[] = [
  {
    id: "sch-1",
    name: "Academic Board Topper Free-ship",
    code: "SCH-TOPPER-100",
    category: "Merit Based",
    discountType: "Percentage",
    discountValue: 100,
    applicableFeeHeads: "Tuition Fee + Annual Dev Fee",
    maxRecipients: 5,
    currentRecipients: 3,
    eligibilityCriteria: "Rank 1st in Grade or GPA > 3.90 in final examination",
    status: "Active",
  },
  {
    id: "sch-2",
    name: "Merit Distinction Scholarship (50%)",
    code: "SCH-MERIT-50",
    category: "Merit Based",
    discountType: "Percentage",
    discountValue: 50,
    applicableFeeHeads: "Tuition Fee Only",
    maxRecipients: 20,
    currentRecipients: 14,
    eligibilityCriteria: "GPA > 3.75 in previous academic term",
    status: "Active",
  },
  {
    id: "sch-3",
    name: "Sibling Fee Concession (20%)",
    code: "SCH-SIBLING-20",
    category: "Sibling / Family",
    discountType: "Percentage",
    discountValue: 20,
    applicableFeeHeads: "Tuition Fee",
    currentRecipients: 42,
    eligibilityCriteria: "Younger sibling enrolled in the same institution",
    status: "Active",
  },
  {
    id: "sch-4",
    name: "Underprivileged & Needy Support Grant",
    code: "SCH-NEEDY-100",
    category: "Need Based / Financial Aid",
    discountType: "Percentage",
    discountValue: 100,
    applicableFeeHeads: "Full School Fee (100% Free-ship)",
    maxRecipients: 15,
    currentRecipients: 11,
    eligibilityCriteria: "Verified local municipal recommendation & income certificate",
    status: "Active",
  },
  {
    id: "sch-5",
    name: "National Sports Champion Grant",
    code: "SCH-SPORTS-50",
    category: "Sports / Cultural",
    discountType: "Percentage",
    discountValue: 50,
    applicableFeeHeads: "Tuition Fee + Extra Curricular",
    maxRecipients: 10,
    currentRecipients: 6,
    eligibilityCriteria: "District/National level sports medal recipient",
    status: "Active",
  },
  {
    id: "sch-6",
    name: "Staff Children Concession",
    code: "SCH-STAFF-50",
    category: "Staff Child",
    discountType: "Percentage",
    discountValue: 50,
    applicableFeeHeads: "Tuition Fee",
    currentRecipients: 18,
    eligibilityCriteria: "Child of full-time confirmed school faculty or staff",
    status: "Active",
  },
];

export default function ScholarshipsSetupPage() {
  const [scholarships, setScholarships] = React.useState<ScholarshipScheme[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<ScholarshipScheme | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    category: "Merit Based" as ScholarshipScheme["category"],
    discountType: "Percentage" as ScholarshipScheme["discountType"],
    discountValue: "50",
    applicableFeeHeads: "Tuition Fee Only",
    maxRecipients: "",
    eligibilityCriteria: "",
    status: "Active" as "Active" | "Inactive",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_fee_scholarships");
    if (saved) {
      try {
        setScholarships(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setScholarships(DEFAULT_SCHOLARSHIPS);
  }, []);

  const saveScholarships = (data: ScholarshipScheme[]) => {
    setScholarships(data);
    localStorage.setItem("erp_fee_scholarships", JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      code: `SCH-${Date.now().toString().slice(-4)}`,
      category: "Merit Based",
      discountType: "Percentage",
      discountValue: "50",
      applicableFeeHeads: "Tuition Fee Only",
      maxRecipients: "15",
      eligibilityCriteria: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ScholarshipScheme) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category,
      discountType: item.discountType,
      discountValue: item.discountValue.toString(),
      applicableFeeHeads: item.applicableFeeHeads,
      maxRecipients: item.maxRecipients ? item.maxRecipients.toString() : "",
      eligibilityCriteria: item.eligibilityCriteria,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this scholarship scheme?")) {
      const updated = scholarships.filter((s) => s.id !== id);
      saveScholarships(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const val = Number(formData.discountValue) || 0;
    const maxR = formData.maxRecipients ? Number(formData.maxRecipients) : undefined;

    if (editingItem) {
      const updated = scholarships.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name,
              code: formData.code,
              category: formData.category,
              discountType: formData.discountType,
              discountValue: val,
              applicableFeeHeads: formData.applicableFeeHeads,
              maxRecipients: maxR,
              eligibilityCriteria: formData.eligibilityCriteria,
              status: formData.status,
            }
          : item
      );
      saveScholarships(updated);
    } else {
      const newItem: ScholarshipScheme = {
        id: `sch-${Date.now()}`,
        name: formData.name,
        code: formData.code || `SCH-${Math.floor(100 + Math.random() * 900)}`,
        category: formData.category,
        discountType: formData.discountType,
        discountValue: val,
        applicableFeeHeads: formData.applicableFeeHeads,
        maxRecipients: maxR,
        currentRecipients: 0,
        eligibilityCriteria: formData.eligibilityCriteria,
        status: formData.status,
      };
      saveScholarships([newItem, ...scholarships]);
    }
    setIsModalOpen(false);
  };

  const filtered = scholarships.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fee Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Scholarships & Concessions
          </span>
        </div>

        {/* Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs border border-indigo-200">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Scholarships & Fee Concessions
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure merit scholarships, sibling discounts, quota concessions, staff grants, and financial aid policies
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Scholarship</span>
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
              placeholder="Search scholarship name, code or category..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          <div className="text-xs text-[var(--text-tertiary)]">
            <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> scholarship schemes defined
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Scheme Name & Code</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Benefit / Discount</th>
                  <th className="py-2.5 px-4">Applicable Fee Heads</th>
                  <th className="py-2.5 px-4">Active Recipients</th>
                  <th className="py-2.5 px-4">Eligibility Criteria</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                      No scholarship schemes found. Click &quot;Add Scholarship&quot; to define a new policy.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-primary)]">{item.name}</div>
                        <div className="text-[11px] font-mono text-[var(--text-tertiary)]">{item.code}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-medium text-neutral-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-700">
                        {item.discountType === "Percentage"
                          ? `${item.discountValue}% Waiver`
                          : `NPR ${item.discountValue.toLocaleString()} Flat`}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {item.applicableFeeHeads}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-primary)] font-semibold">
                          <Users className="h-3.5 w-3.5 text-neutral-400" />
                          {item.currentRecipients} {item.maxRecipients ? `/ ${item.maxRecipients}` : "students"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-tertiary)] max-w-xs truncate" title={item.eligibilityCriteria}>
                        {item.eligibilityCriteria}
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
                            title="Edit Scheme"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded hover:bg-red-50 text-neutral-600 hover:text-red-600 transition-colors"
                            title="Delete Scheme"
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
                  <Award className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {editingItem ? "Edit Scholarship Scheme" : "Add New Scholarship Scheme"}
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
                    Scholarship Scheme Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Merit Board Topper Scholarship"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Scheme Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. SCH-MERIT-100"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="Merit Based">Merit Based</option>
                      <option value="Need Based / Financial Aid">Need Based / Financial Aid</option>
                      <option value="Sibling / Family">Sibling / Family</option>
                      <option value="Staff Child">Staff Child</option>
                      <option value="Sports / Cultural">Sports / Cultural</option>
                      <option value="Government / Quota">Government / Quota</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount (NPR)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === "Percentage" ? "50" : "10000"}
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] focus:outline-none focus:border-[var(--brand-primary)] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Applicable Fee Heads</label>
                    <input
                      type="text"
                      value={formData.applicableFeeHeads}
                      onChange={(e) => setFormData({ ...formData, applicableFeeHeads: e.target.value })}
                      placeholder="Tuition Fee Only"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Max Quota / Seats</label>
                    <input
                      type="number"
                      value={formData.maxRecipients}
                      onChange={(e) => setFormData({ ...formData, maxRecipients: e.target.value })}
                      placeholder="Leave blank for unlimited"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={formData.eligibilityCriteria}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                    placeholder="e.g. Must maintain minimum 3.6 GPA in semester terminals..."
                    className="w-full p-2.5 rounded-[6px] border border-[var(--border-default)] text-xs focus:outline-none focus:border-[var(--brand-primary)]"
                  />
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
                    {editingItem ? "Save Changes" : "Create Scholarship"}
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
