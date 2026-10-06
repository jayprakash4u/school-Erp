"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  CalendarCheck,
  Calendar,
  DollarSign,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { cn } from "@/lib/utils";

export default function StaffReportsPage() {
  const [activeReportTab, setActiveReportTab] = React.useState<
    "employees" | "attendance" | "leaves" | "payroll"
  >("employees");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Sample data states
  const [employees, setEmployees] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_staff_employees_final_v1");
    if (saved) {
      try {
        setEmployees(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setEmployees([
        { id: "emp-1", employeeId: "EMP-001", firstName: "Raj", lastName: "Sharma", designation: "Professor", department: "Computer Science", employeeType: "Teaching Staff", phone: "9841234567", status: "Active", joiningDate: "2026-06-01" },
        { id: "emp-2", employeeId: "EMP-002", firstName: "Sita", lastName: "Sharma", designation: "Teacher", department: "School General", employeeType: "Teaching Staff", phone: "9851098765", status: "Active", joiningDate: "2026-06-05" },
        { id: "emp-3", employeeId: "EMP-003", firstName: "Hari", lastName: "Kumar", designation: "Accountant", department: "Accounts", employeeType: "Non-Teaching Staff", phone: "9812345678", status: "Active", joiningDate: "2026-06-10" },
        { id: "emp-4", employeeId: "EMP-004", firstName: "Ram", lastName: "Thapa", designation: "Lecturer", department: "Management", employeeType: "Teaching Staff", phone: "9801122334", status: "Active", joiningDate: "2026-06-12" },
      ]);
    }
  }, []);

  const handleExportCSV = () => {
    window.alert("Exporting report dataset to CSV file...");
  };

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
          <span className="text-[var(--text-primary)] font-semibold">Reports</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              HR & Staff Reports
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Workforce analytics, attendance summaries, leave registers, and payroll reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--neutral-100)] border border-[var(--border-default)] rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--neutral-100)] border border-[var(--border-default)] rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Report Category Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveReportTab("employees")}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              activeReportTab === "employees"
                ? "bg-[var(--bg-primary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)] shadow-xs"
                : "bg-[var(--bg-primary)] border-[var(--border-default)] hover:border-[var(--neutral-400)]"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Employee Reports</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Roster & department directory
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab("attendance")}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              activeReportTab === "attendance"
                ? "bg-[var(--bg-primary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)] shadow-xs"
                : "bg-[var(--bg-primary)] border-[var(--border-default)] hover:border-[var(--neutral-400)]"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Attendance Reports</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Monthly register & defaulters
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab("leaves")}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              activeReportTab === "leaves"
                ? "bg-[var(--bg-primary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)] shadow-xs"
                : "bg-[var(--bg-primary)] border-[var(--border-default)] hover:border-[var(--neutral-400)]"
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Leave Reports</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Leave balance & logs
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab("payroll")}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              activeReportTab === "payroll"
                ? "bg-[var(--bg-primary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)] shadow-xs"
                : "bg-[var(--bg-primary)] border-[var(--border-default)] hover:border-[var(--neutral-400)]"
            )}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Payroll Reports</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Salary register & expense
            </p>
          </button>
        </div>

        {/* Report Content Table */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-hidden">
          {/* Header of table */}
          <div className="p-3.5 border-b border-[var(--border-light)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                {activeReportTab === "employees" && "Staff Master Directory"}
                {activeReportTab === "attendance" && "Monthly Staff Attendance Summary"}
                {activeReportTab === "leaves" && "Annual Staff Leave Balance Register"}
                {activeReportTab === "payroll" && "Institutional Salary Expenditure Statement"}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">Generated for Academic Session 2026–27</p>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <input
                type="text"
                placeholder="Search report records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeReportTab === "employees" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4 w-[110px]">Employee ID</th>
                    <th className="py-2.5 px-4">Employee Name</th>
                    <th className="py-2.5 px-4">Designation</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Employee Type</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4 w-[110px]">Joining Date</th>
                    <th className="py-2.5 px-4 w-[90px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[var(--neutral-50)]">
                      <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                        {emp.employeeId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {emp.firstName} {emp.lastName || ""}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)]">{emp.designation}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{emp.department || "—"}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{emp.employeeType}</td>
                      <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{emp.phone}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{emp.joiningDate}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === "attendance" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4">Employee Name</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4 text-center">Working Days</th>
                    <th className="py-2.5 px-4 text-center">Days Present</th>
                    <th className="py-2.5 px-4 text-center">Days Absent</th>
                    <th className="py-2.5 px-4 text-center">Late Days</th>
                    <th className="py-2.5 px-4 text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[var(--neutral-50)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {emp.firstName} {emp.lastName || ""}
                        <div className="text-[11px] font-mono text-[var(--neutral-400)]">{emp.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{emp.department || "General"}</td>
                      <td className="py-3 px-4 text-center font-mono">24</td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">23</td>
                      <td className="py-3 px-4 text-center font-mono text-rose-600 font-bold">1</td>
                      <td className="py-3 px-4 text-center font-mono text-amber-600">0</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--brand-primary)]">95.8%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === "leaves" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4">Employee</th>
                    <th className="py-2.5 px-4 text-center">Total Quota</th>
                    <th className="py-2.5 px-4 text-center">Casual Taken</th>
                    <th className="py-2.5 px-4 text-center">Sick Taken</th>
                    <th className="py-2.5 px-4 text-center">Earned Taken</th>
                    <th className="py-2.5 px-4 text-center">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[var(--neutral-50)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {emp.firstName} {emp.lastName || ""}
                        <div className="text-[11px] font-mono text-[var(--neutral-400)]">{emp.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">24 Days</td>
                      <td className="py-3 px-4 text-center font-mono text-amber-700">1 Day</td>
                      <td className="py-3 px-4 text-center font-mono text-amber-700">2 Days</td>
                      <td className="py-3 px-4 text-center font-mono text-amber-700">0 Days</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">21 Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReportTab === "payroll" && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4">Employee</th>
                    <th className="py-2.5 px-4">Designation</th>
                    <th className="py-2.5 px-4 text-right">Basic (Annual)</th>
                    <th className="py-2.5 px-4 text-right">Allowances</th>
                    <th className="py-2.5 px-4 text-right">Deductions</th>
                    <th className="py-2.5 px-4 text-right">Net Annual CTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[var(--neutral-50)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        {emp.firstName} {emp.lastName || ""}
                        <div className="text-[11px] font-mono text-[var(--neutral-400)]">{emp.employeeId}</div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{emp.designation}</td>
                      <td className="py-3 px-4 text-right font-mono">NPR 540,000</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600">+ NPR 60,000</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">- NPR 24,000</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--brand-primary)]">
                        NPR 576,000
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
