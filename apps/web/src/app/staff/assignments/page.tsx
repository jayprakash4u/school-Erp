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
  UserCheck,
  Building2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type AssignmentRole =
  | "HOD"
  | "Class Teacher"
  | "Subject Teacher"
  | "Academic Coordinator"
  | "House Master";

export interface AssignmentItem {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  role: AssignmentRole;
  academicArea: string; // e.g., "Computer Science", "Grade 10 - Section A", "Mathematics (Grade 10 - A)"
  department?: string;
  className?: string;
  section?: string;
  subject?: string;
  academicYear: string;
  assignedDate: string;
  status: "Active" | "Inactive";
}

const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "asgn-1",
    employeeId: "EMP-001",
    employeeName: "Raj Sharma",
    designation: "Professor",
    role: "HOD",
    academicArea: "Computer Science & Engineering",
    department: "Computer Science",
    academicYear: "2026–27",
    assignedDate: "2026-06-01",
    status: "Active",
  },
  {
    id: "asgn-2",
    employeeId: "EMP-002",
    employeeName: "Sita Sharma",
    designation: "Teacher",
    role: "Class Teacher",
    academicArea: "Grade 10 - Section A",
    className: "Grade 10",
    section: "Section A",
    academicYear: "2026–27",
    assignedDate: "2026-06-05",
    status: "Active",
  },
  {
    id: "asgn-3",
    employeeId: "EMP-004",
    employeeName: "Ram Thapa",
    designation: "Lecturer",
    role: "Subject Teacher",
    academicArea: "Mathematics (Grade 10 - A)",
    className: "Grade 10",
    section: "Section A",
    subject: "Mathematics",
    academicYear: "2026–27",
    assignedDate: "2026-06-12",
    status: "Active",
  },
  {
    id: "asgn-4",
    employeeId: "EMP-002",
    employeeName: "Sita Sharma",
    designation: "Teacher",
    role: "Subject Teacher",
    academicArea: "English (Grade 9 - B)",
    className: "Grade 9",
    section: "Section B",
    subject: "English",
    academicYear: "2026–27",
    assignedDate: "2026-06-05",
    status: "Active",
  },
];

