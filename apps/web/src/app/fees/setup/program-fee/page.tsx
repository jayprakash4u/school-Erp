"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  Building,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";

type FeeType = "total" | "annual" | "semester";

interface ProgramFeePlan {
  id: string;
  program: string;
  duration: string;
  totalFee: number;
  annualFee: number;
  semesterFee: number;
  heads: string[];
}

export default function ProgramFeeSetupPage() {
  const [activeTab, setActiveTab] = React.useState<FeeType>("total");

  const programPlans: ProgramFeePlan[] = [
    {
      id: "PROG-01",
      program: "Senior Secondary Science (Grade 11 & 12)",
      duration: "2 Years / 4 Semesters",
      totalFee: 180000,
      annualFee: 90000,
      semesterFee: 45000,
      heads: ["Tuition", "Science Lab", "Exam", "Library"],
    },
    {
      id: "PROG-02",
      program: "Senior Secondary Commerce & Humanities",
      duration: "2 Years / 4 Semesters",
      totalFee: 140000,
      annualFee: 70000,
      semesterFee: 35000,
      heads: ["Tuition", "Computer Lab", "Exam", "Library"],
    },
    {
      id: "PROG-03",
      program: "Vocational IT & Robotics Diploma",
      duration: "1 Year / 2 Semesters",
      totalFee: 60000,
      annualFee: 60000,
      semesterFee: 30000,
      heads: ["Course Fee", "Hardware Kit", "Certification"],
    },
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
          <span className="font-semibold text-[var(--text-primary)]">Program Fee Setup</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Program Fee Setup
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Configure entire degree, diploma, and senior secondary program total, annual, and semester fee structures
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Add Program Fee modal")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-[var(--brand-primary)] text-white shadow-xs hover:bg-[var(--brand-primary-hover,var(--brand-primary))]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Program Fee Structure</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab("total")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "total"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Program Total Fee</span>
          </button>

          <button
            onClick={() => setActiveTab("annual")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "annual"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Program Annual Fee</span>
          </button>

          <button
            onClick={() => setActiveTab("semester")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "semester"
                ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white"
                : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Program Semester Fee</span>
          </button>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programPlans.map((p) => (
            <div key={p.id} className="p-5 rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">{p.id}</span>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{p.program}</h3>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{p.duration}</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-[6px] border border-[var(--border-light)]">
                <div className="text-[10px] text-neutral-500 font-bold uppercase">
                  {activeTab === "total" ? "Full Program Total Fee" : activeTab === "annual" ? "Per-Year Annual Fee" : "Per-Semester Fee"}
                </div>
                <div className="text-xl font-bold text-[var(--brand-primary)] mt-0.5">
                  ₹{activeTab === "total" ? p.totalFee.toLocaleString() : activeTab === "annual" ? p.annualFee.toLocaleString() : p.semesterFee.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase">Included Fee Heads</div>
                <div className="flex flex-wrap gap-1">
                  {p.heads.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-medium">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
