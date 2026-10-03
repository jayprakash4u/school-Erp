"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  CheckCircle2,
  Eye,
  Zap,
  Sparkles,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Coins,
  ChevronRight,
  MoreHorizontal,
  Download,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { erpModules } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/export-utils";

interface StudentFeeRecord {
  id: string;
  studentName: string;
  rollNo: string;
  className: string;
  amount: number;
  status: "pending" | "completed" | "overdue";
  dueDate: string;
}

const SAMPLE_FEE_RECORDS: StudentFeeRecord[] = [
  { id: "FEE-101", studentName: "Aarav Sharma", rollNo: "101", className: "Class 10-A", amount: 5000, status: "pending", dueDate: "Oct 15, 2026" },
  { id: "FEE-102", studentName: "Diya Patel", rollNo: "102", className: "Class 9-B", amount: 4500, status: "pending", dueDate: "Oct 15, 2026" },
  { id: "FEE-103", studentName: "Rohan Gupta", rollNo: "103", className: "Class 10-A", amount: 5000, status: "pending", dueDate: "Oct 15, 2026" },
  { id: "FEE-104", studentName: "Ananya Deshmukh", rollNo: "104", className: "Class 11-Science", amount: 6200, status: "completed", dueDate: "Oct 10, 2026" },
  { id: "FEE-105", studentName: "Kabir Mehta", rollNo: "105", className: "Class 8-C", amount: 4000, status: "completed", dueDate: "Oct 08, 2026" },
  { id: "FEE-106", studentName: "Sanya Verma", rollNo: "106", className: "Class 12-Commerce", amount: 7000, status: "completed", dueDate: "Oct 05, 2026" },
];

