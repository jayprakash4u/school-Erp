"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  X,
  ChevronRight,
  DollarSign,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  CreditCard,
  Pencil,
  FileText,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { cn } from "@/lib/utils";

export interface SalaryStructureItem {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  bankName: string;
  accountNumber: string;
  status: "Active" | "Inactive";
}

const DEFAULT_SALARY_STRUCTURES: SalaryStructureItem[] = [
  {
    id: "sal-1",
    employeeId: "EMP-001",
    employeeName: "Raj Sharma",
    designation: "Professor",
    department: "Computer Science",
    basicSalary: 65000,
    allowance: 8000,
    deduction: 4500,
    netSalary: 68500,
    bankName: "Global Bank",
    accountNumber: "98765432101",
    status: "Active",
  },
  {
    id: "sal-2",
    employeeId: "EMP-002",
    employeeName: "Sita Sharma",
    designation: "Teacher",
    department: "School General",
    basicSalary: 45000,
    allowance: 5000,
    deduction: 2000,
    netSalary: 48000,
    bankName: "National Commercial Bank",
    accountNumber: "12345678902",
    status: "Active",
  },
  {
    id: "sal-3",
    employeeId: "EMP-003",
    employeeName: "Hari Kumar",
    designation: "Accountant",
    department: "Accounts",
    basicSalary: 40000,
    allowance: 4000,
    deduction: 1800,
    netSalary: 42200,
    bankName: "Everest Bank",
    accountNumber: "45678912303",
    status: "Active",
  },
  {
    id: "sal-4",
    employeeId: "EMP-004",
    employeeName: "Ram Thapa",
    designation: "Lecturer",
    department: "Management",
    basicSalary: 52000,
    allowance: 6000,
    deduction: 3200,
    netSalary: 54800,
    bankName: "Nabil Bank",
    accountNumber: "78912345604",
    status: "Active",
  },
];

const PAYROLL_HISTORY_DATA = [
  { month: "September 2026", staffCount: 4, totalBasic: "NPR 202,000", totalNet: "NPR 213,500", date: "30 Sep 2026", status: "Disbursed" },
  { month: "August 2026", staffCount: 4, totalBasic: "NPR 202,000", totalNet: "NPR 213,500", date: "31 Aug 2026", status: "Disbursed" },
  { month: "July 2026", staffCount: 4, totalBasic: "NPR 195,000", totalNet: "NPR 205,000", date: "31 Jul 2026", status: "Disbursed" },
];

