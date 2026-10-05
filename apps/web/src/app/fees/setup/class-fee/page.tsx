"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building,
  Search,
  ChevronRight,
  Plus,
  Calendar,
  CalendarCheck,
  Edit2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

type ClassFeeMode = "annual" | "monthly";

interface ClassFeeStructure {
  grade: string;
  category: "Primary" | "Middle" | "Secondary";
  annualFee: number;
  monthlyFee: number;
  tuitionShare: number;
  devShare: number;
  examShare: number;
}

export default function ClassFeeSetupPage() {
  const [activeTab, setActiveTab] = React.useState<ClassFeeMode>("annual");

  const classFees: ClassFeeStructure[] = [
    { grade: "Nursery / KG", category: "Primary", annualFee: 36000, monthlyFee: 3000, tuitionShare: 24000, devShare: 8000, examShare: 4000 },
    { grade: "Grade 1 - 5", category: "Primary", annualFee: 48000, monthlyFee: 4000, tuitionShare: 32000, devShare: 10000, examShare: 6000 },
    { grade: "Grade 6 - 8", category: "Middle", annualFee: 60000, monthlyFee: 5000, tuitionShare: 40000, devShare: 12000, examShare: 8000 },
    { grade: "Grade 9 - 10", category: "Secondary", annualFee: 78000, monthlyFee: 6500, tuitionShare: 52000, devShare: 16000, examShare: 10000 },
  ];

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
          <span className="text-[var(--text-secondary)]">Fee Configuration</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">Class Fee Setup</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Class Annual & Monthly Fee Setup
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage standard grade-wise fee structures and installment breakdowns for all school classes
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Configure Class Fee modal")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] text-white shadow-xs hover:bg-[var(--brand-primary-hover,var(--brand-primary))]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Configure Grade Structure</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab("annual")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "annual"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Class Annual Fee Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "monthly"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Class Monthly / Term Breakdown</span>
          </button>
        </div>

        {/* Class Fee Table */}
        <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
          <div className="p-3.5 bg-neutral-50/80 border-b border-[var(--border-default)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Grade-Wise Fee Structure (Academic Year 2026-2027)
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)]">4 Grade Tiers Configured</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-neutral-50 text-[var(--text-tertiary)] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Grade Tier</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">{activeTab === "annual" ? "Annual Total Fee" : "Monthly Installment"}</th>
                  <th className="py-2.5 px-3 text-right">Tuition Head</th>
                  <th className="py-2.5 px-3 text-right">Annual Dev</th>
                  <th className="py-2.5 px-3 text-right">Exam Head</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {classFees.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">{row.grade}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{row.category}</td>
                    <td className="py-3 px-3 text-right font-bold text-[var(--brand-primary)]">
                      ₹{activeTab === "annual" ? row.annualFee.toLocaleString() : row.monthlyFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">₹{row.tuitionShare.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-neutral-500">₹{row.devShare.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-neutral-500">₹{row.examShare.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => alert(`Edit fee structure for ${row.grade}`)}
                        className="p-1 rounded text-neutral-500 hover:text-[var(--brand-primary)] hover:bg-neutral-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
