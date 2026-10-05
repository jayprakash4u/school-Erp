"use client";

import * as React from "react";
import Link from "next/link";
import {
  Settings,
  ChevronRight,
  Save,
  Lock,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function AccountingSettingsPage() {
  const [fiscalYear, setFiscalYear] = React.useState("2026-2027");
  const [lockDate, setLockDate] = React.useState("2026-03-31");
  const [autoPostFee, setAutoPostFee] = React.useState(true);
  const [autoPostPayroll, setAutoPostPayroll] = React.useState(true);
  const [jvPrefix, setJvPrefix] = React.useState("JV-2026-");
  const [pvPrefix, setPvPrefix] = React.useState("PV-2026-");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Institutional accounting settings saved successfully!");
  };

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
          <span className="font-semibold text-[var(--text-primary)]">Accounting Settings</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Accounting Settings & Integration Rules
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure fiscal financial periods, auto-posting hooks for fee/payroll, and voucher numbering
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="max-w-3xl space-y-6 text-xs">
          {/* Section 1: Financial Year & Lock Period */}
          <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-light)] font-bold text-sm text-[var(--text-primary)]">
              <Calendar className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>Fiscal Year & Period Lock</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Active Fiscal Financial Year</label>
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white font-medium"
                >
                  <option value="2026-2027">FY 2026-2027 (Apr 1, 2026 - Mar 31, 2027)</option>
                  <option value="2025-2026">FY 2025-2026 (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Lock Closed Period Before</label>
                <input
                  type="date"
                  value={lockDate}
                  onChange={(e) => setLockDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">No retrospective vouchers can be posted prior to this date.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Auto Posting Rules */}
          <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-light)] font-bold text-sm text-[var(--text-primary)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>Automated Double-Entry Posting Rules</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-[6px] bg-neutral-50 border border-[var(--border-default)]">
                <input
                  type="checkbox"
                  id="autoFee"
                  checked={autoPostFee}
                  onChange={(e) => setAutoPostFee(e.target.checked)}
                  className="mt-0.5 rounded text-[var(--brand-primary)]"
                />
                <label htmlFor="autoFee" className="cursor-pointer">
                  <div className="font-semibold text-[var(--text-primary)]">Auto-Post Fee Collections to General Ledger</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    Whenever a cashier receipts fee collection, automatically debit Cash/Bank (1001/1010) and credit Tuition/Development Fee Income (4001).
                  </div>
                </label>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[6px] bg-neutral-50 border border-[var(--border-default)]">
                <input
                  type="checkbox"
                  id="autoPay"
                  checked={autoPostPayroll}
                  onChange={(e) => setAutoPostPayroll(e.target.checked)}
                  className="mt-0.5 rounded text-[var(--brand-primary)]"
                />
                <label htmlFor="autoPay" className="cursor-pointer">
                  <div className="font-semibold text-[var(--text-primary)]">Auto-Post Approved Monthly Payroll to General Ledger</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    When salary disbursements are generated in HR/Payroll, create Salary Expense (5100) debit and Salary Payable (2001) credit entries.
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Voucher Prefixes */}
          <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-light)] font-bold text-sm text-[var(--text-primary)]">
              <Layers className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>Voucher Numbering Series</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Journal Voucher (JV) Prefix</label>
                <input
                  type="text"
                  value={jvPrefix}
                  onChange={(e) => setJvPrefix(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Payment Voucher (PV) Prefix</label>
                <input
                  type="text"
                  value={pvPrefix}
                  onChange={(e) => setPvPrefix(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Accounting Configuration</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
