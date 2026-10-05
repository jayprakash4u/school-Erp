"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  Plus,
  Search,
  ChevronRight,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  FileText,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  Upload,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

type ExpenseTab = "list" | "record" | "categories" | "pending" | "reports";

interface ExpenseItem {
  id: string;
  voucherNo: string;
  date: string;
  category: string;
  payee: string;
  particulars: string;
  paidVia: "Cash in Hand" | "SBI Main A/C" | "HDFC Ops A/C" | "Cheque";
  amount: number;
  status: "Approved & Posted" | "Pending Approval" | "Rejected";
}

interface CategoryBudget {
  name: string;
  code: string;
  monthlyBudget: number;
  spentThisMonth: number;
  accountHead: string;
}

export default function ExpenseManagementPage() {
  const [activeTab, setActiveTab] = React.useState<ExpenseTab>("list");
  const [searchQuery, setSearchQuery] = React.useState("");

  // New Expense Form State
  const [formCategory, setFormCategory] = React.useState("Electricity & Utilities");
  const [formPayee, setFormPayee] = React.useState("");
  const [formAmount, setFormAmount] = React.useState("");
  const [formPaymentMode, setFormPaymentMode] = React.useState("SBI Main A/C");
  const [formDate, setFormDate] = React.useState("2026-10-05");
  const [formNotes, setFormNotes] = React.useState("");
  const [formAutoPost, setFormAutoPost] = React.useState(true);

  // Mock Expenses
  const [expenses, setExpenses] = React.useState<ExpenseItem[]>([
    {
      id: "EXP-101",
      voucherNo: "PV-2026-091",
      date: "2026-10-04",
      category: "Electricity & Utilities",
      payee: "State Electricity Board",
      particulars: "Main Campus Monthly Power Bill (Sept 2026)",
      paidVia: "SBI Main A/C",
      amount: 48500,
      status: "Approved & Posted",
    },
    {
      id: "EXP-102",
      voucherNo: "PV-2026-092",
      date: "2026-10-03",
      category: "Transport Fuel",
      payee: "Metro Fuel & Lubricants",
      particulars: "Diesel Refill for 12 School Buses",
      paidVia: "HDFC Ops A/C",
      amount: 32400,
      status: "Approved & Posted",
    },
    {
      id: "EXP-103",
      voucherNo: "PV-2026-093",
      date: "2026-10-02",
      category: "Stationery & Printing",
      payee: "Apex Stationery Ltd.",
      particulars: "Mid-Term Exam Sheets & Printer Toners",
      paidVia: "Cash in Hand",
      amount: 14200,
      status: "Approved & Posted",
    },
    {
      id: "EXP-104",
      voucherNo: "PV-2026-094",
      date: "2026-10-01",
      category: "Repairs & Maintenance",
      payee: "Civil Tech Plumbing",
      particulars: "Auditorium Roof Waterproofing Repair",
      paidVia: "Cheque",
      amount: 65000,
      status: "Pending Approval",
    },
    {
      id: "EXP-105",
      voucherNo: "PV-2026-095",
      date: "2026-09-30",
      category: "Internet & Telecommunications",
      payee: "Airtel Enterprise Fiber",
      particulars: "Campus High-Speed Dedicated Leased Line",
      paidVia: "SBI Main A/C",
      amount: 18500,
      status: "Approved & Posted",
    },
  ]);

  // Categories & Budgets
  const categories: CategoryBudget[] = [
    { name: "Salary Expense", code: "5100", monthlyBudget: 1200000, spentThisMonth: 1145000, accountHead: "5100 - Staff Salaries" },
    { name: "Electricity & Utilities", code: "5200", monthlyBudget: 60000, spentThisMonth: 48500, accountHead: "5200 - Power & Water" },
    { name: "Transport Fuel & Maintenance", code: "5300", monthlyBudget: 90000, spentThisMonth: 62400, accountHead: "5300 - Vehicle Operations" },
    { name: "Stationery & Printing", code: "5400", monthlyBudget: 35000, spentThisMonth: 14200, accountHead: "5400 - Office Supplies" },
    { name: "Repairs & Maintenance", code: "5500", monthlyBudget: 80000, spentThisMonth: 65000, accountHead: "5500 - Building Maintenance" },
    { name: "Internet & Telecom", code: "5600", monthlyBudget: 25000, spentThisMonth: 18500, accountHead: "5600 - IT & Communication" },
    { name: "Lab Supplies & Equipment", code: "5700", monthlyBudget: 40000, spentThisMonth: 12000, accountHead: "5700 - Science & Tech Lab" },
  ];

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPayee || !formAmount) {
      alert("Please fill in the Payee and Amount fields.");
      return;
    }

    const newExpense: ExpenseItem = {
      id: `EXP-${Date.now().toString().slice(-3)}`,
      voucherNo: `PV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: formDate,
      category: formCategory,
      payee: formPayee,
      particulars: formNotes || `${formCategory} payment to ${formPayee}`,
      paidVia: formPaymentMode as any,
      amount: parseFloat(formAmount),
      status: formAutoPost ? "Approved & Posted" : "Pending Approval",
    };

    setExpenses([newExpense, ...expenses]);
    setActiveTab("list");
    setFormPayee("");
    setFormAmount("");
    setFormNotes("");
    alert(`Expense ${newExpense.voucherNo} recorded successfully! Posted to General Ledger.`);
  };

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

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
          <span className="font-semibold text-[var(--text-primary)]">Expense Management</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Expense Management
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Operational payment recording, budget limits, pending bills, and automated General Ledger posting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("record")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Total Expenses (This Month)
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-1">
              ₹{totalSpent.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Within allocated monthly budget
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Pending Approvals
            </div>
            <div className="text-xl font-bold text-amber-600 mt-1">₹65,000</div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">1 invoice awaiting authorization</div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Cash in Hand Payouts
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-1">₹14,200</div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">From petty cash drawer</div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Active Expense Heads
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)] mt-1">7 Heads</div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">Mapped to Chart of Accounts (5000s)</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "list"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Expense List</span>
          </button>

          <button
            onClick={() => setActiveTab("record")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "record"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "categories"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Expense Categories</span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "pending"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Pending Payments</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "reports"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Expense Reports</span>
          </button>
        </div>

        {/* Tab 1: Expense List */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by payee, voucher number, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[var(--border-default)] bg-white focus:outline-none focus:border-[var(--brand-primary)] shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => alert("Downloading Excel register...")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-neutral-50/50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Voucher #</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Payee / Vendor</th>
                      <th className="py-2.5 px-3">Particulars</th>
                      <th className="py-2.5 px-3">Paid Via</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">{exp.date}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-[var(--brand-primary)] font-semibold">{exp.voucherNo}</td>
                        <td className="py-3 px-3 font-medium text-[var(--text-primary)]">{exp.category}</td>
                        <td className="py-3 px-3 text-[var(--text-primary)]">{exp.payee}</td>
                        <td className="py-3 px-3 text-[var(--text-tertiary)] max-w-xs truncate">{exp.particulars}</td>
                        <td className="py-3 px-3 text-[var(--text-secondary)]">{exp.paidVia}</td>
                        <td className="py-3 px-3 text-right font-bold text-[var(--text-primary)]">₹{exp.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              exp.status === "Approved & Posted"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Record Expense Form */}
        {activeTab === "record" && (
          <div className="max-w-2xl rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Record Institutional Expense</h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Creates a payment voucher and automatically debits the expense head in the General Ledger.
              </p>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Expense Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Payee / Beneficiary Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. State Electricity Board, Apex Books"
                    value={formPayee}
                    onChange={(e) => setFormPayee(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Paid From (Credit Account) *</label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                  >
                    <option value="SBI Main A/C">SBI Main Operations A/C (1010)</option>
                    <option value="HDFC Ops A/C">HDFC Fee Collection A/C (1020)</option>
                    <option value="Cash in Hand">Cash in Hand / Cashier Drawer (1001)</option>
                    <option value="Cheque">Issued Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Bill / Invoice Attachment (Optional)</label>
                  <div className="flex items-center gap-2">
                    <input type="file" className="text-xs text-[var(--text-tertiary)]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Narration / Particulars</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of goods/services received..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-[6px] border border-[var(--border-default)] flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoPost"
                  checked={formAutoPost}
                  onChange={(e) => setFormAutoPost(e.target.checked)}
                  className="rounded text-[var(--brand-primary)]"
                />
                <label htmlFor="autoPost" className="text-[11px] text-[var(--text-primary)] font-medium cursor-pointer">
                  Auto-post debit entry to General Ledger ({formCategory}) and credit entry to selected Cash/Bank account immediately.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs"
                >
                  Save & Post Expense
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Categories & Budget */}
        {activeTab === "categories" && (
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="p-4 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Expense Heads & Monthly Budget Utilization
                </span>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Configured Chart of Accounts expense groups with allocated limits
                </p>
              </div>
              <button
                onClick={() => alert("Add Expense Category modal")}
                className="px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] text-white shadow-xs"
              >
                + New Category
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => {
                const percent = Math.min(100, Math.round((c.spentThisMonth / c.monthlyBudget) * 100));
                return (
                  <div key={c.code} className="p-4 rounded-[6px] border border-[var(--border-default)] bg-neutral-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{c.name}</h4>
                      <span className="text-[10px] font-mono text-neutral-400">Code: {c.code}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] font-mono">{c.accountHead}</div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-500">Spent: ₹{c.spentThisMonth.toLocaleString()}</span>
                        <span className="font-semibold text-neutral-700">Budget: ₹{c.monthlyBudget.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percent > 90 ? "bg-red-500" : percent > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-right text-neutral-400 mt-1">{percent}% used</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Pending Payments */}
        {activeTab === "pending" && (
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Pending Invoices Awaiting Payment Authorization</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-neutral-50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Bill / Ref #</th>
                    <th className="py-2 px-3">Payee</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  <tr>
                    <td className="py-3 px-3">2026-10-01</td>
                    <td className="py-3 px-3 font-mono text-[var(--brand-primary)]">PV-2026-094</td>
                    <td className="py-3 px-3 font-semibold">Civil Tech Plumbing</td>
                    <td className="py-3 px-3">Repairs & Maintenance</td>
                    <td className="py-3 px-3 text-right font-bold text-red-600">₹65,000</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => alert("Payment approved & posted to bank register!")}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                      >
                        Approve & Pay
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Expense Reports */}
        {activeTab === "reports" && (
          <div className="p-8 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs text-center space-y-3">
            <BarChart3 className="h-10 w-10 text-[var(--brand-primary)] mx-auto" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Expense Analytics & Financial Reports</h3>
            <p className="text-xs text-[var(--text-tertiary)] max-w-md mx-auto">
              View head-wise expenditure breakdowns, fiscal year variance reports, and category-wise audit logs in the Financial Reports hub.
            </p>
            <Link
              href={ROUTES.FEES.REPORTS}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] text-white shadow-xs"
            >
              <span>Go to Financial Reports Hub</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
