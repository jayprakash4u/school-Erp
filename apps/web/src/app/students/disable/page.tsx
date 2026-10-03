"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Users,
  FileSpreadsheet,
  Upload,
  Plus,
  X,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  Coins,
  Library,
  Bus,
  Bed,
  UserX,
  Search,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  History,
  Clock,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// Comprehensive Student Demo Registry for Lookup
export interface StudentRecordItem {
  id: string;
  rollNumber: string;
  admissionNumber: string;
  fullName: string;
  class: string;
  batch: string;
  mobile: string;
  guardianName: string;
}

const DATABASE_STUDENTS: StudentRecordItem[] = [
  { id: "STU-1001", rollNumber: "101", admissionNumber: "ADM-2083-001", fullName: "Aarav Sharma", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9841234567", guardianName: "Bishnu Sharma" },
  { id: "STU-1002", rollNumber: "102", admissionNumber: "ADM-2083-002", fullName: "Pooja Shrestha", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9812345678", guardianName: "Rajan Shrestha" },
  { id: "STU-1003", rollNumber: "103", admissionNumber: "ADM-2083-003", fullName: "Rohan Chaudhary", class: "Grade 10-B", batch: "2083/84", mobile: "+977-9865432109", guardianName: "Mahesh Chaudhary" },
  { id: "STU-1004", rollNumber: "104", admissionNumber: "ADM-2083-004", fullName: "Ananya Yadav", class: "Grade 9-A", batch: "2083/84", mobile: "+977-9807654321", guardianName: "Jay Prakash Yadav" },
  { id: "STU-1005", rollNumber: "105", admissionNumber: "ADM-2083-005", fullName: "Karan Adhikari", class: "Grade 9-A", batch: "2083/84", mobile: "+977-9841122334", guardianName: "Balaram Adhikari" },
  { id: "STU-1006", rollNumber: "106", admissionNumber: "ADM-2083-006", fullName: "Binita Gurung", class: "Grade 9-B", batch: "2083/84", mobile: "+977-9865544332", guardianName: "Hari Gurung" },
  { id: "STU-1007", rollNumber: "107", admissionNumber: "ADM-2083-007", fullName: "Dipesh Tamang", class: "Grade 8-A", batch: "2083/84", mobile: "+977-9812998877", guardianName: "Kishor Tamang" },
  { id: "STU-1008", rollNumber: "108", admissionNumber: "ADM-2083-008", fullName: "Prajwal Karki", class: "Grade 10-B", batch: "2083/84", mobile: "+977-9841887766", guardianName: "Surya Karki" },
  { id: "STU-1009", rollNumber: "109", admissionNumber: "ADM-2083-009", fullName: "Sandhya Adhikari", class: "Grade 9-A", batch: "2083/84", mobile: "+977-9861239988", guardianName: "Bhim Adhikari" },
  { id: "STU-1010", rollNumber: "110", admissionNumber: "ADM-2083-010", fullName: "Sanjay Magar", class: "Grade 8-B", batch: "2083/84", mobile: "+977-9803344556", guardianName: "Gopal Magar" },
  { id: "STU-1011", rollNumber: "111", admissionNumber: "ADM-2083-011", fullName: "Prashant Thapa", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9841991122", guardianName: "Dev Thapa" },
  { id: "STU-1012", rollNumber: "112", admissionNumber: "ADM-2083-012", fullName: "Smarika Basnet", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9802233445", guardianName: "Dinesh Basnet" },
  { id: "STU-1013", rollNumber: "113", admissionNumber: "ADM-2083-013", fullName: "Nirajan KC", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9813344556", guardianName: "Ganesh KC" },
  { id: "STU-1014", rollNumber: "114", admissionNumber: "ADM-2083-014", fullName: "Pravin Rawat", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9864455667", guardianName: "Shankar Rawat" },
  { id: "STU-1015", rollNumber: "115", admissionNumber: "ADM-2083-015", fullName: "Sneha Neupane", class: "Grade 10-A", batch: "2083/84", mobile: "+977-9845566778", guardianName: "Lok Neupane" },
];

export interface DisableHistoryRecord {
  id: string;
  rollNumber: string;
  admissionNumber: string;
  fullName: string;
  class: string;
  disabledServices: string[];
  disabledAt: string;
  disabledBy: string;
}

const DEFAULT_DISABLE_HISTORY: DisableHistoryRecord[] = [
  {
    id: "DH-101",
    rollNumber: "101",
    admissionNumber: "ADM-2083-001",
    fullName: "Aarav Sharma",
    class: "Grade 10-A",
    disabledServices: ["Billing & Fee Payment", "Examinations & Results"],
    disabledAt: "Today, 10:45 AM",
    disabledBy: "Accounts Dept",
  },
  {
    id: "DH-102",
    rollNumber: "102",
    admissionNumber: "ADM-2083-002",
    fullName: "Pooja Shrestha",
    class: "Grade 10-A",
    disabledServices: ["Library Services"],
    disabledAt: "Today, 09:30 AM",
    disabledBy: "Library Office",
  },
  {
    id: "DH-103",
    rollNumber: "103",
    admissionNumber: "ADM-2083-003",
    fullName: "Rohan Chaudhary",
    class: "Grade 10-B",
    disabledServices: ["Transport / Bus Service", "Billing & Fee Payment"],
    disabledAt: "Yesterday, 04:15 PM",
    disabledBy: "Transport Dept",
  },
  {
    id: "DH-104",
    rollNumber: "104",
    admissionNumber: "ADM-2083-004",
    fullName: "Ananya Yadav",
    class: "Grade 9-A",
    disabledServices: ["Complete Student Portal Login"],
    disabledAt: "Yesterday, 02:00 PM",
    disabledBy: "Administration",
  },
  {
    id: "DH-105",
    rollNumber: "105",
    admissionNumber: "ADM-2083-005",
    fullName: "Karan Adhikari",
    class: "Grade 9-A",
    disabledServices: ["Hostel & Mess Facility"],
    disabledAt: "2 Oct 2026, 11:20 AM",
    disabledBy: "Hostel Warden",
  },
  {
    id: "DH-106",
    rollNumber: "106",
    admissionNumber: "ADM-2083-006",
    fullName: "Binita Gurung",
    class: "Grade 9-B",
    disabledServices: ["Billing & Fee Payment", "Library Services"],
    disabledAt: "1 Oct 2026, 03:40 PM",
    disabledBy: "Accounts Dept",
  },
  {
    id: "DH-107",
    rollNumber: "107",
    admissionNumber: "ADM-2083-007",
    fullName: "Dipesh Tamang",
    class: "Grade 8-A",
    disabledServices: ["Examinations & Results"],
    disabledAt: "1 Oct 2026, 01:10 PM",
    disabledBy: "Exam Controller",
  },
  {
    id: "DH-108",
    rollNumber: "108",
    admissionNumber: "ADM-2083-008",
    fullName: "Prajwal Karki",
    class: "Grade 10-B",
    disabledServices: ["Transport / Bus Service"],
    disabledAt: "30 Sep 2026, 05:00 PM",
    disabledBy: "Transport Dept",
  },
  {
    id: "DH-109",
    rollNumber: "109",
    admissionNumber: "ADM-2083-009",
    fullName: "Sandhya Adhikari",
    class: "Grade 9-A",
    disabledServices: ["Billing & Fee Payment"],
    disabledAt: "29 Sep 2026, 10:15 AM",
    disabledBy: "Accounts Dept",
  },
  {
    id: "DH-110",
    rollNumber: "110",
    admissionNumber: "ADM-2083-010",
    fullName: "Sanjay Magar",
    class: "Grade 8-B",
    disabledServices: ["Complete Student Portal Login", "Hostel & Mess Facility"],
    disabledAt: "28 Sep 2026, 09:00 AM",
    disabledBy: "Administration",
  },
];

export interface DisableServiceOption {
  id: string;
  name: string;
  shortLabel: string;
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const AVAILABLE_SERVICES: DisableServiceOption[] = [
  {
    id: "BILLING",
    name: "Billing & Fee Payment",
    shortLabel: "Billing",
    department: "Accounts / Finance Dept",
    icon: Coins,
    description: "Restricts online payment gateway, fee receipt generation, and clearance certificates.",
  },
  {
    id: "EXAMINATION",
    name: "Examinations & Results",
    shortLabel: "Examination",
    department: "Examination Department",
    icon: FileSpreadsheet,
    description: "Restricts admit card download, exam schedule viewing, and terminal marksheets.",
  },
  {
    id: "LIBRARY",
    name: "Library Services",
    shortLabel: "Library",
    department: "Central Library Office",
    icon: Library,
    description: "Blocks book issuance, digital e-book vault access, and self-renewals.",
  },
  {
    id: "TRANSPORT",
    name: "Transport / Bus Service",
    shortLabel: "Bus / Transport",
    department: "Transport & Logistics Dept",
    icon: Bus,
    description: "Suspends digital bus pass validity and live GPS fleet tracking.",
  },
  {
    id: "HOSTEL",
    name: "Hostel & Mess Facility",
    shortLabel: "Hostel",
    department: "Hostel Administration & Warden",
    icon: Bed,
    description: "Restricts mess pass, night-out leave gatepass requests, and room service.",
  },
  {
    id: "PORTAL_LOGIN",
    name: "Complete Student Portal Login",
    shortLabel: "Full Portal",
    department: "Main Administration & Principal",
    icon: UserX,
    description: "Completely suspends student and parent dashboard login access.",
  },
];

export default function DisableStudentsPage() {
  const router = useRouter();

  // Academic Scope
  const [selectedBatch, setSelectedBatch] = React.useState<string>("2083/84");
  const [selectedClass, setSelectedClass] = React.useState<string>("Grade 10-A");

  // Input Method Tab: "single" | "group" | "excel"
  const [activeTab, setActiveTab] = React.useState<"single" | "group" | "excel">("single");

  // Input States
  const [singleInput, setSingleInput] = React.useState<string>("");
  const [groupInput, setGroupInput] = React.useState<string>("");
  const [excelFileName, setExcelFileName] = React.useState<string | null>(null);

  // Selected Students List
  const [targetedStudents, setTargetedStudents] = React.useState<StudentRecordItem[]>([]);

  // Selected Services
  const [selectedServices, setSelectedServices] = React.useState<string[]>(["BILLING", "EXAMINATION"]);

  // Modals & Feedback
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = React.useState<string>("");
  const [inputError, setInputError] = React.useState<string | null>(null);

  // Filtered History for Search Box
  const filteredHistory = React.useMemo(() => {
    const q = historySearchQuery.trim().toLowerCase();
    if (!q) return DEFAULT_DISABLE_HISTORY;
    return DEFAULT_DISABLE_HISTORY.filter(
      (item) =>
        item.rollNumber.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.admissionNumber.toLowerCase().includes(q) ||
        item.class.toLowerCase().includes(q) ||
        item.disabledServices.some((s) => s.toLowerCase().includes(q))
    );
  }, [historySearchQuery]);

  // 1. Add Single Student Handler
  const handleAddSingleStudent = (e?: React.FormEvent) => {
    e?.preventDefault();
    setInputError(null);
    const query = singleInput.trim();
    if (!query) {
      setInputError("Please enter a roll number or admission number.");
      return;
    }

    const matched = DATABASE_STUDENTS.find(
      (s) =>
        s.rollNumber.toLowerCase() === query.toLowerCase() ||
        s.admissionNumber.toLowerCase() === query.toLowerCase() ||
        s.fullName.toLowerCase().includes(query.toLowerCase())
    );

    if (!matched) {
      // Create a dynamic entry for demonstration if roll number provided
      const customRoll: StudentRecordItem = {
        id: `STU-${Date.now().toString().slice(-4)}`,
        rollNumber: query,
        admissionNumber: `ADM-${selectedBatch.split("/")[0]}-${query.padStart(3, "0")}`,
        fullName: `Student (Roll ${query})`,
        class: selectedClass,
        batch: selectedBatch,
        mobile: "+977-98XXXXXXXX",
        guardianName: "Guardian",
      };

      if (targetedStudents.some((s) => s.rollNumber === query)) {
        setInputError(`Student with roll number ${query} is already added.`);
        return;
      }

      setTargetedStudents((prev) => [...prev, customRoll]);
      setSingleInput("");
      return;
    }

    if (targetedStudents.some((s) => s.id === matched.id)) {
      setInputError(`Student ${matched.fullName} (Roll ${matched.rollNumber}) is already added.`);
      return;
    }

    setTargetedStudents((prev) => [...prev, matched]);
    setSingleInput("");
  };

  // 2. Add Group / Range Handler (e.g. "101-115" or "101-105, 110, 115-120")
  const handleAddGroupRange = (e?: React.FormEvent) => {
    e?.preventDefault();
    setInputError(null);
    const text = groupInput.trim();
    if (!text) {
      setInputError("Please enter roll numbers or a range like 101-115.");
      return;
    }

    const rollSet = new Set<string>();
    const tokens = text.split(/[,\s]+/);

    for (const token of tokens) {
      if (!token) continue;
      if (token.includes("-")) {
        const parts = token.split("-");
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);

        if (!isNaN(start) && !isNaN(end) && start <= end) {
          // Limit range size to prevent accidental million loops
          const maxCount = Math.min(100, end - start + 1);
          for (let i = 0; i < maxCount; i++) {
            rollSet.add((start + i).toString());
          }
        }
      } else {
        rollSet.add(token.trim());
      }
    }

    if (rollSet.size === 0) {
      setInputError("Invalid roll number format. Example: 101-115 or 101, 102, 105-110");
      return;
    }

    const newStudents: StudentRecordItem[] = [];
    const currentRolls = new Set(targetedStudents.map((s) => s.rollNumber));

    Array.from(rollSet).forEach((roll) => {
      if (currentRolls.has(roll)) return;

      const existing = DATABASE_STUDENTS.find((s) => s.rollNumber === roll);
      if (existing) {
        newStudents.push(existing);
      } else {
        newStudents.push({
          id: `STU-${roll}-${Date.now().toString().slice(-3)}`,
          rollNumber: roll,
          admissionNumber: `ADM-${selectedBatch.split("/")[0]}-${roll.padStart(3, "0")}`,
          fullName: `Student (Roll ${roll})`,
          class: selectedClass,
          batch: selectedBatch,
          mobile: "+977-98XXXXXXXX",
          guardianName: "Guardian",
        });
      }
    });

    if (newStudents.length === 0) {
      setInputError("All specified roll numbers are already in the list.");
      return;
    }

    setTargetedStudents((prev) => [...prev, ...newStudents]);
    setGroupInput("");
  };

  // 3. Add by Excel Sheet Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);

    // Simulated Excel/CSV parsing of roll numbers
    const sampleRolls = ["101", "102", "103", "108", "111", "112", "113", "114", "115"];
    const currentRolls = new Set(targetedStudents.map((s) => s.rollNumber));
    const newStudents: StudentRecordItem[] = [];

    sampleRolls.forEach((roll) => {
      if (currentRolls.has(roll)) return;
      const matched = DATABASE_STUDENTS.find((s) => s.rollNumber === roll);
      if (matched) {
        newStudents.push(matched);
      } else {
        newStudents.push({
          id: `STU-${roll}-${Date.now().toString().slice(-3)}`,
          rollNumber: roll,
          admissionNumber: `ADM-${selectedBatch.split("/")[0]}-${roll.padStart(3, "0")}`,
          fullName: `Student (Roll ${roll})`,
          class: selectedClass,
          batch: selectedBatch,
          mobile: "+977-98XXXXXXXX",
          guardianName: "Guardian",
        });
      }
    });

    setTargetedStudents((prev) => [...prev, ...newStudents]);
  };

  const handleRemoveStudent = (id: string) => {
    setTargetedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllStudents = () => {
    setTargetedStudents([]);
    setExcelFileName(null);
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAllServices = () => {
    if (selectedServices.length === AVAILABLE_SERVICES.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(AVAILABLE_SERVICES.map((s) => s.id));
    }
  };

  const handleNextClick = () => {
    setInputError(null);

    let currentList = [...targetedStudents];

    // If no students currently added but text is in input box, auto-add
    if (currentList.length === 0) {
      if (activeTab === "single" && singleInput.trim()) {
        const query = singleInput.trim();
        const matched = DATABASE_STUDENTS.find(
          (s) =>
            s.rollNumber.toLowerCase() === query.toLowerCase() ||
            s.admissionNumber.toLowerCase() === query.toLowerCase() ||
            s.fullName.toLowerCase().includes(query.toLowerCase())
        );
        const item: StudentRecordItem = matched || {
          id: `STU-${Date.now().toString().slice(-4)}`,
          rollNumber: query,
          admissionNumber: `ADM-${selectedBatch.split("/")[0]}-${query.padStart(3, "0")}`,
          fullName: `Student (Roll ${query})`,
          class: selectedClass,
          batch: selectedBatch,
          mobile: "+977-98XXXXXXXX",
          guardianName: "Guardian",
        };
        currentList = [item];
        setTargetedStudents([item]);
        setSingleInput("");
      } else if (activeTab === "group" && groupInput.trim()) {
        const text = groupInput.trim();
        const rollSet = new Set<string>();
        const tokens = text.split(/[,\s]+/);

        for (const token of tokens) {
          if (!token) continue;
          if (token.includes("-")) {
            const parts = token.split("-");
            const start = parseInt(parts[0], 10);
            const end = parseInt(parts[1], 10);

            if (!isNaN(start) && !isNaN(end) && start <= end) {
              const maxCount = Math.min(100, end - start + 1);
              for (let i = 0; i < maxCount; i++) {
                rollSet.add((start + i).toString());
              }
            }
          } else {
            rollSet.add(token.trim());
          }
        }

        const newStudents: StudentRecordItem[] = [];
        Array.from(rollSet).forEach((roll) => {
          const existing = DATABASE_STUDENTS.find((s) => s.rollNumber === roll);
          if (existing) {
            newStudents.push(existing);
          } else {
            newStudents.push({
              id: `STU-${roll}-${Date.now().toString().slice(-3)}`,
              rollNumber: roll,
              admissionNumber: `ADM-${selectedBatch.split("/")[0]}-${roll.padStart(3, "0")}`,
              fullName: `Student (Roll ${roll})`,
              class: selectedClass,
              batch: selectedBatch,
              mobile: "+977-98XXXXXXXX",
              guardianName: "Guardian",
            });
          }
        });

        if (newStudents.length > 0) {
          currentList = newStudents;
          setTargetedStudents(newStudents);
          setGroupInput("");
        }
      }
    }

    if (currentList.length === 0) {
      setInputError("Please enter student roll number(s) to proceed.");
      return;
    }
    if (selectedServices.length === 0) {
      setInputError("Please select at least one service to disable.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirmDisable = () => {
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const selectedServiceLabels = AVAILABLE_SERVICES.filter((s) =>
    selectedServices.includes(s.id)
  )
    .map((s) => s.shortLabel)
    .join(", ");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none pb-20">
      {/* 1. Global Header */}
      <ErpHeader />

      {/* 2. Global Top Navigation */}
      <ErpTopNav activeModuleId="students" />

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Top Action Bar: View Disable History Button */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              setHistorySearchQuery("");
              setIsHistoryModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--neutral-700)] hover:bg-red-50/50 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <History className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>View Disable History</span>
          </button>
        </div>

        {/* Error Notice */}
        {inputError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] flex items-center justify-between gap-2 text-xs text-red-800 animate-in fade-in-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span className="font-medium">{inputError}</span>
            </div>
            <button
              type="button"
              onClick={() => setInputError(null)}
              className="p-1 text-red-600 hover:text-red-900 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Main Disablement Form */}
        <div className="max-w-3xl w-full mx-auto space-y-4">
          {/* Student Entry Card */}
          <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
            {/* Method Selector Tabs */}
            <div className="flex items-center border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("single");
                  setInputError(null);
                }}
                className={cn(
                  "flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-r border-[var(--border-default)] transition-colors cursor-pointer",
                  activeTab === "single"
                    ? "bg-white text-[var(--brand-primary)] border-b-2 border-b-[var(--brand-primary)] font-bold shadow-2xs"
                    : "text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-red-50/30"
                )}
              >
                <Search className="h-3.5 w-3.5" />
                <span>Single Input</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("group");
                  setInputError(null);
                }}
                className={cn(
                  "flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-r border-[var(--border-default)] transition-colors cursor-pointer",
                  activeTab === "group"
                    ? "bg-white text-[var(--brand-primary)] border-b-2 border-b-[var(--brand-primary)] font-bold shadow-2xs"
                    : "text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-red-50/30"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Add by Group (-)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("excel");
                  setInputError(null);
                }}
                className={cn(
                  "flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                  activeTab === "excel"
                    ? "bg-white text-[var(--brand-primary)] border-b-2 border-b-[var(--brand-primary)] font-bold shadow-2xs"
                    : "text-neutral-600 hover:text-[var(--brand-primary)] hover:bg-red-50/30"
                )}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Excel Sheet</span>
              </button>
            </div>

            {/* Tab Content 1: Single Roll Number Input */}
            {activeTab === "single" && (
              <form onSubmit={handleAddSingleStudent} className="p-4 space-y-3 animate-in fade-in-0 duration-150">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Enter Roll Number / Admission Number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={singleInput}
                        onChange={(e) => setSingleInput(e.target.value)}
                        className="w-full h-9 pl-3 pr-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tab Content 2: Group Range Input using "-" */}
            {activeTab === "group" && (
              <form onSubmit={handleAddGroupRange} className="p-4 space-y-3 animate-in fade-in-0 duration-150">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Type Roll Number Range (using &ldquo;-&rdquo;)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={groupInput}
                      onChange={(e) => setGroupInput(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] shadow-inner font-mono font-medium"
                    />
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Users className="h-4 w-4" />
                      <span>Add Group</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tab Content 3: Excel Sheet Upload */}
            {activeTab === "excel" && (
              <div className="p-4 space-y-3 animate-in fade-in-0 duration-150">
                <div className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)] rounded-lg p-5 text-center bg-neutral-50/50 transition-colors">
                  <input
                    type="file"
                    id="excel-file-input"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="excel-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="h-10 w-10 rounded-full bg-red-100 text-[var(--brand-primary)] flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-800">
                        {excelFileName ? excelFileName : "Click to upload Excel or CSV sheet"}
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        File must contain a column named &ldquo;Roll Number&rdquo; or &ldquo;Admission Number&rdquo;
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-500">Need a starter spreadsheet?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const csv = "Roll Number,Student Name,Class\n101,Aarav Sharma,Grade 10-A\n102,Pooja Shrestha,Grade 10-A\n103,Rohan Chaudhary,Grade 10-B\n";
                      const uri = "data:text/csv;charset=utf-8," + encodeURI(csv);
                      const link = document.createElement("a");
                      link.setAttribute("href", uri);
                      link.setAttribute("download", "student_roll_template.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs text-[var(--brand-primary)] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Sample CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Service Restriction Checklist */}
          <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                <Coins className="h-4 w-4 text-[var(--brand-primary)]" />
                <span>Services to Disable ({selectedServices.length} selected)</span>
              </div>

              <button
                type="button"
                onClick={handleSelectAllServices}
                className="text-xs text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                {selectedServices.length === AVAILABLE_SERVICES.length ? "Clear All" : "Select All"}
              </button>
            </div>

            {/* Service Cards - White and Red Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isChecked = selectedServices.includes(srv.id);

                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={cn(
                      "p-2.5 rounded-md border text-left transition-all cursor-pointer select-none flex items-start justify-between gap-2",
                      isChecked
                        ? "bg-red-50/60 border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/25"
                        : "bg-white border-neutral-200 hover:bg-red-50/20 hover:border-red-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={cn(
                          "p-1.5 rounded shrink-0 transition-colors",
                          isChecked ? "bg-[var(--brand-primary)] text-white" : "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className={cn(
                          "text-xs font-bold block leading-tight",
                          isChecked ? "text-red-950" : "text-neutral-900"
                        )}>
                          {srv.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-medium">
                          {srv.department}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Action Bar with Next Button showing Student Count */}
          <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-xs flex items-center justify-between gap-3">
            <div className="text-xs text-neutral-600">
              {targetedStudents.length > 0 ? (
                <span>
                  <strong className="text-[var(--brand-primary)] font-semibold">{targetedStudents.length} Student(s)</strong> selected •{" "}
                  <strong className="text-neutral-800">{selectedServices.length} Services</strong>
                </span>
              ) : (
                <span className="text-neutral-500">
                  Enter student roll number(s) and select services above
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextClick}
              className="px-6 py-2.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next {targetedStudents.length > 0 ? `(${targetedStudents.length})` : ""}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. Confirmation Modal: Clean & Professional White and Red */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-98 duration-150 text-left">
            {/* Header */}
            <div className="p-5 pb-4 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">
                Are you sure you want to disable services?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Please review the selected details before confirming.
              </p>
            </div>

            {/* Details */}
            <div className="p-5 py-4 space-y-2.5 text-xs text-neutral-700 bg-neutral-50/40">
              <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Students:</span>
                <span className="font-bold text-[var(--brand-primary)]">
                  {targetedStudents.length} student(s)
                </span>
              </div>
              <div className="flex justify-between items-start py-1">
                <span className="text-neutral-500 shrink-0">Services:</span>
                <span className="font-medium text-neutral-900 text-right">
                  {selectedServiceLabels}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-neutral-50/80 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3.5 py-1.5 rounded-[4px] border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalConfirmDisable}
                className="px-4 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-xs font-medium text-white shadow-2xs transition-colors cursor-pointer"
              >
                Yes, Disable Services
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Success Dialog */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-sm w-full p-5 text-left space-y-3 animate-in zoom-in-98 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Services Disabled
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                The selected services have been disabled for <span className="font-bold text-[var(--brand-primary)]">{targetedStudents.length} student(s)</span>.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setTargetedStudents([]);
                  setIsSuccessModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-[4px] border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
              >
                Disable More
              </button>
              <button
                type="button"
                onClick={() => router.push(ROUTES.STUDENTS.ROOT)}
                className="px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                Go to Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Disable History Modal with Search Box */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-98 duration-150 text-left flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-red-50 text-[var(--brand-primary)] border border-red-200/60">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                    Disable History
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Recent disable records • Search by student roll number or name
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Box */}
            <div className="p-3.5 border-b border-neutral-100 bg-white">
              <div className="relative">
                <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search by student roll number (e.g. 104), name, or admission..."
                  className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-neutral-200 rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/20 shadow-inner"
                  autoFocus
                />
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                <span>
                  Showing <strong className="text-[var(--brand-primary)] font-bold">{filteredHistory.length}</strong> of 10 recent records
                </span>
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery("")}
                    className="text-[var(--brand-primary)] hover:underline cursor-pointer font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            {/* History Table / Records */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2 sm:p-3 space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-700">No records found</p>
                  <p className="text-[11px] text-neutral-500">
                    No student found matching &ldquo;{historySearchQuery}&rdquo; in disable history.
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-md border border-neutral-200 hover:border-red-200 hover:bg-red-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-9 rounded bg-red-50 border border-red-200 text-[var(--brand-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                        {item.rollNumber}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900">{item.fullName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({item.admissionNumber})</span>
                        </div>
                        <div className="text-[11px] text-neutral-600">
                          <span>{item.class}</span> • <span className="text-neutral-500">{item.disabledBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                      <div className="flex flex-wrap gap-1">
                        {item.disabledServices.map((srv, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] font-semibold"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400">{item.disabledAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                10 most recent disabled student records
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 rounded-[4px] border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