export default function PayrollPage() {
  const [activeTab, setActiveTab] = React.useState<"structures" | "process" | "payslips" | "history">("structures");
  const [structures, setStructures] = React.useState<SalaryStructureItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);
  const [editingItem, setEditingItem] = React.useState<SalaryStructureItem | null>(null);

  // Selected payslip view
  const [selectedPayslipEmp, setSelectedPayslipEmp] = React.useState<string>("EMP-001");
  const [processSuccess, setProcessSuccess] = React.useState<boolean>(false);

  // Form state
  const [formData, setFormData] = React.useState<{
    employeeId: string;
    basicSalary: number;
    allowance: number;
    deduction: number;
    bankName: string;
    accountNumber: string;
    status: "Active" | "Inactive";
  }>({
    employeeId: "",
    basicSalary: 45000,
    allowance: 5000,
    deduction: 2000,
    bankName: "Global Bank",
    accountNumber: "",
    status: "Active",
  });

  const [availableEmployees, setAvailableEmployees] = React.useState<
    { id: string; name: string; employeeId: string; designation: string; department?: string }[]
  >([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("erp_staff_payroll_structures_v1");
    if (saved) {
      try {
        setStructures(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setStructures(DEFAULT_SALARY_STRUCTURES);
      }
    } else {
      setStructures(DEFAULT_SALARY_STRUCTURES);
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

  const saveStructures = (items: SalaryStructureItem[]) => {
    setStructures(items);
    localStorage.setItem("erp_staff_payroll_structures_v1", JSON.stringify(items));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaultEmp = availableEmployees[0]?.employeeId || "EMP-001";
    setFormData({
      employeeId: defaultEmp,
      basicSalary: 45000,
      allowance: 5000,
      deduction: 2000,
      bankName: "Global Bank",
      accountNumber: "98765432100",
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: SalaryStructureItem) => {
    setEditingItem(item);
    setFormData({
      employeeId: item.employeeId,
      basicSalary: item.basicSalary,
      allowance: item.allowance,
      deduction: item.deduction,
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEmp = availableEmployees.find((e) => e.employeeId === formData.employeeId);
    const empName = selectedEmp?.name || "Staff Member";
    const desig = selectedEmp?.designation || "Faculty";
    const dept = selectedEmp?.department || "General";
    const net = Number(formData.basicSalary) + Number(formData.allowance) - Number(formData.deduction);

    if (editingItem) {
      const updated = structures.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              employeeId: formData.employeeId,
              employeeName: empName,
              designation: desig,
              department: dept,
              basicSalary: Number(formData.basicSalary),
              allowance: Number(formData.allowance),
              deduction: Number(formData.deduction),
              netSalary: net,
              bankName: formData.bankName,
              accountNumber: formData.accountNumber,
              status: formData.status,
            }
          : s
      );
      saveStructures(updated);
    } else {
      const newItem: SalaryStructureItem = {
        id: `sal-${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: empName,
        designation: desig,
        department: dept,
        basicSalary: Number(formData.basicSalary),
        allowance: Number(formData.allowance),
        deduction: Number(formData.deduction),
        netSalary: net,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        status: formData.status,
      };
      saveStructures([...structures, newItem]);
    }
    setIsFormOpen(false);
  };

  const handleRunPayrollBatch = () => {
    setProcessSuccess(true);
    setTimeout(() => setProcessSuccess(false), 4000);
  };

  const selectedPayslipData = structures.find((s) => s.employeeId === selectedPayslipEmp) || structures[0];

  const totalMonthlyPayout = structures.reduce((acc, curr) => acc + curr.netSalary, 0);

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
          <span className="text-[var(--text-primary)] font-semibold">Payroll</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Staff Payroll
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Salary structures, monthly disbursement processing, and payslip generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs inside page */}
            <div className="flex items-center bg-[var(--bg-primary)] p-0.5 rounded-lg border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setActiveTab("structures")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "structures"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Salary Structures
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("process")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "process"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Process Payroll
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("payslips")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "payslips"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Payslips
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
                Payroll History
              </button>
            </div>

            {activeTab === "structures" && (
              <button
                onClick={handleOpenAdd}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Structure</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Salary Structures */}
        {activeTab === "structures" && (
          <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-[var(--border-light)] flex items-center justify-between">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Active Employee Salary Profiles
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Total Monthly Payout: <strong className="text-[var(--brand-primary)] font-mono">NPR {totalMonthlyPayout.toLocaleString()}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4 w-[110px]">Employee ID</th>
                    <th className="py-2.5 px-4">Employee Name</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4 text-right">Basic Salary</th>
                    <th className="py-2.5 px-4 text-right">Allowances</th>
                    <th className="py-2.5 px-4 text-right">Deductions</th>
                    <th className="py-2.5 px-4 text-right">Net Salary</th>
                    <th className="py-2.5 px-4">Bank Details</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {structures.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[var(--neutral-700)]">
                        {item.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{item.employeeName}</div>
                        <div className="text-[11px] text-[var(--neutral-400)]">{item.designation}</div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{item.department}</td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--text-primary)]">
                        NPR {item.basicSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600">
                        + NPR {item.allowance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        - NPR {item.deduction.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--brand-primary)]">
                        NPR {item.netSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        <div>{item.bankName}</div>
                        <div className="text-[11px] font-mono text-[var(--neutral-400)]">{item.accountNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 text-xs text-[var(--brand-primary)] hover:bg-[var(--brand-primary-50)] rounded font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Process Payroll */}
        {activeTab === "process" && (
          <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-4 max-w-2xl mx-auto">
            <div className="pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Process Monthly Salary Batch</h3>
              <p className="text-xs text-[var(--text-secondary)]">Disburse monthly salaries to all active employees for current pay cycle.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Payroll Month</label>
                <select className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md">
                  <option>October 2026</option>
                  <option>September 2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Payment Mode</label>
                <select className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md">
                  <option>Direct Bank Transfer</option>
                  <option>Cheque Disbursement</option>
                  <option>Cash</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-light)] space-y-2 text-xs">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Eligible Active Staff:</span>
                <strong className="text-[var(--text-primary)]">{structures.length} Employees</strong>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Total Gross Salaries:</span>
                <strong className="text-[var(--text-primary)] font-mono">
                  NPR {(structures.reduce((a, b) => a + b.basicSalary + b.allowance, 0)).toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Total Deductions (PF/Tax):</span>
                <strong className="text-rose-600 font-mono">
                  - NPR {(structures.reduce((a, b) => a + b.deduction, 0)).toLocaleString()}
                </strong>
              </div>
              <div className="pt-2 border-t border-[var(--border-default)] flex justify-between font-bold text-sm text-[var(--text-primary)]">
                <span>Net Disbursement Amount:</span>
                <span className="text-[var(--brand-primary)] font-mono">NPR {totalMonthlyPayout.toLocaleString()}</span>
              </div>
            </div>

            {processSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Payroll for October 2026 has been successfully executed and payslips generated!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunPayrollBatch}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Confirm & Execute Salary Batch
            </button>
          </div>
        )}

        {/* Tab 3: Payslips */}
        {activeTab === "payslips" && (
          <div className="space-y-4">
            <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--text-primary)]">Select Employee:</span>
                <select
                  value={selectedPayslipEmp}
                  onChange={(e) => setSelectedPayslipEmp(e.target.value)}
                  className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-medium"
                >
                  {structures.map((s) => (
                    <option key={s.employeeId} value={s.employeeId}>
                      {s.employeeName} ({s.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--neutral-100)] border border-[var(--border-default)] rounded-md cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Payslip</span>
              </button>
            </div>

            {/* Printable Payslip Container */}
            {selectedPayslipData && (
              <div className="bg-white text-gray-900 p-8 rounded-lg border border-[var(--border-default)] shadow-sm max-w-2xl mx-auto space-y-6">
                <div className="text-center pb-4 border-b border-gray-200">
                  <h2 className="text-base font-bold uppercase tracking-wider text-gray-800">
                    Apex Educational Academy
                  </h2>
                  <p className="text-xs text-gray-500">Kathmandu, Nepal • Monthly Salary Payslip</p>
                  <div className="mt-1 text-xs font-semibold text-[var(--brand-primary)]">
                    Pay Period: October 2026
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-500">Employee Name:</div>
                    <div className="font-bold">{selectedPayslipData.employeeName}</div>
                    <div className="text-gray-500 mt-2">Designation:</div>
                    <div className="font-medium">{selectedPayslipData.designation}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Employee ID:</div>
                    <div className="font-mono font-bold">{selectedPayslipData.employeeId}</div>
                    <div className="text-gray-500 mt-2">Department:</div>
                    <div className="font-medium">{selectedPayslipData.department}</div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-md overflow-hidden text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                        <th className="py-2 px-4 text-left">Earnings</th>
                        <th className="py-2 px-4 text-right">Amount</th>
                        <th className="py-2 px-4 text-left border-l border-gray-200">Deductions</th>
                        <th className="py-2 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 px-4">Basic Salary</td>
                        <td className="py-2 px-4 text-right font-mono">
                          NPR {selectedPayslipData.basicSalary.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 border-l border-gray-200">Provident Fund & Tax</td>
                        <td className="py-2 px-4 text-right font-mono text-rose-600">
                          NPR {selectedPayslipData.deduction.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Allowances (HRA/Medical)</td>
                        <td className="py-2 px-4 text-right font-mono">
                          NPR {selectedPayslipData.allowance.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 border-l border-gray-200">—</td>
                        <td className="py-2 px-4 text-right font-mono">—</td>
                      </tr>
                      <tr className="bg-gray-50 font-bold border-t border-gray-200">
                        <td className="py-2.5 px-4">Gross Earnings</td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          NPR {(selectedPayslipData.basicSalary + selectedPayslipData.allowance).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 border-l border-gray-200">Total Deductions</td>
                        <td className="py-2.5 px-4 text-right font-mono text-rose-600">
                          NPR {selectedPayslipData.deduction.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Net Take-Home Salary:</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    NPR {selectedPayslipData.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === "history" && (
          <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-default)] shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Disbursed Payroll Records</h3>
              <p className="text-xs text-[var(--text-secondary)]">Historical record of all finalized monthly staff payrolls.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)] text-[var(--neutral-600)] font-semibold">
                    <th className="py-2.5 px-4">Pay Month</th>
                    <th className="py-2.5 px-4 text-center">Staff Count</th>
                    <th className="py-2.5 px-4 text-right">Total Basic</th>
                    <th className="py-2.5 px-4 text-right">Total Net Disbursed</th>
                    <th className="py-2.5 px-4">Disbursed Date</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {PAYROLL_HISTORY_DATA.map((h) => (
                    <tr key={h.month} className="hover:bg-[var(--neutral-50)]">
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{h.month}</td>
                      <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">{h.staffCount}</td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--text-secondary)]">{h.totalBasic}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--brand-primary)]">{h.totalNet}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">{h.date}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {h.status}
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

      {/* Salary Structure Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-0">
          <div className="bg-[var(--bg-primary)] w-full max-w-lg rounded-lg border border-[var(--border-default)] shadow-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--neutral-50)] shrink-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {editingItem ? "Edit Salary Structure" : "New Salary Structure"}
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Basic Salary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Allowances
                  </label>
                  <input
                    type="number"
                    value={formData.allowance}
                    onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Deductions (PF/Tax)
                  </label>
                  <input
                    type="number"
                    value={formData.deduction}
                    onChange={(e) => setFormData({ ...formData, deduction: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-light)] flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--text-primary)]">Net Monthly Salary:</span>
                <span className="font-bold font-mono text-[var(--brand-primary)]">
                  NPR {(Number(formData.basicSalary) + Number(formData.allowance) - Number(formData.deduction)).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md font-mono"
                  />
                </div>
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
                  Save Salary Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
