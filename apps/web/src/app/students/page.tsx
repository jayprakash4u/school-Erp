"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  MoreVertical,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Trash2,
  FileCheck,
  CheckSquare,
  Square,
  ArrowUpDown,
  Filter,
  Columns,
  RefreshCw,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// Comprehensive Student Record Interface with all columns from the 4 screenshots
export interface StudentRecord {
  id: string;
  photo?: string;
  fullName: string;
  fullNameNepali?: string;
  middleName?: string;
  rollNumber: string;
  admissionNumber: string;
  class: string;
  batch: string;
  mobile: string;
  email: string;
  gender: "Male" | "Female" | "Other";
  dobBS: string;
  dobAD: string;
  bloodGroup: string;
  medicalBloodGroup?: string;
  bloodPressure?: string;
  heightInch?: number;
  weightKg?: number;
  medicalConditions?: string;
  healthNotes?: string;
  nutrition?: string;
  hospitalName?: string;
  doctorName?: string;
  wearsLens: boolean;
  isForeign: boolean;
  isHostel: boolean;
  isBus: boolean;
  isDisabled: boolean;
  isRemote: boolean;
  isPrevious: boolean;
  isTemporary: boolean;
  country: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  tole: string;
  address: string;
  tempProvince?: string;
  tempDistrict?: string;
  tempMunicipality?: string;
  tempWardNo?: string;
  tempAddress?: string;
  applicationFormNo?: string;
  sgiNo?: string;
  scholarship?: string;
  quotaType?: string;
  universityRegNo?: string;
  registrationDateBS?: string;
  registrationDateAD?: string;
  citizenshipNo?: string;
  passportNo?: string;
  nationalIdNo?: string;
  guardianName: string;
  relation: string;
  guardianMobile: string;
  occupation?: string;
  ethnicGroup?: string;
  caste?: string;
  maritalStatus?: string;
  status: "Active" | "Inactive" | "Transferred";
}

