"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sliders,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  User,
  DollarSign,
  ArrowRight,
  Calendar,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ScheduleMilestone {
  id: string;
  milestoneTitle: string;
  monthName: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Due" | "Upcoming";
  receiptRef?: string;
}

interface StudentScheduleAccount {
  id: string;
  studentId: string;
  admissionNo: string;
  studentName: string;
  classGrade: string;
  feeTitle: string;
  totalAgreedFee: number;
  paidSoFar: number;
  scheduleMilestones: ScheduleMilestone[];
}

const DEFAULT_SCHEDULES: StudentScheduleAccount[] = [
  {
    id: "ssa-1",
    studentId: "STU-10245",
    admissionNo: "ADM-2083-042",
    studentName: "Rahul Sharma",
    classGrade: "Grade 10 - Section A",
    feeTitle: "Custom Tuition & Development Plan",
    totalAgreedFee: 60000,
    paidSoFar: 30000,
    scheduleMilestones: [
      { id: "m-1", milestoneTitle: "1st Installment (Term 1 Start)", monthName: "Baishakh (Apr)", dueDate: "2026-04-15", amount: 20000, status: "Paid", receiptRef: "REC-2083-0091" },
      { id: "m-2", milestoneTitle: "2nd Installment (Monthly)", monthName: "Jestha (May)", dueDate: "2026-05-15", amount: 10000, status: "Paid", receiptRef: "REC-2083-0142" },
      { id: "m-3", milestoneTitle: "3rd Installment (Monthly)", monthName: "Ashadh (Jun)", dueDate: "2026-06-15", amount: 10000, status: "Due" },
      { id: "m-4", milestoneTitle: "4th Installment (Term 2 Start)", monthName: "Shrawan (Jul)", dueDate: "2026-07-15", amount: 10000, status: "Upcoming" },
      { id: "m-5", milestoneTitle: "5th Installment (Final Balance)", monthName: "Bhadra (Aug)", dueDate: "2026-08-15", amount: 10000, status: "Upcoming" },
    ],
  },
  {
    id: "ssa-2",
    studentId: "STU-10246",
    admissionNo: "ADM-2083-059",
    studentName: "Priya Thapa",
    classGrade: "Grade 10 - Section B",
    feeTitle: "Sibling Discounted 3-Trimester Schedule",
    totalAgreedFee: 67500,
    paidSoFar: 22500,
    scheduleMilestones: [
      { id: "m-201", milestoneTitle: "1st Trimester Milestone", monthName: "Baishakh (Apr)", dueDate: "2026-04-15", amount: 22500, status: "Paid", receiptRef: "REC-2083-0088" },
      { id: "m-202", milestoneTitle: "2nd Trimester Milestone", monthName: "Bhadra (Aug)", dueDate: "2026-08-15", amount: 22500, status: "Due" },
      { id: "m-203", milestoneTitle: "3rd Trimester Milestone", monthName: "Poush (Dec)", dueDate: "2026-12-15", amount: 22500, status: "Upcoming" },
    ],
  },
];

export default function StudentFeeSchedulePage() {
  const [schedules, setSchedules] = React.useState<StudentScheduleAccount[]>(DEFAULT_SCHEDULES);
  const [selectedAccount, setSelectedAccount] = React.useState<StudentScheduleAccount>(schedules[0]);
  const [search, setSearch] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const filtered = schedules.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const totalMilestonesSum = selectedAccount.scheduleMilestones.reduce((acc, m) => acc + m.amount, 0);
  const remainingBalance = selectedAccount.totalAgreedFee - selectedAccount.paidSoFar;

  const handleAddMilestone = () => {
    const newM: ScheduleMilestone = {
      id: `m-${Date.now().toString().slice(-4)}`,
      milestoneTitle: `Additional Custom Installment`,
      monthName: "Custom Month",
      dueDate: new Date().toISOString().split("T")[0],
      amount: 5000,
      status: "Upcoming",
    };
    const updated = {
      ...selectedAccount,
      scheduleMilestones: [...selectedAccount.scheduleMilestones, newM],
    };
    setSelectedAccount(updated);
    setSchedules(schedules.map((s) => (s.id === updated.id ? updated : s)));
    setToastMessage("Added milestone installment to schedule");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col font-sans">
      <ErpHeader />
      <ErpTopNav activeModuleId="fees" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href={ROUTES.FEES.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fees & Finance
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.FEES.SETUP.ROOT} className="hover:text-[var(--brand-primary)] transition-colors">
            Fee Setup
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-[var(--text-primary)]">
            Student Fee Schedule
          </span>
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold">&times;</button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Student Fee Schedule
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Define customized installment dates, milestone amounts, and payment calendars tailored to individual student agreements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.STUDENT_CUSTOM}
              className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              &larr; Student Custom Fee
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Student Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search student schedule..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedAccount(acc)}
                    className={cn(
                      "p-4 rounded-[8px] border transition-all cursor-pointer",
                      isSelected
                        ? "bg-white border-[var(--brand-primary)] shadow-xs"
                        : "bg-white/80 border-[var(--border-default)] hover:border-neutral-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {acc.studentName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                        {acc.admissionNo}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                      {acc.classGrade}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[var(--border-light)] flex items-center justify-between text-xs">
                      <span className="text-neutral-600">
                        {acc.scheduleMilestones.length} Milestones
                      </span>
                      <span className="font-mono font-bold text-[var(--brand-primary)]">
                        NPR {acc.totalAgreedFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Schedule Milestone Manager */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-default)] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Active Student Fee Schedule
                  </span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedAccount.studentName} ({selectedAccount.admissionNo})
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)]">{selectedAccount.feeTitle}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Total Fee</span>
                    <span className="text-xs font-bold font-mono">NPR {selectedAccount.totalAgreedFee.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Paid So Far</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">NPR {selectedAccount.paidSoFar.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Remaining Due</span>
                    <span className="text-xs font-bold text-rose-600 font-mono">NPR {remainingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Milestone Timeline Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Custom Installment Calendar
                  </h3>
                  <button
                    onClick={handleAddMilestone}
                    className="px-2.5 py-1 rounded bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] text-[11px] font-bold text-[var(--brand-primary)] flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                <div className="rounded-[6px] border border-[var(--border-default)] overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                        <th className="py-2.5 px-3">Milestone / Description</th>
                        <th className="py-2.5 px-3">Billing Month</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-right">Amount (NPR)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {selectedAccount.scheduleMilestones.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-[var(--neutral-50)]/50">
                          <td className="py-3 px-3 font-medium text-[var(--text-primary)]">
                            <div>{m.milestoneTitle}</div>
                            {m.receiptRef && (
                              <div className="text-[10px] text-emerald-700 font-mono">Receipt: {m.receiptRef}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-neutral-600">{m.monthName}</td>
                          <td className="py-3 px-3 text-neutral-600">{m.dueDate}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            NPR {m.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                m.status === "Paid" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                                m.status === "Due" && "bg-rose-50 text-rose-700 border border-rose-200",
                                m.status === "Upcoming" && "bg-slate-50 text-slate-700 border border-slate-200"
                              )}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Schedule Verification Footer */}
              <div className="p-3.5 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">
                  Total Milestones Sum: <strong className="font-mono text-[var(--brand-primary)]">NPR {totalMilestonesSum.toLocaleString()}</strong> (Matches Total Agreed Fee)
                </span>
                <button
                  onClick={() => {
                    setToastMessage("Saved and synchronized student fee schedule!");
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-4 py-1.5 rounded bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
