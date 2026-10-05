"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  ChevronRight,
  Filter,
  Download,
  Printer,
  Calendar,
  Landmark,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

type BookTab = "cash" | "bank" | "reconciliation";

export default function CashBankBooksPage() {
  const [activeTab, setActiveTab] = React.useState<BookTab>("cash");
  const [selectedBank, setSelectedBank] = React.useState("sbi");

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
          <span className="font-semibold text-[var(--text-primary)]">Cash & Bank Books</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Cash & Bank Books
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Real-time registers for counter cash, petty cash drawers, bank accounts, and BRS reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Book</span>
            </button>
            <button
              onClick={() => alert("Exporting Cash/Bank statement...")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Register</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab("cash")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "cash"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Cash Book (Counter & Petty Cash)</span>
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "bank"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Bank Books</span>
          </button>

          <button
            onClick={() => setActiveTab("reconciliation")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "reconciliation"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Bank Reconciliation (BRS)</span>
          </button>
        </div>

        {/* Tab 1: Cash Book */}
        {activeTab === "cash" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
                <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase">Opening Cash Balance</div>
                <div className="text-lg font-bold text-[var(--text-primary)] mt-1">₹1,25,000</div>
              </div>
              <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
                <div className="text-[11px] font-semibold text-emerald-600 uppercase">Cash Inflow (Today)</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">+₹31,200</div>
              </div>
              <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
                <div className="text-[11px] font-semibold text-rose-600 uppercase">Cash Outflow / Expenses</div>
                <div className="text-lg font-bold text-rose-600 mt-1">-₹14,200</div>
              </div>
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Cash Book Register (1001 - Cash in Hand)
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">Closing Balance: ₹1,42,000</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-neutral-50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Voucher #</th>
                      <th className="py-2.5 px-3">Particulars</th>
                      <th className="py-2.5 px-3 text-right">Receipts (Cash In)</th>
                      <th className="py-2.5 px-3 text-right">Payments (Cash Out)</th>
                      <th className="py-2.5 px-3 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    <tr className="hover:bg-neutral-50/70">
                      <td className="py-3 px-3">2026-10-04</td>
                      <td className="py-3 px-3 font-mono text-[var(--brand-primary)]">REC-8920</td>
                      <td className="py-3 px-3">Counter Fee Cash Receipt - Aditya V.</td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">₹31,200</td>
                      <td className="py-3 px-3 text-right text-neutral-400">-</td>
                      <td className="py-3 px-3 text-right font-bold">₹1,56,200</td>
                    </tr>
                    <tr className="hover:bg-neutral-50/70">
                      <td className="py-3 px-3">2026-10-02</td>
                      <td className="py-3 px-3 font-mono text-[var(--brand-primary)]">PV-2026-093</td>
                      <td className="py-3 px-3">Stationery & Printer Paper purchase (Apex Ltd)</td>
                      <td className="py-3 px-3 text-right text-neutral-400">-</td>
                      <td className="py-3 px-3 text-right font-medium text-rose-600">₹14,200</td>
                      <td className="py-3 px-3 text-right font-bold">₹1,42,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bank Book */}
        {activeTab === "bank" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedBank("sbi")}
                className={`px-3 py-2 rounded-[6px] text-xs font-bold border transition-colors ${
                  selectedBank === "sbi"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-neutral-600 border-[var(--border-default)]"
                }`}
              >
                State Bank of India (A/C: ****9821) - ₹32,08,000
              </button>
              <button
                onClick={() => setSelectedBank("hdfc")}
                className={`px-3 py-2 rounded-[6px] text-xs font-bold border transition-colors ${
                  selectedBank === "hdfc"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-neutral-600 border-[var(--border-default)]"
                }`}
              >
                HDFC Fee Collection A/C (A/C: ****4412) - ₹15,00,000
              </button>
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {selectedBank === "sbi" ? "SBI Operations Account Statement (1010)" : "HDFC Collection Account Statement (1020)"}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">Bank Cleared Status: Reconciled</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-neutral-50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Cheque / UTR #</th>
                      <th className="py-2.5 px-3">Particulars</th>
                      <th className="py-2.5 px-3 text-right">Deposits / Credits</th>
                      <th className="py-2.5 px-3 text-right">Withdrawals / Debits</th>
                      <th className="py-2.5 px-3 text-right">Bank Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    <tr className="hover:bg-neutral-50/70">
                      <td className="py-3 px-3">2026-10-04</td>
                      <td className="py-3 px-3 font-mono text-[var(--brand-primary)]">UTR-991204</td>
                      <td className="py-3 px-3">Online Fee Gateway Settlement (Razorpay)</td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">₹85,000</td>
                      <td className="py-3 px-3 text-right text-neutral-400">-</td>
                      <td className="py-3 px-3 text-right font-bold">₹32,08,000</td>
                    </tr>
                    <tr className="hover:bg-neutral-50/70">
                      <td className="py-3 px-3">2026-10-04</td>
                      <td className="py-3 px-3 font-mono text-[var(--brand-primary)]">NEFT-44109</td>
                      <td className="py-3 px-3">Electricity Bill NEFT Payment (State Electricity)</td>
                      <td className="py-3 px-3 text-right text-neutral-400">-</td>
                      <td className="py-3 px-3 text-right font-medium text-rose-600">₹48,500</td>
                      <td className="py-3 px-3 text-right font-bold">₹31,23,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reconciliation */}
        {activeTab === "reconciliation" && (
          <div className="p-8 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Bank Reconciliation Statement (BRS)</h3>
            <p className="text-xs text-[var(--text-tertiary)] max-w-md mx-auto">
              Match unpresented cheques, uncleared deposits, and direct bank debits with your ERP general ledger statement.
            </p>
            <button
              onClick={() => alert("Upload Bank e-Statement CSV for automatic AI matching")}
              className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] text-white shadow-xs"
            >
              Upload Bank Statement (CSV/OFX)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
