"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  Filter,
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

type PartyTab = "student" | "employee" | "supplier" | "other";

interface StudentLedgerRecord {
  id: string;
  date: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  particulars: string;
  voucherNo: string;
  charges: number;
  payments: number;
  discount: number;
  balance: number;
  status: "Paid" | "Partial" | "Overdue";
}

interface EmployeeLedgerRecord {
  id: string;
  date: string;
  employeeName: string;
  empId: string;
  department: string;
  particulars: string;
  voucherNo: string;
  salaryPayable: number;
  advances: number;
  paidAmount: number;
  balance: number;
  status: "Settled" | "Pending" | "Advance";
}

interface SupplierLedgerRecord {
  id: string;
  date: string;
  supplierName: string;
  invoiceNo: string;
  category: string;
  particulars: string;
  purchases: number;
  payments: number;
  adjustments: number;
  outstanding: number;
  status: "Paid" | "Unpaid" | "Partial";
}

export default function PartyLedgersPage() {
  const [activeTab, setActiveTab] = React.useState<PartyTab>("student");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedParty, setSelectedParty] = React.useState<string>("all");

  // Mock Student Ledgers
  const studentLedgers: StudentLedgerRecord[] = [
    {
      id: "ST-01",
      date: "2026-10-04",
      studentName: "Aarav Sharma",
      admissionNo: "ADM-2024-001",
      grade: "Grade 10-A",
      particulars: "Tuition Fee - Term 2",
      voucherNo: "REC-8921",
      charges: 45000,
      payments: 45000,
      discount: 0,
      balance: 0,
      status: "Paid",
    },
    {
      id: "ST-02",
      date: "2026-10-03",
      studentName: "Priya Patel",
      admissionNo: "ADM-2024-042",
      grade: "Grade 8-B",
      particulars: "Annual Development & Lab Fee",
      voucherNo: "INV-4412",
      charges: 28000,
      payments: 15000,
      discount: 3000,
      balance: 10000,
      status: "Partial",
    },
    {
      id: "ST-03",
      date: "2026-10-01",
      studentName: "Rohan Verma",
      admissionNo: "ADM-2023-119",
      grade: "Grade 12-Science",
      particulars: "Hostel & Transport Fee",
      voucherNo: "INV-4390",
      charges: 55000,
      payments: 0,
      discount: 0,
      balance: 55000,
      status: "Overdue",
    },
    {
      id: "ST-04",
      date: "2026-09-28",
      studentName: "Ananya Gupta",
      admissionNo: "ADM-2024-088",
      grade: "Grade 6-A",
      particulars: "Tuition Fee + Merit Scholarship Discount",
      voucherNo: "REC-8840",
      charges: 30000,
      payments: 24000,
      discount: 6000,
      balance: 0,
      status: "Paid",
    },
  ];

  // Mock Employee Ledgers
  const employeeLedgers: EmployeeLedgerRecord[] = [
    {
      id: "EMP-01",
      date: "2026-10-01",
      employeeName: "Dr. Rajesh K. Mishra",
      empId: "FAC-0104",
      department: "Mathematics",
      particulars: "Salary Payable - Sept 2026",
      voucherNo: "JV-SAL-09",
      salaryPayable: 65000,
      advances: 0,
      paidAmount: 65000,
      balance: 0,
      status: "Settled",
    },
    {
      id: "EMP-02",
      date: "2026-09-25",
      employeeName: "Sunita Rani",
      empId: "STF-0209",
      department: "Administration",
      particulars: "Festival Advance Recovery",
      voucherNo: "JV-ADV-44",
      salaryPayable: 35000,
      advances: 10000,
      paidAmount: 25000,
      balance: 0,
      status: "Settled",
    },
    {
      id: "EMP-03",
      date: "2026-10-01",
      employeeName: "Vikram Chauhan",
      empId: "TRN-0051",
      department: "Transport",
      particulars: "Overtime & Travel Reimbursement",
      voucherNo: "JV-REM-12",
      salaryPayable: 28000,
      advances: 0,
      paidAmount: 20000,
      balance: 8000,
      status: "Pending",
    },
  ];

  // Mock Supplier Ledgers
  const supplierLedgers: SupplierLedgerRecord[] = [
    {
      id: "SUP-01",
      date: "2026-10-02",
      supplierName: "Apex Stationery & Books Ltd.",
      invoiceNo: "INV-APX-9981",
      category: "Academic Books & Exam Papers",
      particulars: "Mid-Term Examination Answer Sheets",
      purchases: 125000,
      payments: 100000,
      adjustments: 0,
      outstanding: 25000,
      status: "Partial",
    },
    {
      id: "SUP-02",
      date: "2026-09-30",
      supplierName: "Metro Fuel & Lubricants",
      invoiceNo: "INV-MTR-4120",
      category: "School Bus Diesel",
      particulars: "September Fleet Diesel Supply",
      purchases: 84000,
      payments: 84000,
      adjustments: 0,
      outstanding: 0,
      status: "Paid",
    },
    {
      id: "SUP-03",
      date: "2026-09-28",
      supplierName: "TechnoWorld IT Solutions",
      invoiceNo: "INV-TECH-332",
      category: "Computer Lab Upgrades",
      particulars: "20x Core-i7 Desktop Systems",
      purchases: 450000,
      payments: 200000,
      adjustments: 5000,
      outstanding: 245000,
      status: "Partial",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--text-secondary)]">Accounts & Finance</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">Party Ledgers</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Party Ledgers
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Individual financial statements for students, employees, suppliers, and third parties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={() => alert("Exporting party statement to Excel...")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Module Integration Notice */}
        <div className="p-3.5 rounded-[8px] bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Subledger & Institutional Accounting Separation:</span>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Party Ledgers provide detailed individual balances (charges, payments, advances, discounts, and payables). All transactions automatically sync to the <strong>General Ledger</strong> for institutional double-entry financial reporting. Employee salary processing remains managed under HR & Staff/Payroll.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "student"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("employee")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "employee"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Employee Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("supplier")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "supplier"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Supplier Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("other")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "other"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Other Party Ledger</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder={
                activeTab === "student"
                  ? "Search by student name, admission no, grade..."
                  : activeTab === "employee"
                  ? "Search by employee name, ID, department..."
                  : "Search supplier name, invoice no..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[var(--border-default)] bg-white focus:outline-none focus:border-[var(--brand-primary)] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select className="px-3 py-2 text-xs rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-secondary)] shadow-xs">
              <option value="all">All Statuses</option>
              <option value="pending">Outstanding / Pending</option>
              <option value="settled">Fully Settled</option>
            </select>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs">
              <Filter className="h-3.5 w-3.5 text-neutral-400" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Student Ledger Content */}
        {activeTab === "student" && (
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Student Fee & Payment History Statements
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Showing 4 active student ledger entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-neutral-50/50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student & ID</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Particulars / Head</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3 text-right">Fee Charges</th>
                    <th className="py-2.5 px-3 text-right">Paid Amount</th>
                    <th className="py-2.5 px-3 text-right">Discount</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {studentLedgers.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--text-primary)]">{row.studentName}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{row.admissionNo}</div>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{row.grade}</td>
                      <td className="py-3 px-3 text-[var(--text-primary)] max-w-xs truncate">{row.particulars}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--brand-primary)]">{row.voucherNo}</td>
                      <td className="py-3 px-3 text-right font-medium">₹{row.charges.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">₹{row.payments.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-neutral-500">{row.discount > 0 ? `₹${row.discount.toLocaleString()}` : "-"}</td>
                      <td className={`py-3 px-3 text-right font-bold ${row.balance > 0 ? "text-red-600" : "text-neutral-700"}`}>
                        ₹{row.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : row.status === "Partial"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Employee Ledger Content */}
        {activeTab === "employee" && (
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Staff & Teacher Financial Accounts (Salary Payable, Advances & Recoveries)
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Showing 3 active employee ledger statements
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-neutral-50/50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Employee Name & ID</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Particulars / Journal</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3 text-right">Gross Salary / Claim</th>
                    <th className="py-2.5 px-3 text-right">Advance Recovery</th>
                    <th className="py-2.5 px-3 text-right">Disbursed</th>
                    <th className="py-2.5 px-3 text-right">Net Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {employeeLedgers.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--text-primary)]">{row.employeeName}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{row.empId}</div>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{row.department}</td>
                      <td className="py-3 px-3 text-[var(--text-primary)]">{row.particulars}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--brand-primary)]">{row.voucherNo}</td>
                      <td className="py-3 px-3 text-right font-medium">₹{row.salaryPayable.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-amber-600">{row.advances > 0 ? `₹${row.advances.toLocaleString()}` : "-"}</td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">₹{row.paidAmount.toLocaleString()}</td>
                      <td className={`py-3 px-3 text-right font-bold ${row.balance > 0 ? "text-amber-600" : "text-neutral-700"}`}>
                        ₹{row.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.status === "Settled"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Supplier Ledger Content */}
        {activeTab === "supplier" && (
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Vendors & Suppliers Ledger (Purchases, Bills, Payments & Outstanding Payables)
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Showing 3 supplier accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-neutral-50/50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Vendor / Supplier</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Particulars</th>
                    <th className="py-2.5 px-3 text-right">Bill Total</th>
                    <th className="py-2.5 px-3 text-right">Paid Amount</th>
                    <th className="py-2.5 px-3 text-right">Adjustments</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Payable</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {supplierLedgers.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">{row.date}</td>
                      <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">{row.supplierName}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--brand-primary)]">{row.invoiceNo}</td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{row.category}</td>
                      <td className="py-3 px-3 text-[var(--text-primary)]">{row.particulars}</td>
                      <td className="py-3 px-3 text-right font-medium">₹{row.purchases.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">₹{row.payments.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-neutral-500">{row.adjustments > 0 ? `₹${row.adjustments.toLocaleString()}` : "-"}</td>
                      <td className={`py-3 px-3 text-right font-bold ${row.outstanding > 0 ? "text-red-600" : "text-neutral-700"}`}>
                        ₹{row.outstanding.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Other Party Ledger */}
        {activeTab === "other" && (
          <div className="p-8 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Other Institutional Parties</h3>
            <p className="text-xs text-[var(--text-tertiary)] max-w-md mx-auto">
              Maintain individual ledgers for property tenants, canteen caterers, security contractors, and external service providers.
            </p>
            <button
              onClick={() => alert("Add New Party modal opens here")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] text-white shadow-xs hover:bg-[var(--brand-primary-hover,var(--brand-primary))] transition-colors"
            >
              <span>+ Add New Party Account</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
