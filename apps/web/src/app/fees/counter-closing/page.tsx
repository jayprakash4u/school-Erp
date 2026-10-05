"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  ChevronRight,
  Download,
  Printer,
  Coins,
  CreditCard,
  QrCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function CounterClosingPage() {
  const [cashierName] = React.useState("Ramesh Kumar (Counter #1)");
  const [shiftTime] = React.useState("08:00 AM - 04:00 PM");
  const [closingDate] = React.useState("2026-10-05");

  // System collection totals
  const systemTotals = {
    cash: 31200,
    upi: 48500,
    card: 22000,
    cheque: 15000,
    total: 116700,
  };

  // Denominations state
  const [denominations, setDenominations] = React.useState<Record<number, number>>({
    500: 58, // 29000
    200: 8,  // 1600
    100: 6,  // 600
    50: 0,
    20: 0,
    10: 0,
  });

  const [counterNotes, setCounterNotes] = React.useState("");
  const [isClosed, setIsClosed] = React.useState(false);

  const physicalCashTotal = Object.entries(denominations).reduce(
    (sum, [denom, count]) => sum + Number(denom) * (Number(count) || 0),
    0
  );

  const cashDiscrepancy = physicalCashTotal - systemTotals.cash;

  const handleDenomChange = (denom: number, val: string) => {
    setDenominations({
      ...denominations,
      [denom]: parseInt(val, 10) || 0,
    });
  };

  const handleCloseCounter = (e: React.FormEvent) => {
    e.preventDefault();
    setIsClosed(true);
    alert("Counter closed successfully! Daily collection scroll generated and sent to Head Accountant.");
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
          <span className="text-[var(--text-secondary)]">Billing & Collection</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">Counter Closing & Cash Audit</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Daily Counter Closing & Cash Reconciliation
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Cashier shift reconciliation, physical currency denomination tally, and daily collection scroll
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] border border-[var(--border-default)] bg-white hover:bg-neutral-50 text-[var(--text-secondary)] shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Daily Scroll</span>
            </button>
          </div>
        </div>

        {/* Shift Information Bar */}
        <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[var(--brand-primary)]" />
            <span className="font-semibold text-[var(--text-primary)]">Cashier:</span>
            <span className="text-[var(--text-secondary)]">{cashierName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--brand-primary)]" />
            <span className="font-semibold text-[var(--text-primary)]">Shift:</span>
            <span className="text-[var(--text-secondary)]">{shiftTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">Date:</span>
            <span className="text-[var(--text-secondary)]">{closingDate}</span>
          </div>
          <div>
            <span
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                isClosed ? "bg-neutral-100 text-neutral-600" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isClosed ? "Counter Closed" : "Counter Active"}
            </span>
          </div>
        </div>

        {/* Mode-Wise Collection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase">Cash</span>
              <Coins className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-1">
              ₹{systemTotals.cash.toLocaleString()}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">8 Receipts</div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase">UPI / QR</span>
              <QrCode className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-1">
              ₹{systemTotals.upi.toLocaleString()}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">14 Receipts</div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase">Card (POS)</span>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-1">
              ₹{systemTotals.card.toLocaleString()}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">3 Transactions</div>
          </div>

          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase">Cheque / DD</span>
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-1">
              ₹{systemTotals.cheque.toLocaleString()}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">1 Cheque</div>
          </div>

          <div className="p-4 rounded-[8px] bg-[var(--brand-primary)] text-white shadow-xs">
            <div className="text-[11px] font-semibold uppercase text-red-100">Total Shift Inflow</div>
            <div className="text-xl font-bold mt-1">
              ₹{systemTotals.total.toLocaleString()}
            </div>
            <div className="text-[10px] text-red-100 mt-0.5">26 Total Transactions</div>
          </div>
        </div>

        {/* Physical Cash Denomination Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Physical Cash Drawer Denomination Counter
              </h3>
              <span className="text-xs text-[var(--text-tertiary)]">Enter note counts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[500, 200, 100, 50, 20, 10].map((denom) => (
                <div key={denom} className="p-2.5 rounded-[6px] border border-[var(--border-default)] bg-neutral-50/50 flex items-center justify-between gap-2">
                  <span className="font-bold text-[var(--text-primary)] font-mono">₹{denom} x</span>
                  <input
                    type="number"
                    min="0"
                    value={denominations[denom] || 0}
                    onChange={(e) => handleDenomChange(denom, e.target.value)}
                    className="w-16 px-2 py-1 text-center font-mono rounded border border-[var(--border-default)] bg-white text-xs"
                  />
                  <span className="text-neutral-500 font-medium text-[11px]">
                    = ₹{((denominations[denom] || 0) * denom).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-primary)]">Total Physical Cash Counted:</span>
              <span className="text-base font-bold text-emerald-600 font-mono">
                ₹{physicalCashTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Reconciliation Audit Box */}
          <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 flex flex-col justify-between space-y-4 text-xs">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Shift Audit Summary</h3>

              <div className="space-y-2 py-2 border-y border-[var(--border-light)]">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>System Cash Expected:</span>
                  <span className="font-semibold">₹{systemTotals.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Physical Cash Counted:</span>
                  <span className="font-semibold">₹{physicalCashTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-light)]">
                  <span>Variance / Discrepancy:</span>
                  <span className={cashDiscrepancy === 0 ? "text-emerald-600" : "text-red-600"}>
                    {cashDiscrepancy === 0 ? "₹0 (Balanced)" : `₹${cashDiscrepancy.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Cashier Handover Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes regarding cash handover to main safe..."
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[var(--border-default)] text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleCloseCounter}
              disabled={isClosed}
              className="w-full py-2.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white shadow-xs disabled:bg-neutral-300 cursor-pointer"
            >
              {isClosed ? "Counter Closed & Reconciled" : "Close Counter & Generate Daily Scroll"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
