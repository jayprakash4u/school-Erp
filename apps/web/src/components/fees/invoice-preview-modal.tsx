"use client";

import * as React from "react";
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  GraduationCap,
  Shield,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Layers,
  ArrowLeft,
  School,
  QrCode,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface InvoiceItem {
  id: string;
  sn: number;
  particulars: string;
  description: string;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNo: string;
  isOriginal: boolean;
  studentName: string;
  studentId: string;
  admissionNo: string;
  classGrade: string;
  section: string;
  academicYear: string;
  invoiceDate: string;
  invoiceDateBs?: string;
  dueDate: string;
  dueDateBs?: string;
  paymentStatus: "Paid" | "Partial" | "Unpaid" | "Due";
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  bankDetails: {
    bankName: string;
    accountNo: string;
    accountHolder: string;
    paymentMode: string;
  };
  schoolInfo: {
    name: string;
    motto: string;
    location: string;
    phone: string;
    email: string;
    tagline: string;
  };
}

import {
  InvoiceSetupConfig,
  InvoiceTemplateConfig,
  DEFAULT_INVOICE_SETUP,
  DEFAULT_INVOICE_TEMPLATE,
} from "@/types/invoice-setup";
import {
  getStoredInvoiceSetup,
  getStoredInvoiceTemplate,
} from "@/lib/invoice-settings-store";

