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
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export type EmployeeType = "Teaching Staff" | "Non-Teaching Staff" | "Administrative" | "Support";

export interface EmployeeItem {
  id: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  employeeType: EmployeeType;
  designation: string;
  department?: string; // Optional (e.g. for schools or unassigned)
  joiningDate: string;
  status: "Active" | "Inactive";
}

const DEFAULT_EMPLOYEES: EmployeeItem[] = [
  {
    id: "emp-1",
    employeeId: "EMP-001",
    firstName: "Raj",
    lastName: "Sharma",
    phone: "9841234567",
    email: "raj@email.com",
    employeeType: "Teaching Staff",
    designation: "Professor",
    department: "Computer Science",
    joiningDate: "2026-06-01",
    status: "Active",
  },
  {
    id: "emp-2",
    employeeId: "EMP-002",
    firstName: "Sita",
    lastName: "Sharma",
    phone: "9851098765",
    email: "sita.sharma@institution.edu",
    employeeType: "Teaching Staff",
    designation: "Teacher",
    department: "", // School setting: no department
    joiningDate: "2026-06-05",
    status: "Active",
  },
  {
    id: "emp-3",
    employeeId: "EMP-003",
    firstName: "Hari",
    lastName: "Kumar",
    phone: "9812345678",
    email: "hari.kumar@institution.edu",
    employeeType: "Non-Teaching Staff",
    designation: "Accountant",
    department: "Accounts",
    joiningDate: "2026-06-10",
    status: "Active",
  },
  {
    id: "emp-4",
    employeeId: "EMP-004",
    firstName: "Ram",
    lastName: "Thapa",
    phone: "9801122334",
    email: "ram.thapa@institution.edu",
    employeeType: "Teaching Staff",
    designation: "Lecturer",
    department: "Management",
    joiningDate: "2026-06-12",
    status: "Active",
  },
];

const DEFAULT_DESIGNATION_OPTIONS = [
  "Teacher",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Principal",
  "Vice Principal",
  "HOD",
  "Accountant",
  "Librarian",
  "Lab Assistant",
];

