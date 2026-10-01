import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  CalendarCheck,
  FileSpreadsheet,
  Settings,
  Building2,
  Briefcase,
} from "lucide-react";
import { NavSection } from "@/types/navigation";
import { ROUTES } from "@/constants/routes";

export const navigationConfig: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
      {
        title: "Schools",
        href: ROUTES.SCHOOLS.ROOT,
        icon: Building2,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    title: "Academic Management",
    items: [
      {
        title: "Students",
        href: ROUTES.STUDENTS.ROOT,
        icon: GraduationCap,
        children: [
          { title: "Student Directory", href: ROUTES.STUDENTS.ROOT },
          { title: "Admission Form", href: ROUTES.STUDENTS.ADMISSION },
          { title: "Attendance", href: ROUTES.STUDENTS.ATTENDANCE },
          { title: "Promotion", href: ROUTES.STUDENTS.PROMOTION },
        ],
      },
      {
        title: "Academics",
        href: ROUTES.ACADEMICS.ROOT,
        icon: BookOpen,
        children: [
          { title: "Classes & Sections", href: ROUTES.ACADEMICS.CLASSES },
          { title: "Subjects", href: ROUTES.ACADEMICS.SUBJECTS },
          { title: "Timetable", href: ROUTES.ACADEMICS.TIMETABLE },
          { title: "Syllabus", href: ROUTES.ACADEMICS.SYLLABUS },
        ],
      },
      {
        title: "Examinations",
        href: ROUTES.EXAMS.ROOT,
        icon: FileSpreadsheet,
        children: [
          { title: "Exam Schedule", href: ROUTES.EXAMS.SCHEDULE },
          { title: "Marks Entry", href: ROUTES.EXAMS.MARKS_ENTRY },
          { title: "Report Cards", href: ROUTES.EXAMS.REPORT_CARDS },
        ],
      },
    ],
  },
  {
    title: "People & Staff",
    items: [
      {
        title: "Teachers",
        href: ROUTES.TEACHERS.ROOT,
        icon: Users,
      },
      {
        title: "Staff & HR",
        href: ROUTES.STAFF.ROOT,
        icon: Briefcase,
        children: [
          { title: "Staff Directory", href: ROUTES.STAFF.ROOT },
          { title: "Payroll", href: ROUTES.STAFF.PAYROLL },
          { title: "Leave Tracker", href: ROUTES.STAFF.LEAVE },
        ],
      },
    ],
  },
  {
    title: "Finance & Operations",
    items: [
      {
        title: "Fee Management",
        href: ROUTES.FEES.ROOT,
        icon: DollarSign,
        children: [
          { title: "Fee Collection", href: ROUTES.FEES.COLLECTION },
          { title: "Fee Structure", href: ROUTES.FEES.STRUCTURE },
          { title: "Invoices", href: ROUTES.FEES.INVOICES },
          { title: "Financial Reports", href: ROUTES.FEES.REPORTS },
        ],
      },
      {
        title: "Attendance & Leaves",
        href: ROUTES.STUDENTS.ATTENDANCE,
        icon: CalendarCheck,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: ROUTES.SETTINGS.ROOT,
        icon: Settings,
        children: [
          { title: "General Settings", href: ROUTES.SETTINGS.GENERAL },
          { title: "Roles & Permissions", href: ROUTES.SETTINGS.ROLES },
          { title: "Audit Logs", href: ROUTES.SETTINGS.AUDIT_LOGS },
        ],
      },
    ],
  },
];
