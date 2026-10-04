"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Search,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Receipt,
  CheckCircle2,
  Calendar,
  Filter,
  CreditCard,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { InvoicePreviewModal, InvoiceData } from "@/components/fees/invoice-preview-modal";

const SAMPLE_INVOICE_DATA: InvoiceData[] = [
  {
    id: "inv-1",
    invoiceNo: "INV-2025-0001",
    isOriginal: true,
    studentName: "Aarav Sharma",
    studentId: "GV12345",
    admissionNo: "ADM-2083-042",
    classGrade: "Grade 10 (Science)",
    section: "A",
    academicYear: "2082 (2025-26)",
    invoiceDate: "2082-04-15 (2025-07-01)",
    dueDate: "2082-04-30 (2025-07-16)",
    paymentStatus: "Paid",
    items: [
      { id: "it-1", sn: 1, particulars: "Tuition Fee", description: "Annual Tuition Fee (Grade 10)", amount: 120000 },
      { id: "it-2", sn: 2, particulars: "Examination Fee", description: "Exam Fee (Annual)", amount: 10000 },
      { id: "it-3", sn: 3, particulars: "Library Fee", description: "Library & Resource Fee", amount: 5000 },
      { id: "it-4", sn: 4, particulars: "Computer Fee", description: "Computer Lab & Internet", amount: 5000 },
      { id: "it-5", sn: 5, particulars: "Miscellaneous Fee", description: "Miscellaneous Charges", amount: 2000 },
    ],
    subTotal: 142000,
    discount: 0,
    totalAmount: 142000,
    paidAmount: 142000,
    dueAmount: 0,
    bankDetails: {
      bankName: "Nepal Bank Limited",
      accountNo: "001000123456",
      accountHolder: "Mount Everest International Academy",
      paymentMode: "Bank Transfer / Online / Cash",
    },
    schoolInfo: {
      name: "Mount Everest International Academy",
      motto: "Knowledge | Character | Future",
      location: "Tinkune, Kathmandu, Nepal",
      phone: "+977-1-1234567",
      email: "info@schoolerp.edu.np",
      tagline: "Building Bright Futures",
    },
  },
  {
    id: "inv-2",
    invoiceNo: "INV-2025-0002",
    isOriginal: false,
    studentName: "Pooja Thapa",
    studentId: "GV12346",
    admissionNo: "ADM-2083-059",
    classGrade: "Grade 10 (Science)",
    section: "B",
    academicYear: "2082 (2025-26)",
    invoiceDate: "2082-04-15 (2025-07-01)",
    dueDate: "2082-04-30 (2025-07-16)",
    paymentStatus: "Partial",
    items: [
      { id: "it-201", sn: 1, particulars: "Tuition Fee", description: "Term 1 Tuition Fee", amount: 35000 },
      { id: "it-202", sn: 2, particulars: "Laboratory Fee", description: "Science Lab Materials", amount: 8000 },
      { id: "it-203", sn: 3, particulars: "Exam Fee", description: "Term Examination Fee", amount: 5000 },
    ],
    subTotal: 48000,
    discount: 3000,
    totalAmount: 45000,
    paidAmount: 22500,
    dueAmount: 22500,
    bankDetails: {
      bankName: "Global IME Bank",
      accountNo: "099000192834",
      accountHolder: "Mount Everest International Academy",
      paymentMode: "Online eSewa / Mobile Banking",
    },
    schoolInfo: {
      name: "Mount Everest International Academy",
      motto: "Knowledge | Character | Future",
      location: "Tinkune, Kathmandu, Nepal",
      phone: "+977-1-1234567",
      email: "info@schoolerp.edu.np",
      tagline: "Building Bright Futures",
    },
  },
  {
    id: "inv-3",
    invoiceNo: "INV-2025-0003",
    isOriginal: true,
    studentName: "Bikash Adhikari",
    studentId: "GV12347",
    admissionNo: "ADM-2083-112",
    classGrade: "Grade 9 (General)",
    section: "A",
    academicYear: "2082 (2025-26)",
    invoiceDate: "2082-04-15 (2025-07-01)",
    dueDate: "2082-04-30 (2025-07-16)",
    paymentStatus: "Unpaid",
    items: [
      { id: "it-301", sn: 1, particulars: "Tuition Fee", description: "Annual Tuition Fee", amount: 48000 },
      { id: "it-302", sn: 2, particulars: "Development Fee", description: "Annual Infrastructure Maintenance", amount: 10000 },
      { id: "it-303", sn: 3, particulars: "Computer Lab", description: "IT Curriculum & Practical Lab", amount: 6000 },
    ],
    subTotal: 64000,
    discount: 0,
    totalAmount: 64000,
    paidAmount: 0,
    dueAmount: 64000,
    bankDetails: {
      bankName: "Nepal Bank Limited",
      accountNo: "001000123456",
      accountHolder: "Mount Everest International Academy",
      paymentMode: "Bank Transfer / Cash Counter",
    },
    schoolInfo: {
      name: "Mount Everest International Academy",
      motto: "Knowledge | Character | Future",
      location: "Tinkune, Kathmandu, Nepal",
      phone: "+977-1-1234567",
      email: "info@schoolerp.edu.np",
      tagline: "Building Bright Futures",
    },
  },
];