// Initial realistic Nepali School ERP demo data
const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: "STU-1001",
    fullName: "Aarav Sharma",
    fullNameNepali: "आरव शर्मा",
    rollNumber: "101",
    admissionNumber: "ADM-2083-001",
    class: "Grade 10-A",
    batch: "2083/84",
    mobile: "+977-9841234567",
    email: "aarav.sharma@gmail.com",
    gender: "Male",
    dobBS: "2068-03-15",
    dobAD: "2011-06-29",
    bloodGroup: "O+",
    medicalBloodGroup: "O+",
    bloodPressure: "110/75",
    heightInch: 62,
    weightKg: 48,
    medicalConditions: "None",
    healthNotes: "Normal",
    nutrition: "Good",
    hospitalName: "Grande Int'l Hospital",
    doctorName: "Dr. K.P. Joshi",
    wearsLens: false,
    isForeign: false,
    isHostel: true,
    isBus: false,
    isDisabled: false,
    isRemote: false,
    isPrevious: true,
    isTemporary: false,
    country: "Nepal",
    province: "Bagmati Province",
    district: "Kathmandu",
    municipality: "Kathmandu Metro",
    wardNo: "04",
    tole: "Baluwatar",
    address: "Baluwatar Marg-4, Kathmandu",
    tempProvince: "Bagmati Province",
    tempDistrict: "Kathmandu",
    tempMunicipality: "Kathmandu Metro",
    tempWardNo: "04",
    tempAddress: "Hostel Block A, Bed 12",
    applicationFormNo: "AF-2083-049",
    sgiNo: "SGI-8890",
    scholarship: "Academic Merit 50%",
    quotaType: "General Quota",
    universityRegNo: "NEB-902341",
    registrationDateBS: "2083-01-10",
    registrationDateAD: "2026-04-23",
    citizenshipNo: "27-01-79-11234",
    passportNo: "N1293847",
    nationalIdNo: "902-8374-110",
    guardianName: "Bishnu Sharma",
    relation: "Father",
    guardianMobile: "+977-9801234567",
    occupation: "Senior Engineer",
    ethnicGroup: "Brahmin / Chhetri",
    caste: "Brahmin",
    maritalStatus: "Single",
    status: "Active",
  },
  {
    id: "STU-1002",
    fullName: "Pooja Shrestha",
    fullNameNepali: "पूजा श्रेष्ठ",
    rollNumber: "102",
    admissionNumber: "ADM-2083-002",
    class: "Grade 10-A",
    batch: "2083/84",
    mobile: "+977-9812345678",
    email: "pooja.shrestha@gmail.com",
    gender: "Female",
    dobBS: "2068-05-22",
    dobAD: "2011-09-08",
    bloodGroup: "A+",
    medicalBloodGroup: "A+",
    bloodPressure: "115/80",
    heightInch: 59,
    weightKg: 44,
    medicalConditions: "Mild Asthma",
    healthNotes: "Carries Inhaler",
    nutrition: "Normal",
    hospitalName: "Norvic Int'l Hospital",
    doctorName: "Dr. Anita Rayamajhi",
    wearsLens: true,
    isForeign: false,
    isHostel: false,
    isBus: true,
    isDisabled: false,
    isRemote: false,
    isPrevious: true,
    isTemporary: false,
    country: "Nepal",
    province: "Bagmati Province",
    district: "Lalitpur",
    municipality: "Lalitpur Metro",
    wardNo: "02",
    tole: "Sanepa",
    address: "Sanepa Height, Lalitpur",
    applicationFormNo: "AF-2083-052",
    sgiNo: "SGI-8891",
    scholarship: "None",
    quotaType: "General Quota",
    universityRegNo: "NEB-902342",
    registrationDateBS: "2083-01-12",
    registrationDateAD: "2026-04-25",
    citizenshipNo: "28-02-80-00451",
    nationalIdNo: "902-8374-112",
    guardianName: "Rajan Shrestha",
    relation: "Father",
    guardianMobile: "+977-9851029384",
    occupation: "Business Executive",
    ethnicGroup: "Janajati",
    caste: "Newar",
    maritalStatus: "Single",
    status: "Active",
  },
  {
    id: "STU-1003",
    fullName: "Rohan Chaudhary",
    fullNameNepali: "रोहन चौधरी",
    rollNumber: "103",
    admissionNumber: "ADM-2083-003",
    class: "Grade 10-B",
    batch: "2083/84",
    mobile: "+977-9865432109",
    email: "rohan.chy@gmail.com",
    gender: "Male",
    dobBS: "2067-11-18",
    dobAD: "2011-03-02",
    bloodGroup: "B+",
    medicalBloodGroup: "B+",
    bloodPressure: "120/80",
    heightInch: 64,
    weightKg: 52,
    medicalConditions: "None",
    healthNotes: "Athletic / Footballer",
    nutrition: "Excellent",
    hospitalName: "Bir Hospital",
    doctorName: "Dr. Sagar Thapa",
    wearsLens: false,
    isForeign: false,
    isHostel: true,
    isBus: false,
    isDisabled: false,
    isRemote: true,
    isPrevious: false,
    isTemporary: true,
    country: "Nepal",
    province: "Madhesh Province",
    district: "Dhanusha",
    municipality: "Janakpur Sub-Metro",
    wardNo: "08",
    tole: "Ramanand Chowk",
    address: "Ramanand Chowk-8, Janakpur",
    tempProvince: "Bagmati Province",
    tempDistrict: "Kathmandu",
    tempMunicipality: "Kathmandu Metro",
    tempWardNo: "04",
    tempAddress: "Hostel Block B, Bed 04",
    applicationFormNo: "AF-2083-088",
    sgiNo: "SGI-8898",
    scholarship: "Sports Quota 100%",
    quotaType: "Reserved Quota",
    universityRegNo: "NEB-902345",
    registrationDateBS: "2083-01-15",
    registrationDateAD: "2026-04-28",
    citizenshipNo: "14-01-78-99881",
    nationalIdNo: "902-8374-129",
    guardianName: "Mahesh Chaudhary",
    relation: "Father",
    guardianMobile: "+977-9845012345",
    occupation: "Agriculture & Enterprise",
    ethnicGroup: "Tharu / Madhesi",
    caste: "Chaudhary",
    maritalStatus: "Single",
    status: "Active",
  },
  {
    id: "STU-1004",
    fullName: "Ananya Yadav",
    fullNameNepali: "अनन्या यादव",
    rollNumber: "104",
    admissionNumber: "ADM-2083-004",
    class: "Grade 9-A",
    batch: "2083/84",
    mobile: "+977-9807654321",
    email: "ananya.yadav@gmail.com",
    gender: "Female",
    dobBS: "2069-02-10",
    dobAD: "2012-05-23",
    bloodGroup: "AB+",
    medicalBloodGroup: "AB+",
    bloodPressure: "110/70",
    heightInch: 57,
    weightKg: 41,
    medicalConditions: "None",
    healthNotes: "Normal",
    nutrition: "Good",
    wearsLens: false,
    isForeign: false,
    isHostel: false,
    isBus: true,
    isDisabled: false,
    isRemote: false,
    isPrevious: true,
    isTemporary: false,
    country: "Nepal",
    province: "Bagmati Province",
    district: "Bhaktapur",
    municipality: "Suryabinayak",
    wardNo: "05",
    tole: "Katunje",
    address: "Katunje-5, Bhaktapur",
    applicationFormNo: "AF-2083-112",
    sgiNo: "SGI-8910",
    scholarship: "Sibling Discount 25%",
    quotaType: "General Quota",
    universityRegNo: "NEB-902350",
    registrationDateBS: "2083-01-18",
    registrationDateAD: "2026-05-01",
    nationalIdNo: "902-8374-145",
    guardianName: "Jay Prakash Yadav",
    relation: "Father",
    guardianMobile: "+977-9841998877",
    occupation: "Professor",
    ethnicGroup: "Madhesi",
    caste: "Yadav",
    maritalStatus: "Single",
    status: "Active",
  },
];

