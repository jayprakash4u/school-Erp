"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  label: string;
  invoiced: number; // in thousands (k)
  collected: number; // in thousands (k)
}

const MONTHLY_CHART_DATA: ChartDataPoint[] = [
  { label: "W1 (1-7)", invoiced: 480, collected: 420 },
  { label: "W2 (8-14)", invoiced: 560, collected: 510 },
  { label: "W3 (15-21)", invoiced: 490, collected: 430 },
  { label: "W4 (22-28)", invoiced: 315, collected: 260 },
];

export function MonthlyCollectionChart() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const maxVal = Math.max(...MONTHLY_CHART_DATA.map((d) => Math.max(d.invoiced, d.collected)));

  return (
    <div className="rounded-[6px] border border-[var(--border-default)] bg-white shadow-xs overflow-hidden flex flex-col">
      {/* Card Header matching ERP style */}
      <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
            Fee Billings & Collection — This Month
          </h2>
          <p className="text-xs text-[var(--neutral-500)]">
            Comparison between fee billed vs actual receipts collected
          </p>
        </div>

        {/* Legend in our Brand Colors: Brand Secondary & Brand Primary */}
        <div className="flex items-center gap-4 text-xs select-none">
          <div className="flex items-center gap-3 font-medium text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px] bg-[var(--brand-secondary)] shrink-0" />
              <span className="text-[var(--neutral-700)]">Net Invoiced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px] bg-[var(--brand-primary)] shrink-0" />
              <span className="text-[var(--neutral-700)]">Receipt Collected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Chart Graphic Area */}
          <div className="h-56 relative flex items-end justify-between gap-6 pt-6 pb-2 border-b border-[var(--border-default)] px-4">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30 pb-2">
              <div className="border-b border-dashed border-[var(--neutral-300)] w-full" />
              <div className="border-b border-dashed border-[var(--neutral-300)] w-full" />
              <div className="border-b border-dashed border-[var(--neutral-300)] w-full" />
              <div className="border-b border-dashed border-[var(--neutral-300)] w-full" />
            </div>

            {/* Bars */}
            {MONTHLY_CHART_DATA.map((item, idx) => {
              const invoicedHeight = `${(item.invoiced / maxVal) * 85}%`;
              const collectedHeight = `${(item.collected / maxVal) * 85}%`;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-[4px] bg-[var(--brand-secondary)] text-white text-[10px] font-mono shadow-xl border border-[var(--neutral-700)] whitespace-nowrap animate-in fade-in-0 duration-150">
                      <div>Invoiced: NPR {item.invoiced.toLocaleString()},000</div>
                      <div>Collected: NPR {item.collected.toLocaleString()},000</div>
                    </div>
                  )}

                  {/* Dual Bar Group in Brand Colors */}
                  <div className="flex items-end gap-2 w-full max-w-[64px] h-full justify-center">
                    {/* Invoiced Bar: Brand Secondary / Slate Dark */}
                    <div
                      style={{ height: invoicedHeight }}
                      className="w-full rounded-t-[3px] bg-[var(--brand-secondary)] transition-all duration-300 group-hover:bg-black shadow-2xs"
                    />
                    {/* Collected Bar: Brand Primary / Red */}
                    <div
                      style={{ height: collectedHeight }}
                      className="w-full rounded-t-[3px] bg-[var(--brand-primary)] transition-all duration-300 group-hover:bg-red-700 shadow-2xs"
                    />
                  </div>

                  {/* X-axis Label */}
                  <span className="text-[11px] font-medium text-[var(--neutral-600)] mt-2">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* X Axis Note */}
          <div className="flex items-center justify-between text-[11px] text-[var(--neutral-400)] pt-2 px-2">
            <span>Weekly collection cycles (Ashwin 2083)</span>
            <span>Target: 90% monthly recovery</span>
          </div>
        </div>

        {/* Right: Big Metric Numbers in Brand Colors */}
        <div className="lg:col-span-4 lg:border-l lg:border-[var(--border-default)] lg:pl-6 space-y-6">
          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
              NPR 1,845,000
            </div>
            <div className="text-xs font-semibold text-[var(--neutral-500)]">
              Net Billing Amount
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-[var(--brand-primary)] tracking-tight">
              NPR 1,620,000
            </div>
            <div className="text-xs font-semibold text-[var(--neutral-500)]">
              Total Receipt Amount
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--neutral-400)] block">
                Collection Rate
              </span>
              <span className="text-lg font-bold font-mono text-[var(--brand-primary)]">87.8%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--neutral-400)] block">
                Pending Balance
              </span>
              <span className="text-xs font-mono font-bold text-[var(--neutral-800)]">NPR 225,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
