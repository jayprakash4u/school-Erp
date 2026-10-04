"use client";

import * as React from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  CreditCard,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Save,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function PaymentBankSettingsPage() {
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Payment & Bank Settings
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs border border-slate-200">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Payment & Bank Settings
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage official school bank deposit accounts, eSewa / Khalti merchant APIs, and QR billing codes
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          {/* Primary Bank Account */}
          <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-light)]">
              <Building2 className="h-4 w-4 text-[var(--brand-primary)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Primary School Bank Account
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Bank Name</label>
                <input
                  type="text"
                  defaultValue="Nabil Bank Limited"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Account Name</label>
                <input
                  type="text"
                  defaultValue="School ERP Academic Fund A/C"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Account Number</label>
                <input
                  type="text"
                  defaultValue="01200175002849"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Branch & Swift / Routing</label>
                <input
                  type="text"
                  defaultValue="Kathmandu Main Branch (NABINPKA)"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Digital Payment Gateways */}
          <div className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-light)]">
              <QrCode className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Digital Payment Gateways (eSewa, Khalti, Fonepay)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">eSewa Merchant Service Code (SCD)</label>
                <input
                  type="text"
                  defaultValue="EPAYTEST"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Khalti Public Key</label>
                <input
                  type="text"
                  defaultValue="test_public_key_849204928"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Fonepay Merchant ID</label>
                <input
                  type="text"
                  defaultValue="FP-MERCHANT-8492"
                  className="w-full h-8 px-3 rounded border border-[var(--border-default)] text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--text-secondary)]">Auto-Receipt Generation</label>
                <select className="w-full h-8 px-2 rounded border border-[var(--border-default)] bg-white text-xs">
                  <option>Enabled (Instant Digital Receipt & SMS)</option>
                  <option>Require Manual Verification by Cashier</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-semibold text-emerald-600">
                ✓ Payment & Bank Settings updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[6px] bg-[var(--brand-primary)] text-white text-xs font-semibold hover:bg-[var(--brand-primary-hover)] shadow-xs transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