// Definition of All 60+ Table Columns
interface ColumnConfig {
  key: keyof StudentRecord | "actions" | "select" | "index";
  label: string;
  minWidth?: number;
  pinned?: "left" | "right";
  visibleByDefault?: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { key: "select", label: "", minWidth: 40, pinned: "left", visibleByDefault: true },
  { key: "index", label: "#", minWidth: 40, pinned: "left", visibleByDefault: true },
  { key: "fullName", label: "Student Name", minWidth: 160, pinned: "left", visibleByDefault: true },
  { key: "mobile", label: "Mobile", minWidth: 120, visibleByDefault: true },
  { key: "rollNumber", label: "Roll Number", minWidth: 100, visibleByDefault: true },
  { key: "email", label: "Email", minWidth: 160, visibleByDefault: true },
  { key: "admissionNumber", label: "Admission Number", minWidth: 140, visibleByDefault: true },
  { key: "hospitalName", label: "Hospital Name", minWidth: 150, visibleByDefault: true },
  { key: "bloodPressure", label: "Blood Pressure", minWidth: 110, visibleByDefault: true },
  { key: "heightInch", label: "Height (Inch)", minWidth: 95, visibleByDefault: true },
  { key: "weightKg", label: "Weight (Kg)", minWidth: 95, visibleByDefault: true },
  { key: "isForeign", label: "Is Foreign", minWidth: 85, visibleByDefault: true },
  { key: "batch", label: "Batch", minWidth: 90, visibleByDefault: true },
  { key: "class", label: "Class", minWidth: 100, visibleByDefault: true },
  { key: "medicalConditions", label: "Medical Conditions", minWidth: 140, visibleByDefault: true },
  { key: "bloodGroup", label: "Blood Group", minWidth: 95, visibleByDefault: true },
  { key: "healthNotes", label: "Health Notes", minWidth: 120, visibleByDefault: true },
  { key: "nutrition", label: "Nutrition", minWidth: 90, visibleByDefault: true },
  { key: "wardNo", label: "Ward No.", minWidth: 85, visibleByDefault: true },
  { key: "wearsLens", label: "Wears Lens", minWidth: 90, visibleByDefault: true },
  { key: "country", label: "Country", minWidth: 90, visibleByDefault: true },
  { key: "isHostel", label: "Is Hostel", minWidth: 85, visibleByDefault: true },
  { key: "province", label: "Province", minWidth: 130, visibleByDefault: true },
  { key: "isBus", label: "Is Bus", minWidth: 75, visibleByDefault: true },
  { key: "district", label: "District", minWidth: 100, visibleByDefault: true },
  { key: "isDisabled", label: "Is Disabled", minWidth: 90, visibleByDefault: true },
  { key: "municipality", label: "Municipality", minWidth: 130, visibleByDefault: true },
  { key: "isRemote", label: "Is Remote", minWidth: 85, visibleByDefault: true },
  { key: "address", label: "Address", minWidth: 160, visibleByDefault: true },
  { key: "tempWardNo", label: "Temp Ward No.", minWidth: 105, visibleByDefault: true },
  { key: "isPrevious", label: "Is Previous", minWidth: 90, visibleByDefault: true },
  { key: "tole", label: "Tole", minWidth: 95, visibleByDefault: true },
  { key: "isTemporary", label: "Is Temporary", minWidth: 100, visibleByDefault: true },
  { key: "tempProvince", label: "Temp Province", minWidth: 130, visibleByDefault: true },
  { key: "tempDistrict", label: "Temp District", minWidth: 110, visibleByDefault: true },
  { key: "tempMunicipality", label: "Temp Municipality", minWidth: 140, visibleByDefault: true },
  { key: "tempAddress", label: "Temp Address", minWidth: 150, visibleByDefault: true },
  { key: "applicationFormNo", label: "Application Form No.", minWidth: 145, visibleByDefault: true },
  { key: "sgiNo", label: "SGI No.", minWidth: 90, visibleByDefault: true },
  { key: "scholarship", label: "Scholarship", minWidth: 140, visibleByDefault: true },
  { key: "quotaType", label: "Quota Type", minWidth: 120, visibleByDefault: true },
  { key: "universityRegNo", label: "University Registration No.", minWidth: 170, visibleByDefault: true },
  { key: "registrationDateBS", label: "Registration Date (BS)", minWidth: 140, visibleByDefault: true },
  { key: "registrationDateAD", label: "Registration Date (AD)", minWidth: 140, visibleByDefault: true },
  { key: "citizenshipNo", label: "Citizenship No.", minWidth: 130, visibleByDefault: true },
  { key: "passportNo", label: "Passport No.", minWidth: 110, visibleByDefault: true },
  { key: "nationalIdNo", label: "National ID No.", minWidth: 130, visibleByDefault: true },
  { key: "guardianName", label: "Guardian Name", minWidth: 140, visibleByDefault: true },
  { key: "relation", label: "Relation", minWidth: 90, visibleByDefault: true },
  { key: "guardianMobile", label: "Guardian Mobile", minWidth: 130, visibleByDefault: true },
  { key: "occupation", label: "Occupation", minWidth: 130, visibleByDefault: true },
  { key: "doctorName", label: "Doctor Name", minWidth: 130, visibleByDefault: true },
  { key: "medicalBloodGroup", label: "Medical Blood Group", minWidth: 140, visibleByDefault: true },
  { key: "middleName", label: "Middle Name", minWidth: 100, visibleByDefault: true },
  { key: "fullNameNepali", label: "Full Name Nepali", minWidth: 140, visibleByDefault: true },
  { key: "gender", label: "Gender", minWidth: 85, visibleByDefault: true },
  { key: "dobBS", label: "Date of Birth (BS)", minWidth: 130, visibleByDefault: true },
  { key: "dobAD", label: "Date of Birth (AD)", minWidth: 130, visibleByDefault: true },
  { key: "ethnicGroup", label: "Ethnic Group", minWidth: 120, visibleByDefault: true },
  { key: "caste", label: "Caste", minWidth: 95, visibleByDefault: true },
  { key: "maritalStatus", label: "Marital Status", minWidth: 105, visibleByDefault: true },
  { key: "actions", label: "Actions", minWidth: 90, pinned: "right", visibleByDefault: true },
];

