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
  Eye,
  QrCode,
  Phone,
  FileText,
  Check,
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

  // Financial breakdown modifiers
  const [discountType, setDiscountType] = React.useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = React.useState<string>("0");
  const [taxRate, setTaxRate] = React.useState<number>(0);
  const [fineAmount, setFineAmount] = React.useState<string>("0");
  const [amountReceived, setAmountReceived] = React.useState<string>("");

  // Modal / Receipt state
  const [completedReceipt, setCompletedReceipt] = React.useState<PaymentReceipt | null>(null);
  const [isAddChargeModalOpen, setIsAddChargeModalOpen] = React.useState<boolean>(false);
  const [printBill, setPrintBill] = React.useState<boolean>(true);

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

  // When student is selected, reset charge selections and financial modifiers
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
      setDiscountType("fixed");
      setDiscountValue("0");
      setTaxRate(0);
      setFineAmount("0");
      setAmountReceived("");
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

  const [searchFocusedIndex, setSearchFocusedIndex] = React.useState<number>(0);

  // Helper to format Grade-Section into clean "Grade-10-A" format
  const formatGradeSection = (classGrade: string, section: string) => {
    const g = classGrade.trim().replace(/^Grade\s*/i, "Grade-");
    const s = section.trim().replace(/^Section\s*/i, "");
    return s ? `${g}-${s}` : g;
  };

  // Reset highlighted suggestion index when search query changes
  React.useEffect(() => {
    setSearchFocusedIndex(0);
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredStudents.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchFocusedIndex((prev) => (prev + 1) % filteredStudents.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchFocusedIndex((prev) => (prev - 1 + filteredStudents.length) % filteredStudents.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetStudent = filteredStudents[searchFocusedIndex] || filteredStudents[0];
      if (targetStudent) {
        setSelectedStudentId(targetStudent.studentId);
        setSearchQuery("");
      }
    } else if (e.key === "Escape") {
      setSearchQuery("");
    }
  };

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

  // Comprehensive billing calculations: Subtotal, Discount, Tax, Fine, Grand Total, Tendered, Change
  const billingCalculations = React.useMemo(() => {
    const rawSubtotal = selectedItemsSummary.totalToCollect;

    const discNum = Math.max(0, Number(discountValue) || 0);
    const calculatedDiscount =
      discountType === "percent"
        ? Math.min(rawSubtotal, Math.round(((rawSubtotal * discNum) / 100) * 100) / 100)
        : Math.min(rawSubtotal, discNum);

    const taxableBase = Math.max(0, rawSubtotal - calculatedDiscount);
    const calculatedTax = Math.round(((taxableBase * taxRate) / 100) * 100) / 100;
    const calculatedFine = Math.max(0, Number(fineAmount) || 0);
    const grandTotal = Math.max(0, Math.round((taxableBase + calculatedTax + calculatedFine) * 100) / 100);

    const receivedNum = amountReceived ? Number(amountReceived) || 0 : grandTotal;
    const changeDue = Math.max(0, receivedNum - grandTotal);

    return {
      subtotal: rawSubtotal,
      discount: calculatedDiscount,
      taxableBase,
      taxRate,
      taxAmount: calculatedTax,
      fine: calculatedFine,
      grandTotal,
      amountReceived: receivedNum,
      changeDue,
    };
  }, [selectedItemsSummary.totalToCollect, discountType, discountValue, taxRate, fineAmount, amountReceived]);

  // Execute payment collection
  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || billingCalculations.grandTotal <= 0) return;

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
      subtotalAmount: billingCalculations.subtotal,
      discountAmount: billingCalculations.discount > 0 ? billingCalculations.discount : undefined,
      taxRate: billingCalculations.taxRate > 0 ? billingCalculations.taxRate : undefined,
      taxAmount: billingCalculations.taxAmount > 0 ? billingCalculations.taxAmount : undefined,
      fineAmount: billingCalculations.fine > 0 ? billingCalculations.fine : undefined,
      totalAmount: billingCalculations.grandTotal,
      amountReceived: billingCalculations.amountReceived > 0 ? billingCalculations.amountReceived : undefined,
      changeAmount: billingCalculations.changeDue > 0 ? billingCalculations.changeDue : undefined,
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

    if (printBill) {
      setCompletedReceipt(newReceipt);
    } else {
      // Reset payment form fields for next operation
      setTransactionRef("");
      setRemarks("");
      setDiscountValue("0");
      setFineAmount("0");
      setAmountReceived("");
    }
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
            {/* Student Search Input */}
            <div className="max-w-xl relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search student by name, student ID, or roll..."
                  className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm bg-white border border-[var(--border-default)] rounded-[6px] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white transition-all shadow-xs"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown / Suggestions Panel */}
              {searchQuery.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-1 z-40 rounded-[6px] border border-[var(--border-default)] bg-white shadow-lg overflow-hidden">
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[var(--text-tertiary)]">
                      No student found matching &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-light)] max-h-64 overflow-y-auto">
                      {filteredStudents.map((stu, idx) => {
                        const isFocused = idx === searchFocusedIndex;
                        const formattedGrade = formatGradeSection(stu.classGrade, stu.section);

                        return (
                          <div
                            key={stu.studentId}
                            onClick={() => {
                              setSelectedStudentId(stu.studentId);
                              setSearchQuery("");
                            }}
                            onMouseEnter={() => setSearchFocusedIndex(idx)}
                            className={cn(
                              "px-3.5 py-2 cursor-pointer transition-colors select-none text-left",
                              isFocused
                                ? "bg-neutral-100"
                                : "hover:bg-neutral-50"
                            )}
                          >
                            <div className="text-xs font-semibold text-neutral-900 leading-snug">
                              {stu.fullName}{" "}
                              <span className="font-normal text-neutral-500">
                                ({stu.studentId})
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                              Roll: {stu.rollNo || "—"} - {formattedGrade}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Collections */}
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Recent Collections
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border-t border-[var(--border-default)]">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] text-neutral-800 font-semibold bg-neutral-50/70">
                      <th className="py-2.5 px-4 border-r border-[var(--border-default)]">Receipt No.</th>
                      <th className="py-2.5 px-4 border-r border-[var(--border-default)]">Student Name</th>
                      <th className="py-2.5 px-4 border-r border-[var(--border-default)]">Class</th>
                      <th className="py-2.5 px-4 border-r border-[var(--border-default)]">Amount Paid</th>
                      <th className="py-2.5 px-4 border-r border-[var(--border-default)]">Method</th>
                      <th className="py-2.5 px-4 border-r border-[var(--border-default)]">Time</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {receipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-[var(--brand-primary)] border-r border-[var(--border-default)]">
                          {rec.receiptNo}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[var(--border-default)]">
                          <button
                            onClick={() => setSelectedStudentId(rec.studentId)}
                            className="font-medium text-neutral-900 hover:text-[var(--brand-primary)] text-left"
                          >
                            {rec.studentName}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-neutral-700 border-r border-[var(--border-default)]">
                          {rec.classGrade} - {rec.section}
                        </td>
                        <td className="py-2.5 px-4 font-normal text-neutral-900 border-r border-[var(--border-default)]">
                          NPR {rec.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 border-r border-[var(--border-default)]">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-[11px] font-medium">
                            {rec.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-neutral-600 border-r border-[var(--border-default)]">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-neutral-400 shrink-0" />
                            {rec.time}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setSelectedStudentId(rec.studentId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-neutral-50 text-neutral-700 border border-[var(--border-default)] text-[11px] font-semibold transition-colors"
                              title="View Student Desk"
                            >
                              <Eye className="h-3 w-3 text-neutral-500" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => setCompletedReceipt(rec)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-secondary)] hover:bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--border-default)] text-[11px] font-semibold transition-colors"
                              title="View Receipt"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Receipt</span>
                            </button>
                          </div>
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
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={() => setSelectedStudentId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-white border border-[var(--border-default)] hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs w-fit"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-neutral-500" />
                <span>Back to Student Search</span>
              </button>

              <button
                onClick={() => setIsAddChargeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-white border border-[var(--border-default)] hover:bg-neutral-50 text-xs font-semibold text-[var(--brand-primary)] transition-colors shadow-2xs w-fit cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add One-off / Misc Charge</span>
              </button>
            </div>

            {/* Humanized Student Profile & Financial Summary Card */}
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 lg:p-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Student Profile Info */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-lg flex items-center justify-center shrink-0">
                    {activeStudent.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg sm:text-xl font-bold text-neutral-900 leading-none">
                        {activeStudent.fullName}
                      </h1>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                        {activeStudent.studentId}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                      <span className="font-medium text-neutral-800">
                        {activeStudent.classGrade} - {activeStudent.section}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span>Roll: {activeStudent.rollNo || "—"}</span>
                      <span className="text-neutral-300">•</span>
                      <span>Adm No: {activeStudent.admissionNo}</span>
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-1.5 pt-0.5">
                      <User className="h-3 w-3 text-neutral-400" />
                      <span>Guardian: {activeStudent.guardianName}</span>
                      <span className="text-neutral-300">•</span>
                      <Phone className="h-3 w-3 text-neutral-400 ml-1" />
                      <span>{activeStudent.guardianPhone}</span>
                    </div>
                  </div>
                </div>

                {/* 3-Pillar Financial Balances */}
                {studentTotals && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[480px]">
                    <div className="p-3.5 rounded-[6px] bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        Total Charges
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-900 mt-0.5 block">
                        NPR {studentTotals.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-[6px] bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        Total Paid
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-900 mt-0.5 block">
                        NPR {studentTotals.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-[6px] bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        Outstanding Due
                      </span>
                      <span className="text-sm sm:text-base font-bold text-red-600 mt-0.5 block">
                        NPR {studentTotals.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2-Column Collection Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Outstanding Charges Selection Table */}
              <div className="lg:col-span-2 space-y-5">
                <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Outstanding Fees &amp; Charges
                    </h2>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllOutstanding}
                        className="px-2.5 py-1 rounded bg-white border border-[var(--border-default)] hover:bg-neutral-50 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="px-2.5 py-1 rounded bg-white border border-[var(--border-default)] hover:bg-neutral-50 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  {outstandingCharges.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-neutral-400 mx-auto" />
                      <h3 className="text-xs font-bold text-neutral-800">All Charges Cleared</h3>
                      <p className="text-[11px] text-neutral-500">
                        This student currently has zero outstanding dues.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border-t border-[var(--border-default)]">
                        <thead>
                          <tr className="border-b border-[var(--border-default)] text-neutral-800 font-semibold bg-neutral-50/70">
                            <th className="py-2.5 px-3 text-center w-10 border-r border-[var(--border-default)]">
                              Pay
                            </th>
                            <th className="py-2.5 px-4 border-r border-[var(--border-default)]">
                              Fee Particulars
                            </th>
                            <th className="py-2.5 px-3 border-r border-[var(--border-default)]">
                              Due Date
                            </th>
                            <th className="py-2.5 px-3 text-right border-r border-[var(--border-default)]">
                              Total Charge
                            </th>
                            <th className="py-2.5 px-3 text-right border-r border-[var(--border-default)]">
                              Paid
                            </th>
                            <th className="py-2.5 px-3 text-right border-r border-[var(--border-default)] text-red-600 font-semibold">
                              Remaining Due
                            </th>
                            <th className="py-2.5 px-4 text-right w-36">
                              Paying Now (NPR)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-default)]">
                          {outstandingCharges.map((charge) => {
                            const sel = chargeSelections[charge.id] || {
                              selected: false,
                              payingAmount: charge.remainingAmount,
                            };
                            const isSelected = sel.selected;
                            const remainingAfter = Math.max(0, charge.remainingAmount - (isSelected ? sel.payingAmount : 0));

                            return (
                              <tr
                                key={charge.id}
                                className={cn(
                                  "transition-colors",
                                  isSelected ? "bg-neutral-50" : "hover:bg-neutral-50/50"
                                )}
                              >
                                <td className="py-3 px-3 text-center border-r border-[var(--border-default)]">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleCharge(charge.id)}
                                    className="h-4 w-4 rounded border-[var(--border-default)] text-neutral-900 focus:ring-0 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-4 border-r border-[var(--border-default)]">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-neutral-900">
                                      {charge.title}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-medium text-neutral-600">
                                      {charge.category}
                                    </span>
                                  </div>
                                  {charge.description && (
                                    <p className="text-[11px] text-neutral-500 mt-0.5">
                                      {charge.description}
                                    </p>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-neutral-600 border-r border-[var(--border-default)] whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-neutral-400" />
                                    {charge.dueDate}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right text-neutral-800 border-r border-[var(--border-default)]">
                                  {charge.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-right text-neutral-700 border-r border-[var(--border-default)]">
                                  {charge.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-red-600 border-r border-[var(--border-default)]">
                                  {charge.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                        "w-full h-7 px-2 text-right rounded border text-xs font-semibold transition-all",
                                        isSelected
                                          ? "border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                                          : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                      )}
                                    />
                                    {isSelected && (
                                      <div className="text-[10px] text-neutral-500 text-right">
                                        {remainingAfter === 0 ? (
                                          <span className="text-neutral-600 font-medium">Full Settle</span>
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
                        <tfoot className="border-t-2 border-[var(--border-default)] bg-neutral-50/80 font-semibold text-neutral-800">
                          <tr>
                            <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-[11px] text-neutral-500 border-r border-[var(--border-default)]">
                              Subtotal (Selected Items):
                            </td>
                            <td colSpan={3} className="py-2.5 px-3 text-right border-r border-[var(--border-default)] text-neutral-900 font-bold">
                              NPR {billingCalculations.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-neutral-900">
                              NPR {billingCalculations.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* Fully Paid Charges Archive Collapsible (for reference) */}
                {paidCharges.length > 0 && (
                  <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
                      <span className="text-xs font-bold text-neutral-700">
                        Previously Fully Paid Charges ({paidCharges.length})
                      </span>
                      <span className="text-[11px] text-neutral-600 font-semibold">✓ Settled</span>
                    </div>
                    <div className="mt-2 divide-y divide-[var(--border-light)] text-xs">
                      {paidCharges.map((pc) => (
                        <div key={pc.id} className="py-1.5 flex items-center justify-between text-neutral-600">
                          <div>
                            <span className="font-medium text-neutral-800">{pc.title}</span>
                            <span className="text-[10px] text-neutral-400 ml-2">({pc.category})</span>
                          </div>
                          <span className="font-normal text-neutral-800">
                            NPR {pc.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Paid
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
                  className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4 text-xs"
                >
                  {/* Form Header */}
                  <div className="pb-3 border-b border-neutral-200">
                    <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Collection Settlement
                    </h2>
                  </div>

                  {/* Selected Items Breakdown */}
                  {selectedItemsSummary.items.length > 0 && (
                    <div className="pb-3 border-b border-neutral-200">
                      <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider block mb-1">
                        Selected Fee Heads
                      </span>
                      <div className="divide-y divide-neutral-100 max-h-36 overflow-y-auto">
                        {selectedItemsSummary.items.map((item) => (
                          <div
                            key={item.charge.id}
                            className="py-1.5 flex items-center justify-between text-xs"
                          >
                            <div className="truncate mr-2">
                              <span className="font-medium text-neutral-800">
                                {item.charge.title}
                              </span>
                              {item.newDue > 0 && (
                                <span className="text-[10px] text-neutral-500 ml-1.5">
                                  (Due: NPR {item.newDue.toLocaleString()})
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-neutral-900 shrink-0 font-mono">
                              NPR {item.payingNow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Billing Ledger */}
                  <div className="space-y-2.5 text-xs">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600 font-medium">Subtotal</span>
                      <span className="font-semibold text-neutral-900 font-mono">
                        NPR {billingCalculations.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-600 font-medium shrink-0">Discount</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="flex rounded border border-neutral-300 bg-white overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => setDiscountType("fixed")}
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                              discountType === "fixed"
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-600 hover:bg-neutral-100"
                            )}
                          >
                            NPR
                          </button>
                          <button
                            type="button"
                            onClick={() => setDiscountType("percent")}
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                              discountType === "percent"
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-600 hover:bg-neutral-100"
                            )}
                          >
                            %
                          </button>
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="0"
                          className="w-16 h-7 px-2 text-right rounded border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:border-neutral-800"
                        />
                        <span className="text-neutral-600 font-mono w-24 text-right">
                          - NPR {billingCalculations.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Tax / Cess */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-600 font-medium shrink-0">Tax / Cess</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <select
                          value={taxRate}
                          onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                          className="h-7 px-2 rounded border border-neutral-300 bg-white text-xs text-neutral-800 focus:outline-none focus:border-neutral-800"
                        >
                          <option value={0}>0% Tax Exempt</option>
                          <option value={1}>1% Education Cess</option>
                          <option value={5}>5% Service Tax</option>
                          <option value={13}>13% VAT</option>
                        </select>
                        <span className="text-neutral-600 font-mono w-24 text-right">
                          + NPR {billingCalculations.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Fine */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-neutral-600 font-medium shrink-0">Late Fine</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <input
                          type="number"
                          min={0}
                          value={fineAmount}
                          onChange={(e) => setFineAmount(e.target.value)}
                          placeholder="0"
                          className="w-20 h-7 px-2 text-right rounded border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:border-neutral-800"
                        />
                        <span className="text-neutral-600 font-mono w-24 text-right">
                          + NPR {billingCalculations.fine.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Total Row - Simple, Clean, Unboxed */}
                  <div className="pt-3 border-t-2 border-neutral-900 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 block">
                        Net Total Amount
                      </span>
                      <span className="text-[11px] text-neutral-500">Total to Collect</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-900">
                      NPR {billingCalculations.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Payment Mode & Details */}
                  <div className="space-y-3 pt-3 border-t border-neutral-200">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-700 block">
                        Payment Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full h-8 px-2.5 rounded border border-neutral-300 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:border-neutral-800"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank Transfer / Deposit</option>
                        <option value="Card">Credit / Debit Card (POS)</option>
                        <option value="Online">Online / Digital (eSewa / Khalti / QR)</option>
                      </select>
                    </div>

                    {/* Cash Tendered & Change Due */}
                    {paymentMethod === "Cash" && billingCalculations.grandTotal > 0 && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-neutral-600 block">
                            Cash Received
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            placeholder={billingCalculations.grandTotal.toString()}
                            className="w-full h-7.5 px-2.5 text-right rounded border border-neutral-300 bg-white text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-neutral-600 block">
                            Change Due
                          </span>
                          <div className="h-7.5 flex items-center justify-end px-2.5 rounded bg-neutral-100 font-semibold text-xs text-neutral-900 border border-neutral-200">
                            NPR {billingCalculations.changeDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank Reference */}
                    {paymentMethod === "Bank" && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-neutral-700 block">
                          Bank Reference / Voucher No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. NBL123456 or Voucher #84920"
                          className="w-full h-8 px-2.5 rounded border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:border-neutral-800 font-mono"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Online Gateway */}
                    {paymentMethod === "Online" && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-neutral-700 block">
                          Transaction ID / eSewa / Khalti Ref <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. ESW-849204 or KHLTI-19283"
                          className="w-full h-8 px-2.5 rounded border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:border-neutral-800 font-mono"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Card Auth */}
                    {paymentMethod === "Card" && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-neutral-700 block">
                          Approval Code / Slip Auth No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. AUTH-092841"
                          className="w-full h-8 px-2.5 rounded border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:border-neutral-800 font-mono"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Remarks */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-neutral-600 block">
                        Cashier Remarks / Notes
                      </label>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g. Term fee payment received at counter"
                        className="w-full h-8 px-2.5 rounded border border-neutral-300 bg-white text-xs text-neutral-800 focus:outline-none focus:border-neutral-800"
                      />
                    </div>
                  </div>

                  {/* Action Buttons & Print Options */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={billingCalculations.grandTotal <= 0}
                      className={cn(
                        "w-full py-2.5 rounded-[6px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs",
                        billingCalculations.grandTotal > 0
                          ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] cursor-pointer"
                          : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      )}
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Pay Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(null)}
                      className="w-full py-2 rounded-[6px] border border-neutral-300 hover:bg-neutral-50 text-neutral-600 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel &amp; Return
                    </button>

                    {/* Print Preference Options */}
                    <div className="flex items-center justify-center gap-6 pt-1 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-700">
                        <input
                          type="radio"
                          name="billPrintPreference"
                          checked={printBill === true}
                          onChange={() => setPrintBill(true)}
                          className="h-3.5 w-3.5 text-neutral-900 border-neutral-300 focus:ring-0 cursor-pointer"
                        />
                        <span>Print Bill</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-700">
                        <input
                          type="radio"
                          name="billPrintPreference"
                          checked={printBill === false}
                          onChange={() => setPrintBill(false)}
                          className="h-3.5 w-3.5 text-neutral-900 border-neutral-300 focus:ring-0 cursor-pointer"
                        />
                        <span>No Bill Print</span>
                      </label>
                    </div>
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
                    {completedReceipt.subtotalAmount !== undefined && (
                      <tr className="border-t border-neutral-300 text-xs bg-neutral-50/50">
                        <td colSpan={3} className="py-1.5 px-3 text-neutral-600">Subtotal:</td>
                        <td className="py-1.5 px-3 text-right font-medium text-neutral-900">
                          NPR {completedReceipt.subtotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-3" />
                      </tr>
                    )}
                    {completedReceipt.discountAmount !== undefined && completedReceipt.discountAmount > 0 && (
                      <tr className="text-xs bg-neutral-50/50 text-emerald-700">
                        <td colSpan={3} className="py-1.5 px-3">Discount / Concession:</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          - NPR {completedReceipt.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-3" />
                      </tr>
                    )}
                    {completedReceipt.taxAmount !== undefined && completedReceipt.taxAmount > 0 && (
                      <tr className="text-xs bg-neutral-50/50 text-neutral-700">
                        <td colSpan={3} className="py-1.5 px-3">Tax / Education Cess ({completedReceipt.taxRate || 0}%):</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          + NPR {completedReceipt.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-3" />
                      </tr>
                    )}
                    {completedReceipt.fineAmount !== undefined && completedReceipt.fineAmount > 0 && (
                      <tr className="text-xs bg-neutral-50/50 text-rose-700">
                        <td colSpan={3} className="py-1.5 px-3">Late Fine / Penalty:</td>
                        <td className="py-1.5 px-3 text-right font-medium">
                          + NPR {completedReceipt.fineAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-3" />
                      </tr>
                    )}
                    <tr className="border-t-2 border-neutral-900 font-bold text-xs bg-neutral-100">
                      <td colSpan={3} className="py-2.5 px-3 uppercase">Total Amount Collected:</td>
                      <td className="py-2.5 px-3 text-right text-sm text-[var(--brand-primary)]">
                        NPR {completedReceipt.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3" />
                    </tr>
                    {completedReceipt.amountReceived !== undefined && (
                      <tr className="text-[11px] text-neutral-600 bg-neutral-50/70 border-t border-neutral-200">
                        <td colSpan={3} className="py-1.5 px-3">
                          Tendered: NPR {completedReceipt.amountReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {completedReceipt.changeAmount !== undefined && completedReceipt.changeAmount > 0 && (
                            <span className="ml-3 font-semibold text-neutral-800">
                              Change Returned: NPR {completedReceipt.changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    )}
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
