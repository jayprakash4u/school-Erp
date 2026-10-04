"use client";

import * as React from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  ArrowLeft,
  CheckCircle2,
  Printer,
  DollarSign,
  AlertCircle,
  Coins,
  CreditCard,
  Building,
  CheckSquare,
  Square,
  Plus,
  Tag,
  Clock,
  User,
  Calendar,
  Layers,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  StudentAccount,
  PaymentReceipt,
  FeeCharge,
  PaymentMethod,
  SettledFeeItem,
  FeeCategory,
} from "@/types/fees";
import {
  getStoredStudentAccounts,
  saveStoredStudentAccounts,
  getStoredReceipts,
  saveStoredReceipts,
  calculateStudentTotals,
} from "@/lib/fees-data";

export default function FeeCollectionPage() {
  const [accounts, setAccounts] = React.useState<StudentAccount[]>([]);
  const [receipts, setReceipts] = React.useState<PaymentReceipt[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);

  // Cashier payment state for selected student
  // Map of chargeId -> { selected: boolean, payingAmount: number }
  const [chargeSelections, setChargeSelections] = React.useState<
    Record<string, { selected: boolean; payingAmount: number }>
  >({});
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("Cash");
  const [transactionRef, setTransactionRef] = React.useState<string>("");
  const [remarks, setRemarks] = React.useState<string>("");

  // Modal / Receipt state
  const [completedReceipt, setCompletedReceipt] = React.useState<PaymentReceipt | null>(null);
  const [isAddChargeModalOpen, setIsAddChargeModalOpen] = React.useState<boolean>(false);

  // New charge form
  const [newChargeData, setNewChargeData] = React.useState({
    title: "",
    category: "Miscellaneous" as FeeCategory,
    description: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
  });

  // Load from localStorage on mount and check URL query params
  React.useEffect(() => {
    const loadedAccounts = getStoredStudentAccounts();
    setAccounts(loadedAccounts);
    setReceipts(getStoredReceipts());

    // Check URL parameters for preselected student
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const paramStudentId = urlParams.get("studentId");
      if (paramStudentId && loadedAccounts.some((a) => a.studentId === paramStudentId)) {
        setSelectedStudentId(paramStudentId);
      }
    }
  }, []);

  const activeStudent = React.useMemo(() => {
    return accounts.find((a) => a.studentId === selectedStudentId) || null;
  }, [accounts, selectedStudentId]);

  // When student is selected, reset charge selections
  React.useEffect(() => {
    if (activeStudent) {
      const initialMap: Record<string, { selected: boolean; payingAmount: number }> = {};
      activeStudent.charges.forEach((c) => {
        if (c.remainingAmount > 0) {
          // Unselected by default, paying amount defaulted to remaining amount
          initialMap[c.id] = {
            selected: false,
            payingAmount: c.remainingAmount,
          };
        }
      });
      setChargeSelections(initialMap);
      setPaymentMethod("Cash");
      setTransactionRef("");
      setRemarks("");
      setCompletedReceipt(null);
    }
  }, [activeStudent]);

  // Search filtered students
  const filteredStudents = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.studentId.toLowerCase().includes(q) ||
        a.admissionNo.toLowerCase().includes(q) ||
        a.guardianPhone.includes(q) ||
        a.classGrade.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  // Toggle charge selection
  const handleToggleCharge = (chargeId: string) => {
    setChargeSelections((prev) => {
      const current = prev[chargeId];
      if (!current) return prev;
      return {
        ...prev,
        [chargeId]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
  };

  // Update paying amount for a charge
  const handlePayingAmountChange = (chargeId: string, amountStr: string) => {
    const num = Math.max(0, Number(amountStr) || 0);
    setChargeSelections((prev) => {
      const current = prev[chargeId];
      if (!current) return prev;
      return {
        ...prev,
        [chargeId]: {
          ...current,
          selected: true, // auto select if cashier modifies amount
          payingAmount: num,
        },
      };
    });
  };

  // Shortcut: Select All Outstanding
  const handleSelectAllOutstanding = () => {
    if (!activeStudent) return;
    setChargeSelections((prev) => {
      const updated: Record<string, { selected: boolean; payingAmount: number }> = {};
      activeStudent.charges.forEach((c) => {
        if (c.remainingAmount > 0) {
          updated[c.id] = {
            selected: true,
            payingAmount: c.remainingAmount,
          };
        }
      });
      return updated;
    });
  };

  // Shortcut: Clear All
  const handleClearSelection = () => {
    if (!activeStudent) return;
    setChargeSelections((prev) => {
      const updated: Record<string, { selected: boolean; payingAmount: number }> = {};
      activeStudent.charges.forEach((c) => {
        if (c.remainingAmount > 0) {
          updated[c.id] = {
            selected: false,
            payingAmount: c.remainingAmount,
          };
        }
      });
      return updated;
    });
  };

  // Calculate selected total to collect
  const selectedItemsSummary = React.useMemo(() => {
    if (!activeStudent) return { items: [], totalToCollect: 0 };

    const list: { charge: FeeCharge; payingNow: number; newDue: number }[] = [];
    let total = 0;

    activeStudent.charges.forEach((c) => {
      const sel = chargeSelections[c.id];
      if (sel && sel.selected && sel.payingAmount > 0) {
        const paying = Math.min(sel.payingAmount, c.remainingAmount);
        const newDue = Math.max(0, c.remainingAmount - paying);
        list.push({
          charge: c,
          payingNow: paying,
          newDue,
        });
        total += paying;
      }
    });

    return { items: list, totalToCollect: total };
  }, [activeStudent, chargeSelections]);

  // Execute payment collection
  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || selectedItemsSummary.totalToCollect <= 0) return;

    const receiptNumber = `REC-${Date.now().toString().slice(-5)}`;
    const settledItems: SettledFeeItem[] = [];

    // Clone and update active student's charges
    const updatedCharges = activeStudent.charges.map((c) => {
      const sel = chargeSelections[c.id];
      if (sel && sel.selected && sel.payingAmount > 0) {
        const paying = Math.min(sel.payingAmount, c.remainingAmount);
        const previousDue = c.remainingAmount;
        const newRemaining = previousDue - paying;
        const newPaid = c.paidAmount + paying;

        settledItems.push({
          chargeId: c.id,
          chargeTitle: c.title,
          description: c.description,
          category: c.category,
          amountPaid: paying,
          previousDue,
          newRemaining,
        });

        return {
          ...c,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
        };
      }
      return c;
    });

    const updatedStudent: StudentAccount = {
      ...activeStudent,
      charges: updatedCharges,
    };

    const newReceipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNo: receiptNumber,
      studentId: activeStudent.studentId,
      studentName: activeStudent.fullName,
      admissionNo: activeStudent.admissionNo,
      classGrade: activeStudent.classGrade,
      section: activeStudent.section,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      totalAmount: selectedItemsSummary.totalToCollect,
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined,
      remarks: remarks.trim() || undefined,
      cashierName: "Admin Cashier",
      settledItems,
    };

    // Update state & persistence
    const updatedAccounts = accounts.map((acc) =>
      acc.studentId === activeStudent.studentId ? updatedStudent : acc
    );
    const updatedReceipts = [newReceipt, ...receipts];

    setAccounts(updatedAccounts);
    setReceipts(updatedReceipts);
    saveStoredStudentAccounts(updatedAccounts);
    saveStoredReceipts(updatedReceipts);

    setCompletedReceipt(newReceipt);
  };

  // Add new on-the-spot charge to student account
  const handleAddNewCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !newChargeData.title.trim() || !newChargeData.amount) return;

    const amt = Number(newChargeData.amount) || 0;
    const newCharge: FeeCharge = {
      id: `chg-${Date.now()}`,
      title: newChargeData.title.trim(),
      category: newChargeData.category,
      description: newChargeData.description.trim() || undefined,
      totalAmount: amt,
      paidAmount: 0,
      remainingAmount: amt,
      dueDate: newChargeData.dueDate,
      isMandatory: false,
    };

    const updatedCharges = [...activeStudent.charges, newCharge];
    const updatedStudent: StudentAccount = {
      ...activeStudent,
      charges: updatedCharges,
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.studentId === activeStudent.studentId ? updatedStudent : acc
    );

    setAccounts(updatedAccounts);
    saveStoredStudentAccounts(updatedAccounts);

    // Auto-select the newly added charge
    setChargeSelections((prev) => ({
      ...prev,
      [newCharge.id]: {
        selected: true,
        payingAmount: amt,
      },
    }));

    setIsAddChargeModalOpen(false);
    setNewChargeData({
      title: "",
      category: "Miscellaneous",
      description: "",
      amount: "",
      dueDate: new Date().toISOString().split("T")[0],
    });
  };

  const studentTotals = activeStudent ? calculateStudentTotals(activeStudent) : null;
  const outstandingCharges = activeStudent
    ? activeStudent.charges.filter((c) => c.remainingAmount > 0)
    : [];
  const paidCharges = activeStudent
    ? activeStudent.charges.filter((c) => c.remainingAmount === 0 && c.paidAmount > 0)
    : [];

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
            Fee Collection Counter
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

        {/* View Mode 1: Search & Landing Station (When no student is selected) */}
        {!activeStudent && (
          <div className="space-y-6">
            {/* Cashier Welcome & Search Card */}
            <div className="p-6 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[var(--text-primary)]">
                      Fee Collection Counter
                    </h1>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Search student to view outstanding charges, tuition dues, and collect payments
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[var(--text-tertiary)] font-medium block">
                    Cashier Terminal
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Counter Active
                  </span>
                </div>
              </div>

              {/* Large Instant Search Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Student Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student by name, admission no. (e.g. STU-10245), or phone..."
                    className="w-full h-11 pl-10 pr-4 text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Instant Search Results Dropdown / Panel */}
                {searchQuery.trim() !== "" && (
                  <div className="rounded-[6px] border border-[var(--brand-primary)]/40 bg-white shadow-lg overflow-hidden animate-in fade-in-0 duration-150">
                    <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-secondary)]">
                        Matching Students ({filteredStudents.length})
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        Click student to view fee overview
                      </span>
                    </div>

                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
                        No student found matching &quot;{searchQuery}&quot;. Try searching with student ID, name, or phone.
                      </div>
                    ) : (
                      <div className="divide-y divide-[var(--border-light)] max-h-80 overflow-y-auto">
                        {filteredStudents.map((stu) => {
                          const totals = calculateStudentTotals(stu);
                          return (
                            <div
                              key={stu.studentId}
                              onClick={() => {
                                setSelectedStudentId(stu.studentId);
                                setSearchQuery("");
                              }}
                              className="p-3.5 hover:bg-[var(--red-50)]/40 cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-[var(--neutral-100)] group-hover:bg-[var(--red-100)] text-[var(--brand-primary)] font-bold text-xs flex items-center justify-center transition-colors">
                                  {stu.fullName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                                    {stu.fullName}
                                    <span className="ml-2 text-[11px] font-mono text-[var(--text-tertiary)] font-normal">
                                      ({stu.studentId})
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[var(--text-tertiary)]">
                                    {stu.classGrade} - {stu.section} • Roll: {stu.rollNo} • Phone: {stu.guardianPhone}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">
                                  Outstanding Due
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-bold",
                                    totals.totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"
                                  )}
                                >
                                  NPR {totals.totalOutstanding.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Today's Collections Log */}
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Today&apos;s Collections Log
                  </h2>
                </div>
                <div className="text-xs font-semibold text-[var(--text-secondary)]">
                  Total Collected Today:{" "}
                  <span className="font-bold text-emerald-700">
                    NPR{" "}
                    {receipts
                      .reduce((sum, r) => sum + r.totalAmount, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold bg-neutral-50/50">
                      <th className="py-2.5 px-4">Receipt No.</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Amount Paid</th>
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">Time</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {receipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                          {rec.receiptNo}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedStudentId(rec.studentId)}
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:underline text-left"
                          >
                            {rec.studentName}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {rec.classGrade} - {rec.section}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          NPR {rec.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 font-medium text-[10px] text-neutral-700">
                            {rec.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-tertiary)]">{rec.time}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setCompletedReceipt(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-secondary)] hover:bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--border-default)] text-[11px] font-semibold transition-colors"
                            title="View Receipt"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Student Fee Overview & Collection Desk (When student is selected) */}
        {activeStudent && (
          <div className="space-y-6">
            {/* Top Navigation & Student Header */}
            <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedStudentId(null)}
                    className="p-1.5 rounded-[6px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--neutral-100)] hover:text-[var(--text-primary)] transition-colors"
                    title="Back to Search"
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddChargeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    <span>Add One-off / Misc Charge</span>
                  </button>
                </div>
              </div>

              {/* 3-Pillar KPI Banner: Total Charges, Total Paid, Outstanding Due */}
              {studentTotals && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-[6px] bg-neutral-50 border border-[var(--border-default)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                        Total Fees / Charges
                      </span>
                      <span className="text-base font-bold text-[var(--text-primary)]">
                        NPR {studentTotals.totalFees.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                      <Coins className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Total Paid Amount
                      </span>
                      <span className="text-base font-bold text-emerald-700">
                        NPR {studentTotals.totalPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                        Outstanding Due Balance
                      </span>
                      <span className="text-base font-bold text-rose-700">
                        NPR {studentTotals.totalOutstanding.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2-Column Collection Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Outstanding Charges Selection & Partial Payment Table */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Outstanding Fees &amp; Charges ({outstandingCharges.length})
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllOutstanding}
                        className="px-2.5 py-1 rounded-[4px] bg-white border border-[var(--border-default)] hover:border-[var(--brand-primary)] text-[11px] font-semibold text-[var(--brand-primary)] transition-colors cursor-pointer"
                      >
                        Select All Outstanding
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="px-2.5 py-1 rounded-[4px] bg-white border border-[var(--border-default)] hover:bg-neutral-50 text-[11px] font-medium text-neutral-600 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {outstandingCharges.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                      <h3 className="text-xs font-bold text-emerald-800">All Charges Cleared!</h3>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        This student has zero outstanding fees.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold bg-neutral-50/50">
                            <th className="py-2.5 px-3 text-center w-10">Pay</th>
                            <th className="py-2.5 px-4">Fee Head &amp; Particulars</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3 text-right">Total Charge</th>
                            <th className="py-2.5 px-3 text-right">Paid</th>
                            <th className="py-2.5 px-3 text-right">Remaining Due</th>
                            <th className="py-2.5 px-4 text-right w-36">Paying Now (NPR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-light)]">
                          {outstandingCharges.map((charge) => {
                            const sel = chargeSelections[charge.id] || {
                              selected: false,
                              payingAmount: charge.remainingAmount,
                            };
                            const isSelected = sel.selected;
                            const isPartial = isSelected && sel.payingAmount < charge.remainingAmount;
                            const remainingAfter = Math.max(0, charge.remainingAmount - (isSelected ? sel.payingAmount : 0));

                            return (
                              <tr
                                key={charge.id}
                                className={cn(
                                  "transition-colors",
                                  isSelected ? "bg-[var(--red-50)]/40" : "hover:bg-[var(--neutral-50)]/60"
                                )}
                              >
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleCharge(charge.id)}
                                    className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-0 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[var(--text-primary)]">
                                      {charge.title}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-medium text-neutral-600">
                                      {charge.category}
                                    </span>
                                  </div>
                                  {charge.description && (
                                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                                      {charge.description}
                                    </p>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                                  {charge.dueDate}
                                </td>
                                <td className="py-3 px-3 text-right text-[var(--text-secondary)]">
                                  {charge.totalAmount.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right text-emerald-600 font-medium">
                                  {charge.paidAmount.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-rose-700">
                                  NPR {charge.remainingAmount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="space-y-1">
                                    <input
                                      type="number"
                                      min={1}
                                      max={charge.remainingAmount}
                                      value={sel.payingAmount || ""}
                                      onChange={(e) => handlePayingAmountChange(charge.id, e.target.value)}
                                      disabled={!isSelected}
                                      placeholder={charge.remainingAmount.toString()}
                                      className={cn(
                                        "w-full h-7 px-2 text-right rounded border text-xs font-bold transition-all",
                                        isSelected
                                          ? "border-[var(--brand-primary)] bg-white text-[var(--brand-primary)]"
                                          : "border-[var(--border-default)] bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                      )}
                                    />
                                    {isSelected && (
                                      <div className="text-[10px] text-neutral-500 text-right">
                                        {remainingAfter === 0 ? (
                                          <span className="text-emerald-600 font-medium">Full Settle</span>
                                        ) : (
                                          <span>After: NPR {remainingAfter.toLocaleString()}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Fully Paid Charges Archive Collapsible (for reference) */}
                {paidCharges.length > 0 && (
                  <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
                      <span className="text-xs font-bold text-neutral-600">
                        Previously Fully Paid Charges ({paidCharges.length})
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold">✓ Settled</span>
                    </div>
                    <div className="mt-2 divide-y divide-[var(--border-light)] text-xs">
                      {paidCharges.map((pc) => (
                        <div key={pc.id} className="py-1.5 flex items-center justify-between text-neutral-600">
                          <div>
                            <span className="font-medium text-neutral-800">{pc.title}</span>
                            <span className="text-[10px] text-neutral-400 ml-2">({pc.category})</span>
                          </div>
                          <span className="font-medium text-emerald-700">
                            NPR {pc.paidAmount.toLocaleString()} Paid
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Payment Settlement Form */}
              <div className="space-y-4">
                <form
                  onSubmit={handleCollectPayment}
                  className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Payment Settlement
                    </h2>
                    <span className="text-[11px] font-semibold text-[var(--brand-primary)]">
                      {selectedItemsSummary.items.length} Selected
                    </span>
                  </div>

                  {/* Selected Items Breakdown List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                      Selected Fee Items
                    </span>

                    {selectedItemsSummary.items.length === 0 ? (
                      <div className="p-4 rounded-[6px] bg-[var(--bg-secondary)] text-center text-neutral-500 text-xs">
                        No charges selected yet. Check the boxes on the left to collect payment.
                      </div>
                    ) : (
                      <div className="p-3 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-1.5 max-h-48 overflow-y-auto">
                        {selectedItemsSummary.items.map((item) => (
                          <div key={item.charge.id} className="flex items-center justify-between text-xs">
                            <div className="truncate mr-2">
                              <span className="font-semibold text-neutral-800">
                                {item.charge.title}
                              </span>
                              {item.newDue > 0 && (
                                <span className="text-[10px] text-amber-600 ml-1">
                                  (Partial, Due: {item.newDue})
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-neutral-900 shrink-0">
                              NPR {item.payingNow.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total to Collect Highlight Banner */}
                  <div className="p-3.5 rounded-[6px] bg-neutral-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                        Amount to Collect
                      </span>
                      <span className="text-lg font-bold text-white">
                        NPR {selectedItemsSummary.totalToCollect.toLocaleString()}
                      </span>
                    </div>
                    <Receipt className="h-6 w-6 text-neutral-400" />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)] block">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Cash", "Bank", "Card", "Online"] as PaymentMethod[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMethod(mode)}
                          className={cn(
                            "py-2 px-3 rounded-[6px] border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                            paymentMethod === mode
                              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs"
                              : "bg-white border-[var(--border-default)] text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          {mode === "Cash" && <DollarSign className="h-3.5 w-3.5" />}
                          {mode === "Bank" && <Building className="h-3.5 w-3.5" />}
                          {mode === "Card" && <CreditCard className="h-3.5 w-3.5" />}
                          {mode === "Online" && <Coins className="h-3.5 w-3.5" />}
                          <span>{mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank Transfer Reference Details */}
                  {paymentMethod === "Bank" && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-[6px] space-y-2 animate-in fade-in-0 duration-150">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                        <Building className="h-3.5 w-3.5" />
                        <span>Bank Transfer / Statement Details</span>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-emerald-900 text-[11px]">
                          Bank Reference Number / Voucher No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. NBL123456 or Voucher #84920"
                          className="w-full h-8 px-2.5 rounded-[6px] border border-emerald-300 bg-white text-xs font-mono text-emerald-950 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                          autoFocus
                        />
                      </div>
                      <p className="text-[10px] text-emerald-700">
                        Enter bank statement reference or deposit voucher number presented by student.
                      </p>
                    </div>
                  )}

                  {/* Online Gateway Reference Details */}
                  {paymentMethod === "Online" && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-[6px] space-y-2 animate-in fade-in-0 duration-150">
                      <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px] uppercase tracking-wider">
                        <Coins className="h-3.5 w-3.5" />
                        <span>Digital Gateway Transaction Ref</span>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-blue-900 text-[11px]">
                          Transaction ID / eSewa / Khalti Ref <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. ESW-849204 or KHLTI-19283"
                          className="w-full h-8 px-2.5 rounded-[6px] border border-blue-300 bg-white text-xs font-mono text-blue-950 focus:outline-none focus:border-blue-600"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {/* Card / POS Reference Details */}
                  {paymentMethod === "Card" && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-[6px] space-y-2 animate-in fade-in-0 duration-150">
                      <div className="flex items-center gap-1.5 text-purple-800 font-bold text-[11px] uppercase tracking-wider">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>POS Card Transaction Code</span>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-purple-900 text-[11px]">
                          Approval Code / Card Slip Auth No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. AUTH-092841"
                          className="w-full h-8 px-2.5 rounded-[6px] border border-purple-300 bg-white text-xs font-mono text-purple-950 focus:outline-none focus:border-purple-600"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {/* Remarks Input */}
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">
                      Cashier Remarks / Receipt Notes
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Term fee payment received at counter"
                      className="w-full h-8 px-2.5 rounded-[6px] border border-[var(--border-default)] text-xs"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={selectedItemsSummary.totalToCollect <= 0}
                      className={cn(
                        "w-full py-2.5 rounded-[6px] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all",
                        selectedItemsSummary.totalToCollect > 0
                          ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] cursor-pointer"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      )}
                    >
                      <Receipt className="h-4 w-4" />
                      <span>
                        Collect NPR {selectedItemsSummary.totalToCollect.toLocaleString()}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(null)}
                      className="w-full py-2 rounded-[6px] border border-[var(--border-default)] hover:bg-neutral-50 text-neutral-600 text-xs font-medium transition-colors"
                    >
                      Cancel &amp; Return
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add One-Off / Miscellaneous Charge */}
        {isAddChargeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in-0">
            <div className="bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-98 duration-150">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Add Charge to Student Account
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddChargeModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddNewCharge} className="p-5 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Charge Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newChargeData.title}
                    onChange={(e) => setNewChargeData({ ...newChargeData, title: e.target.value })}
                    placeholder="e.g. ID Card Replacement, Lab Damage, Event Fee"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">Charge Category</label>
                    <select
                      value={newChargeData.category}
                      onChange={(e) => setNewChargeData({ ...newChargeData, category: e.target.value as any })}
                      className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                    >
                      <option value="Miscellaneous">Miscellaneous</option>
                      <option value="Fine">Fine / Damage Penalty</option>
                      <option value="Uniform">Uniform / Books</option>
                      <option value="Examination">Examination / Re-exam</option>
                      <option value="Transport">Transport Adjustment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[var(--text-secondary)]">
                      Amount (NPR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newChargeData.amount}
                      onChange={(e) => setNewChargeData({ ...newChargeData, amount: e.target.value })}
                      placeholder="500"
                      className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">
                    Reason / Description
                  </label>
                  <input
                    type="text"
                    value={newChargeData.description}
                    onChange={(e) => setNewChargeData({ ...newChargeData, description: e.target.value })}
                    placeholder="e.g. Smart card lost, issued replacement barcode card"
                    className="w-full h-8 px-3 rounded-[6px] border border-[var(--border-default)] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[var(--text-secondary)]">Due Date</label>
                  <input
                    type="date"
                    value={newChargeData.dueDate}
                    onChange={(e) => setNewChargeData({ ...newChargeData, dueDate: e.target.value })}
                    className="w-full h-8 px-2 rounded-[6px] border border-[var(--border-default)] bg-white text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddChargeModalOpen(false)}
                    className="px-3 py-1.5 rounded-[6px] border border-[var(--border-default)] text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[6px] bg-[var(--brand-primary)] text-white font-semibold hover:bg-[var(--brand-primary-hover)]"
                  >
                    Add Charge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Payment Receipt & Print Screen */}
        {completedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
            <div className="bg-white rounded-[8px] border border-[var(--border-default)] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-98 duration-150">
              {/* Receipt Action Bar */}
              <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">
                    Payment Collected Successfully
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)]"
                  >
                    <Printer className="h-3 w-3" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setCompletedReceipt(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Printable Official Receipt Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* School Header */}
                <div className="text-center pb-3 border-b border-neutral-200 space-y-0.5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    School ERP Enterprise Academy
                  </h2>
                  <p className="text-[11px] text-neutral-500">
                    Kathmandu, Nepal • Ph: +977-1-4455667 • PAN/VAT: 301928475
                  </p>
                  <div className="pt-1">
                    <span className="px-2.5 py-0.5 rounded bg-neutral-100 font-mono font-bold text-neutral-800 text-[11px] uppercase">
                      Official Fee Receipt
                    </span>
                  </div>
                </div>

                {/* Receipt Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded bg-neutral-50 border border-neutral-200">
                  <div>
                    <span className="text-neutral-500">Receipt No: </span>
                    <span className="font-mono font-bold text-neutral-900">{completedReceipt.receiptNo}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500">Date &amp; Time: </span>
                    <span className="font-medium text-neutral-900">{completedReceipt.date} {completedReceipt.time}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Student: </span>
                    <span className="font-bold text-neutral-900">{completedReceipt.studentName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500">Class &amp; Section: </span>
                    <span className="font-medium text-neutral-900">{completedReceipt.classGrade} - {completedReceipt.section}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Student ID / Adm: </span>
                    <span className="font-mono font-medium text-neutral-900">{completedReceipt.studentId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500">Payment Mode: </span>
                    <span className="font-semibold text-neutral-900">{completedReceipt.paymentMethod}</span>
                  </div>
                </div>

                {/* Itemized Settled Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-300 text-neutral-700 font-bold bg-neutral-100">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Fee Particulars</th>
                      <th className="py-2 px-3 text-right">Previous Due</th>
                      <th className="py-2 px-3 text-right">Amount Paid</th>
                      <th className="py-2 px-3 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {completedReceipt.settledItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-neutral-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-neutral-900">{item.chargeTitle}</span>
                          {item.description && (
                            <span className="text-[10px] text-neutral-500 block">{item.description}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-600">
                          NPR {item.previousDue.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-neutral-900">
                          NPR {item.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-600">
                          {item.newRemaining === 0 ? "—" : `NPR ${item.newRemaining.toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-neutral-900 font-bold text-xs bg-neutral-50">
                      <td colSpan={3} className="py-2.5 px-3 uppercase">Total Amount Collected:</td>
                      <td className="py-2.5 px-3 text-right text-sm text-[var(--brand-primary)]">
                        NPR {completedReceipt.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3" />
                    </tr>
                  </tfoot>
                </table>

                {/* Footer details */}
                <div className="pt-4 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-200">
                  <div>
                    <span>Cashier: {completedReceipt.cashierName}</span>
                    {completedReceipt.transactionRef && (
                      <span className="block font-mono">Ref: {completedReceipt.transactionRef}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-neutral-700">Authorized Signature</span>
                    <span className="block text-[10px] text-neutral-400">System Generated Computer Receipt</span>
                  </div>
                </div>

                {/* Modal dismiss buttons */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setCompletedReceipt(null);
                      setSelectedStudentId(null);
                    }}
                    className="px-4 py-2 rounded bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800"
                  >
                    Done (Collect Next Student)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