export default function OurStudentsPage() {
  const [students, setStudents] = React.useState<StudentRecord[]>(SAMPLE_STUDENTS);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedClass, setSelectedClass] = React.useState<string>("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [recordsPerPage, setRecordsPerPage] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = React.useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState<boolean>(false);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => {
      init[col.key] = col.visibleByDefault ?? true;
    });
    return init;
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showAllColumns = () => {
    const allTrue: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => {
      allTrue[col.key] = true;
    });
    setVisibleColumns(allTrue);
  };

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stu.fullNameNepali && stu.fullNameNepali.includes(searchQuery)) ||
      stu.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.mobile.includes(searchQuery) ||
      stu.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === "ALL" || stu.class.includes(selectedClass);

    return matchesSearch && matchesClass;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / recordsPerPage));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleSelectAll = () => {
    if (selectedStudentIds.length === paginatedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(paginatedStudents.map((s) => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedClass("ALL");
    setCurrentPage(1);
  };

  const activeColumnsList = ALL_COLUMNS.filter((col) => visibleColumns[col.key]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      {/* 1. Global Header with Quick Menu & FY session */}
      <ErpHeader />

      {/* 2. 20-Module Top Navigation Bar */}
      <ErpTopNav activeModuleId="students" />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 w-full mx-auto p-3 sm:p-4 space-y-3">
        {/* Top Filter & Actions Header Bar */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-[6px] border border-[var(--border-default)] shadow-xs space-y-3">
          {/* Row 1: Class Selector & Top Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Class Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 px-3 text-xs font-semibold bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer shadow-xs min-w-[150px]"
              >
                <option value="ALL">All Students</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 10-A">Grade 10-A</option>
                <option value="Grade 10-B">Grade 10-B</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 9-A">Grade 9-A</option>
                <option value="Grade 8">Grade 8</option>
              </select>
            </div>

            {/* Right: Column Visibility + Add Student Button + More */}
            <div className="flex items-center gap-2">
              {/* Column Settings Toggle Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
                  title="Customize Columns"
                  className={cn(
                    "h-8 px-2.5 rounded-[4px] border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer",
                    isColumnDropdownOpen
                      ? "bg-[var(--red-50)] text-[var(--brand-primary)] border-[var(--brand-primary)]"
                      : "bg-white text-[var(--neutral-700)] border-[var(--border-default)] hover:bg-[var(--neutral-50)]"
                  )}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Columns</span>
                </button>

                {/* Column Visibility Popover Dropdown */}
                {isColumnDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-98 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)] mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Toggle Columns
                      </span>
                      <button
                        type="button"
                        onClick={showAllColumns}
                        className="text-[10px] text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer"
                      >
                        Show All
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {ALL_COLUMNS.filter((c) => c.key !== "select" && c.key !== "actions").map(
                        (col) => (
                          <label
                            key={col.key}
                            className="flex items-center gap-2 px-1.5 py-1 text-xs text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] rounded cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(visibleColumns[col.key])}
                              onChange={() => toggleColumn(col.key)}
                              className="rounded border-[var(--neutral-300)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-3.5 w-3.5"
                            />
                            <span className="truncate">{col.label}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* + Student Primary Button */}
              <Link
                href={ROUTES.STUDENTS.ADMISSION}
                className="h-8 px-3.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Student</span>
              </Link>

              {/* More Actions Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                  className="h-8 w-8 rounded-[4px] border border-[var(--border-default)] bg-white text-[var(--neutral-600)] hover:text-black hover:bg-[var(--neutral-50)] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-[6px] border border-[var(--border-default)] shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-98 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["Roll No", "Admission No", "Name", "Class", "Gender", "Mobile", "Email", "Status"];
                        const rows = filteredStudents.map((s) => [
                          s.rollNumber,
                          s.admissionNumber,
                          `"${s.fullName}"`,
                          `"${s.class}"`,
                          s.gender,
                          s.mobile,
                          s.email,
                          s.status,
                        ]);
                        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `student_directory_${new Date().toISOString().split("T")[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 text-[var(--neutral-700)] hover:bg-[var(--neutral-50)] cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>Export to Excel (CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 text-[var(--neutral-700)] hover:bg-[var(--neutral-50)]"
                    >
                      <Printer className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      <span>Print Directory</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Search Input & Filter Buttons matching reference */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border-light)]">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search students... (Name, Roll, Admission No, Phone)"
                className="w-full h-8 pl-3 pr-8 text-xs bg-white border border-[var(--border-default)] rounded-[4px] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-black"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="h-8 px-3.5 rounded-[4px] border border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--red-50)]/50 hover:bg-[var(--red-50)] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="h-8 px-3 rounded-[4px] border border-[var(--border-default)] bg-white text-[var(--neutral-600)] hover:bg-[var(--neutral-50)] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* 4. Complete Master Students Data Table */}
        <div className="bg-[var(--bg-primary)] rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden flex flex-col">
          {/* Scrollable Table Viewport with All 60+ Columns */}
          <div className="overflow-x-auto custom-scrollbar min-h-[420px]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)] sticky top-0 z-10">
                  {/* Select All Checkbox */}
                  {visibleColumns["select"] && (
                    <th className="py-2.5 px-3 w-10 text-center bg-[var(--neutral-50)]">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="cursor-pointer text-[var(--neutral-500)] hover:text-black"
                      >
                        {selectedStudentIds.length === paginatedStudents.length &&
                        paginatedStudents.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  )}

                  {/* Serial Index */}
                  {visibleColumns["index"] && (
                    <th className="py-2.5 px-3 w-10 text-center bg-[var(--neutral-50)]">#</th>
                  )}

                  {/* Render Visible Column Headers */}
                  {ALL_COLUMNS.filter(
                    (col) =>
                      col.key !== "select" &&
                      col.key !== "index" &&
                      col.key !== "actions" &&
                      visibleColumns[col.key]
                  ).map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.minWidth }}
                      className="py-2.5 px-3 text-[10px] font-bold text-[var(--neutral-700)] border-r border-[var(--border-light)]"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}

                  {/* Actions Column */}
                  {visibleColumns["actions"] && (
                    <th className="py-2.5 px-3 w-20 text-right bg-[var(--neutral-50)] sticky right-0 shadow-l">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-default)]">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, idx) => {
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <tr
                        key={student.id}
                        className={cn(
                          "hover:bg-[var(--neutral-50)]/80 transition-colors",
                          isSelected && "bg-[var(--red-50)]/40"
                        )}
                      >
                        {/* Select Row Checkbox */}
                        {visibleColumns["select"] && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectOne(student.id)}
                              className="cursor-pointer text-[var(--neutral-500)] hover:text-black"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        )}

                        {/* Serial Number */}
                        {visibleColumns["index"] && (
                          <td className="py-2.5 px-3 text-center text-[var(--neutral-500)] font-medium">
                            {(currentPage - 1) * recordsPerPage + idx + 1}
                          </td>
                        )}

                        {/* Student Name */}
                        {visibleColumns["fullName"] && (
                          <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)] border-r border-[var(--border-light)]">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {student.fullName.charAt(0)}
                              </div>
                              <span className="hover:text-[var(--brand-primary)] cursor-pointer">
                                {student.fullName}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Mobile */}
                        {visibleColumns["mobile"] && (
                          <td className="py-2.5 px-3 font-mono text-[11px] border-r border-[var(--border-light)]">
                            {student.mobile}
                          </td>
                        )}

                        {/* Roll Number */}
                        {visibleColumns["rollNumber"] && (
                          <td className="py-2.5 px-3 font-mono font-bold text-[var(--brand-primary)] border-r border-[var(--border-light)]">
                            {student.rollNumber}
                          </td>
                        )}

                        {/* Email */}
                        {visibleColumns["email"] && (
                          <td className="py-2.5 px-3 text-[var(--neutral-600)] border-r border-[var(--border-light)]">
                            {student.email}
                          </td>
                        )}

                        {/* Admission Number */}
                        {visibleColumns["admissionNumber"] && (
                          <td className="py-2.5 px-3 font-mono text-[11px] border-r border-[var(--border-light)]">
                            {student.admissionNumber}
                          </td>
                        )}

                        {/* Hospital Name */}
                        {visibleColumns["hospitalName"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.hospitalName || "—"}
                          </td>
                        )}

                        {/* Blood Pressure */}
                        {visibleColumns["bloodPressure"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.bloodPressure || "—"}
                          </td>
                        )}

                        {/* Height */}
                        {visibleColumns["heightInch"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.heightInch ? `${student.heightInch}"` : "—"}
                          </td>
                        )}

                        {/* Weight */}
                        {visibleColumns["weightKg"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.weightKg ? `${student.weightKg} kg` : "—"}
                          </td>
                        )}

                        {/* Is Foreign */}
                        {visibleColumns["isForeign"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isForeign ? "Yes" : "No"}
                          </td>
                        )}

                        {/* Batch */}
                        {visibleColumns["batch"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.batch}
                          </td>
                        )}

                        {/* Class */}
                        {visibleColumns["class"] && (
                          <td className="py-2.5 px-3 font-medium border-r border-[var(--border-light)]">
                            <span className="px-2 py-0.5 rounded bg-[var(--neutral-100)] text-[11px] font-semibold text-[var(--neutral-800)]">
                              {student.class}
                            </span>
                          </td>
                        )}

                        {/* Medical Conditions */}
                        {visibleColumns["medicalConditions"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.medicalConditions || "None"}
                          </td>
                        )}

                        {/* Blood Group */}
                        {visibleColumns["bloodGroup"] && (
                          <td className="py-2.5 px-3 font-bold text-red-600 border-r border-[var(--border-light)]">
                            {student.bloodGroup}
                          </td>
                        )}

                        {/* Health Notes */}
                        {visibleColumns["healthNotes"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.healthNotes || "—"}
                          </td>
                        )}

                        {/* Nutrition */}
                        {visibleColumns["nutrition"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.nutrition || "Normal"}
                          </td>
                        )}

                        {/* Ward No */}
                        {visibleColumns["wardNo"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.wardNo}
                          </td>
                        )}

                        {/* Wears Lens */}
                        {visibleColumns["wearsLens"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.wearsLens ? "Yes" : "No"}
                          </td>
                        )}

                        {/* Country */}
                        {visibleColumns["country"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.country}
                          </td>
                        )}

                        {/* Is Hostel */}
                        {visibleColumns["isHostel"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isHostel ? (
                              <span className="text-emerald-600 font-semibold">Yes</span>
                            ) : (
                              "No"
                            )}
                          </td>
                        )}

                        {/* Province */}
                        {visibleColumns["province"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.province}
                          </td>
                        )}

                        {/* Is Bus */}
                        {visibleColumns["isBus"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isBus ? (
                              <span className="text-blue-600 font-semibold">Yes</span>
                            ) : (
                              "No"
                            )}
                          </td>
                        )}

                        {/* District */}
                        {visibleColumns["district"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.district}
                          </td>
                        )}

                        {/* Is Disabled */}
                        {visibleColumns["isDisabled"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isDisabled ? "Yes" : "No"}
                          </td>
                        )}

                        {/* Municipality */}
                        {visibleColumns["municipality"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.municipality}
                          </td>
                        )}

                        {/* Is Remote */}
                        {visibleColumns["isRemote"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isRemote ? "Yes" : "No"}
                          </td>
                        )}

                        {/* Address */}
                        {visibleColumns["address"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.address}
                          </td>
                        )}

                        {/* Temp Ward No */}
                        {visibleColumns["tempWardNo"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.tempWardNo || "—"}
                          </td>
                        )}

                        {/* Is Previous */}
                        {visibleColumns["isPrevious"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isPrevious ? "Yes" : "No"}
                          </td>
                        )}

                        {/* Tole */}
                        {visibleColumns["tole"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.tole}
                          </td>
                        )}

                        {/* Is Temporary */}
                        {visibleColumns["isTemporary"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.isTemporary ? "Yes" : "No"}
                          </td>
                        )}

                        {/* Temp Province */}
                        {visibleColumns["tempProvince"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.tempProvince || "—"}
                          </td>
                        )}

                        {/* Temp District */}
                        {visibleColumns["tempDistrict"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.tempDistrict || "—"}
                          </td>
                        )}

                        {/* Temp Municipality */}
                        {visibleColumns["tempMunicipality"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.tempMunicipality || "—"}
                          </td>
                        )}

                        {/* Temp Address */}
                        {visibleColumns["tempAddress"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.tempAddress || "—"}
                          </td>
                        )}

                        {/* Application Form No */}
                        {visibleColumns["applicationFormNo"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.applicationFormNo || "—"}
                          </td>
                        )}

                        {/* SGI No */}
                        {visibleColumns["sgiNo"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.sgiNo || "—"}
                          </td>
                        )}

                        {/* Scholarship */}
                        {visibleColumns["scholarship"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.scholarship || "None"}
                          </td>
                        )}

                        {/* Quota Type */}
                        {visibleColumns["quotaType"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.quotaType || "General"}
                          </td>
                        )}

                        {/* University Registration No */}
                        {visibleColumns["universityRegNo"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.universityRegNo || "—"}
                          </td>
                        )}

                        {/* Registration Date BS */}
                        {visibleColumns["registrationDateBS"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.registrationDateBS || "—"}
                          </td>
                        )}

                        {/* Registration Date AD */}
                        {visibleColumns["registrationDateAD"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.registrationDateAD || "—"}
                          </td>
                        )}

                        {/* Citizenship No */}
                        {visibleColumns["citizenshipNo"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.citizenshipNo || "—"}
                          </td>
                        )}

                        {/* Passport No */}
                        {visibleColumns["passportNo"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.passportNo || "—"}
                          </td>
                        )}

                        {/* National ID No */}
                        {visibleColumns["nationalIdNo"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.nationalIdNo || "—"}
                          </td>
                        )}

                        {/* Guardian Name */}
                        {visibleColumns["guardianName"] && (
                          <td className="py-2.5 px-3 font-medium border-r border-[var(--border-light)]">
                            {student.guardianName}
                          </td>
                        )}

                        {/* Relation */}
                        {visibleColumns["relation"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.relation}
                          </td>
                        )}

                        {/* Guardian Mobile */}
                        {visibleColumns["guardianMobile"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.guardianMobile}
                          </td>
                        )}

                        {/* Occupation */}
                        {visibleColumns["occupation"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.occupation || "—"}
                          </td>
                        )}

                        {/* Doctor Name */}
                        {visibleColumns["doctorName"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.doctorName || "—"}
                          </td>
                        )}

                        {/* Medical Blood Group */}
                        {visibleColumns["medicalBloodGroup"] && (
                          <td className="py-2.5 px-3 font-bold text-red-600 border-r border-[var(--border-light)]">
                            {student.medicalBloodGroup || "—"}
                          </td>
                        )}

                        {/* Middle Name */}
                        {visibleColumns["middleName"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.middleName || "—"}
                          </td>
                        )}

                        {/* Full Name Nepali */}
                        {visibleColumns["fullNameNepali"] && (
                          <td className="py-2.5 px-3 font-medium text-[var(--neutral-800)] border-r border-[var(--border-light)]">
                            {student.fullNameNepali || "—"}
                          </td>
                        )}

                        {/* Gender */}
                        {visibleColumns["gender"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.gender}
                          </td>
                        )}

                        {/* Date of Birth BS */}
                        {visibleColumns["dobBS"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.dobBS}
                          </td>
                        )}

                        {/* Date of Birth AD */}
                        {visibleColumns["dobAD"] && (
                          <td className="py-2.5 px-3 font-mono border-r border-[var(--border-light)]">
                            {student.dobAD}
                          </td>
                        )}

                        {/* Ethnic Group */}
                        {visibleColumns["ethnicGroup"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.ethnicGroup || "—"}
                          </td>
                        )}

                        {/* Caste */}
                        {visibleColumns["caste"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.caste || "—"}
                          </td>
                        )}

                        {/* Marital Status */}
                        {visibleColumns["maritalStatus"] && (
                          <td className="py-2.5 px-3 border-r border-[var(--border-light)]">
                            {student.maritalStatus || "Single"}
                          </td>
                        )}

                        {/* Actions */}
                        {visibleColumns["actions"] && (
                          <td className="py-2.5 px-3 text-right sticky right-0 bg-[var(--bg-primary)] shadow-l">
                            <div className="inline-flex items-center gap-1">
                              <Link
                                href={`/students/${student.id}`}
                                title="View Profile"
                                className="p-1 rounded text-[var(--neutral-500)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-100)]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={`/students/${student.id}/edit`}
                                title="Edit"
                                className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-100)]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={activeColumnsList.length + 2}
                      className="py-16 text-center text-xs text-[var(--neutral-500)]"
                    >
                      No matching student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Total Rows & Pagination Bar matching screenshot */}
          <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--neutral-50)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-medium">
              <span>
                Total Rows: <strong className="text-[var(--text-primary)]">{filteredStudents.length}</strong>
              </span>
              {selectedStudentIds.length > 0 && (
                <span className="text-[var(--brand-primary)] font-semibold">
                  ({selectedStudentIds.length} selected)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Records per page selector */}
              <div className="flex items-center gap-1.5">
                <span>Records per page:</span>
                <select
                  value={recordsPerPage}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 px-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 font-semibold text-[var(--text-primary)]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1 rounded text-[var(--neutral-500)] hover:text-black hover:bg-[var(--neutral-200)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
