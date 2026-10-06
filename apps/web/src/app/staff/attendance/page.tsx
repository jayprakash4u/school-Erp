"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  CheckCheck,
  Building2,
  Download,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { cn } from "@/lib/utils";

export type AttendanceStatus = "Present" | "Late" | "Half Day" | "Absent" | "On Leave";

export interface StaffAttendanceRecord {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
}

const DEFAULT_ATTENDANCE_RECORDS: StaffAttendanceRecord[] = [
  {
    id: "att-1",
    employeeId: "EMP-001",
    name: "Raj Sharma",
    designation: "Professor",
    department: "Computer Science",
    status: "Present",
    checkIn: "08:50 AM",
    checkOut: "04:30 PM",
    remarks: "",
  },
  {
    id: "att-2",
    employeeId: "EMP-002",
    name: "Sita Sharma",
    designation: "Teacher",
    department: "School General",
    status: "Present",
    checkIn: "08:45 AM",
    checkOut: "03:45 PM",
    remarks: "",
  },
  {
    id: "att-3",
    employeeId: "EMP-003",
    name: "Hari Kumar",
    designation: "Accountant",
    department: "Accounts",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "05:00 PM",
    remarks: "",
  },
  {
    id: "att-4",
    employeeId: "EMP-004",
    name: "Ram Thapa",
    designation: "Lecturer",
    department: "Management",
    status: "Absent",
    checkIn: "",
    checkOut: "",
    remarks: "Informed sick leave",
  },
];

export default function StaffAttendancePage() {
  const [activeTab, setActiveTab] = React.useState<"daily" | "history">("daily");
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [records, setRecords] = React.useState<StaffAttendanceRecord[]>([]);
  const [savedSuccess, setSavedSuccess] = React.useState<boolean>(false);

  // Dynamic departments
  const [availableDepartments, setAvailableDepartments] = React.useState<string[]>([
    "Computer Science",
    "Management",
    "Accounts",
    "Science & Technology",
  ]);

  React.useEffect(() => {
    const saved = localStorage.getItem(`erp_staff_attendance_${selectedDate}`);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setRecords(DEFAULT_ATTENDANCE_RECORDS);
      }
    } else {
      // Initialize from employee master if present
      const savedStaff = localStorage.getItem("erp_staff_employees_final_v1");
      if (savedStaff) {
        try {
          const parsed = JSON.parse(savedStaff);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped: StaffAttendanceRecord[] = parsed.map(
              (emp: { id: string; employeeId: string; firstName: string; lastName?: string; designation: string; department?: string }) => ({
                id: `att-${emp.id}`,
                employeeId: emp.employeeId,
                name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
                designation: emp.designation,
                department: emp.department || "General",
                status: "Present",
                checkIn: "09:00 AM",
                checkOut: "04:30 PM",
                remarks: "",
              })
            );
            setRecords(mapped);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setRecords(DEFAULT_ATTENDANCE_RECORDS);
    }

    // Load master departments
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
    }
  }, [selectedDate]);

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status } : rec))
    );
    setSavedSuccess(false);
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, remarks } : rec))
    );
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((rec) => ({ ...rec, status })));
    setSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    localStorage.setItem(`erp_staff_attendance_${selectedDate}`, JSON.stringify(records));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Filtered
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "All" || rec.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const lateCount = records.filter((r) => r.status === "Late").length;
  const leaveCount = records.filter((r) => r.status === "On Leave" || r.status === "Half Day").length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <ErpHeader />
      <ErpTopNav activeModuleId="staff" />

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)] font-medium">
          <Link href="/staff" className="hover:text-[var(--brand-primary)] transition-colors">
            HR & Staff
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
          <span className="text-[var(--text-primary)] font-semibold">Staff Attendance</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Staff Attendance
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Track daily employee attendance and view historical logs.
            </p>
          </div>

          {/* Sub-Tabs inside Page */}
          <div className="flex items-center bg-[var(--bg-primary)] p-0.5 rounded-lg border border-[var(--border-default)]">
            <button
              type="button"
              onClick={() => setActiveTab("daily")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === "daily"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Daily Attendance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === "history"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Attendance History
            </button>
          </div>
        </div>

        {activeTab === "daily" ? (
          <>
            {/* Filter Bar & Date Selector */}
            <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      Date:
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      Department:
                    </span>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
                    >
                      <option value="All">All Departments</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleMarkAll("Present")}
                    className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll("Absent")}
                    className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Attendance Statistics Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-[var(--border-light)] text-xs">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span>Total Staff:</span>
                  <strong className="text-[var(--text-primary)]">{records.length}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Present:</span>
                  <strong>{presentCount}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Absent:</span>
                  <strong>{absentCount}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Late:</span>
                  <strong>{lateCount}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-purple-700">
                  <span>Leaves / Half Day:</span>
                  <strong>{leaveCount}</strong>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                      <th className="py-2.5 px-4 w-[110px]">Employee ID</th>
                      <th className="py-2.5 px-4">Employee Name</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4 w-[340px]">Status</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                          {item.employeeId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--text-primary)]">{item.name}</div>
                          <div className="text-[11px] text-[var(--neutral-400)]">{item.designation}</div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {item.department || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {(["Present", "Late", "Half Day", "Absent"] as AttendanceStatus[]).map(
                              (st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(item.id, st)}
                                  className={cn(
                                    "px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer",
                                    item.status === st
                                      ? st === "Present"
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : st === "Absent"
                                        ? "bg-rose-600 text-white shadow-2xs"
                                        : st === "Late"
                                        ? "bg-amber-600 text-white shadow-2xs"
                                        : "bg-blue-600 text-white shadow-2xs"
                                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--neutral-200)] border border-[var(--border-default)]"
                                  )}
                                >
                                  {st}
                                </button>
                              )
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.remarks || ""}
                            onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                            placeholder="Optional remark..."
                            className="w-full px-2.5 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save Footer Bar */}
              <div className="p-4 border-t border-[var(--border-default)] bg-[var(--neutral-50)] flex items-center justify-between">
                <div className="text-xs text-[var(--text-secondary)]">
                  {savedSuccess ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                      <CheckCheck className="h-4 w-4" /> Attendance saved successfully!
                    </span>
                  ) : (
                    <span>Review daily entries before saving to system.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Attendance History View */
          <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-light)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Monthly Attendance Matrix</h3>
                <p className="text-xs text-[var(--text-secondary)]">Overview of staff attendance for October 2026</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--neutral-100)] border border-[var(--border-default)] rounded-md transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Log (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4 w-[120px]">Employee</th>
                    <th className="py-2.5 px-4">Role / Dept</th>
                    <th className="py-2.5 px-4 text-center">Working Days</th>
                    <th className="py-2.5 px-4 text-center">Present</th>
                    <th className="py-2.5 px-4 text-center">Absent</th>
                    <th className="py-2.5 px-4 text-center">Attendance %</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {rec.name}
                        <div className="text-[11px] font-mono text-[var(--neutral-400)]">{rec.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {rec.designation} ({rec.department})
                      </td>
                      <td className="py-3 px-4 text-center font-mono">24</td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600 font-semibold">
                        {rec.status === "Absent" ? "21" : "23"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-rose-600 font-semibold">
                        {rec.status === "Absent" ? "3" : "1"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--text-primary)]">
                        {rec.status === "Absent" ? "87.5%" : "95.8%"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Regular
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
