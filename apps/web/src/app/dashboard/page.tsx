"use client";

import * as React from "react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { KpiMetricStrip } from "@/components/dashboard/kpi-metric-strip";
import { MonthlyCollectionChart } from "@/components/dashboard/monthly-collection-chart";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { QuickPillNavigation } from "@/components/dashboard/quick-pill-navigation";
import { ClassRevenueRanking } from "@/components/dashboard/class-revenue-ranking";
import { PaymentModeRanking } from "@/components/dashboard/payment-mode-ranking";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      {/* 1. Global ERP Header */}
      <ErpHeader />

      {/* 2. Top Navigation Menu */}
      <ErpTopNav activeModuleId="dashboard" />

      {/* 3. Main Dashboard Body (Strict 70% - 30% Split Layout) */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">
          {/* 70% LEFT SIDE: Main Operational & Analytics Workspace */}
          <div className="flex-1 w-full lg:w-[70%] min-w-0 space-y-4">
            {/* Row 1: 4-Item KPI Metrics Strip (Total Students, Teachers, Classes, Attendance) */}
            <KpiMetricStrip />

            {/* Row 3: Monthly Fee Collection & Billings Chart */}
            <MonthlyCollectionChart />

            {/* Row 4: Recent Live Fee Collections & Receipts Stream Table */}
            <RecentActivityTable />
          </div>

          {/* 30% RIGHT SIDE: Quick Navigation & Breakdown Rankings */}
          <div className="w-full lg:w-[30%] lg:min-w-[320px] space-y-4 shrink-0">
            {/* Quick Navigation at the VERY TOP of the 30% side */}
            <QuickPillNavigation />

            {/* Class Revenue Ranking */}
            <ClassRevenueRanking />

            {/* Payment Mode Revenue Ranking */}
            <PaymentModeRanking />
          </div>
        </div>
      </main>
    </div>
  );
}
