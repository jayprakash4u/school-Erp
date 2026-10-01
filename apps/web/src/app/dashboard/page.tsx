"use client";

import * as React from "react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* 1. Global ERP Header with Quick Menu */}
      <ErpHeader />

      {/* 2. 20-Module Top Navigation Menu */}
      <ErpTopNav activeModuleId="dashboard" />

      {/* 3. Clean Dashboard Body */}
      <main className="flex-1" />
    </div>
  );
}

