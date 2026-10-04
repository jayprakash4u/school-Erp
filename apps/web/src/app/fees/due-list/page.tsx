"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Search,
  ChevronRight,
  ArrowLeft,
  Coins,
  DollarSign,
  CheckCircle2,
  Printer,
  Receipt,
  Plus,
  Building,
  CreditCard,
  Upload,
  FileText,
  Calendar,
  X,
  Filter,
  Eye,
  Check,
  Tag,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { StudentAccount, PaymentReceipt, PaymentMethod, FeeCharge } from "@/types/fees";
import {
  getStoredStudentAccounts,
  saveStoredStudentAccounts,
  getStoredReceipts,
  saveStoredReceipts,
  calculateStudentTotals,
  recordExternalBankPayment,
} from "@/lib/fees-data";

export default function FeeDuesAndAccountPage() {
  const router = useRouter();
  const [accounts, setAccounts] = React.useState<StudentAccount[]>([]);
  const [receipts, setReceipts] = React.useState<PaymentReceipt[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedClassFilter, setSelectedClassFilter] = React.useState<string>("All");
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);

  // "Add Payment" Modal State
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = React.useState<boolean>(false);
  const [paymentFormData, setPaymentFormData] = React.useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "Bank" as PaymentMethod,
    referenceNo: "",
    proofFileName: "",
    remarks: "",
  });
  const [paymentSuccessToast, setPaymentSuccessToast] = React.useState<string | null>(null);

  // Load from localStorage on mount
  React.useEffect(() => {
    const loadedAccounts = getStoredStudentAccounts();
    const loadedReceipts = getStoredReceipts();
    setAccounts(loadedAccounts);
    setReceipts(loadedReceipts);

    // Auto-select student if studentId is in URL query
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const qStudentId = urlParams.get("studentId");
      if (qStudentId && loadedAccounts.some((a) => a.studentId === qStudentId)) {
        setSelectedStudentId(qStudentId);
      }
    }
  }, []);

  const activeStudent = React.useMemo(() => {
    return accounts.find((a) => a.studentId === selectedStudentId) || null;
  }, [accounts, selectedStudentId]);

  // Student payments history
  const studentPaymentHistory = React.useMemo(() => {
    if (!activeStudent) return [];
    return receipts.filter((r) => r.studentId === activeStudent.studentId);
  }, [receipts, activeStudent]);

  // Directory filter
  const filteredAccounts = React.useMemo(() => {
    return accounts.filter((acc) => {
      const matchesClass =
        selectedClassFilter === "All" ||
        acc.classGrade.toLowerCase().includes(selectedClassFilter.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        acc.fullName.toLowerCase().includes(q) ||
        acc.studentId.toLowerCase().includes(q) ||
        acc.admissionNo.toLowerCase().includes(q) ||
        acc.guardianPhone.includes(q) ||
        acc.classGrade.toLowerCase().includes(q);

      return matchesClass && matchesSearch;
    });
  }, [accounts, selectedClassFilter, searchQuery]);

  // Handle "Add Payment" Submit (e.g. Bank Transfer verification)
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !paymentFormData.amount) return;

    const amt = Number(paymentFormData.amount) || 0;
    if (amt <= 0) return;

    const result = recordExternalBankPayment({
      studentId: activeStudent.studentId,
      amount: amt,
      date: paymentFormData.date,
      method: paymentFormData.method,
      referenceNo: paymentFormData.referenceNo.trim() || undefined,
      proofFileName: paymentFormData.proofFileName || undefined,
      remarks: paymentFormData.remarks.trim() || undefined,
      cashierName: "Accountant",
    });

    if (result) {
      setAccounts(result.updatedAccounts);
      setReceipts([result.newReceipt, ...receipts]);
      setIsAddPaymentModalOpen(false);

      setPaymentSuccessToast(
        `✓ Payment of NPR ${amt.toLocaleString()} recorded successfully for ${activeStudent.fullName}!`
      );
      setTimeout(() => setPaymentSuccessToast(null), 4000);

      // Reset form
      setPaymentFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        method: "Bank",
        referenceNo: "",
        proofFileName: "",
        remarks: "",
      });
    }
  };

  const studentTotals = activeStudent ? calculateStudentTotals(activeStudent) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Fee Dues & Student Account
          </span>
          {activeStudent && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-bold text-[var(--brand-primary)]">
                {activeStudent.fullName} ({activeStudent.studentId})
              </span>
            </>
          )}
        </div>

        {/* Success Alert Toast */}
        {paymentSuccessToast && (
          <div className="p-3.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in-0">
            <span>{paymentSuccessToast}</span>
            <button onClick={() => setPaymentSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* VIEW 1: SEARCH & DIRECTORY (When no student is selected) */}
        {!activeStudent && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs border border-amber-200">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[var(--text-primary)]">
                    Fee Dues & Student Fee Accounts
                  </h1>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Check outstanding balances, examine fee breakdowns, record external bank payments, and collect dues
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={ROUTES.FEES.COLLECTION}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Go to Collect Fee Counter</span>
                </Link>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, admission no. (e.g. STU-10245), or phone..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-neutral-400 focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <Filter className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Filter Class:</span>
                </div>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-[6px] border border-[var(--border-default)] bg-white text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="All">All Grades (Full School)</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 1">Grade 1</option>
                </select>
              </div>
            </div>

            {/* Student Accounts Table */}
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Student Fee Accounts ({filteredAccounts.length})
                  </h2>
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                  Click on student to view complete fee account
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold bg-neutral-50/50">
                      <th className="py-2.5 px-4">Student Name & ID</th>
                      <th className="py-2.5 px-4">Class & Section</th>
                      <th className="py-2.5 px-4">Guardian Contact</th>
                      <th className="py-2.5 px-4 text-right">Total Fee (NPR)</th>
                      <th className="py-2.5 px-4 text-right">Paid (NPR)</th>
                      <th className="py-2.5 px-4 text-right">Balance Due (NPR)</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                          No student accounts found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((acc) => {
                        const totals = calculateStudentTotals(acc);
                        return (
                          <tr
                            key={acc.studentId}
                            onClick={() => setSelectedStudentId(acc.studentId)}
                            className="hover:bg-[var(--neutral-50)]/70 transition-colors cursor-pointer group"
                          >
                            <td className="py-3 px-4">
                              <div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                                {acc.fullName}
                              </div>
                              <div className="text-[11px] font-mono text-[var(--text-tertiary)]">
                                {acc.studentId} · Adm: {acc.admissionNo}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[var(--text-secondary)] font-medium">
                              {acc.classGrade} - {acc.section} · Roll {acc.rollNo}
                            </td>
                            <td className="py-3 px-4 text-[var(--text-secondary)]">
                              <div>{acc.guardianName}</div>
                              <div className="text-[10px] font-mono text-neutral-400">{acc.guardianPhone}</div>
                            </td>
                            <td className="py-3 px-4 text-right text-[var(--text-secondary)]">
                              {totals.totalFees.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                              {totals.totalPaid.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-bold">
                              {totals.totalOutstanding > 0 ? (
                                <span className="text-rose-600 font-bold">
                                  {totals.totalOutstanding.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-medium">✓ Cleared</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudentId(acc.studentId);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[var(--bg-secondary)] hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] hover:text-white border border-[var(--border-default)] font-semibold text-xs transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View Account</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CENTRAL STUDENT FEE ACCOUNT (The One Place) */}
        {activeStudent && (
          <div className="space-y-6">
            {/* Student Profile Card & Action Bar */}
            <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedStudentId(null)}
                    className="p-1.5 rounded-[6px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--neutral-100)] hover:text-[var(--text-primary)] transition-colors"
                    title="Back to Directory"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold text-[var(--text-primary)]">
                        {activeStudent.fullName}
                      </h1>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] font-medium">
                        {activeStudent.studentId}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {activeStudent.classGrade} · {activeStudent.section} · Admission: {activeStudent.admissionNo} · Guardian: {activeStudent.guardianName} ({activeStudent.guardianPhone})
                    </p>
                  </div>
                </div>

                {/* The Two Main Buttons: [ Collect Fee ] [ Add Payment ] */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFormData({
                        amount: activeStudent ? studentTotals?.totalOutstanding.toString() || "" : "",
                        date: new Date().toISOString().split("T")[0],
                        method: "Bank",
                        referenceNo: "",
                        proofFileName: "",
                        remarks: "",
                      });
                      setIsAddPaymentModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Building className="h-3.5 w-3.5" />
                    <span>Add Payment</span>
                  </button>

                  <Link
                    href={`/fees/collection?studentId=${activeStudent.studentId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Collect Fee</span>
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-[6px] border border-[var(--border-default)] text-neutral-500 hover:bg-neutral-50"
                    title="Print Statement"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 3-Pillar Financial Summary: Total Fee | Paid | Balance */}
              {studentTotals && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-[6px] bg-neutral-50 border border-[var(--border-default)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                        Total Fee
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        Rs. {studentTotals.totalFees.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                      <Coins className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="p-4 rounded-[6px] bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Paid
                      </span>
                      <span className="text-lg font-bold text-emerald-700">
                        Rs. {studentTotals.totalPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="p-4 rounded-[6px] bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                        Balance
                      </span>
                      <span className="text-lg font-bold text-rose-700">
                        Rs. {studentTotals.totalOutstanding.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Fee Details Table */}
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Fee Details
                  </h2>
                </div>
                {studentTotals && (
                  <span className="text-xs font-bold text-neutral-700">
                    Net Outstanding Balance:{" "}
                    <span className="text-rose-600">
                      Rs. {studentTotals.totalOutstanding.toLocaleString()}
                    </span>
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold bg-neutral-50/50">
                      <th className="py-2.5 px-4">Fee Head</th>
                      <th className="py-2.5 px-4 text-right">Amount (Rs.)</th>
                      <th className="py-2.5 px-4 text-right">Paid (Rs.)</th>
                      <th className="py-2.5 px-4 text-right">Balance (Rs.)</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {activeStudent.charges.map((charge) => {
                      const isPaid = charge.remainingAmount === 0;
                      return (
                        <tr key={charge.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-[var(--text-primary)]">{charge.title}</span>
                            {charge.description && (
                              <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">
                                {charge.description}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-neutral-800 font-medium">
                            {charge.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                            {charge.paidAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            {charge.remainingAmount > 0 ? (
                              <span className="text-rose-700">{charge.remainingAmount.toLocaleString()}</span>
                            ) : (
                              <span className="text-neutral-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isPaid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Paid
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Due
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {studentTotals && (
                    <tfoot>
                      <tr className="border-t-2 border-neutral-300 font-bold bg-neutral-50 text-xs text-neutral-900">
                        <td className="py-3 px-4 uppercase font-bold">Total</td>
                        <td className="py-3 px-4 text-right font-bold">
                          {studentTotals.totalFees.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {studentTotals.totalPaid.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700">
                          {studentTotals.totalOutstanding.toLocaleString()}
                        </td>
                        <td className="py-3 px-4" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* 2. Payment History Table */}
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Payment History
                  </h2>
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                  {studentPaymentHistory.length} Recorded Payment(s)
                </span>
              </div>

              {studentPaymentHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
                  No payment records found for this student. Click &quot;Add Payment&quot; or &quot;Collect Fee&quot; to record a payment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold bg-neutral-50/50">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Amount Paid</th>
                        <th className="py-2.5 px-4">Payment Method</th>
                        <th className="py-2.5 px-4">Reference / Receipt No.</th>
                        <th className="py-2.5 px-4">Remarks / Note</th>
                        <th className="py-2.5 px-4">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {studentPaymentHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                          <td className="py-3 px-4 font-medium text-neutral-800">{rec.date}</td>
                          <td className="py-3 px-4 font-bold text-emerald-700">
                            Rs. {rec.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-neutral-700">
                              {rec.paymentMethod === "Bank" ? "Bank Transfer" : rec.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-neutral-700">
                            {rec.transactionRef || rec.receiptNo}
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {rec.remarks || "—"}
                          </td>
                          <td className="py-3 px-4 text-neutral-500">{rec.cashierName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: "Add Payment" (Record External / Bank Payment) */}
        {isAddPaymentModalOpen && activeStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
            <div className="bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-98 duration-150">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Add Payment
                  </h3>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Record bank transfer, direct deposit, or external payment for {activeStudent.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddPaymentSubmit} className="p-5 space-y-4 text-xs">
                {/* Payment Amount */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                    Payment Amount (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentFormData.amount}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, amount: e.target.value })
                    }
                    placeholder="e.g. 20000"
                    className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] text-sm font-bold text-emerald-700 focus:outline-none focus:border-[var(--brand-primary)]"
                    autoFocus
                  />
                </div>

                {/* Payment Date & Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={paymentFormData.date}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, date: e.target.value })
                      }
                      className="w-full h-8 px-2.5 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Payment Method</label>
                    <select
                      value={paymentFormData.method}
                      onChange={(e) =>
                        setPaymentFormData({
                          ...paymentFormData,
                          method: e.target.value as PaymentMethod,
                        })
                      }
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs font-medium"
                    >
                      <option value="Bank">Bank Transfer / Direct Deposit</option>
                      <option value="Online">eSewa / Khalti / ConnectIPS</option>
                      <option value="Card">POS Card</option>
                      <option value="Cash">Cash (Counter/Voucher)</option>
                    </select>
                  </div>
                </div>

                {/* Reference No */}
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Reference No. / Bank Voucher Code
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.referenceNo}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, referenceNo: e.target.value })
                    }
                    placeholder="e.g. NBL123456 or Voucher #84920"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs font-mono"
                  />
                </div>

                {/* Payment Proof Upload & Remarks */}
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Payment Proof / Slip Note (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={paymentFormData.remarks}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, remarks: e.target.value })
                      }
                      placeholder="e.g. Bank statement verified on 02 Oct"
                      className="flex-1 h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs"
                    />
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] border border-[var(--border-default)] bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-700 cursor-pointer">
                      <Upload className="h-3 w-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPaymentFormData({
                              ...paymentFormData,
                              proofFileName: e.target.files[0].name,
                              remarks: paymentFormData.remarks || `Attached: ${e.target.files[0].name}`,
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {paymentFormData.proofFileName && (
                    <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                      ✓ File attached: {paymentFormData.proofFileName}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPaymentModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-[6px] border border-[var(--border-default)] text-neutral-600 hover:bg-neutral-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
