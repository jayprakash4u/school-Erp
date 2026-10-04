"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Sliders,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  Building,
  Coins,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  Hash,
  FileCheck,
  Lock,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  InvoiceSetupConfig,
  DEFAULT_INVOICE_SETUP,
} from "@/types/invoice-setup";
import {
  getStoredInvoiceSetup,
  saveStoredInvoiceSetup,
} from "@/lib/invoice-settings-store";

export default function InvoiceSetupPage() {
  const [config, setConfig] = React.useState<InvoiceSetupConfig>(DEFAULT_INVOICE_SETUP);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [isResetConfirm, setIsResetConfirm] = React.useState(false);

  React.useEffect(() => {
    setConfig(getStoredInvoiceSetup());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredInvoiceSetup(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setConfig(DEFAULT_INVOICE_SETUP);
    saveStoredInvoiceSetup(DEFAULT_INVOICE_SETUP);
    setIsResetConfirm(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Compute live sample invoice number from format
  const sampleNumber = React.useMemo(() => {
    const yr = new Date().getFullYear().toString();
    const no = config.numberStartFrom.toString();
    return config.numberFormat
      .replace("{YYYY}", yr)
      .replace("{NO}", no)
      .replace("{PREFIX}", config.prefix);
  }, [config.numberFormat, config.numberStartFrom, config.prefix]);

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
              <span className="font-semibold text-neutral-900">Invoice & Receipt Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--brand-primary)]" />
                <span>Invoice & Receipt Behavior Setup</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-[var(--brand-primary)] border border-rose-200">
                Financial Engine
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure automated invoice numbering, multi-copy printing rules, financial constraints, and voucher policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.INVOICE_TEMPLATE}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>Template Designer &rarr;</span>
            </Link>

            <Link
              href={ROUTES.FEES.INVOICES}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileCheck className="h-3.5 w-3.5 text-neutral-600" />
              <span>Invoices List</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {savedSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium animate-in fade-in-0 duration-200 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Invoice Setup rules have been saved successfully and applied to all billing workflows!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: Config Settings (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. General & Document Numbering */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="text-sm font-bold text-neutral-900">1. General Document & Numbering</h2>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">Auto-Sequence</span>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Document Type */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Document Type</label>
                  <select
                    value={config.documentType}
                    onChange={(e) => setConfig({ ...config, documentType: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Fee Invoice">Fee Invoice</option>
                    <option value="Payment Receipt">Payment Receipt</option>
                    <option value="Fee Due Notice">Fee Due Notice</option>
                    <option value="Salary Voucher">Salary Voucher</option>
                  </select>
                  <p className="text-[11px] text-neutral-400">Controls the primary title and ledger categorization.</p>
                </div>

                {/* Prefix */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Prefix</label>
                  <input
                    type="text"
                    value={config.prefix}
                    onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-mono font-bold text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="INV-"
                  />
                  <p className="text-[11px] text-neutral-400">e.g. INV-, REC-, SCH-2082-</p>
                </div>

                {/* Number Start From */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Number Start From</label>
                  <input
                    type="number"
                    value={config.numberStartFrom}
                    onChange={(e) => setConfig({ ...config, numberStartFrom: parseInt(e.target.value) || 1 })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-mono font-bold text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-neutral-400">Starting serial sequence for new invoices.</p>
                </div>

                {/* Number Format */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Number Format Pattern</label>
                  <input
                    type="text"
                    value={config.numberFormat}
                    onChange={(e) => setConfig({ ...config, numberFormat: e.target.value })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-mono text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="INV-{YYYY}-{NO}"
                  />
                  <p className="text-[11px] text-neutral-400">Tokens: &#123;PREFIX&#125;, &#123;YYYY&#125;, &#123;NO&#125;</p>
                </div>

                {/* Live Sample Preview Bar */}
                <div className="sm:col-span-2 p-3 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-600">Sample Generated Number:</span>
                  <span className="font-mono font-bold text-sm text-[var(--brand-primary)] px-2.5 py-0.5 rounded bg-white border border-neutral-200">
                    {sampleNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Financial & Currency Settings */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="text-sm font-bold text-neutral-900">2. Financial & Calculations</h2>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Currency */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Default Currency</label>
                  <select
                    value={config.currency}
                    onChange={(e) => setConfig({ ...config, currency: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="NPR">NPR (Nepalese Rupee - Rs.)</option>
                    <option value="INR">INR (Indian Rupee - ₹)</option>
                    <option value="USD">USD (US Dollar - $)</option>
                    <option value="EUR">EUR (Euro - €)</option>
                    <option value="GBP">GBP (British Pound - £)</option>
                  </select>
                </div>

                {/* Tax Rate */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Tax / VAT Rate (%)</label>
                  <input
                    type="number"
                    disabled={!config.taxEnabled}
                    value={config.taxRate}
                    onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) || 0 })}
                    className={cn(
                      "w-full h-9 rounded-md border border-[var(--border-default)] px-3 font-mono text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]",
                      !config.taxEnabled ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" : "bg-white"
                    )}
                  />
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-neutral-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.taxEnabled}
                      onChange={(e) => setConfig({ ...config, taxEnabled: e.target.checked })}
                      className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                    />
                    <span className="font-medium text-neutral-800">Enable Tax / Educational VAT line item</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.discountEnabled}
                      onChange={(e) => setConfig({ ...config, discountEnabled: e.target.checked })}
                      className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                    />
                    <span className="font-medium text-neutral-800">Enable Scholarships & Discount Deductions on invoice</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.fineLateFeeEnabled}
                      onChange={(e) => setConfig({ ...config, fineLateFeeEnabled: e.target.checked })}
                      className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                    />
                    <span className="font-medium text-neutral-800">Include Automated Late Fines & Overdue Penalties</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Printing & Multi-Copy Voucher Rules */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="text-sm font-bold text-neutral-900">3. Printing & Multi-Copy Voucher Structure</h2>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Dual-Copy Printing
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Paper Size */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Paper Size</label>
                  <select
                    value={config.paperSize}
                    onChange={(e) => setConfig({ ...config, paperSize: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="A4">A4 (Standard Full Sheet / Dual Half Slips)</option>
                    <option value="A5">A5 (Compact Voucher Sheet)</option>
                    <option value="Thermal 80mm">Thermal POS 80mm (Counter Receipt)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Orientation</label>
                  <select
                    value={config.orientation}
                    onChange={(e) => setConfig({ ...config, orientation: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                {/* Number of Copies */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Number of Printed Copies per Transaction</label>
                  <select
                    value={config.numberOfCopies}
                    onChange={(e) => setConfig({ ...config, numberOfCopies: parseInt(e.target.value) || 1 })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value={1}>1 Copy (Single Slip)</option>
                    <option value={2}>2 Copies (Student Copy + Office Copy)</option>
                    <option value={3}>3 Copies (Student + Office + Bank Copy)</option>
                  </select>
                </div>

                {/* Print Layout */}
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Layout Arrangement on Single Sheet</label>
                  <select
                    value={config.printLayout}
                    onChange={(e) => setConfig({ ...config, printLayout: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="dual-side-by-side">Side-by-Side (2 Slips per A4 Page)</option>
                    <option value="dual-stacked">Stacked Top-Bottom (2 Slips per A4 Page)</option>
                    <option value="single-page">Single Voucher per Page</option>
                  </select>
                </div>

                {/* Copy Labels */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-600 text-[11px]">Copy 1 Label</label>
                    <input
                      type="text"
                      value={config.copy1Label}
                      onChange={(e) => setConfig({ ...config, copy1Label: e.target.value })}
                      className="w-full h-8 rounded border border-[var(--border-default)] bg-white px-2.5 font-medium text-neutral-900 text-xs"
                      placeholder="Student Copy"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-600 text-[11px]">Copy 2 Label</label>
                    <input
                      type="text"
                      value={config.copy2Label}
                      onChange={(e) => setConfig({ ...config, copy2Label: e.target.value })}
                      className="w-full h-8 rounded border border-[var(--border-default)] bg-white px-2.5 font-medium text-neutral-900 text-xs"
                      placeholder="Office Copy"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-600 text-[11px]">Copy 3 Label</label>
                    <input
                      type="text"
                      value={config.copy3Label}
                      onChange={(e) => setConfig({ ...config, copy3Label: e.target.value })}
                      className="w-full h-8 rounded border border-[var(--border-default)] bg-white px-2.5 font-medium text-neutral-900 text-xs"
                      placeholder="Accounts Copy"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Invoice Behavioral Rules */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="text-sm font-bold text-neutral-900">4. ERP Invoice Security & Rules</h2>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
                  <input
                    type="checkbox"
                    checked={config.generateUniqueNumber}
                    onChange={(e) => setConfig({ ...config, generateUniqueNumber: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Generate unique invoice number (once)</span>
                    <span className="text-[11px] text-neutral-500">Locks sequence generation to prevent gaps and skips.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
                  <input
                    type="checkbox"
                    checked={config.preventDuplicateNumber}
                    onChange={(e) => setConfig({ ...config, preventDuplicateNumber: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Prevent duplicate invoice number</span>
                    <span className="text-[11px] text-neutral-500">Database constraint check before issuing receipt.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
                  <input
                    type="checkbox"
                    checked={config.showPaymentStatus}
                    onChange={(e) => setConfig({ ...config, showPaymentStatus: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Show payment status badge</span>
                    <span className="text-[11px] text-neutral-500">Displays Paid, Partial, or Due badge clearly on voucher.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
                  <input
                    type="checkbox"
                    checked={config.allowReprint}
                    onChange={(e) => setConfig({ ...config, allowReprint: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Allow invoice / receipt reprint</span>
                    <span className="text-[11px] text-neutral-500">Permits cashier to regenerate past vouchers.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
                  <input
                    type="checkbox"
                    checked={config.markReprintAsCopy}
                    onChange={(e) => setConfig({ ...config, markReprintAsCopy: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Mark reprint as DUPLICATE / COPY</span>
                    <span className="text-[11px] text-neutral-500">Shows ORIGINAL on 1st print and DUPLICATE on re-prints.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
                  <input
                    type="checkbox"
                    checked={config.lockInvoiceAfterPayment}
                    onChange={(e) => setConfig({ ...config, lockInvoiceAfterPayment: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 block">Lock invoice after payment</span>
                    <span className="text-[11px] text-neutral-500">Prevents editing charge amounts once payment is settled.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 5. Numbering Strategy & Fiscal Year */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="text-sm font-bold text-neutral-900">5. Branch & Fiscal Year Partitioning</h2>
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.separateByBranch}
                    onChange={(e) => setConfig({ ...config, separateByBranch: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span className="font-bold text-neutral-800">Separate numbering by school branch / campus</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.separateByFiscalYear}
                    onChange={(e) => setConfig({ ...config, separateByFiscalYear: e.target.checked })}
                    className="rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <span className="font-bold text-neutral-800">Reset invoice numbering sequence annually per fiscal year</span>
                </label>
              </div>
            </div>

            {/* 6. Footer & Policies */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="text-sm font-bold text-neutral-900">6. Terms & Footer Policy Text</h2>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Terms & Conditions (Printed on bottom left)</label>
                  <textarea
                    rows={3}
                    value={config.termsAndConditions}
                    onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                    className="w-full rounded-md border border-[var(--border-default)] bg-white p-2.5 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700">Footer Tagline Message</label>
                  <input
                    type="text"
                    value={config.footerMessage}
                    onChange={(e) => setConfig({ ...config, footerMessage: e.target.value })}
                    className="w-full h-9 rounded-md border border-[var(--border-default)] bg-white px-3 font-medium text-neutral-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right: Summary Card & Architecture Info (4 cols) */}
          <div className="lg:col-span-4 space-y-5 sticky top-6">
            
            {/* Action Bar Card */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
              <h3 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider">
                Save & Apply Settings
              </h3>
              <p className="text-xs text-neutral-500">
                Saving will instantly update the invoice generation sequence and dual-copy printing rules across the ERP.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirm(true)}
                  className="flex-1 py-2.5 rounded-[4px] border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Setup</span>
                </button>
              </div>

              {isResetConfirm && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 animate-in fade-in-0">
                  <p className="font-bold">Reset all settings to system default values?</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResetConfirm(false)}
                      className="px-2.5 py-1 rounded border border-rose-300 text-rose-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Flow Diagram Card */}
            <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-xs p-4 space-y-3">
              <h3 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <span>ERP Document Architecture</span>
              </h3>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono space-y-2">
                <div className="text-center font-bold text-neutral-800 bg-white p-1.5 rounded border border-neutral-200">
                  1 PAYMENT = 1 INVOICE NO
                </div>
                <div className="text-center text-neutral-400">&darr;</div>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
                  <div className="p-1.5 bg-rose-50 border border-rose-200 text-[var(--brand-primary)] rounded">
                    {config.copy1Label}
                  </div>
                  <div className="p-1.5 bg-slate-100 border border-slate-300 text-slate-800 rounded">
                    {config.copy2Label}
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-500 space-y-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Paper: <strong>{config.paperSize}</strong> ({config.orientation})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Copies: <strong>{config.numberOfCopies} Voucher Slips</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Currency: <strong>{config.currency}</strong></span>
                </div>
              </div>
            </div>

          </div>

        </form>
      </main>
    </div>
  );
}
