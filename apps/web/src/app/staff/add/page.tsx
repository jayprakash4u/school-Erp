"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { EmployeeItem, EmployeeType } from "../page";

const DEFAULT_DESIGNATIONS = [
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

const DEFAULT_DEPARTMENTS = [
  "Computer Science",
  "Management",
  "Science & Technology",
  "Mathematics",
  "Accounts",
  "Administration",
  "Library Services",
  "Transport & Logistics",
];

export default function AddEmployeePage() {
  const router = useRouter();

  const [availableDesignations, setAvailableDesignations] =
    React.useState<string[]>(DEFAULT_DESIGNATIONS);
  const [availableDepartments, setAvailableDepartments] =
    React.useState<string[]>(DEFAULT_DEPARTMENTS);

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
    employeeId: "EMP-001",
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

  React.useEffect(() => {
    // Generate next employee ID from existing records
    const saved = localStorage.getItem("erp_staff_employees_final_v1");
    if (saved) {
      try {
        const parsed: EmployeeItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nextIndex = parsed.length + 1;
          const formattedId = `EMP-${String(nextIndex).padStart(3, "0")}`;
          setFormData((prev) => ({ ...prev, employeeId: formattedId }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load designations
    const savedDesignations = localStorage.getItem("erp_master_designations_final_v1");
    if (savedDesignations) {
      try {
        const parsed = JSON.parse(savedDesignations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((d: { name: string }) => d.name);
          setAvailableDesignations(Array.from(new Set([...names, ...DEFAULT_DESIGNATIONS])));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load departments
    const savedDepartments = localStorage.getItem("erp_master_departments_simple_v1");
    if (savedDepartments) {
      try {
        const parsed = JSON.parse(savedDepartments);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map((d: { name: string }) => d.name);
          setAvailableDepartments(Array.from(new Set([...names, ...DEFAULT_DEPARTMENTS])));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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

    const saved = localStorage.getItem("erp_staff_employees_final_v1");
    let currentEmployees: EmployeeItem[] = [];
    if (saved) {
      try {
        currentEmployees = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

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

    const updated = [...currentEmployees, newItem];
    localStorage.setItem("erp_staff_employees_final_v1", JSON.stringify(updated));

    router.push("/staff");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <ErpHeader />
      <ErpTopNav activeModuleId="staff" />

      <main className="flex-1 max-w-[760px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href="/staff" className="hover:text-[var(--brand-primary)] transition-colors">
            HR & Staff
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <Link href="/staff" className="hover:text-[var(--brand-primary)] transition-colors">
            Employees
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Add Employee</span>
        </div>

        {/* Back Link & Title */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Add Employee
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Add a new employee to your institution.
            </p>
          </div>
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Employees</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-hidden">
          <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-[var(--neutral-600)] uppercase tracking-wider border-b border-[var(--border-light)] pb-1">
                Personal Information
              </div>

              {/* First Name * & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      "w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
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
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  />
                </div>
              </div>

              {/* Phone * & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      "w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
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
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: EMPLOYMENT INFORMATION */}
            <div className="space-y-4 pt-2">
              <div className="text-[11px] font-bold text-[var(--neutral-600)] uppercase tracking-wider border-b border-[var(--border-light)] pb-1">
                Employment Information
              </div>

              {/* Employee ID * & Employee Type * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      "w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-md uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
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
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="Teaching Staff">Teaching Staff</option>
                    <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>

              {/* Designation * & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
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
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Joining Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 bg-[var(--bg-secondary)] border rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]",
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
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions: Cancel & Save */}
            <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <Link
                href="/staff"
                className="px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] rounded-md border border-[var(--border-default)] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Save Employee
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
