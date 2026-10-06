"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  X,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { cn } from "@/lib/utils";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export type LeaveType = "Sick Leave" | "Casual Leave" | "Earned Leave" | "Maternity Leave" | "Bereavement";

export interface LeaveRequestItem {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: LeaveStatus;
}

const DEFAULT_LEAVE_REQUESTS: LeaveRequestItem[] = [
  {
    id: "leave-1",
    employeeId: "EMP-001",
    employeeName: "Raj Sharma",
    designation: "Professor",
    department: "Computer Science",
    leaveType: "Sick Leave",
    fromDate: "2026-10-08",
    toDate: "2026-10-09",
    days: 2,
    reason: "Severe viral fever and medical recovery.",
    appliedDate: "2026-10-05",
    status: "Pending",
  },
  {
    id: "leave-2",
    employeeId: "EMP-002",
    employeeName: "Sita Sharma",
    designation: "Teacher",
    department: "School General",
    leaveType: "Casual Leave",
    fromDate: "2026-10-12",
    toDate: "2026-10-12",
    days: 1,
    reason: "Attending personal family function.",
    appliedDate: "2026-10-04",
    status: "Approved",
  },
  {
    id: "leave-3",
    employeeId: "EMP-004",
    employeeName: "Ram Thapa",
    designation: "Lecturer",
    department: "Management",
    leaveType: "Earned Leave",
    fromDate: "2026-10-15",
    toDate: "2026-10-18",
    days: 4,
    reason: "Annual vacation and research symposium.",
    appliedDate: "2026-10-01",
    status: "Approved",
  },
];

