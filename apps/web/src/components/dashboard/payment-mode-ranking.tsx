"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PaymentModeItem {
  rank: number;
  channelName: string;
  amount: string;
}

const PAYMENT_MODE_DATA: PaymentModeItem[] = [
  { rank: 1, channelName: "School Cash Counter", amount: "NPR 890,000" },
  { rank: 2, channelName: "eSewa Mobile Wallet", amount: "NPR 420,000" },
  { rank: 3, channelName: "Fonepay / Bank QR", amount: "NPR 260,000" },
  { rank: 4, channelName: "Khalti Digital Wallet", amount: "NPR 150,000" },
  { rank: 5, channelName: "POS Terminal (Cards)", amount: "NPR 125,000" },
];

export function PaymentModeRanking() {
  return (
    <div className="rounded-[6px] border border-[var(--border-default)] bg-white shadow-xs overflow-hidden">
      {/* Card Header matching ERP Brand Design */}
      <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Payment Mode Revenue
        </h3>
        <Link
          href="/fees/reports"
          className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
        >
          <span>Ledger</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Numbered Rows with Obsidian Dark Badges */}
      <div className="divide-y divide-[var(--border-light)] text-xs">
        {PAYMENT_MODE_DATA.map((item) => (
          <div
            key={item.rank}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--neutral-50)] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Obsidian Dark Solid Number Badge */}
              <div className="h-5 w-5 rounded-[3px] bg-[var(--brand-secondary)] text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                {item.rank}
              </div>
              <span className="font-medium text-[var(--text-primary)] truncate">
                {item.channelName}
              </span>
            </div>

            <span className="font-mono font-bold text-[var(--neutral-800)] text-right shrink-0">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
