"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Sliders,
  Printer,
  Eye,
  CheckCircle2,
  Save,
  RotateCcw,
  Building,
  GraduationCap,
  CreditCard,
  QrCode,
  FileText,
  ChevronRight,
  Check,
  Layers,
  FileCheck,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  InvoiceTemplateConfig,
  DEFAULT_INVOICE_TEMPLATE,
} from "@/types/invoice-setup";
import {
  getStoredInvoiceTemplate,
  saveStoredInvoiceTemplate,
} from "@/lib/invoice-settings-store";
import { InvoicePreviewModal, InvoiceData } from "@/components/fees/invoice-preview-modal";

const SAMPLE_INVOICE: InvoiceData = {
  id: "inv-sample-1",
  invoiceNo: "INV-2082-100001",
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
    { id: "1", sn: 1, particulars: "Tuition Fee", description: "Annual Tuition Fee (Grade 10)", amount: 120000 },
    { id: "2", sn: 2, particulars: "Examination Fee", description: "Exam Fee (Annual)", amount: 10000 },
    { id: "3", sn: 3, particulars: "Library Fee", description: "Library & Resource Fee", amount: 5000 },
    { id: "4", sn: 4, particulars: "Computer Fee", description: "Computer Lab & Internet", amount: 5000 },
    { id: "5", sn: 5, particulars: "Miscellaneous Fee", description: "Miscellaneous Charges", amount: 2000 },
  ],
  subTotal: 142000,
  discount: 0,
  totalAmount: 142000,
  paidAmount: 142000,
  dueAmount: 0,
  bankDetails: {
    bankName: "Nepal Bank Limited",
    accountNo: "001000123456",
    accountHolder: "Green Valley International School",
    paymentMode: "Bank Transfer / Online / Cash",
  },
  schoolInfo: {
    name: "Green Valley International School",
    motto: "Knowledge | Character | Future",
    location: "Tinkune, Kathmandu, Nepal",
    phone: "+977-1-1234567",
    email: "info@greenvalley.edu.np",
    tagline: "Building Bright Futures",
  },
};

