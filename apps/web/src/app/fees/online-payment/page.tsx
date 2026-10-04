"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

export default function OnlinePaymentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fee & Accounts
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Online Payment Gateway
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-200">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Online Payment & Portal Sync
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Real-time parent digital transaction feed, eSewa, Khalti, ConnectIPS and Mobile Banking reconciliation
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">Today Online Collections</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">NPR 182,400</div>
            <span className="text-[10px] text-neutral-400">28 successful transactions</span>
          </div>
          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">eSewa Merchant Status</span>
            <div className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected & Live
            </div>
            <span className="text-[10px] text-neutral-400">Response time: ~120ms</span>
          </div>
          <div className="p-4 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">Khalti & Fonepay</span>
            <div className="text-sm font-bold text-neutral-800 mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected & Live
            </div>
            <span className="text-[10px] text-neutral-400">Dynamic QR generated</span>
          </div>
        </div>
      </main>
    </div>
  );
}
