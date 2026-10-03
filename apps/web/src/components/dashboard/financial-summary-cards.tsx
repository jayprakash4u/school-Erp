"use client";

import * as React from "react";
import { Receipt, Coins, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BillingRow {
  period: "Today" | "Month" | "All";
  amount: string;
  count: string;
}

interface SummaryCardProps {
  title: string;
  headerBg: string;
  headerTextColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  rows: BillingRow[];
  linkHref: string;
}

const BILLING_SUMMARY_DATA: SummaryCardProps[] = [
  {
    title: "Fee Invoiced / Billing",
    headerBg: "bg-[var(--brand-secondary)]",
    headerTextColor: "text-white",
    icon: Receipt,
    iconColor: "text-[var(--brand-accent)]",
    linkHref: "/fees/invoices",
    rows: [
      { period: "Today", amount: "NPR 45,200", count: "18 Invoices" },
      { period: "Month", amount: "NPR 1,845,000", count: "412 Invoices" },
      { period: "All", amount: "NPR 14,250,000", count: "3,120 Invoices" },
    ],
  },
  {
    title: "Fee Collected / Receipts",
    headerBg: "bg-[var(--brand-primary)]",
    headerTextColor: "text-white",
    icon: Coins,
    iconColor: "text-white",
    linkHref: "/fees/collection",
    rows: [
      { period: "Today", amount: "NPR 38,500", count: "15 Receipts" },
      { period: "Month", amount: "NPR 1,620,000", count: "385 Receipts" },
      { period: "All", amount: "NPR 12,890,000", count: "2,840 Receipts" },
    ],
  },
  {
    title: "Due & Receivables",
    headerBg: "bg-[var(--neutral-800)]",
    headerTextColor: "text-white",
    icon: AlertCircle,
    iconColor: "text-[var(--brand-accent)]",
    linkHref: "/fees/due-list",
    rows: [
      { period: "Today", amount: "NPR 6,700", count: "3 Pending" },
      { period: "Month", amount: "NPR 225,000", count: "27 Pending" },
      { period: "All", amount: "NPR 1,360,000", count: "280 Overdue" },
    ],
  },
];

export function FinancialSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {BILLING_SUMMARY_DATA.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-[6px] border border-[var(--border-default)] bg-white shadow-xs overflow-hidden flex flex-col transition-all duration-150 hover:shadow-md"
          >
            {/* Card Header matching ERP Brand Colors */}
            <div
              className={cn(
                "px-4 py-2.5 flex items-center justify-between font-bold text-xs tracking-wide select-none",
                card.headerBg,
                card.headerTextColor
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4 shrink-0", card.iconColor || "text-white")} />
                <span>{card.title}</span>
              </div>
              <Link
                href={card.linkHref}
                className="opacity-80 hover:opacity-100 transition-opacity text-[11px] font-normal flex items-center gap-0.5"
              >
                <span>View</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Card Rows Table: Today / Month / All */}
            <div className="p-3 divide-y divide-[var(--border-light)] text-xs flex-1 bg-white">
              {card.rows.map((row) => (
                <div
                  key={row.period}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-[var(--neutral-50)]/80 rounded transition-colors"
                >
                  <span className="font-semibold text-[var(--neutral-600)] w-16">
                    {row.period}
                  </span>
                  <div className="flex items-center gap-2 font-mono font-medium">
                    <span className="text-[var(--text-primary)] font-bold">
                      {row.amount}
                    </span>
                    <span className="text-[var(--neutral-400)] text-[11px]">/</span>
                    <span className="text-[var(--neutral-500)] text-[11px]">
                      {row.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
