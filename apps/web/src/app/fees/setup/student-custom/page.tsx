"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  DollarSign,
  ArrowRight,
  Sliders,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface StudentCustomFeeRecord {
  id: string;
  studentId: string;
  admissionNo: string;
  studentName: string;
  classGrade: string;
  standardFee: number;
  customAgreedFee: number;
  discountPercentage: number;
  approvalReference: string;
  reason: string;
  approvedBy: string;
  effectiveYear: string;
  status: "Active" | "Pending Review";
}

const DEFAULT_CUSTOM_FEES: StudentCustomFeeRecord[] = [
  {
    id: "scf-1",
    studentId: "STU-10245",
    admissionNo: "ADM-2083-042",
    studentName: "Rahul Sharma",
    classGrade: "Grade 10 - Section A",
    standardFee: 75000,
    customAgreedFee: 60000,
    discountPercentage: 20,
    approvalReference: "MC-DEC-2083-019",
    reason: "Board of Trustees Merit-Need Discretionary Grant",
    approvedBy: "Managing Committee",
    effectiveYear: "2026-2027 (2083 BS)",
    status: "Active",
  },
  {
    id: "scf-2",
    studentId: "STU-10246",
    admissionNo: "ADM-2083-059",
    studentName: "Priya Thapa",
    classGrade: "Grade 10 - Section B",
    standardFee: 75000,
    customAgreedFee: 67500,
    discountPercentage: 10,
    approvalReference: "SIB-2083-088",
    reason: "Second Sibling Concession Agreement",
    approvedBy: "Principal Office",
    effectiveYear: "2026-2027 (2083 BS)",
    status: "Active",
  },
  {
    id: "scf-3",
    studentId: "STU-10247",
    admissionNo: "ADM-2083-112",
    studentName: "Bikash Adhikari",
    classGrade: "Grade 9 - Section A",
    standardFee: 68000,
    customAgreedFee: 34000,
    discountPercentage: 50,
    approvalReference: "STAFF-GRANT-2083",
    reason: "Permanent Staff Child 50% Tuition Waiver",
    approvedBy: "Finance Director",
    effectiveYear: "2026-2027 (2083 BS)",
    status: "Active",
  },
];

export default function StudentCustomFeePage() {
  const [records, setRecords] = React.useState<StudentCustomFeeRecord[]>(DEFAULT_CUSTOM_FEES);
  const [search, setSearch] = React.useState("");
  const [selectedRecord, setSelectedRecord] = React.useState<StudentCustomFeeRecord | null>(records[0]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const filtered = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase())
  );

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
            Student Custom Fee
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
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Student Custom Fee
              </h1>
              <p className="text-xs text-[var(--text-tertiary)]">
                Manage individual student fee overrides, customized billing agreements, and official institutional grant approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.FEES.SETUP.STUDENT_SCHEDULE}
              className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-primary)] shadow-xs transition-colors"
            >
              Student Fee Schedule &rarr;
            </Link>
            <button
              onClick={() => {
                const newRec: StudentCustomFeeRecord = {
                  id: `scf-${Date.now().toString().slice(-4)}`,
                  studentId: `STU-${Math.floor(10000 + Math.random() * 90000)}`,
                  admissionNo: `ADM-2083-${Math.floor(100 + Math.random() * 900)}`,
                  studentName: "New Student Custom Plan",
                  classGrade: "Grade 10 - Section A",
                  standardFee: 75000,
                  customAgreedFee: 65000,
                  discountPercentage: 13,
                  approvalReference: `DEC-2083-${Math.floor(100 + Math.random() * 900)}`,
                  reason: "Special Committee Fee Waiver",
                  approvedBy: "Principal Office",
                  effectiveYear: "2026-2027 (2083 BS)",
                  status: "Active",
                };
                setRecords([newRec, ...records]);
                setSelectedRecord(newRec);
                setToastMessage(`Created new student fee override for ${newRec.studentName}`);
              }}
              className="px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover,var(--brand-primary))] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Custom Override</span>
            </button>
          </div>
        </div>

        {/* Main Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by student name, admission no or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-[var(--border-default)] bg-white text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold">
                    <th className="py-2.5 px-4">Student Details</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4 text-right">Standard Fee</th>
                    <th className="py-2.5 px-4 text-right">Custom Agreed</th>
                    <th className="py-2.5 px-4 text-center">Waiver %</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {filtered.map((r) => {
                    const isSelected = selectedRecord?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRecord(r)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-rose-50/40 font-medium" : "hover:bg-[var(--neutral-50)]/60"
                        )}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--text-primary)]">{r.studentName}</div>
                          <div className="text-[11px] text-[var(--text-tertiary)]">{r.admissionNo} • {r.studentId}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{r.classGrade}</td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-500 line-through">
                          NPR {r.standardFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[var(--brand-primary)]">
                          NPR {r.customAgreedFee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                            {r.discountPercentage}% OFF
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Details Panel */}
          <div className="lg:col-span-4 space-y-4">
            {selectedRecord && (
              <div className="rounded-[8px] bg-white border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="border-b border-[var(--border-default)] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Custom Agreement Record
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {selectedRecord.studentName}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">{selectedRecord.classGrade} ({selectedRecord.admissionNo})</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Base Standard Fee:</span>
                    <span className="font-mono">NPR {selectedRecord.standardFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Institutional Discount:</span>
                    <span className="font-mono">- NPR {(selectedRecord.standardFee - selectedRecord.customAgreedFee).toLocaleString()} ({selectedRecord.discountPercentage}%)</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-default)] flex justify-between font-bold text-[var(--text-primary)]">
                    <span>Agreed Annual Charge:</span>
                    <span className="text-sm font-extrabold text-[var(--brand-primary)] font-mono">
                      NPR {selectedRecord.customAgreedFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Audit & Approval Box */}
                <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Approval Reference</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] font-mono">
                    Ref: {selectedRecord.approvalReference} • By {selectedRecord.approvedBy}
                  </p>
                  <p className="text-[11px] text-neutral-700 italic">
                    &ldquo;{selectedRecord.reason}&rdquo;
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={ROUTES.FEES.SETUP.STUDENT_SCHEDULE}
                    className="w-full py-2 rounded bg-[var(--bg-secondary)] hover:bg-[var(--neutral-100)] text-xs font-bold text-[var(--brand-primary)] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Custom Milestone Schedule</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