const DEFAULT_DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Management",
  "Science & Technology",
  "Mathematics",
  "Accounts",
  "Administration",
  "Library Services",
  "Transport & Logistics",
];

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("All");
  const [designationFilter, setDesignationFilter] = React.useState<string>("All");
  const [employeeTypeFilter, setEmployeeTypeFilter] = React.useState<string>("All");
  const [statusFilter, setStatusFilter] = React.useState<string>("Active");

  // Dynamic Options loaded from Master Setup
  const [availableDesignations, setAvailableDesignations] = React.useState<string[]>(
    DEFAULT_DESIGNATION_OPTIONS
  );
  const [availableDepartments, setAvailableDepartments] = React.useState<string[]>(
    DEFAULT_DEPARTMENT_OPTIONS
  );

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<EmployeeItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = React.useState<EmployeeItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<{
    employeeId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    employeeType: EmployeeType;
    designation: string;
    department: string;
    joiningDate: string;
    status: "Active" | "Inactive";
  }>({
    employeeId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    employeeType: "Teaching Staff",
    designation: "Teacher",
    department: "",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  const [formErrors, setFormErrors] = React.useState<{
    employeeId?: string;
    firstName?: string;
    phone?: string;
    employeeType?: string;
    designation?: string;
    joiningDate?: string;
  }>({});

  // Load data & synchronize with Master Setup options
  React.useEffect(() => {
    const saved = localStorage.getItem("erp_staff_employees_final_v1");
    if (saved) {
      try {
        setEmployees(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load employees from storage", e);
        setEmployees(DEFAULT_EMPLOYEES);
      }
    } else {
      setEmployees(DEFAULT_EMPLOYEES);
    }

    // Load designations from master setup if available
    const savedDesignations = localStorage.getItem("erp_master_designations_final_v1");
    if (savedDesignations) {
      try {
        const parsed = JSON.parse(savedDesignations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((d: { name: string }) => d.name);
          setAvailableDesignations(Array.from(new Set([...names, ...DEFAULT_DESIGNATION_OPTIONS])));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load departments from master setup if available
    const savedDepartments = localStorage.getItem("erp_master_departments_simple_v1");
    if (savedDepartments) {
      try {
        const parsed = JSON.parse(savedDepartments);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((d: { name: string }) => d.name);
          setAvailableDepartments(Array.from(new Set([...names, ...DEFAULT_DEPARTMENT_OPTIONS])));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveEmployees = (items: EmployeeItem[]) => {
    setEmployees(items);
    localStorage.setItem("erp_staff_employees_final_v1", JSON.stringify(items));
  };

  // Close actions dropdown on outside click
  React.useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

  // Auto-open Add modal if action=add is in URL query
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "add") {
        handleOpenAdd();
      }
    }
  }, [availableDesignations]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormErrors({});
    const nextIndex = employees.length + 1;
    const formattedId = `EMP-${String(nextIndex).padStart(3, "0")}`;

    setFormData({
      employeeId: formattedId,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      employeeType: "Teaching Staff",
      designation: availableDesignations[0] || "Teacher",
      department: "",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setEditingItem(emp);
    setFormErrors({});
    setFormData({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName || "",
      phone: emp.phone,
      email: emp.email || "",
      employeeType: emp.employeeType,
      designation: emp.designation,
      department: emp.department || "",
      joiningDate: emp.joiningDate,
      status: emp.status,
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = (emp: EmployeeItem) => {
    const nextStatus: "Active" | "Inactive" = emp.status === "Active" ? "Inactive" : "Active";
    const updated = employees.map((e) => (e.id === emp.id ? { ...e, status: nextStatus } : e));
    saveEmployees(updated);
  };

  const handleConfirmDelete = (id: string) => {
    const updated = employees.filter((e) => e.id !== id);
    saveEmployees(updated);
    setDeleteConfirmItem(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First Name is required";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    }
    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
    }
    if (!formData.employeeType) {
      errors.employeeType = "Employee Type is required";
    }
    if (!formData.designation) {
      errors.designation = "Designation is required";
    }
    if (!formData.joiningDate) {
      errors.joiningDate = "Joining Date is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      const updated = employees.map((emp) =>
        emp.id === editingItem.id
          ? {
              ...emp,
              employeeId: formData.employeeId.trim().toUpperCase(),
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim() || undefined,
              phone: formData.phone.trim(),
              email: formData.email.trim() || undefined,
              employeeType: formData.employeeType,
              designation: formData.designation,
              department: formData.department.trim() || undefined,
              joiningDate: formData.joiningDate,
              status: formData.status,
            }
          : emp
      );
      saveEmployees(updated);
    } else {
      const newItem: EmployeeItem = {
        id: `emp-${Date.now()}`,
        employeeId: formData.employeeId.trim().toUpperCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        employeeType: formData.employeeType,
        designation: formData.designation,
        department: formData.department.trim() || undefined,
        joiningDate: formData.joiningDate,
        status: formData.status,
      };
      saveEmployees([...employees, newItem]);
    }

    setIsFormOpen(false);
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Filtered dataset
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDepartment =
      departmentFilter === "All" ||
      (departmentFilter === "None" && !emp.department) ||
      emp.department === departmentFilter;

    const matchesDesignation =
      designationFilter === "All" || emp.designation === designationFilter;

    const matchesType =
      employeeTypeFilter === "All" || emp.employeeType === employeeTypeFilter;

    const matchesStatus = statusFilter === "All" || emp.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesDesignation && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* 1. Global ERP Top Header */}
      <ErpHeader />

      {/* 2. Global ERP 2-Row Top Navigation Menu */}
      <ErpTopNav activeModuleId="staff" />

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup / HR
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Employees</span>
        </div>

        {/* Page Title & Main Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Employees</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Manage teaching and non-teaching staff.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-2.5">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search by name, employee ID, phone..."
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

          {/* Filters Strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-light)]">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              >
                <option value="All">All Departments</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="None">— Unassigned / No Dept —</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-medium">Designation:</span>
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              >
                <option value="All">All Designations</option>
                {availableDesignations.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-medium">Employee Type:</span>
              <select
                value={employeeTypeFilter}
                onChange={(e) => setEmployeeTypeFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Teaching Staff">Teaching Staff</option>
                <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                <option value="Administrative">Administrative</option>
                <option value="Support">Support</option>
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

        {/* Employees Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                  <th className="py-2.5 px-4 w-[110px]">Employee ID</th>
                  <th className="py-2.5 px-4">Employee Name</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Designation</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 w-[130px]">Joining Date</th>
                  <th className="py-2.5 px-4 w-[100px]">Status</th>
                  <th className="py-2.5 px-4 w-[60px] text-right">•••</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[var(--text-secondary)]">
                      No employees found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                        {emp.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {emp.firstName} {emp.lastName || ""}
                        </div>
                        {emp.email && (
                          <div className="text-[11px] text-[var(--neutral-400)]">{emp.email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                        {emp.phone}
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        <div>{emp.designation}</div>
                        <div className="text-[11px] text-[var(--neutral-400)] font-normal">
                          {emp.employeeType}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {emp.department ? (
                          emp.department
                        ) : (
                          <span className="text-[var(--neutral-400)]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {formatDateDisplay(emp.joiningDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium",
                            emp.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              emp.status === "Active" ? "bg-emerald-500" : "bg-neutral-400"
                            )}
                          />
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === emp.id ? null : emp.id);
                          }}
                          className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Actions Menu Dropdown */}
                        {activeMenuId === emp.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 top-8 z-30 w-36 bg-[var(--bg-primary)] rounded-md border border-[var(--border-default)] shadow-lg py-1 text-xs text-left animate-in fade-in-50 zoom-in-95"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenEdit(emp);
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
                                handleToggleStatus(emp);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--neutral-100)] text-[var(--text-primary)] cursor-pointer"
                            >
                              <Power className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                              <span>{emp.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>

                            <div className="my-1 border-t border-[var(--border-light)]" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteConfirmItem(emp);
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

          {/* Table Footer Counter */}
          <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>Showing {filteredEmployees.length} employees</span>
            <span>
              1–{filteredEmployees.length} of {filteredEmployees.length}
            </span>
          </div>
        </div>
      </main>

      {/* Add / Edit Employee Modal — Exact Simple UI Specification */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-lg rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-start justify-between bg-[var(--neutral-50)] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItem ? "Edit Employee" : "Add Employee"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {editingItem
                    ? "Update employee record in your institution."
                    : "Add a new employee to your institution."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-[var(--neutral-400)] hover:text-[var(--neutral-700)] cursor-pointer p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-[var(--neutral-600)] uppercase tracking-wider border-b border-[var(--border-light)] pb-1">
                  Personal Information
                </div>

                {/* First Name * & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Raj"
                      className={cn(
                        "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                        formErrors.firstName ? "border-rose-400" : "border-[var(--border-default)]"
                      )}
                    />
                    {formErrors.firstName && (
                      <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Sharma"
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    />
                  </div>
                </div>

                {/* Phone * & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className={cn(
                        "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                        formErrors.phone ? "border-rose-400" : "border-[var(--border-default)]"
                      )}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="raj@email.com"
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: EMPLOYMENT INFORMATION */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold text-[var(--neutral-600)] uppercase tracking-wider border-b border-[var(--border-light)] pb-1">
                  Employment Information
                </div>

                {/* Employee ID * & Employee Type * */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Employee ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="EMP-001"
                      className={cn(
                        "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                        formErrors.employeeId ? "border-rose-400" : "border-[var(--border-default)]"
                      )}
                    />
                    {formErrors.employeeId && (
                      <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.employeeId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Employee Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.employeeType}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeType: e.target.value as EmployeeType })
                      }
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    >
                      <option value="Teaching Staff">Teaching Staff</option>
                      <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                {/* Designation * & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Designation <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    >
                      {availableDesignations.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                    >
                      <option value="">Select Department</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Joining Date * & Status * */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Joining Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className={cn(
                        "w-full px-3 py-1.5 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
                        formErrors.joiningDate ? "border-rose-400" : "border-[var(--border-default)]"
                      )}
                    />
                    {formErrors.joiningDate && (
                      <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.joiningDate}</p>
                    )}
                  </div>

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
                </div>
              </div>

              {/* Modal Action Buttons: Cancel and Save Employee */}
              <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3.5 py-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] rounded-md border border-[var(--border-default)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? "Save Changes" : "Save Employee"}
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
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Delete Employee Record</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete employee{" "}
              <strong className="text-[var(--text-primary)]">
                {deleteConfirmItem.firstName} {deleteConfirmItem.lastName || ""}
              </strong>{" "}
              ({deleteConfirmItem.employeeId})?
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