const LEAVE_TYPE_ALLOWANCES = [
  { type: "Casual Leave", daysPerYear: 12, description: "For unplanned personal or emergency matters." },
  { type: "Sick Leave", daysPerYear: 12, description: "For illness and medical treatments with doctor certificate." },
  { type: "Earned Leave", daysPerYear: 18, description: "Annual accrued leave for academic staff." },
  { type: "Maternity Leave", daysPerYear: 90, description: "Statutory paid maternity benefit for female employees." },
  { type: "Bereavement", daysPerYear: 7, description: "Compassionate leave in event of family bereavement." },
];

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = React.useState<"requests" | "types" | "history">("requests");
  const [leaves, setLeaves] = React.useState<LeaveRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [typeFilter, setTypeFilter] = React.useState<string>("All");

  // Modal State
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<LeaveRequestItem | null>(null);
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Available staff list
  const [availableEmployees, setAvailableEmployees] = React.useState<
    { id: string; name: string; employeeId: string; designation: string; department?: string }[]
  >([]);

  // Form State
  const [formData, setFormData] = React.useState<{
    employeeId: string;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    reason: string;
    status: LeaveStatus;
  }>({
    employeeId: "",
    leaveType: "Casual Leave",
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    reason: "",
    status: "Pending",
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_staff_leaves_v1");
    if (saved) {
      try {
        setLeaves(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setLeaves(DEFAULT_LEAVE_REQUESTS);
      }
    } else {
      setLeaves(DEFAULT_LEAVE_REQUESTS);
    }

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
              department: emp.department || "General",
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setAvailableEmployees([
        { id: "emp-1", employeeId: "EMP-001", name: "Raj Sharma", designation: "Professor", department: "Computer Science" },
        { id: "emp-2", employeeId: "EMP-002", name: "Sita Sharma", designation: "Teacher", department: "School" },
        { id: "emp-3", employeeId: "EMP-003", name: "Hari Kumar", designation: "Accountant", department: "Accounts" },
        { id: "emp-4", employeeId: "EMP-004", name: "Ram Thapa", designation: "Lecturer", department: "Management" },
      ]);
    }
  }, []);

  const saveLeaves = (items: LeaveRequestItem[]) => {
    setLeaves(items);
    localStorage.setItem("erp_staff_leaves_v1", JSON.stringify(items));
  };

  const calculateDays = (from: string, to: string) => {
    if (!from || !to) return 1;
    const start = new Date(from);
    const end = new Date(to);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaultEmp = availableEmployees[0]?.employeeId || "EMP-001";
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      employeeId: defaultEmp,
      leaveType: "Casual Leave",
      fromDate: today,
      toDate: today,
      reason: "",
      status: "Pending",
    });
    setIsFormOpen(true);
  };

  const handleStatusUpdate = (id: string, newStatus: LeaveStatus) => {
    const updated = leaves.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
    saveLeaves(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEmp = availableEmployees.find((e) => e.employeeId === formData.employeeId);
    const empName = selectedEmp?.name || "Staff Member";
    const desig = selectedEmp?.designation || "Faculty";
    const dept = selectedEmp?.department || "General";
    const days = calculateDays(formData.fromDate, formData.toDate);

    if (editingItem) {
      const updated = leaves.map((l) =>
        l.id === editingItem.id
          ? {
              ...l,
              employeeId: formData.employeeId,
              employeeName: empName,
              designation: desig,
              department: dept,
              leaveType: formData.leaveType,
              fromDate: formData.fromDate,
              toDate: formData.toDate,
              days,
              reason: formData.reason,
              status: formData.status,
            }
          : l
      );
      saveLeaves(updated);
    } else {
      const newItem: LeaveRequestItem = {
        id: `leave-${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: empName,
        designation: desig,
        department: dept,
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        days,
        reason: formData.reason,
        appliedDate: new Date().toISOString().split("T")[0],
        status: formData.status,
      };
      saveLeaves([newItem, ...leaves]);
    }
    setIsFormOpen(false);
  };

  const filteredLeaves = leaves.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesType = typeFilter === "All" || item.leaveType === typeFilter;

    if (activeTab === "requests") {
      return matchesSearch && matchesStatus && matchesType;
    }
    if (activeTab === "history") {
      return matchesSearch && item.status !== "Pending" && matchesType;
    }
    return true;
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
          <span className="text-[var(--text-primary)] font-semibold">Leave Management</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Leave Management
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Review staff leave applications, approve requests, and configure leave types.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab strip inside page */}
            <div className="flex items-center bg-[var(--bg-primary)] p-0.5 rounded-lg border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "requests"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Leave Requests
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("types")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "types"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Leave Types
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "history"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Leave History
              </button>
            </div>

            <button
              onClick={handleOpenAdd}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Apply Leave</span>
            </button>
          </div>
        </div>

        {activeTab === "requests" || activeTab === "history" ? (
          <>
            {/* Filter Bar */}
            <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-2.5">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                <input
                  type="text"
                  placeholder="Search by employee, reason..."
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
                  <span className="font-medium">Leave Type:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
                  >
                    <option value="All">All Types</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Bereavement">Bereavement</option>
                  </select>
                </div>

                {activeTab === "requests" && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="font-medium">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="py-1 px-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Table */}
            <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                      <th className="py-2.5 px-4 w-[120px]">Employee ID</th>
                      <th className="py-2.5 px-4">Employee Name</th>
                      <th className="py-2.5 px-4">Leave Type</th>
                      <th className="py-2.5 px-4">From</th>
                      <th className="py-2.5 px-4">To</th>
                      <th className="py-2.5 px-4 text-center">Days</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4 w-[110px]">Status</th>
                      <th className="py-2.5 px-4 text-right w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-[var(--text-secondary)]">
                          No leave requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaves.map((item) => (
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
                          <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                            {item.leaveType}
                          </td>
                          <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">{item.fromDate}</td>
                          <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">{item.toDate}</td>
                          <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                            {item.days}
                          </td>
                          <td className="py-3 px-4 text-[var(--text-secondary)] max-w-xs truncate" title={item.reason}>
                            {item.reason}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium",
                                item.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.status === "Rejected"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  item.status === "Approved"
                                    ? "bg-emerald-500"
                                    : item.status === "Rejected"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                )}
                              />
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.status === "Pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(item.id, "Approved")}
                                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(item.id, "Rejected")}
                                  className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[var(--neutral-400)]">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] text-xs text-[var(--text-secondary)]">
                Showing {filteredLeaves.length} leave records
              </div>
            </div>
          </>
        ) : (
          /* Leave Types & Allowances View */
          <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Institutional Leave Policies & Quotas</h3>
              <p className="text-xs text-[var(--text-secondary)]">Configured leave entitlement rules for academic and non-academic staff.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4 w-[200px]">Leave Type</th>
                    <th className="py-2.5 px-4 text-center w-[140px]">Annual Allowance</th>
                    <th className="py-2.5 px-4">Policy Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {LEAVE_TYPE_ALLOWANCES.map((policy) => (
                    <tr key={policy.type} className="hover:bg-[var(--neutral-50)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{policy.type}</td>
                      <td className="py-3 px-4 text-center font-bold text-[var(--brand-primary)]">
                        {policy.daysPerYear} Days / year
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{policy.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Apply Leave Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-lg rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)] shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Apply Leave Request</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-[var(--neutral-400)] hover:text-[var(--neutral-700)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
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

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Bereavement">Bereavement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    To Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Reason for Leave <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide brief details regarding leave..."
                  className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                />
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
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
