"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  FlaskConical,
  GraduationCap,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  type: "Compulsory" | "Optional" | "Extra-Curricular";
  category: "Theory & Practical" | "Theory Only" | "Practical Only";
  creditHours: number;
  theoryFullMarks: number;
  theoryPassMarks: number;
  practicalFullMarks: number;
  practicalPassMarks: number;
  totalMarks: number;
}

const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: "1",
    name: "Compulsory English",
    code: "ENG-101",
    type: "Compulsory",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 75,
    theoryPassMarks: 27,
    practicalFullMarks: 25,
    practicalPassMarks: 10,
    totalMarks: 100,
  },
  {
    id: "2",
    name: "Compulsory Nepali",
    code: "NEP-102",
    type: "Compulsory",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 75,
    theoryPassMarks: 27,
    practicalFullMarks: 25,
    practicalPassMarks: 10,
    totalMarks: 100,
  },
  {
    id: "3",
    name: "Compulsory Mathematics",
    code: "MTH-103",
    type: "Compulsory",
    category: "Theory Only",
    creditHours: 4.0,
    theoryFullMarks: 100,
    theoryPassMarks: 35,
    practicalFullMarks: 0,
    practicalPassMarks: 0,
    totalMarks: 100,
  },
  {
    id: "4",
    name: "Science & Technology",
    code: "SCI-104",
    type: "Compulsory",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 75,
    theoryPassMarks: 27,
    practicalFullMarks: 25,
    practicalPassMarks: 10,
    totalMarks: 100,
  },
  {
    id: "5",
    name: "Social Studies & Life Skills",
    code: "SOC-105",
    type: "Compulsory",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 75,
    theoryPassMarks: 27,
    practicalFullMarks: 25,
    practicalPassMarks: 10,
    totalMarks: 100,
  },
  {
    id: "6",
    name: "Optional Mathematics",
    code: "OPM-106",
    type: "Optional",
    category: "Theory Only",
    creditHours: 4.0,
    theoryFullMarks: 100,
    theoryPassMarks: 35,
    practicalFullMarks: 0,
    practicalPassMarks: 0,
    totalMarks: 100,
  },
  {
    id: "7",
    name: "Computer Science",
    code: "CS-107",
    type: "Optional",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 50,
    theoryPassMarks: 18,
    practicalFullMarks: 50,
    practicalPassMarks: 20,
    totalMarks: 100,
  },
  {
    id: "8",
    name: "Accountancy & Financial Management",
    code: "ACC-108",
    type: "Optional",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 75,
    theoryPassMarks: 27,
    practicalFullMarks: 25,
    practicalPassMarks: 10,
    totalMarks: 100,
  },
];