export function ModuleWorkflowDemo() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"pending" | "completed" | "all">("pending");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState("all");

  const studentsModule = erpModules.find((m) => m.id === "students");
  const feesModule = erpModules.find((m) => m.id === "fees");

  const filteredRecords = SAMPLE_FEE_RECORDS.filter((item) => {
    const matchesTab =
      activeTab === "all" ? true : item.status === activeTab;
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rollNo.includes(searchQuery) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === "all" ? true : item.className.startsWith(selectedClass);

    return matchesTab && matchesSearch && matchesClass;
  });

  const handleExport = () => {
    exportToCsv(
      filteredRecords.map((r) => ({
        "Fee ID": r.id,
        "Student Name": r.studentName,
        "Roll No": r.rollNo,
        "Class": r.className,
        "Amount (USD)": `$${r.amount.toLocaleString()}`,
        "Status": r.status.toUpperCase(),
        "Due Date": r.dueDate,
      })),
      "Fee-Collection-Export"
    );
    toast({
      type: "success",
      title: "Data Exported",
      message: `Exported ${filteredRecords.length} fee records to CSV.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* 3 Step Clean Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Hover on a Main Option */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)] p-5 shadow-xs space-y-4 flex flex-col">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold">
                1
              </span>
              Hover on a Main Option (e.g., Students)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              When hovering over any main option, a dropdown appears showing all sub options cleanly.
            </p>
          </div>

          {/* Line-divided Toolbar Simulator */}
          <div className="flex-1 p-3.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)] space-y-3">
            <div className="flex items-center border border-[var(--border-default)] bg-[var(--bg-primary)] rounded-md divide-x divide-[var(--border-default)] text-[11px] overflow-hidden">
              <span className="px-2.5 py-1.5 text-[var(--text-secondary)]">
                Dashboard
              </span>
              <span className="px-2.5 py-1.5 text-[var(--brand-primary)] font-semibold bg-[var(--red-50)]/40 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> Students <ChevronRight className="h-2.5 w-2.5 rotate-90" />
              </span>
              <span className="px-2.5 py-1.5 text-[var(--text-secondary)]">
                Academics
              </span>
              <span className="px-2.5 py-1.5 text-[var(--text-secondary)]">
                Examinations
              </span>
            </div>

            {/* Students Popover Preview */}
            {studentsModule && (
              <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] p-3 shadow-md text-[11px] space-y-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] divide-x divide-[var(--border-light)]">
                  <div className="space-y-1 pr-1">
                    {studentsModule.categories?.[0]?.items.slice(0, 5).map((item) => (
                      <div key={item.title} className="flex items-center gap-1.5 text-[var(--text-primary)] hover:text-[var(--brand-primary)] truncate">
                        {item.icon && <item.icon className="h-3 w-3 text-[var(--neutral-400)] shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 pl-2">
                    {studentsModule.categories?.[1]?.items.slice(0, 5).map((item) => (
                      <div key={item.title} className="flex items-center gap-1.5 text-[var(--text-primary)] hover:text-[var(--brand-primary)] truncate">
                        {item.icon && <item.icon className="h-3 w-3 text-[var(--neutral-400)] shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Click on a Main Option */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)] p-5 shadow-xs space-y-4 flex flex-col">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold">
                2
              </span>
              Click on a Main Option (e.g., Fee & Accounts)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              On click, the menu stays open or navigates, showing all organized sub options.
            </p>
          </div>

          {/* Line-divided Toolbar Simulator */}
          <div className="flex-1 p-3.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)] space-y-3">
            <div className="flex items-center border border-[var(--border-default)] bg-[var(--bg-primary)] rounded-md divide-x divide-[var(--border-default)] text-[11px] overflow-hidden">
              <span className="px-2.5 py-1.5 text-[var(--text-secondary)]">
                Attendance
              </span>
              <span className="px-2.5 py-1.5 text-[var(--brand-primary)] font-semibold bg-[var(--red-50)]/40 flex items-center gap-1">
                <Coins className="h-3 w-3" /> Fee & Accounts <ChevronRight className="h-2.5 w-2.5 rotate-90" />
              </span>
              <span className="px-2.5 py-1.5 text-[var(--text-secondary)]">
                HR & Staff
              </span>
            </div>

            {/* Fee & Accounts Popover Preview */}
            {feesModule && (
              <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] p-3 shadow-md text-[11px] space-y-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] divide-x divide-[var(--border-light)]">
                  <div className="space-y-1 pr-1">
                    {feesModule.categories?.[0]?.items.slice(0, 5).map((item) => (
                      <div key={item.title} className="flex items-center gap-1.5 text-[var(--text-primary)] hover:text-[var(--brand-primary)] truncate">
                        {item.icon && <item.icon className="h-3 w-3 text-[var(--brand-primary)] shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 pl-2">
                    {feesModule.categories?.[1]?.items.slice(0, 5).map((item) => (
                      <div key={item.title} className="flex items-center gap-1.5 text-[var(--text-primary)] hover:text-[var(--brand-primary)] truncate">
                        {item.icon && <item.icon className="h-3 w-3 text-[var(--brand-primary)] shrink-0" />}
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Sub Option Click (e.g., Fee Collection) */}
        <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)] p-5 shadow-xs space-y-4 flex flex-col">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold">
                3
              </span>
              Sub Option Click (e.g., Fee Collection)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Clicking a sub option takes the user to the respective module with full data view.
            </p>
          </div>

          <div className="flex-1 p-3.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)] flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <span>Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <span>Fee & Accounts</span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <span className="font-bold text-[var(--brand-primary)]">Fee Collection</span>
            </div>

            <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[var(--red-50)] text-[var(--brand-primary)]">
                    <Coins className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Live ERP Collection Grid Active
                  </span>
                </div>
                <Badge variant="active" dot>Real-time</Badge>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Filter by pending dues, receipt generation, and class section with CSV export below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive ERP Fee Collection Module View */}
      <Card className="border-[var(--border-default)] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-[var(--bg-primary)] border-b border-[var(--border-default)] space-y-4">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--brand-primary)] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <Link href="/fees" className="hover:text-[var(--brand-primary)] transition-colors">
              Fee & Accounts
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <span className="font-bold text-[var(--brand-primary)]">Fee Collection</span>
          </div>

          {/* Module Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)] shadow-2xs">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  Fee Collection
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Manage student tuition fees, generate invoice receipts, and track pending dues.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  toast({
                    type: "info",
                    title: "Add Collection",
                    message: "Opening new fee payment collection dialog...",
                  })
                }
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Collection
              </Button>
            </div>
          </div>

          {/* Status Tabs & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2 border-t border-[var(--border-default)]">
            {/* Filter Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] w-fit">
              <button
                onClick={() => setActiveTab("pending")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "pending"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Pending ({SAMPLE_FEE_RECORDS.filter(r => r.status === "pending").length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "completed"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                Completed ({SAMPLE_FEE_RECORDS.filter(r => r.status === "completed").length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "all"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                All ({SAMPLE_FEE_RECORDS.length})
              </button>
            </div>

            {/* Search Input and Select Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                <input
                  type="text"
                  placeholder="Search student name, roll no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-8 px-2.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
              >
                <option value="all">Class: All</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>

              <div className="px-2.5 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md text-xs font-medium text-[var(--text-secondary)]">
                Session: <span className="font-semibold text-[var(--text-primary)]">2026-27</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-0 overflow-x-auto">
          <Table className="border-0 rounded-none">
            <TableHeader className="bg-[var(--neutral-100)] border-b border-[var(--border-default)]">
              <TableRow>
                <TableHead className="w-12 text-center font-bold text-[var(--text-primary)]">#</TableHead>
                <TableHead className="font-bold text-[var(--text-primary)]">Student Name</TableHead>
                <TableHead className="font-bold text-[var(--text-primary)]">Roll No</TableHead>
                <TableHead className="font-bold text-[var(--text-primary)]">Class & Section</TableHead>
                <TableHead className="font-bold text-[var(--text-primary)]">Amount</TableHead>
                <TableHead className="font-bold text-[var(--text-primary)]">Due Date</TableHead>
                <TableHead className="font-bold text-[var(--text-primary)]">Status</TableHead>
                <TableHead className="text-right font-bold text-[var(--text-primary)]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-xs text-[var(--text-tertiary)]">
                    No fee records found matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record, index) => (
                  <TableRow key={record.id} className="hover:bg-[var(--neutral-50)] transition-colors">
                    <TableCell className="text-center font-mono text-xs text-[var(--text-tertiary)]">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-[var(--text-primary)]">
                      {record.studentName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                      {record.rollNo}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {record.className}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[var(--text-primary)]">
                      ${record.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {record.dueDate}
                    </TableCell>
                    <TableCell>
                      {record.status === "pending" ? (
                        <Badge variant="pending" dot>
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="active" dot>
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-[var(--brand-primary)] hover:bg-[var(--red-50)]"
                          onClick={() =>
                            toast({
                              type: "info",
                              title: `Record ${record.id}`,
                              message: `Opening receipt generation for ${record.studentName}`,
                            })
                          }
                        >
                          Collect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bottom Architecture & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Why This Works? */}
        <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success-100)] text-[var(--success-700)]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Why This Works?
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success-600)] shrink-0 mt-0.5" />
              <span>All 20 main modules visible at once in continuous sleek rows.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success-600)] shrink-0 mt-0.5" />
              <span>Clean line dividers without cluttered box borders.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success-600)] shrink-0 mt-0.5" />
              <span>Easy to scan and find the right section quickly.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success-600)] shrink-0 mt-0.5" />
              <span>Scales cleanly as additional modules are introduced.</span>
            </li>
          </ul>
        </div>

        {/* Feature 1 & 2 */}
        <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-[var(--red-50)] text-[var(--brand-primary)] w-fit">
              <Eye className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              20 Main Options
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              All visible in top navigation organized by hairline dividers.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-default)] space-y-2">
            <div className="p-2 rounded-lg bg-[var(--yellow-100)] text-[var(--yellow-800)] w-fit">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Hover & Click
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Shows categorized sub options instantly on hover or click.
            </p>
          </div>
        </div>

        {/* Feature 3 & 4 */}
        <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-[var(--info-100)] text-[var(--info-700)] w-fit">
              <Sparkles className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Professional UI
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Sleek enterprise aesthetic driven by semantic tokens.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-default)] space-y-2">
            <div className="p-2 rounded-lg bg-[var(--success-100)] text-[var(--success-700)] w-fit">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Scalable Architecture
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Adapts gracefully across standard screens and widescreen views.
            </p>
          </div>
        </div>

        {/* Tip for Future Growth */}
        <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--brand-accent)]/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--yellow-100)] text-[var(--yellow-800)]">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Tip for Future Growth
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            If the number of main options grows beyond 20, you can:
          </p>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc list-inside">
            <li>Keep 2 clean rows (e.g., 10 + 10 = 20)</li>
            <li>Or use 3 rows if needed (e.g., 7 + 7 + 6)</li>
            <li>Or use a compact mode with a &quot;View All&quot; dropdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