export default function InvoiceTemplateDesignerPage() {
  const [template, setTemplate] = React.useState<InvoiceTemplateConfig>(DEFAULT_INVOICE_TEMPLATE);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);

  React.useEffect(() => {
    setTemplate(getStoredInvoiceTemplate());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredInvoiceTemplate(template);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setTemplate(DEFAULT_INVOICE_TEMPLATE);
    saveStoredInvoiceTemplate(DEFAULT_INVOICE_TEMPLATE);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Synchronize sample data with current template inputs
  const liveInvoiceData: InvoiceData = React.useMemo(() => {
    return {
      ...SAMPLE_INVOICE,
      schoolInfo: {
        name: template.schoolName,
        motto: template.motto,
        location: template.address,
        phone: template.phone,
        email: template.email,
        tagline: template.tagline,
      },
      bankDetails: {
        bankName: template.bankName,
        accountNo: template.accountNo,
        accountHolder: template.accountHolder,
        paymentMode: template.paymentMode,
      },
    };
  }, [template]);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans text-[var(--text-primary)]">
      <ErpHeader />
      <ErpTopNav />

      {/* Breadcrumbs & Header Bar */}
      <div className="bg-white border-b border-[var(--border-default)] px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
              <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)]">
                Fees & Finance
              </Link>
              <ChevronRight className="h-3 w-3 text-neutral-400" />
              <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)]">
                Setup
              </Link>
              <ChevronRight className="h-3 w-3 text-neutral-400" />
              <span className="font-semibold text-neutral-900">Invoice Template Designer</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--brand-primary)]" />
                <span>Invoice & Receipt Template Designer</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-[var(--brand-primary)] border border-rose-200">
                Visual Studio
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Customize visual layout, branding crest, visible student fields, fee table columns, and bank payment QR codes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.INVOICE_SETUP}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Sliders className="h-3.5 w-3.5 text-neutral-600" />
              <span>&larr; Invoice Setup</span>
            </Link>

            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Full Screen Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area: Controls on Left (5 cols) + Realtime Preview on Right (7 cols) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {savedSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium animate-in fade-in-0 duration-200 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Invoice Template styling and visible fields have been saved and synchronized across all vouchers!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT: Customizer Form (5 cols)                                            */}
          {/* ========================================================================= */}
          <form onSubmit={handleSave} className="lg:col-span-5 space-y-5">
            
            {/* 1. Template Presets */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h3 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider">
                  1. Template Variations
                </h3>
                <span className="text-[11px] font-bold text-[var(--brand-primary)]">
                  {template.templateStyle.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplate({ ...template, templateStyle: "classic" })}
                  className={cn(
                    "p-2.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer",
                    template.templateStyle === "classic"
                      ? "border-[var(--brand-primary)] bg-rose-50 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  )}
                >
                  <Sparkles className="h-4 w-4 mx-auto mb-1 text-[var(--brand-primary)]" />
                  <span>Classic Red</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplate({ ...template, templateStyle: "modern" })}
                  className={cn(
                    "p-2.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer",
                    template.templateStyle === "modern"
                      ? "border-[var(--brand-primary)] bg-rose-50 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  )}
                >
                  <FileText className="h-4 w-4 mx-auto mb-1 text-neutral-700" />
                  <span>Modern Clean</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplate({ ...template, templateStyle: "college" })}
                  className={cn(
                    "p-2.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer",
                    template.templateStyle === "college"
                      ? "border-[var(--brand-primary)] bg-rose-50 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  )}
                >
                  <Building className="h-4 w-4 mx-auto mb-1 text-slate-700" />
                  <span>College Style</span>
                </button>
              </div>
            </div>

            {/* 2. School/College Branding */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
              <h3 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                2. School / College Branding
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Institution Name</label>
                  <input
                    type="text"
                    value={template.schoolName}
                    onChange={(e) => setTemplate({ ...template, schoolName: e.target.value })}
                    className="w-full h-8 rounded border border-neutral-300 px-2.5 font-bold text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Motto / Subtitle</label>
                  <input
                    type="text"
                    value={template.motto}
                    onChange={(e) => setTemplate({ ...template, motto: e.target.value })}
                    className="w-full h-8 rounded border border-neutral-300 px-2.5 font-medium text-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">Address / Location</label>
                    <input
                      type="text"
                      value={template.address}
                      onChange={(e) => setTemplate({ ...template, address: e.target.value })}
                      className="w-full h-8 rounded border border-neutral-300 px-2.5 font-medium text-neutral-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">Phone</label>
                    <input
                      type="text"
                      value={template.phone}
                      onChange={(e) => setTemplate({ ...template, phone: e.target.value })}
                      className="w-full h-8 rounded border border-neutral-300 px-2.5 font-mono text-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">Email</label>
                    <input
                      type="text"
                      value={template.email}
                      onChange={(e) => setTemplate({ ...template, email: e.target.value })}
                      className="w-full h-8 rounded border border-neutral-300 px-2.5 font-mono text-neutral-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">PAN / VAT / Reg No</label>
                    <input
                      type="text"
                      value={template.panVatNumber}
                      onChange={(e) => setTemplate({ ...template, panVatNumber: e.target.value })}
                      className="w-full h-8 rounded border border-neutral-300 px-2.5 font-mono text-neutral-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Visible Student Fields */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
              <h3 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                3. Visible Student Information Fields
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={template.showStudentName}
                    onChange={(e) => setTemplate({ ...template, showStudentName: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span>Student Name</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={template.showStudentId}
                    onChange={(e) => setTemplate({ ...template, showStudentId: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span>Student ID</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={template.showClassGrade}
                    onChange={(e) => setTemplate({ ...template, showClassGrade: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span>Class / Grade</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={template.showSection}
                    onChange={(e) => setTemplate({ ...template, showSection: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span>Section</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={template.showAcademicYear}
                    onChange={(e) => setTemplate({ ...template, showAcademicYear: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span>Academic Year</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={template.showGuardianName}
                    onChange={(e) => setTemplate({ ...template, showGuardianName: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span>Guardian Name</span>
                </label>
              </div>
            </div>

            {/* 4. Bank & Payment Information Box */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
              <h3 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-2">
                4. Bank Account & QR Code
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Bank Name</label>
                  <input
                    type="text"
                    value={template.bankName}
                    onChange={(e) => setTemplate({ ...template, bankName: e.target.value })}
                    className="w-full h-8 rounded border border-neutral-300 px-2.5 font-medium text-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">Account No</label>
                    <input
                      type="text"
                      value={template.accountNo}
                      onChange={(e) => setTemplate({ ...template, accountNo: e.target.value })}
                      className="w-full h-8 rounded border border-neutral-300 px-2.5 font-mono text-neutral-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700">Payment Mode</label>
                    <input
                      type="text"
                      value={template.paymentMode}
                      onChange={(e) => setTemplate({ ...template, paymentMode: e.target.value })}
                      className="w-full h-8 rounded border border-neutral-300 px-2.5 font-medium text-neutral-900"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={template.showQrCode}
                    onChange={(e) => setTemplate({ ...template, showQrCode: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span className="font-bold text-neutral-800">Show Digital Payment QR Code (Fonepay / eSewa)</span>
                </label>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-[4px] border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Template</span>
              </button>
            </div>

          </form>

          {/* ========================================================================= */}
          {/* RIGHT: Live Interactive Voucher Sheet Preview (7 cols)                    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-3 sticky top-6">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-t-xl border border-[var(--border-default)] border-b-0">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[var(--brand-primary)]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">
                  Live Real-Time Template Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
              >
                <span>Launch Modal</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Printable A4 Sheet Preview Container */}
            <div className={cn(
              "bg-white rounded-b-xl border border-[var(--border-default)] shadow-md p-6 sm:p-8 space-y-5 relative overflow-hidden transition-all",
              template.templateStyle === "classic" && "border-t-4 border-t-[var(--brand-primary)]",
              template.templateStyle === "modern" && "border-t-4 border-t-neutral-800 font-sans",
              template.templateStyle === "college" && "border-t-4 border-t-slate-800"
            )}>
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-200 pb-4 gap-4">
                <div className="flex items-center gap-3.5">
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
                      {template.schoolName}
                    </h1>
                    <p className="text-[11px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                      {template.motto}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {template.address}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {template.phone} | {template.email}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 mb-0.5">
                    <Building className="h-3 w-3 text-[var(--brand-primary)]" />
                    <span>Fee Invoice</span>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-neutral-900 font-sans">
                    INVOICE
                  </div>
                  <div className="mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-emerald-600 text-white shadow-2xs">
                      ORIGINAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50/80 p-3.5 rounded-lg border border-neutral-200">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                    Invoice To
                  </div>
                  {template.showStudentName && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Student Name</span>
                      <span className="col-span-2 font-bold text-neutral-900">: Aarav Sharma</span>
                    </div>
                  )}
                  {template.showStudentId && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Student ID</span>
                      <span className="col-span-2 font-mono font-bold text-[var(--brand-primary)]">: GV12345</span>
                    </div>
                  )}
                  {template.showClassGrade && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Class / Grade</span>
                      <span className="col-span-2 font-medium text-neutral-800">: Grade 10 (Science)</span>
                    </div>
                  )}
                  {template.showSection && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Section</span>
                      <span className="col-span-2 font-medium text-neutral-800">: A</span>
                    </div>
                  )}
                  {template.showAcademicYear && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500 font-medium">Academic Year</span>
                      <span className="col-span-2 text-neutral-800">: 2082 (2025-26)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pl-3 border-l border-neutral-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-transparent mb-1.5 select-none">
                    Info
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-medium">Invoice No</span>
                    <span className="col-span-2 font-mono font-bold text-neutral-900">: INV-2082-100001</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-medium">Invoice Date</span>
                    <span className="col-span-2 font-mono text-neutral-800">: 2082-04-15 (2025-07-01)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500 font-medium">Due Date</span>
                    <span className="col-span-2 font-mono text-neutral-800">: 2082-04-30 (2025-07-16)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 items-center pt-0.5">
                    <span className="text-neutral-500 font-medium">Payment Status</span>
                    <span className="col-span-2">
                      : <span className="px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={cn(
                      "text-white font-bold",
                      template.templateStyle === "classic" && "bg-[var(--brand-primary)]",
                      template.templateStyle === "modern" && "bg-neutral-800",
                      template.templateStyle === "college" && "bg-slate-800"
                    )}>
                      <th className="py-2 px-3 w-10 text-center font-semibold">SN</th>
                      <th className="py-2 px-3 font-semibold">Particulars</th>
                      <th className="py-2 px-3 font-semibold">Description</th>
                      <th className="py-2 px-3 text-right font-semibold">Amount (NPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {SAMPLE_INVOICE.items.map((item, idx) => (
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

              {/* Payment Details & Totals Split */}
              <div className="grid grid-cols-2 gap-4 items-start pt-1">
                {/* Left: Payment Box */}
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-neutral-800">
                      <CreditCard className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>Payment Details</span>
                    </div>
                    {template.showQrCode && (
                      <QrCode className="h-4 w-4 text-neutral-700" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500">Bank Name</span>
                    <span className="col-span-2 font-medium text-neutral-900">: {template.bankName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500">Account No</span>
                    <span className="col-span-2 font-mono font-bold text-neutral-900">: {template.accountNo}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-neutral-500">Payment Mode</span>
                    <span className="col-span-2 text-neutral-700">: {template.paymentMode}</span>
                  </div>
                </div>

                {/* Right: Totals Box */}
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>Sub Total</span>
                    <span className="font-mono font-semibold">142,000.00</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>Discount</span>
                    <span className="font-mono text-emerald-600 font-semibold">0.00</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs font-bold text-neutral-900 bg-rose-50/50 -mx-3 -mb-3 p-2.5 rounded-b-lg">
                    <span className="uppercase tracking-wider">Total Amount</span>
                    <span className="font-mono font-black text-sm text-[var(--brand-primary)]">
                      NPR 142,000.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Your payment has been received. Thank you for your cooperation.</span>
              </div>

              {/* Terms & Signature */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-200 items-end">
                <div className="space-y-0.5 text-[10px] text-neutral-500">
                  <div className="font-bold uppercase tracking-wider text-neutral-800 text-[10.5px] mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-neutral-600" />
                    <span>Terms & Conditions</span>
                  </div>
                  <p>• This invoice is for the selected academic term only.</p>
                  <p>• Please mention invoice number when depositing.</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="h-8"></div>
                  <div className="border-t border-neutral-400 pt-1">
                    <p className="text-xs font-bold text-neutral-900">{template.authorizedSignatureTitle}</p>
                    <p className="text-[10px] text-neutral-500">{template.schoolName}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Wave Ribbon */}
              <div className={cn(
                "mt-3 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 py-3 px-6 text-white flex items-center justify-center transition-colors",
                template.templateStyle === "classic" && "bg-[var(--brand-primary)]",
                template.templateStyle === "modern" && "bg-neutral-800",
                template.templateStyle === "college" && "bg-slate-800"
              )}>
                <span className="text-xs font-semibold tracking-wider italic">
                  &ldquo;{template.tagline}&rdquo;
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Full Screen Live Invoice Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        invoice={liveInvoiceData}
        allInvoices={[liveInvoiceData]}
      />
    </div>
  );
}
