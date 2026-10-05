"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSignature,
  Plus,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Printer,
  Calendar,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

interface JournalLine {
  accountHead: string;
  debit: number;
  credit: number;
}

export default function JournalEntriesPage() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [journalDate, setJournalDate] = React.useState("2026-10-05");
  const [narration, setNarration] = React.useState("");
  const [lines, setLines] = React.useState<JournalLine[]>([
    { accountHead: "5200 - Electricity & Utilities", debit: 15000, credit: 0 },
    { accountHead: "2010 - Accounts Payable", debit: 0, credit: 15000 },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const handleAddLine = () => {
    setLines([...lines, { accountHead: "1001 - Cash in Hand", debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (index: number, field: keyof JournalLine, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
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
          <span className="font-semibold text-[var(--text-primary)]">Journal Entries</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Journal Entries (JV)
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Record manual adjustments, inter-account transfers, year-end provisions, and corrections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isCreating ? "View Recent Journals" : "New Journal Voucher"}</span>
            </button>
          </div>
        </div>

        {/* Journal Creation Form */}
        {isCreating ? (
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Create Journal Voucher</h2>
                <p className="text-xs text-[var(--text-tertiary)]">Debit and credit amounts must exactly balance.</p>
              </div>
              <div className="text-xs font-mono font-semibold text-[var(--brand-primary)]">
                Voucher #: JV-2026-108
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Voucher Date *</label>
                <input
                  type="date"
                  value={journalDate}
                  onChange={(e) => setJournalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Journal Type</label>
                <select className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]">
                  <option>Adjustment Voucher</option>
                  <option>Inter-Account Transfer</option>
                  <option>Year-End Closing Entry</option>
                  <option>Depreciation Provision</option>
                </select>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[var(--border-default)] rounded-[6px] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-3">Account Head</th>
                    <th className="py-2.5 px-3 w-40 text-right">Debit (Dr) ₹</th>
                    <th className="py-2.5 px-3 w-40 text-right">Credit (Cr) ₹</th>
                    <th className="py-2.5 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <select
                          value={l.accountHead}
                          onChange={(e) => handleLineChange(idx, "accountHead", e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] bg-white text-xs"
                        >
                          <option value="5200 - Electricity & Utilities">5200 - Electricity & Utilities</option>
                          <option value="2010 - Accounts Payable">2010 - Accounts Payable</option>
                          <option value="1001 - Cash in Hand">1001 - Cash in Hand</option>
                          <option value="1010 - SBI Operations A/C">1010 - SBI Operations A/C</option>
                          <option value="4001 - Tuition Fee Income">4001 - Tuition Fee Income</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={l.debit || ""}
                          onChange={(e) => handleLineChange(idx, "debit", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] text-right text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={l.credit || ""}
                          onChange={(e) => handleLineChange(idx, "credit", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded border border-[var(--border-default)] text-right text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-50 font-bold border-t border-[var(--border-default)]">
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={handleAddLine}
                        className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        + Add Line
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700">₹{totalDebit.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">₹{totalCredit.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      {isBalanced ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1 text-xs">Narration / Detailed Reason *</label>
              <textarea
                rows={2}
                placeholder="Narration explaining the debit and credit journal posting..."
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-[var(--border-default)] bg-white text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isBalanced}
                onClick={() => {
                  alert("Journal Voucher JV-2026-108 saved and posted!");
                  setIsCreating(false);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-[6px] text-white shadow-xs ${
                  isBalanced
                    ? "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] cursor-pointer"
                    : "bg-neutral-300 cursor-not-allowed"
                }`}
              >
                Post Journal Entry
              </button>
            </div>
          </div>
        ) : (
          /* Recent Journals List */
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Posted Journal Vouchers (Current Financial Year)
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Double-entry balanced records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-neutral-50/50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Narration</th>
                    <th className="py-2.5 px-3 text-right">Debit (Dr) Total</th>
                    <th className="py-2.5 px-3 text-right">Credit (Cr) Total</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  <tr className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 text-[var(--text-secondary)]">2026-10-01</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[var(--brand-primary)]">JV-SAL-09</td>
                    <td className="py-3 px-3 text-[var(--text-primary)]">Monthly Staff Salary Provision for Sept 2026</td>
                    <td className="py-3 px-3 text-right font-bold">₹12,00,000</td>
                    <td className="py-3 px-3 text-right font-bold">₹12,00,000</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Posted
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 text-[var(--text-secondary)]">2026-09-25</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[var(--brand-primary)]">JV-ADV-44</td>
                    <td className="py-3 px-3 text-[var(--text-primary)]">Staff Festival Advance Deduction & Transfer</td>
                    <td className="py-3 px-3 text-right font-bold">₹35,000</td>
                    <td className="py-3 px-3 text-right font-bold">₹35,000</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Posted
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