export default function SubjectSetupPage() {
  const [subjects, setSubjects] = React.useState<SubjectItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<string>("All");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<SubjectItem | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<{
    name: string;
    code: string;
    type: SubjectItem["type"];
    category: SubjectItem["category"];
    creditHours: number;
    theoryFullMarks: number;
    theoryPassMarks: number;
    practicalFullMarks: number;
    practicalPassMarks: number;
  }>({
    name: "",
    code: "",
    type: "Compulsory",
    category: "Theory & Practical",
    creditHours: 4.0,
    theoryFullMarks: 75,
    theoryPassMarks: 27,
    practicalFullMarks: 25,
    practicalPassMarks: 10,
  });

  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    code?: string;
    creditHours?: string;
    marks?: string;
    theoryPass?: string;
    practicalPass?: string;
  }>({});

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_master_subjects_v3");
    if (saved) {
      try {
        setSubjects(JSON.parse(saved));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setSubjects(DEFAULT_SUBJECTS);
  }, []);

  const saveSubjects = (newItems: SubjectItem[]) => {
    setSubjects(newItems);
    localStorage.setItem("erp_master_subjects_v3", JSON.stringify(newItems));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    setFormData({
      name: "",
      code: "",
      type: "Compulsory",
      category: "Theory & Practical",
      creditHours: 4.0,
      theoryFullMarks: 75,
      theoryPassMarks: 27,
      practicalFullMarks: 25,
      practicalPassMarks: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SubjectItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      name: item.name,
      code: item.code,
      type: item.type,
      category: item.category,
      creditHours: item.creditHours,
      theoryFullMarks: item.theoryFullMarks,
      theoryPassMarks: item.theoryPassMarks,
      practicalFullMarks: item.practicalFullMarks,
      practicalPassMarks: item.practicalPassMarks,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    saveSubjects(subjects.filter((s) => s.id !== id));
  };

  const validateSubjectForm = () => {
    const errors: {
      name?: string;
      code?: string;
      creditHours?: string;
      marks?: string;
      theoryPass?: string;
      practicalPass?: string;
    } = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errors.name = "Subject name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Subject name must be at least 2 characters.";
    }

    const trimmedCode = formData.code.trim().toUpperCase();
    if (!trimmedCode) {
      errors.code = "Subject code is required.";
    } else {
      const isDuplicateCode = subjects.some(
        (s) =>
          s.code.toUpperCase() === trimmedCode &&
          s.id !== editingItem?.id
      );
      if (isDuplicateCode) {
        errors.code = `Subject code "${trimmedCode}" is already in use.`;
      }
    }

    const crHours = Number(formData.creditHours);
    if (!crHours || isNaN(crHours) || crHours <= 0) {
      errors.creditHours = "Credit hours must be greater than 0.";
    } else if (crHours > 20) {
      errors.creditHours = "Credit hours cannot exceed 20.";
    }

    const thFull = Number(formData.theoryFullMarks) || 0;
    const thPass = Number(formData.theoryPassMarks) || 0;
    const prFull = Number(formData.practicalFullMarks) || 0;
    const prPass = Number(formData.practicalPassMarks) || 0;

    if (thPass > thFull) {
      errors.theoryPass = "Theory pass marks cannot exceed full marks.";
    }
    if (prPass > prFull) {
      errors.practicalPass = "Practical pass marks cannot exceed full marks.";
    }

    if (formData.category === "Theory & Practical") {
      if (thFull <= 0 || prFull <= 0) {
        errors.marks = "Both theory and practical marks must be greater than 0 for this category.";
      }
    } else if (formData.category === "Theory Only") {
      if (thFull <= 0) {
        errors.marks = "Theory marks must be greater than 0.";
      }
    } else if (formData.category === "Practical Only") {
      if (prFull <= 0) {
        errors.marks = "Practical marks must be greater than 0.";
      }
    }

    if (thFull + prFull <= 0) {
      errors.marks = "Combined total marks must be greater than 0.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSubjectForm()) {
      return;
    }

    const thFull = Number(formData.theoryFullMarks) || 0;
    const prFull = Number(formData.practicalFullMarks) || 0;
    const total = thFull + prFull;

    if (editingItem) {
      const updated = subjects.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              name: formData.name.trim(),
              code: formData.code.trim().toUpperCase(),
              type: formData.type,
              category: formData.category,
              creditHours: Number(formData.creditHours) || 0,
              theoryFullMarks: thFull,
              theoryPassMarks: Number(formData.theoryPassMarks) || 0,
              practicalFullMarks: prFull,
              practicalPassMarks: Number(formData.practicalPassMarks) || 0,
              totalMarks: total,
            }
          : s
      );
      saveSubjects(updated);
    } else {
      const newItem: SubjectItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        category: formData.category,
        creditHours: Number(formData.creditHours) || 0,
        theoryFullMarks: thFull,
        theoryPassMarks: Number(formData.theoryPassMarks) || 0,
        practicalFullMarks: prFull,
        practicalPassMarks: Number(formData.practicalPassMarks) || 0,
        totalMarks: total,
      };
      saveSubjects([...subjects, newItem]);
    }
    setIsModalOpen(false);
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || s.type === typeFilter;
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const compulsoryCount = subjects.filter((s) => s.type === "Compulsory").length;
  const optionalCount = subjects.filter((s) => s.type === "Optional").length;
  const practicalCount = subjects.filter((s) => s.practicalFullMarks > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      <ErpHeader />
      <ErpTopNav activeModuleId="academics" />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="font-bold text-[var(--brand-primary)]">Subject Setup</span>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-red-50 text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Total Subjects</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{subjects.length}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Compulsory</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{compulsoryCount}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Optional Electives</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{optionalCount}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Lab / Practical</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{practicalCount}</div>
            </div>
          </div>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Subjects & Curriculum
                </h1>
                <p className="text-xs text-[var(--neutral-500)]">
                  Manage academic subjects, credit units, theory and practical pass criteria
                </p>
              </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject or code..."
                  className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-40 sm:w-48"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium text-[var(--neutral-700)] cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Compulsory">Compulsory</option>
                <option value="Optional">Optional</option>
                <option value="Extra-Curricular">Extra-Curricular</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-medium text-[var(--neutral-700)] cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Theory & Practical">Theory & Practical</option>
                <option value="Theory Only">Theory Only</option>
                <option value="Practical Only">Practical Only</option>
              </select>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Subject</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {filteredSubjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Subject Name</th>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-center">Credit Hrs</th>
                    <th className="py-2.5 px-4 text-center">Theory (FM/PM)</th>
                    <th className="py-2.5 px-4 text-center">Practical (FM/PM)</th>
                    <th className="py-2.5 px-4 text-center">Total FM</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {filteredSubjects.map((subject, index) => (
                    <tr key={subject.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)] font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{subject.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[var(--neutral-800)] border border-[var(--border-default)]">
                          {subject.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border",
                          subject.type === "Compulsory" && "bg-blue-50 text-blue-700 border-blue-200",
                          subject.type === "Optional" && "bg-purple-50 text-purple-700 border-purple-200",
                          subject.type === "Extra-Curricular" && "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          {subject.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--neutral-700)]">
                        <span className="text-[11px] font-medium">{subject.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        {subject.creditHours.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--neutral-700)]">
                        {subject.theoryFullMarks} / <span className="text-red-600 font-medium">{subject.theoryPassMarks}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--neutral-700)]">
                        {subject.practicalFullMarks > 0 ? (
                          <span>{subject.practicalFullMarks} / <span className="text-red-600 font-medium">{subject.practicalPassMarks}</span></span>
                        ) : (
                          <span className="text-[var(--neutral-400)]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--text-primary)]">
                        {subject.totalMarks}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(subject)}
                            title="Edit"
                            className="p-1.5 rounded text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(subject.id)}
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
              <FileText className="h-10 w-10 text-[var(--neutral-400)] mx-auto" />
              <p className="text-xs font-medium text-[var(--neutral-500)]">
                No subjects found matching your filters. Click &ldquo;+ Add Subject&rdquo; to create one.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
          <div className="w-full max-w-lg bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItem ? "Edit Subject" : "Add New Subject"}
                </h2>
                <p className="text-xs text-[var(--neutral-500)]">
                  {editingItem ? "Update subject configuration and grading rules" : "Create a new academic subject with marks weighting"}
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Subject Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g., Compulsory Mathematics, Computer Science"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Subject Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({ ...formData, code: e.target.value });
                      if (formErrors.code) setFormErrors({ ...formErrors, code: undefined });
                    }}
                    placeholder="e.g., MTH-101, SCI-104"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono uppercase transition-colors",
                      formErrors.code
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.code && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.code}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Credit Hours <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.creditHours}
                    onChange={(e) => {
                      setFormData({ ...formData, creditHours: parseFloat(e.target.value) || 0 });
                      if (formErrors.creditHours) setFormErrors({ ...formErrors, creditHours: undefined });
                    }}
                    placeholder="4.0"
                    className={cn(
                      "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                      formErrors.creditHours
                        ? "border-red-500 bg-red-50/10"
                        : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                    )}
                  />
                  {formErrors.creditHours && (
                    <p className="text-[11px] text-red-600 font-medium">{formErrors.creditHours}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Subject Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                  >
                    <option value="Compulsory">Compulsory</option>
                    <option value="Optional">Optional</option>
                    <option value="Extra-Curricular">Extra-Curricular</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      let th = formData.theoryFullMarks;
                      let pr = formData.practicalFullMarks;
                      if (cat === "Theory Only") {
                        th = 100;
                        pr = 0;
                      } else if (cat === "Practical Only") {
                        th = 0;
                        pr = 100;
                      } else if (cat === "Theory & Practical" && pr === 0) {
                        th = 75;
                        pr = 25;
                      }
                      setFormData({
                        ...formData,
                        category: cat,
                        theoryFullMarks: th,
                        practicalFullMarks: pr,
                        theoryPassMarks: Math.round(th * 0.35),
                        practicalPassMarks: Math.round(pr * 0.4),
                      });
                      if (formErrors.marks) setFormErrors({ ...formErrors, marks: undefined });
                    }}
                    className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                  >
                    <option value="Theory & Practical">Theory & Practical</option>
                    <option value="Theory Only">Theory Only</option>
                    <option value="Practical Only">Practical Only</option>
                  </select>
                </div>
              </div>

              {/* Theory Marks Breakdown */}
              <div className="p-3 bg-[var(--neutral-50)] rounded-[4px] border border-[var(--border-default)] space-y-3">
                <div className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Marks & Evaluation Breakdown
                </div>

                {formErrors.marks && (
                  <p className="text-[11px] text-red-600 font-medium">{formErrors.marks}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Theory Full Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.theoryFullMarks}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          theoryFullMarks: val,
                          theoryPassMarks: Math.round(val * 0.35),
                        });
                        if (formErrors.marks) setFormErrors({ ...formErrors, marks: undefined });
                      }}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Theory Pass Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.theoryPassMarks}
                      onChange={(e) => {
                        setFormData({ ...formData, theoryPassMarks: parseInt(e.target.value) || 0 });
                        if (formErrors.theoryPass) setFormErrors({ ...formErrors, theoryPass: undefined });
                      }}
                      className={cn(
                        "w-full h-8 px-2.5 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                        formErrors.theoryPass
                          ? "border-red-500 bg-red-50/10"
                          : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                      )}
                    />
                    {formErrors.theoryPass && (
                      <p className="text-[10px] text-red-600 font-medium">{formErrors.theoryPass}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Practical Full Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.practicalFullMarks}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          practicalFullMarks: val,
                          practicalPassMarks: Math.round(val * 0.4),
                        });
                        if (formErrors.marks) setFormErrors({ ...formErrors, marks: undefined });
                      }}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Practical Pass Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.practicalPassMarks}
                      onChange={(e) => {
                        setFormData({ ...formData, practicalPassMarks: parseInt(e.target.value) || 0 });
                        if (formErrors.practicalPass) setFormErrors({ ...formErrors, practicalPass: undefined });
                      }}
                      className={cn(
                        "w-full h-8 px-2.5 text-xs bg-white border rounded-[4px] focus:outline-none font-mono transition-colors",
                        formErrors.practicalPass
                          ? "border-red-500 bg-red-50/10"
                          : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
                      )}
                    />
                    {formErrors.practicalPass && (
                      <p className="text-[10px] text-red-600 font-medium">{formErrors.practicalPass}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--neutral-600)]">Combined Total Marks:</span>
                  <span className="font-bold font-mono text-sm text-[var(--brand-primary)]">
                    {Number(formData.theoryFullMarks || 0) + Number(formData.practicalFullMarks || 0)}
                  </span>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[var(--border-default)]">
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