const DEFAULT_CLASSES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const DEFAULT_SECTIONS = ["Section A", "Section B", "Section C", "Section D"];
const DEFAULT_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Computer Science", "Accountancy", "Economics"];

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<string>("All");
  const [statusFilter, setStatusFilter] = React.useState<string>("Active");

  // Options from registered employees and departments
  const [availableEmployees, setAvailableEmployees] = React.useState<
    { id: string; name: string; employeeId: string; designation: string; department?: string }[]
  >([]);
  const [availableDepartments, setAvailableDepartments] = React.useState<string[]>([]);

  // Modal States
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<AssignmentItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<AssignmentItem | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<{
    employeeId: string;
    role: AssignmentRole;
    department: string;
    className: string;
    section: string;
    subject: string;
    academicYear: string;
    assignedDate: string;
    status: "Active" | "Inactive";
  }>({
    employeeId: "",
    role: "Class Teacher",
    department: "",
    className: "Grade 10",
    section: "Section A",
    subject: "Mathematics",
    academicYear: "2026–27",
    assignedDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{
    employeeId?: string;
    department?: string;
    className?: string;
    section?: string;
    subject?: string;
  }>({});

  React.useEffect(() => {
    // Load assignments
    const saved = localStorage.getItem("erp_staff_assignments_v1");
    if (saved) {
      try {
        setAssignments(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setAssignments(DEFAULT_ASSIGNMENTS);
      }
    } else {
      setAssignments(DEFAULT_ASSIGNMENTS);
    }

    // Load employees
    const savedStaff = localStorage.getItem("erp_staff_employees_final_v1");
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableEmployees(
            parsed.map((emp: { id: string; employeeId: string; firstName: string; lastName?: string; designation: string; department?: string }) => ({
              id: emp.id,
              employeeId: emp.employeeId,
              name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
              designation: emp.designation,
              department: emp.department,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setAvailableEmployees([
        { id: "emp-1", employeeId: "EMP-001", name: "Raj Sharma", designation: "Professor", department: "Computer Science" },
        { id: "emp-2", employeeId: "EMP-002", name: "Sita Sharma", designation: "Teacher" },
        { id: "emp-3", employeeId: "EMP-003", name: "Hari Kumar", designation: "Accountant", department: "Accounts" },
        { id: "emp-4", employeeId: "EMP-004", name: "Ram Thapa", designation: "Lecturer", department: "Management" },
      ]);
    }

    // Load departments
    const savedDepts = localStorage.getItem("erp_master_departments_simple_v1");
    if (savedDepts) {
      try {
        const parsed = JSON.parse(savedDepts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableDepartments(parsed.map((d: { name: string }) => d.name));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setAvailableDepartments([
        "Computer Science",
        "Management",
        "Science & Technology",
        "Mathematics",
        "Accounts",
      ]);
    }
  }, []);

  const saveAssignments = (items: AssignmentItem[]) => {
    setAssignments(items);
    localStorage.setItem("erp_staff_assignments_v1", JSON.stringify(items));
  };

  React.useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    const defaultEmp = availableEmployees[0]?.employeeId || "EMP-001";
    setFormData({
      employeeId: defaultEmp,
      role: "Class Teacher",
      department: availableDepartments[0] || "Computer Science",
      className: "Grade 10",
      section: "Section A",
      subject: "Mathematics",
      academicYear: "2026–27",
      assignedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: AssignmentItem) => {
    setEditingItem(item);
    setFormErrors({});
    setFormData({
      employeeId: item.employeeId,
      role: item.role,
      department: item.department || availableDepartments[0] || "",
      className: item.className || "Grade 10",
      section: item.section || "Section A",
      subject: item.subject || "Mathematics",
      academicYear: item.academicYear,
      assignedDate: item.assignedDate,
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = (item: AssignmentItem) => {
    const nextStatus: "Active" | "Inactive" = item.status === "Active" ? "Inactive" : "Active";
    const updated = assignments.map((a) => (a.id === item.id ? { ...a, status: nextStatus } : a));
    saveAssignments(updated);
  };

  const handleConfirmDelete = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    saveAssignments(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!formData.employeeId) {
      errors.employeeId = "Please select an employee";
    }

    if (formData.role === "HOD" && !formData.department.trim()) {
      errors.department = "Department is required for HOD assignment";
    }

    if (formData.role === "Class Teacher") {
      if (!formData.className) errors.className = "Class is required";
      if (!formData.section) errors.section = "Section is required";
    }

    if (formData.role === "Subject Teacher") {
      if (!formData.className) errors.className = "Class is required";
      if (!formData.section) errors.section = "Section is required";
      if (!formData.subject.trim()) errors.subject = "Subject is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedEmp = availableEmployees.find((e) => e.employeeId === formData.employeeId);
    const empName = selectedEmp?.name || "Staff Member";
    const desig = selectedEmp?.designation || "Faculty";

    let academicArea = "";
    if (formData.role === "HOD") {
      academicArea = formData.department;
    } else if (formData.role === "Class Teacher") {
      academicArea = `${formData.className} - ${formData.section}`;
    } else if (formData.role === "Subject Teacher") {
      academicArea = `${formData.subject} (${formData.className} - ${formData.section})`;
    } else {
      academicArea = formData.department || "Academic Faculty";
    }

    if (editingItem) {
      const updated = assignments.map((a) =>
        a.id === editingItem.id
          ? {
              ...a,
              employeeId: formData.employeeId,
              employeeName: empName,
              designation: desig,
              role: formData.role,
              academicArea,
              department: formData.role === "HOD" ? formData.department : undefined,
              className: formData.role !== "HOD" ? formData.className : undefined,
              section: formData.role !== "HOD" ? formData.section : undefined,
              subject: formData.role === "Subject Teacher" ? formData.subject : undefined,
              academicYear: formData.academicYear,
              assignedDate: formData.assignedDate,
              status: formData.status,
            }
          : a
      );
      saveAssignments(updated);
    } else {
      const newItem: AssignmentItem = {
        id: `asgn-${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: empName,
        designation: desig,
        role: formData.role,
        academicArea,
        department: formData.role === "HOD" ? formData.department : undefined,
        className: formData.role !== "HOD" ? formData.className : undefined,
        section: formData.role !== "HOD" ? formData.section : undefined,
        subject: formData.role === "Subject Teacher" ? formData.subject : undefined,
        academicYear: formData.academicYear,
        assignedDate: formData.assignedDate,
        status: formData.status,
      };
      saveAssignments([...assignments, newItem]);
    }

    setIsFormOpen(false);
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.academicArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "All" || item.role === roleFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <ErpHeader />
      <ErpTopNav activeModuleId="staff" />

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href="/staff" className="hover:text-[var(--brand-primary)] transition-colors">
            HR & Staff
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Staff Assignments</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Staff Assignments
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Assign and track academic responsibilities (HOD, Class Teacher, Subject Teacher).
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Assignment</span>
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-2.5">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search by employee, responsibility, class, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-light)]">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Assignment Type:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              >
                <option value="All">All Assignments</option>
                <option value="HOD">HOD (Head of Dept)</option>
                <option value="Class Teacher">Class Teacher</option>
                <option value="Subject Teacher">Subject Teacher</option>
                <option value="Academic Coordinator">Academic Coordinator</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-medium">Status:</span>
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
        </div>

        {/* Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                  <th className="py-2.5 px-4 w-[110px]">Employee ID</th>
                  <th className="py-2.5 px-4">Employee Name</th>
                  <th className="py-2.5 px-4">Assignment Role</th>
                  <th className="py-2.5 px-4">Academic Area / Scope</th>
                  <th className="py-2.5 px-4 w-[100px]">Academic Year</th>
                  <th className="py-2.5 px-4 w-[100px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[var(--text-secondary)]">
                      No staff assignments found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                        {item.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {item.employeeName}
                        </div>
                        <div className="text-[11px] text-[var(--neutral-400)]">{item.designation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold",
                            item.role === "HOD"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : item.role === "Class Teacher"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}
                        >
                          {item.role === "HOD" && <Building2 className="h-3 w-3" />}
                          {item.role === "Class Teacher" && <GraduationCap className="h-3 w-3" />}
                          {item.role === "Subject Teacher" && <BookOpen className="h-3 w-3" />}
                          <span>{item.role}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {item.academicArea}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {item.academicYear}
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
                          className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>Showing {filteredAssignments.length} assignments</span>
            <span>
              1–{filteredAssignments.length} of {filteredAssignments.length}
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Assignment Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-lg rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)] shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Assignment" : "New Staff Assignment"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-[var(--neutral-400)] hover:text-[var(--neutral-700)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
              {/* Employee Selection */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  {availableEmployees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) — {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Assignment Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as AssignmentRole })
                    }
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="HOD">Head of Department (HOD)</option>
                    <option value="Class Teacher">Class Teacher</option>
                    <option value="Subject Teacher">Subject Teacher</option>
                    <option value="Academic Coordinator">Academic Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="2026–27">2026–27</option>
                    <option value="2025–26">2025–26</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Scope Fields */}
              {formData.role === "HOD" && (
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === "Class Teacher" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Class / Grade <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    >
                      {DEFAULT_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Section <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    >
                      {DEFAULT_SECTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.role === "Subject Teacher" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        Class / Grade <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                      >
                        {DEFAULT_CLASSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        Section <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                      >
                        {DEFAULT_SECTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    >
                      {DEFAULT_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })
                  }
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-sm rounded-lg border border-[var(--border-default)] shadow-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Assignment</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to remove the{" "}
              <strong className="text-[var(--text-primary)]">{deleteConfirmItem.role}</strong> assignment for{" "}
              <strong className="text-[var(--text-primary)]">{deleteConfirmItem.employeeName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteConfirmItem.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md cursor-pointer"
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