export default function InvoicesAndReceiptsPage() {
  const [invoices, setInvoices] = React.useState<InvoiceData[]>(SAMPLE_INVOICE_DATA);
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"invoices" | "receipts">("invoices");
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = React.useState<InvoiceData | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);

  const filtered = invoices.filter((i) => {
    const matchesSearch =
      i.studentName.toLowerCase().includes(search.toLowerCase()) ||
      i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      i.studentId.toLowerCase().includes(search.toLowerCase()) ||
      i.admissionNo.toLowerCase().includes(search.toLowerCase());
    if (viewMode === "receipts") {
      return matchesSearch && i.paidAmount > 0;
    }
    return matchesSearch;
  });

  const handleOpenPreview = (inv: InvoiceData) => {
    setSelectedInvoiceForModal(inv);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Invoices & Receipts
          </span>
        </div>

        {notification && (
          <div className="p-3.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in-0 duration-150">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold">&times;</button>
          </div>
        )}

        {/* Page Header with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Invoices & Receipts
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage monthly billings, generate student invoices, and preview printable billing documents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.INVOICE_SETUP}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-neutral-500" />
              <span>Invoice Setup</span>
            </Link>

            <Link
              href={ROUTES.FEES.SETUP.INVOICE_TEMPLATE}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Receipt className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>Template Designer</span>
            </Link>

            <Link
              href={ROUTES.FEES.COLLECTION}
              className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Receipt className="h-3.5 w-3.5 text-neutral-500" />
              <span>Collect Fee</span>
            </Link>
            <button
              onClick={() => {
                const newInv: InvoiceData = {
                  id: `inv-${Date.now().toString().slice(-4)}`,
                  invoiceNo: `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
                  isOriginal: true,
                  studentName: "New Student Invoice",
                  studentId: `GV${Math.floor(10000 + Math.random() * 90000)}`,
                  admissionNo: `ADM-2083-${Math.floor(100 + Math.random() * 900)}`,
                  classGrade: "Grade 10 (Science)",
                  section: "A",
                  academicYear: "2082 (2025-26)",
                  invoiceDate: "2082-04-15 (2025-07-01)",
                  dueDate: "2082-04-30 (2025-07-16)",
                  paymentStatus: "Unpaid",
                  items: [
                    { id: "it-new-1", sn: 1, particulars: "Tuition Fee", description: "Term Tuition", amount: 25000 },
                    { id: "it-new-2", sn: 2, particulars: "Examination Fee", description: "Term Exam", amount: 4000 },
                  ],
                  subTotal: 29000,
                  discount: 0,
                  totalAmount: 29000,
                  paidAmount: 0,
                  dueAmount: 29000,
                  bankDetails: {
                    bankName: "Nepal Bank Limited",
                    accountNo: "001000123456",
                    accountHolder: "Mount Everest International Academy",
                    paymentMode: "Bank Transfer / Online / Cash",
                  },
                  schoolInfo: {
                    name: "Mount Everest International Academy",
                    motto: "Knowledge | Character | Future",
                    location: "Tinkune, Kathmandu, Nepal",
                    phone: "+977-1-1234567",
                    email: "info@schoolerp.edu.np",
                    tagline: "Building Bright Futures",
                  },
                };
                setInvoices([newInv, ...invoices]);
                setSelectedInvoiceForModal(newInv);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create Invoice</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs & Search Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs">
            <button
              onClick={() => setViewMode("invoices")}
              className={cn(
                "px-4 py-1.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === "invoices"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Invoices List ({invoices.length})</span>
            </button>
            <button
              onClick={() => setViewMode("receipts")}
              className={cn(
                "px-4 py-1.5 rounded-[4px] text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === "receipts"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Payment Receipts ({invoices.filter((i) => i.paidAmount > 0).length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by invoice no, student or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        {/* Invoices / Receipts Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-4">{viewMode === "receipts" ? "Receipt / Inv No." : "Invoice No."}</th>
                <th className="py-2.5 px-4">Student Details</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Billing Date</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4 text-right">Total (NPR)</th>
                <th className="py-2.5 px-4 text-right">Paid (NPR)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Print / View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => handleOpenPreview(inv)}
                  className="hover:bg-[var(--neutral-50)]/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[var(--text-primary)]">{inv.studentName}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] font-mono">{inv.studentId} • {inv.admissionNo}</div>
                  </td>
                  <td className="py-3 px-4 text-neutral-600 font-medium">{inv.classGrade} ({inv.section})</td>
                  <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">{inv.invoiceDate}</td>
                  <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-900 font-mono">
                    {inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold font-mono">
                    {inv.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        inv.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : inv.paymentStatus === "Partial"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenPreview(inv)}
                      className="px-2.5 py-1 rounded bg-[var(--bg-secondary)] hover:bg-[var(--neutral-100)] text-neutral-800 text-[11px] font-bold border border-[var(--border-default)] inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>Preview & Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Reusable High-Fidelity Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoiceForModal}
        allInvoices={invoices}
        onSelectInvoice={(inv) => setSelectedInvoiceForModal(inv)}
      />
    </div>
  );
}