export type InvoiceTemplateStyle = "classic" | "modern" | "college";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  allInvoices?: InvoiceData[];
  onSelectInvoice?: (inv: InvoiceData) => void;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  allInvoices = [],
  onSelectInvoice,
}: InvoicePreviewModalProps) {
  const [templateStyle, setTemplateStyle] = React.useState<InvoiceTemplateStyle>("classic");
  const [printMode, setPrintMode] = React.useState<"single" | "dual">("single");
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = React.useState(true);
  const [isCopied, setIsCopied] = React.useState(false);
  const [currentInvoice, setCurrentInvoice] = React.useState<InvoiceData | null>(invoice);
  const [setupConfig, setSetupConfig] = React.useState<InvoiceSetupConfig>(DEFAULT_INVOICE_SETUP);
  const [templateConfig, setTemplateConfig] = React.useState<InvoiceTemplateConfig>(DEFAULT_INVOICE_TEMPLATE);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setSetupConfig(getStoredInvoiceSetup());
      setTemplateConfig(getStoredInvoiceTemplate());
    }
  }, []);

  React.useEffect(() => {
    if (invoice) {
      setCurrentInvoice(invoice);
    }
  }, [invoice]);

  if (!isOpen || !currentInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in-0 duration-200">
      
      {/* Modal Dialog Shell */}
      <div className="relative w-full max-w-[1400px] max-h-[96vh] bg-white rounded-xl shadow-2xl border border-[var(--border-default)] flex flex-col overflow-hidden text-[var(--text-primary)]">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-[var(--border-default)] flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Official Fee Invoice Preview & Voucher
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--brand-primary)]">
                  {currentInvoice.invoiceNo}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  currentInvoice.paymentStatus === "Paid"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                    : currentInvoice.paymentStatus === "Partial"
                    ? "bg-amber-50 text-amber-700 border border-amber-300"
                    : "bg-rose-50 text-rose-700 border border-rose-300"
                )}>
                  {currentInvoice.paymentStatus}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Enterprise School & College billing engine with multi-template formatting and instant print
              </p>
            </div>
          </div>

          {/* Top Header Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 3-Column Architecture matching the exact reference UI */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f4f6]/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================================= */}
            {/* COLUMN 1: Printable A4 Sheet Document (Left 6 Cols)                      */}
            {/* ========================================================================= */}
            <div className="lg:col-span-6 space-y-2">
              <div className={cn(
                "bg-white rounded-xl border border-[var(--border-default)] shadow-md p-6 sm:p-7 space-y-5 printable-document relative overflow-hidden transition-all",
                templateStyle === "classic" && "border-t-4 border-t-[var(--brand-primary)]",
                templateStyle === "modern" && "border-t-4 border-t-neutral-800 font-sans",
                templateStyle === "college" && "border-t-4 border-t-slate-800"
              )}>
                
                {/* 1. Header Section: School Crest + Info + Invoice Badge */}
                <div className="flex items-start justify-between border-b border-neutral-200 pb-4 gap-4">
                  {/* School Crest & Identity */}
                  <div className="flex items-center gap-3.5">
                    {/* Academic Crest Emblem */}
                    <div className="h-14 w-14 rounded-full border-2 border-[var(--brand-primary)] p-1 flex items-center justify-center text-[var(--brand-primary)] shrink-0 bg-rose-50/60 shadow-2xs">
                      <div className="flex flex-col items-center justify-center text-center">
                        <GraduationCap className="h-5 w-5" />
                        <span className="text-[7px] font-extrabold uppercase tracking-tighter leading-none mt-0.5">
                          VERITAS
                        </span>
                      </div>
                    </div>

                    <div>
                      <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-tight">
                        {currentInvoice.schoolInfo.name}
                      </h1>
                      <p className="text-[11px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                        {currentInvoice.schoolInfo.motto}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {currentInvoice.schoolInfo.location}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {currentInvoice.schoolInfo.phone} | {currentInvoice.schoolInfo.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Category Title & Invoice Badges */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 mb-0.5">
                      <Building className="h-3 w-3 text-[var(--brand-primary)]" />
                      <span>School / College Fee Invoice</span>
                    </div>
                    <div className="text-2xl font-black tracking-tight text-neutral-900 font-sans">
                      INVOICE
                    </div>
                    <div className="mt-1">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase text-white shadow-2xs",
                        currentInvoice.isOriginal ? "bg-emerald-600" : "bg-neutral-600"
                      )}>
                        {currentInvoice.isOriginal ? "ORIGINAL" : "CUSTOMER COPY"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Metadata Grid: Invoice To vs Invoice Info (2 columns) */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50/80 p-3.5 rounded-lg border border-neutral-200">
                  {/* Left Column: Invoice To */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                      Invoice To
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Student Name</span>
                      <span className="col-span-2 font-bold text-neutral-900">: {currentInvoice.studentName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Student ID</span>
                      <span className="col-span-2 font-mono font-bold text-[var(--brand-primary)]">: {currentInvoice.studentId}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Class / Grade</span>
                      <span className="col-span-2 font-medium text-neutral-800">: {currentInvoice.classGrade}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Section</span>
                      <span className="col-span-2 font-medium text-neutral-800">: {currentInvoice.section}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Academic Year</span>
                      <span className="col-span-2 text-neutral-800">: {currentInvoice.academicYear}</span>
                    </div>
                  </div>

                  {/* Right Column: Invoice Details */}
                  <div className="space-y-1 pl-3 border-l border-neutral-200">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-transparent mb-1.5 select-none">
                      Info
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Invoice No</span>
                      <span className="col-span-2 font-mono font-bold text-neutral-900">: {currentInvoice.invoiceNo}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Invoice Date</span>
                      <span className="col-span-2 font-mono text-neutral-800">: {currentInvoice.invoiceDate}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Due Date</span>
                      <span className="col-span-2 font-mono text-neutral-800">: {currentInvoice.dueDate}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 items-center pt-0.5">
                      <span className="text-neutral-500 font-medium">Payment Status</span>
                      <span className="col-span-2">
                        : <span className={cn(
                            "px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider",
                            currentInvoice.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800 font-extrabold"
                              : currentInvoice.paymentStatus === "Partial"
                              ? "bg-amber-100 text-amber-800 font-extrabold"
                              : "bg-rose-100 text-rose-800 font-extrabold"
                          )}>
                            {currentInvoice.paymentStatus}
                          </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Line Items Table */}
                <div className="rounded-lg border border-neutral-200 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={cn(
                        "text-white font-bold",
                        templateStyle === "classic" && "bg-[var(--brand-primary)]",
                        templateStyle === "modern" && "bg-neutral-800",
                        templateStyle === "college" && "bg-slate-800"
                      )}>
                        <th className="py-2 px-3 w-10 text-center font-semibold">SN</th>
                        <th className="py-2 px-3 font-semibold">Particulars</th>
                        <th className="py-2 px-3 font-semibold">Description</th>
                        <th className="py-2 px-3 text-right font-semibold">Amount (NPR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {currentInvoice.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-neutral-50/50">
                          <td className="py-2 px-3 text-center text-neutral-500 font-medium">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-neutral-900">{item.particulars}</td>
                          <td className="py-2 px-3 text-neutral-600 text-[11px]">{item.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-neutral-900">
                            {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Payment Details Box (Left) & Totals Calculation Box (Right) */}
                <div className="grid grid-cols-2 gap-4 items-start pt-1">
                  {/* Left: Payment Details Box */}
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1 mb-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>Payment Details</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Bank Name</span>
                      <span className="col-span-2 font-medium text-neutral-900">: {currentInvoice.bankDetails.bankName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Account No</span>
                      <span className="col-span-2 font-mono font-bold text-neutral-900">: {currentInvoice.bankDetails.accountNo}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Account Holder</span>
                      <span className="col-span-2 font-medium text-neutral-900">: {currentInvoice.bankDetails.accountHolder}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Payment Mode</span>
                      <span className="col-span-2 text-neutral-700">: {currentInvoice.bankDetails.paymentMode}</span>
                    </div>
                  </div>

                  {/* Right: Totals Box */}
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-600 font-medium">
                      <span>Sub Total</span>
                      <span className="font-mono font-semibold">
                        {currentInvoice.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 font-medium">
                      <span>Discount</span>
                      <span className="font-mono text-emerald-600 font-semibold">
                        {currentInvoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs font-bold text-neutral-900 bg-rose-50/50 -mx-3 -mb-3 p-2.5 rounded-b-lg">
                      <span className="uppercase tracking-wider">Total Amount</span>
                      <span className="font-mono font-black text-sm text-[var(--brand-primary)]">
                        {currentInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Payment Received / Remit Banner */}
                {currentInvoice.paymentStatus === "Paid" ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Your payment has been received. Thank you for your cooperation.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Please make payment before {currentInvoice.dueDate} to prevent penalty fees.</span>
                  </div>
                )}

                {/* 6. Terms & Authorized Signature */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-200 items-end">
                  <div className="space-y-0.5 text-[10px] text-neutral-500">
                    <div className="font-bold uppercase tracking-wider text-neutral-800 text-[10.5px] mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-neutral-600" />
                      <span>Terms & Conditions</span>
                    </div>
                    <p>• This invoice is for the selected academic term only.</p>
                    <p>• Please mention the invoice number while making the payment.</p>
                    <p>• For any queries, contact the accounts office.</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="h-8"></div>
                    <div className="border-t border-neutral-400 pt-1">
                      <p className="text-xs font-bold text-neutral-900">Authorized Signature</p>
                      <p className="text-[10px] text-neutral-500">{currentInvoice.schoolInfo.name}</p>
                    </div>
                  </div>
                </div>

                {/* 7. Bottom Brand Wave Ribbon */}
                <div className={cn(
                  "mt-3 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 py-3 px-6 text-white flex items-center justify-center transition-colors",
                  templateStyle === "classic" && "bg-[var(--brand-primary)]",
                  templateStyle === "modern" && "bg-neutral-800",
                  templateStyle === "college" && "bg-slate-800"
                )}>
                  <span className="text-xs font-semibold tracking-wider italic">
                    {currentInvoice.schoolInfo.tagline}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs font-semibold text-neutral-500 py-1">
                Invoice Template (School / College)
              </p>
            </div>


            {/* ========================================================================= */}
            {/* COLUMN 2: UI for Invoice Preview & Print (Center 3.5 Cols)                */}
            {/* ========================================================================= */}
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3.5">
                
                {/* Header Title */}
                <div className="font-extrabold text-sm text-neutral-900 border-b border-neutral-200 pb-2">
                  Invoice Preview
                </div>

                {/* Select Invoice Dropdown + Quick Print / PDF */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-600">
                      Select Invoice
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrint}
                        className="px-2 py-1 rounded bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View / Print"
                      >
                        <Printer className="h-3 w-3" />
                        <span>View / Print</span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="h-3 w-3" />
                        <span>{isCopied ? "Saved" : "Download PDF"}</span>
                      </button>
                    </div>
                  </div>

                  {allInvoices.length > 0 ? (
                    <select
                      value={currentInvoice.id}
                      onChange={(e) => {
                        const found = allInvoices.find((inv) => inv.id === e.target.value);
                        if (found) {
                          setCurrentInvoice(found);
                          onSelectInvoice?.(found);
                        }
                      }}
                      className="w-full h-8 rounded-md border border-neutral-300 bg-white px-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[var(--brand-primary)]"
                    >
                      {allInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNo} ({inv.studentName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-2.5 py-1.5 rounded bg-neutral-100 text-xs font-mono font-bold text-neutral-700">
                      {currentInvoice.invoiceNo} ({currentInvoice.studentName})
                    </div>
                  )}
                </div>

                {/* Student Info & Status Card */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                  {/* Left: Student Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-600 mb-1">
                      <GraduationCap className="h-3 w-3 text-[var(--brand-primary)]" />
                      <span>Student Info</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Name:</span> <strong className="text-neutral-900 block truncate">{currentInvoice.studentName}</strong>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Student ID:</span> <span className="font-mono font-bold text-neutral-800 block">{currentInvoice.studentId}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Class:</span> <span className="text-neutral-800 block truncate">{currentInvoice.classGrade}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Section:</span> <span className="text-neutral-800 font-bold">{currentInvoice.section}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Academic Year:</span> <span className="text-neutral-800 block">{currentInvoice.academicYear}</span>
                    </div>
                  </div>

                  {/* Right: Status */}
                  <div className="space-y-1 border-l border-neutral-200 pl-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-600">Status</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider",
                        currentInvoice.paymentStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : currentInvoice.paymentStatus === "Partial"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      )}>
                        {currentInvoice.paymentStatus}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Invoice No:</span>
                      <span className="font-mono font-bold text-neutral-800 block truncate">{currentInvoice.invoiceNo}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Invoice Date:</span>
                      <span className="font-mono text-neutral-700 block truncate">{currentInvoice.invoiceDate}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">Due Date:</span>
                      <span className="font-mono text-neutral-700 block truncate">{currentInvoice.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Items List & Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    <FileText className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    <span>Invoice Items</span>
                  </div>

                  <div className="rounded-md border border-neutral-200 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-100 text-neutral-600 font-bold border-b border-neutral-200">
                        <tr>
                          <th className="py-1.5 px-2 w-6 text-center">#</th>
                          <th className="py-1.5 px-2">Particulars</th>
                          <th className="py-1.5 px-2 text-right">Amount (NPR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 bg-white">
                        {currentInvoice.items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-neutral-50/50">
                            <td className="py-1.5 px-2 text-center text-neutral-500">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-medium text-neutral-800">{item.particulars}</td>
                            <td className="py-1.5 px-2 text-right font-mono font-semibold text-neutral-900">
                              {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations Box */}
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Sub Total</span>
                      <span className="font-mono font-medium">
                        {currentInvoice.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Discount</span>
                      <span className="font-mono font-medium text-emerald-600">
                        {currentInvoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                      <span>Total Amount</span>
                      <span className="font-mono text-[var(--brand-primary)]">
                        {currentInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Payment Details Accordion */}
                <div className="rounded-md border border-neutral-200 overflow-hidden text-xs">
                  <button
                    onClick={() => setIsPaymentDetailsOpen(!isPaymentDetailsOpen)}
                    className="w-full p-2 bg-neutral-100/70 hover:bg-neutral-100 flex items-center justify-between font-bold text-neutral-800 text-xs text-left transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>Payment Details</span>
                    </span>
                    {isPaymentDetailsOpen ? <ChevronUp className="h-3.5 w-3.5 text-neutral-500" /> : <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />}
                  </button>
                  {isPaymentDetailsOpen && (
                    <div className="p-2.5 space-y-1 bg-white text-neutral-600 border-t border-neutral-200">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">Bank Name</span>
                        <span className="col-span-2 font-medium text-neutral-900">: {currentInvoice.bankDetails.bankName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">Account No</span>
                        <span className="col-span-2 font-mono font-bold text-neutral-900">: {currentInvoice.bankDetails.accountNo}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">Account Holder</span>
                        <span className="col-span-2 font-medium text-neutral-900">: {currentInvoice.bankDetails.accountHolder}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">Payment Mode</span>
                        <span className="col-span-2 text-neutral-700">: {currentInvoice.bankDetails.paymentMode}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors shadow-2xs text-center flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to List</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2 rounded bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Invoice</span>
                  </button>
                </div>

              </div>

              <p className="text-center text-xs font-semibold text-neutral-500 py-1">
                UI for Invoice Preview & Print
              </p>
            </div>


            {/* ========================================================================= */}
            {/* COLUMN 3: Template Variations & Key ERP Features (Right 2.5 Cols)          */}
            {/* ========================================================================= */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Template Variations Card */}
              <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
                <div className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                  Template Variations (Examples)
                </div>

                <div className="space-y-3">
                  {/* Option 1: Modern (Minimal) */}
                  <div
                    onClick={() => setTemplateStyle("modern")}
                    className={cn(
                      "p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-xs",
                      templateStyle === "modern"
                        ? "border-[var(--brand-primary)] bg-rose-50/50 ring-1 ring-[var(--brand-primary)]"
                        : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Mini Thumbnail Preview */}
                      <div className="h-16 w-12 bg-white rounded border border-neutral-300 p-1 flex flex-col justify-between shrink-0 shadow-2xs">
                        <div className="space-y-0.5">
                          <div className="h-1 w-6 bg-neutral-800 rounded-2xs"></div>
                          <div className="h-0.5 w-8 bg-neutral-300 rounded-2xs"></div>
                        </div>
                        <div className="space-y-0.5 my-1">
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-700 rounded-2xs"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-900">Modern (Minimal)</h4>
                          {templateStyle === "modern" && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                          Clean and simple design, easy to read.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Classic (with Logo & Colors) */}
                  <div
                    onClick={() => setTemplateStyle("classic")}
                    className={cn(
                      "p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-xs",
                      templateStyle === "classic"
                        ? "border-[var(--brand-primary)] bg-rose-50/50 ring-1 ring-[var(--brand-primary)]"
                        : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Mini Thumbnail Preview */}
                      <div className="h-16 w-12 bg-white rounded border border-neutral-300 p-1 flex flex-col justify-between shrink-0 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="h-2 w-2 rounded-full bg-[var(--brand-primary)]"></div>
                          <div className="h-1 w-4 bg-emerald-600 rounded-2xs"></div>
                        </div>
                        <div className="space-y-0.5 my-1">
                          <div className="h-1.5 w-full bg-[var(--brand-primary)] rounded-2xs"></div>
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                        </div>
                        <div className="h-2 w-full bg-[var(--brand-primary)] rounded-b-2xs"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-900">Classic (with Logo & Colors)</h4>
                          {templateStyle === "classic" && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                          Traditional look with school branding.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: College Style (Modern) */}
                  <div
                    onClick={() => setTemplateStyle("college")}
                    className={cn(
                      "p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-xs",
                      templateStyle === "college"
                        ? "border-[var(--brand-primary)] bg-rose-50/50 ring-1 ring-[var(--brand-primary)]"
                        : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Mini Thumbnail Preview */}
                      <div className="h-16 w-12 bg-white rounded border border-neutral-300 p-1 flex flex-col justify-between shrink-0 shadow-2xs">
                        <div className="flex items-center gap-1 border-b border-neutral-200 pb-0.5">
                          <div className="h-2 w-2 bg-slate-800 rounded-2xs"></div>
                          <div className="h-1 w-5 bg-slate-700 rounded-2xs"></div>
                        </div>
                        <div className="space-y-0.5 my-1">
                          <div className="h-1 w-full bg-slate-700 rounded-2xs"></div>
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                          <div className="h-0.5 w-full bg-neutral-200"></div>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-2xs"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-900">College Style (Modern)</h4>
                          {templateStyle === "college" && (
                            <Check className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                          Professional and modern for colleges.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features for Your ERP Checklist */}
              <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-2.5">
                <div className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                  <span>Key Features for Your ERP</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Generate unique invoice number (once).</span>
                  </div>

                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Show <strong>ORIGINAL</strong> on first print, <strong>COPY</strong> on reprints.</span>
                  </div>

                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Track invoice status (Generated, Issued, Paid, Cancelled).</span>
                  </div>

                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Print and download as PDF.</span>
                  </div>

                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Customizable template (logo, colors, footer, fields).</span>
                  </div>

                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Supports both School and College settings (class/grade or department).</span>
                  </div>

                  <div className="flex items-start gap-2 text-neutral-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Responsive design (works on desktop and mobile).</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
