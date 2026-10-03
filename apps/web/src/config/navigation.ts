import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  CalendarCheck,
  Coins,
  Briefcase,
  Library,
  Bus,
  Bed,
  MessageSquare,
  Settings,
  FileText,
  LineChart,
  Package,
  Folder,
  FlaskConical,
  ShieldCheck,
  Link2,
  Headphones,
  UserPlus,
  List,
  User,
  Upload,
  RefreshCw,
  Users,
  Tag,
  Home,
  FileBadge,
  FileCheck,
  FileX,
  Copy,
  Search,
  History,
  FileCode,
  CheckSquare,
  Grid,
  Layers,
  Building,
  Calendar,
  Clock,
  BookMarked,
  Award,
  FilePlus,
  Receipt,
  CreditCard,
  AlertCircle,
  Percent,
  RotateCcw,
  Sliders,
  PieChart,
  UserCheck,
  Building2,
  DollarSign,
  Fuel,
  MapPin,
  QrCode,
  Smartphone,
  Mail,
  Share2,
  Megaphone,
  Shield,
  Key,
  Database,
  BarChart2,
  TrendingUp,
  Boxes,
  ShoppingBag,
  AlertTriangle,
  FileSignature,
  CreditCard as IdCard,
  Archive,
  CheckCircle,
  HelpCircle,
  Video,
  LifeBuoy,
  FileQuestion,
  Activity,
  ArrowRight,
  ArrowLeftRight,
  UserX,
  Trash2,
} from "lucide-react";
import { NavItem } from "@/types/navigation";
import { ROUTES } from "@/constants/routes";

/**
 * Enterprise 20-Module Navigation Registry for School ERP
 * Structured in clean continuous rows with multi-column mega-menu sub-options.
 */
export const erpModules: NavItem[] = [
  // 1. Dashboard
  {
    id: "dashboard",
    order: 1,
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    categories: [],
  },

  // 2. Students
  {
    id: "students",
    order: 2,
    title: "Students",
    href: ROUTES.STUDENTS.ROOT,
    icon: GraduationCap,
    categories: [
      {
        title: "Students",
        items: [
          { title: "Our Students", href: ROUTES.STUDENTS.ROOT, icon: Users },
          { title: "Student Registration", href: ROUTES.STUDENTS.ADMISSION, icon: UserPlus },
          { title: "Upgrade Class", href: "/students/upgrade-class", icon: ArrowRight },
          { title: "Change Section", href: "/students/change-section", icon: ArrowLeftRight },
          { title: "Disable Students", href: ROUTES.STUDENTS.DISABLE, icon: UserX },
          { title: "Disabled Students", href: ROUTES.STUDENTS.DISABLED, icon: Users },
          { title: "Deleted Students", href: ROUTES.STUDENTS.DELETED, icon: Trash2 },
        ],
      },
    ],
  },


  // 3. Academics
  {
    id: "academics",
    order: 3,
    title: "Academics",
    href: ROUTES.ACADEMICS.ROOT,
    icon: BookOpen,
    categories: [
      {
        title: "Classes & Curriculum",
        items: [
          { title: "Classes & Sections", href: ROUTES.ACADEMICS.CLASSES, icon: Building },
          { title: "Subjects & Syllabus", href: ROUTES.ACADEMICS.SUBJECTS, icon: BookOpen },
          { title: "Class Timetable", href: ROUTES.ACADEMICS.TIMETABLE, icon: Clock },
          { title: "Academic Calendar", href: "/academics/calendar", icon: Calendar },
        ],
      },
      {
        title: "Staff Allocations",
        items: [
          { title: "Assign Subject Teachers", href: "/academics/assign-teachers", icon: UserCheck },
          { title: "Class Teacher Allocation", href: "/academics/class-teachers", icon: Users },
          { title: "Lesson Planning", href: "/academics/lesson-plans", icon: BookMarked },
          { title: "Classroom Spaces", href: "/academics/classrooms", icon: Home },
        ],
      },
    ],
  },

  // 4. Examinations
  {
    id: "examinations",
    order: 4,
    title: "Examinations",
    href: ROUTES.EXAMS.ROOT,
    icon: FileSpreadsheet,
    categories: [
      {
        title: "Exams & Schedules",
        items: [
          { title: "Exam Schedule", href: ROUTES.EXAMS.SCHEDULE, icon: Calendar },
          { title: "Marks Entry", href: ROUTES.EXAMS.MARKS_ENTRY, icon: FileSpreadsheet },
          { title: "Grade Configuration", href: "/examinations/grades", icon: Sliders },
          { title: "Admit Cards", href: "/examinations/admit-cards", icon: FileBadge },
        ],
      },
      {
        title: "Grading & Reports",
        items: [
          { title: "Report Cards", href: ROUTES.EXAMS.REPORT_CARDS, icon: Award },
          { title: "Tabulation Sheet", href: "/examinations/tabulation", icon: Grid },
          { title: "Exam Attendance", href: "/examinations/attendance", icon: CheckSquare },
          { title: "Question Bank", href: "/examinations/question-bank", icon: FileCode },
        ],
      },
    ],
  },

  // 5. Attendance
  {
    id: "attendance",
    order: 5,
    title: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
    categories: [
      {
        title: "Daily Attendance",
        items: [
          { title: "Student Attendance", href: ROUTES.STUDENTS.ATTENDANCE, icon: GraduationCap },
          { title: "Staff Attendance", href: ROUTES.STAFF.ATTENDANCE, icon: Users },
          { title: "Biometric & RFID Sync", href: "/attendance/biometric", icon: QrCode },
          { title: "Attendance Reports", href: "/attendance/reports", icon: BarChart2 },
        ],
      },
      {
        title: "Leaves & Holidays",
        items: [
          { title: "Student Leave Requests", href: "/attendance/student-leaves", icon: Clock },
          { title: "Staff Leave Tracker", href: ROUTES.STAFF.LEAVE, icon: Calendar },
          { title: "Holiday Calendar", href: "/attendance/holidays", icon: CalendarCheck },
          { title: "Monthly Attendance Matrix", href: "/attendance/matrix", icon: Grid },
        ],
      },
    ],
  },

  // 6. Fee & Accounts
  {
    id: "fees",
    order: 6,
    title: "Fee & Accounts",
    href: ROUTES.FEES.ROOT,
    icon: Coins,
    categories: [
      {
        title: "Fee Collection & Structure",
        items: [
          { title: "Fee Structure", href: ROUTES.FEES.STRUCTURE, icon: Sliders },
          { title: "Fee Collection", href: ROUTES.FEES.COLLECTION, icon: Receipt },
          { title: "Online Payment", href: "/fees/online-payment", icon: CreditCard },
          { title: "Payment History", href: "/fees/history", icon: History },
          { title: "Due List", href: "/fees/due-list", icon: AlertCircle },
          { title: "Discounts & Concessions", href: "/fees/discounts", icon: Percent },
          { title: "Refunds", href: "/fees/refunds", icon: RotateCcw },
          { title: "Installment Plan", href: "/fees/installment-plan", icon: Calendar },
          { title: "Scholarship", href: "/fees/scholarship", icon: Award },
          { title: "Fine Management", href: "/fees/fines", icon: AlertTriangle },
        ],
      },
      {
        title: "Financial Reports & Ledger",
        items: [
          { title: "Fee Reports", href: ROUTES.FEES.REPORTS, icon: FileText },
          { title: "Receipt Generation", href: ROUTES.FEES.INVOICES, icon: FilePlus },
          { title: "Ledger", href: "/fees/ledger", icon: Grid },
          { title: "Pending Payments", href: "/fees/pending", icon: Clock },
          { title: "Payment Settings", href: "/fees/settings", icon: Settings },
          { title: "Financial Summary", href: "/fees/summary", icon: PieChart },
        ],
      },
    ],
  },

  // 7. HR & Staff
  {
    id: "staff",
    order: 7,
    title: "HR & Staff",
    href: ROUTES.STAFF.ROOT,
    icon: Briefcase,
    categories: [
      {
        title: "Staff Management",
        items: [
          { title: "Staff Directory", href: ROUTES.STAFF.ROOT, icon: Users },
          { title: "Add New Employee", href: "/staff/new", icon: UserPlus },
          { title: "Departments & Designations", href: "/staff/departments", icon: Building2 },
          { title: "Teacher Profiles", href: ROUTES.TEACHERS.ROOT, icon: GraduationCap },
        ],
      },
      {
        title: "Payroll & Operations",
        items: [
          { title: "Payroll & Salary Slips", href: ROUTES.STAFF.PAYROLL, icon: DollarSign },
          { title: "Staff Leave Applications", href: ROUTES.STAFF.LEAVE, icon: Calendar },
          { title: "Staff Attendance Log", href: ROUTES.STAFF.ATTENDANCE, icon: CheckSquare },
          { title: "Staff Appraisal / Reviews", href: "/staff/reviews", icon: Award },
        ],
      },
    ],
  },

  // 8. Library
  {
    id: "library",
    order: 8,
    title: "Library",
    href: "/library",
    icon: Library,
    categories: [
      {
        title: "Book Inventory & Circulation",
        items: [
          { title: "Book Directory", href: "/library/books", icon: BookMarked },
          { title: "Issue / Return Book", href: "/library/issue-return", icon: RefreshCw },
          { title: "Member Registry", href: "/library/members", icon: Users },
          { title: "Overdue & Fine Collection", href: "/library/fines", icon: AlertCircle },
        ],
      },
      {
        title: "Digital Library",
        items: [
          { title: "Barcode / RFID Labels", href: "/library/barcodes", icon: QrCode },
          { title: "Digital E-Books", href: "/library/ebooks", icon: BookOpen },
          { title: "Publisher & Authors", href: "/library/publishers", icon: List },
          { title: "Library Reports", href: "/library/reports", icon: FileText },
        ],
      },
    ],
  },

  // 9. Transport
  {
    id: "transport",
    order: 9,
    title: "Transport",
    href: "/transport",
    icon: Bus,
    categories: [
      {
        title: "Fleet & Routes",
        items: [
          { title: "Route Management", href: "/transport/routes", icon: MapPin },
          { title: "Vehicle Fleet", href: "/transport/vehicles", icon: Bus },
          { title: "Drivers & Attendants", href: "/transport/drivers", icon: Users },
          { title: "Student Route Allocations", href: "/transport/allocations", icon: GraduationCap },
        ],
      },
      {
        title: "Tracking & Expenses",
        items: [
          { title: "GPS Live Tracking", href: "/transport/tracking", icon: MapPin },
          { title: "Fuel & Maintenance Log", href: "/transport/maintenance", icon: Fuel },
          { title: "Transport Fee Collection", href: "/transport/fees", icon: Receipt },
          { title: "Transport Reports", href: "/transport/reports", icon: FileText },
        ],
      },
    ],
  },

  // 10. Hostel
  {
    id: "hostel",
    order: 10,
    title: "Hostel",
    href: "/hostel",
    icon: Bed,
    categories: [
      {
        title: "Hostel Facilities",
        items: [
          { title: "Hostel Buildings", href: "/hostel/buildings", icon: Building },
          { title: "Room & Bed Allocation", href: "/hostel/rooms", icon: Bed },
          { title: "Resident Students", href: "/hostel/residents", icon: Users },
          { title: "Mess / Food Menu", href: "/hostel/mess", icon: List },
        ],
      },
      {
        title: "Hostel Governance",
        items: [
          { title: "Warden & Caretakers", href: "/hostel/wardens", icon: UserCheck },
          { title: "Hostel Attendance & Curfew", href: "/hostel/attendance", icon: CheckSquare },
          { title: "Hostel Fee Collection", href: "/hostel/fees", icon: Receipt },
          { title: "Disciplinary Incidents", href: "/hostel/incidents", icon: AlertTriangle },
        ],
      },
    ],
  },

  // 11. Communication
  {
    id: "communication",
    order: 11,
    title: "Communication",
    href: "/communication",
    icon: MessageSquare,
    categories: [
      {
        title: "Messaging Channels",
        items: [
          { title: "Notice Board", href: "/communication/notices", icon: Megaphone },
          { title: "SMS Gateway", href: "/communication/sms", icon: Smartphone },
          { title: "Email Broadcasts", href: "/communication/email", icon: Mail },
          { title: "WhatsApp Notifications", href: "/communication/whatsapp", icon: Share2 },
        ],
      },
      {
        title: "Portals & Logs",
        items: [
          { title: "Parent Communication", href: "/communication/parents", icon: Users },
          { title: "Teacher Announcements", href: "/communication/teachers", icon: GraduationCap },
          { title: "Message Delivery Logs", href: "/communication/logs", icon: History },
          { title: "Event Broadcasts", href: "/communication/events", icon: Calendar },
        ],
      },
    ],
  },

  // 12. Settings
  {
    id: "settings",
    order: 12,
    title: "Settings",
    href: ROUTES.SETTINGS.ROOT,
    icon: Settings,
    categories: [
      {
        title: "School Configuration",
        items: [
          { title: "School Profile", href: ROUTES.SETTINGS.GENERAL, icon: Building2 },
          { title: "Academic Sessions", href: "/settings/sessions", icon: Calendar },
          { title: "Branch Settings", href: "/settings/branches", icon: Building },
          { title: "System Preferences", href: "/settings/preferences", icon: Sliders },
        ],
      },
      {
        title: "Security & Audits",
        items: [
          { title: "Roles & Permissions", href: ROUTES.SETTINGS.ROLES, icon: Key },
          { title: "Audit Trail Logs", href: ROUTES.SETTINGS.AUDIT_LOGS, icon: Shield },
          { title: "Database Backup", href: ROUTES.SETTINGS.BACKUP, icon: Database },
          { title: "Email / SMS API Keys", href: "/settings/integrations", icon: Link2 },
        ],
      },
    ],
  },

  // 13. Reports
  {
    id: "reports",
    order: 13,
    title: "Reports",
    href: ROUTES.REPORTS.ROOT,
    icon: FileText,
    categories: [
      {
        title: "Operational Reports",
        items: [
          { title: "Academic Performance", href: ROUTES.REPORTS.ACADEMIC, icon: Award },
          { title: "Financial Reports", href: ROUTES.REPORTS.FINANCIAL, icon: DollarSign },
          { title: "Attendance Summaries", href: ROUTES.REPORTS.ATTENDANCE, icon: CalendarCheck },
          { title: "Student Demographics", href: "/reports/demographics", icon: Users },
        ],
      },
      {
        title: "Administrative Reports",
        items: [
          { title: "Staff & Payroll Reports", href: "/reports/staff", icon: Briefcase },
          { title: "Transport & Hostel Reports", href: "/reports/logistics", icon: Bus },
          { title: "Custom Report Builder", href: "/reports/builder", icon: Sliders },
          { title: "Scheduled Email Reports", href: "/reports/schedules", icon: Mail },
        ],
      },
    ],
  },

  // 14. Analytics
  {
    id: "analytics",
    order: 14,
    title: "Analytics",
    href: "/analytics",
    icon: LineChart,
    categories: [
      {
        title: "Executive Insights",
        items: [
          { title: "Executive Dashboard", href: "/analytics/executive", icon: PieChart },
          { title: "Student Academic Trends", href: "/analytics/academic-trends", icon: TrendingUp },
          { title: "Fee Revenue Projections", href: "/analytics/revenue", icon: DollarSign },
          { title: "Attendance Heatmaps", href: "/analytics/attendance", icon: CalendarCheck },
        ],
      },
      {
        title: "Enrollment & Growth",
        items: [
          { title: "Admission Funnel", href: "/analytics/admissions", icon: UserPlus },
          { title: "Dropout Risk Analysis", href: "/analytics/retention", icon: AlertCircle },
          { title: "Teacher Workload Stats", href: "/analytics/workload", icon: Briefcase },
          { title: "Comparative School Benchmarks", href: "/analytics/benchmarks", icon: BarChart2 },
        ],
      },
    ],
  },

  // 15. Inventory
  {
    id: "inventory",
    order: 15,
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    categories: [
      {
        title: "Stock & Products",
        items: [
          { title: "Item Categories", href: "/inventory/categories", icon: Grid },
          { title: "Stock Item Directory", href: "/inventory/items", icon: Boxes },
          { title: "Stock In / Receive", href: "/inventory/stock-in", icon: Upload },
          { title: "Stock Out / Issue", href: "/inventory/stock-out", icon: RefreshCw },
        ],
      },
      {
        title: "Procurement & Vendors",
        items: [
          { title: "Vendor Management", href: "/inventory/vendors", icon: ShoppingBag },
          { title: "Purchase Orders", href: "/inventory/orders", icon: FileText },
          { title: "Depletion Alerts", href: "/inventory/alerts", icon: AlertTriangle },
          { title: "Asset Depreciations", href: "/inventory/depreciation", icon: DollarSign },
        ],
      },
    ],
  },

  // 16. Documents
  {
    id: "documents",
    order: 16,
    title: "Documents",
    href: "/documents",
    icon: Folder,
    categories: [
      {
        title: "Certificates & Cards",
        items: [
          { title: "Certificate Templates", href: "/documents/templates", icon: FileSignature },
          { title: "ID Card Generation", href: "/documents/id-cards", icon: IdCard },
          { title: "Transfer Certificate Archive", href: "/documents/tc-archive", icon: FileBadge },
          { title: "Student Document Vault", href: "/documents/student-vault", icon: Folder },
        ],
      },
      {
        title: "Official Records",
        items: [
          { title: "Staff Document Vault", href: "/documents/staff-vault", icon: Briefcase },
          { title: "Online Verification Portal", href: "/documents/verify", icon: CheckCircle },
          { title: "Document Expiry Alerts", href: "/documents/expiry", icon: Clock },
          { title: "Archived Past Batches", href: "/documents/archives", icon: Archive },
        ],
      },
    ],
  },

  // 17. Examination Lab
  {
    id: "lab",
    order: 17,
    title: "Examination Lab",
    href: "/lab",
    icon: FlaskConical,
    categories: [
      {
        title: "Online Assessment",
        items: [
          { title: "Online Quizzes / CBT", href: "/lab/quizzes", icon: CheckSquare },
          { title: "Question Paper Generator", href: "/lab/generator", icon: FilePlus },
          { title: "Question Bank Hub", href: "/lab/questions", icon: FileCode },
          { title: "Auto-Evaluation Engine", href: "/lab/evaluation", icon: Award },
        ],
      },
      {
        title: "Practical Laboratories",
        items: [
          { title: "Computer Lab Schedule", href: "/lab/computer-lab", icon: Grid },
          { title: "Science Lab Experiments", href: "/lab/science-lab", icon: FlaskConical },
          { title: "Equipment Allocation", href: "/lab/equipment", icon: Package },
          { title: "Practical Marks Registry", href: "/lab/practical-marks", icon: FileSpreadsheet },
        ],
      },
    ],
  },

  // 18. Behaviour
  {
    id: "behaviour",
    order: 18,
    title: "Behaviour",
    href: "/behaviour",
    icon: ShieldCheck,
    categories: [
      {
        title: "Discipline & Incidents",
        items: [
          { title: "Incident Reporting", href: "/behaviour/incidents", icon: AlertTriangle },
          { title: "Disciplinary Action Log", href: "/behaviour/actions", icon: Shield },
          { title: "Parent Notification Records", href: "/behaviour/notifications", icon: MessageSquare },
          { title: "Counseling & Guidance", href: "/behaviour/counseling", icon: Users },
        ],
      },
      {
        title: "Rewards & Merit",
        items: [
          { title: "Merit Badges & Awards", href: "/behaviour/awards", icon: Award },
          { title: "House Points Leaderboard", href: "/behaviour/house-points", icon: TrendingUp },
          { title: "Student of the Month", href: "/behaviour/star-student", icon: Award },
          { title: "Conduct Certificate", href: "/behaviour/certificates", icon: FileBadge },
        ],
      },
    ],
  },

  // 19. Master Setup
  {
    id: "master-setup",
    order: 19,
    title: "Master Setup",
    href: "/master-setup",
    icon: Sliders,
    categories: [
      {
        title: "Setup",
        items: [
          { title: "General Setup", href: "/master-setup/general", icon: Settings },
          { title: "Class Setup", href: "/master-setup/classes", icon: GraduationCap },
          { title: "Location", href: "/master-setup/locations", icon: MapPin },
          { title: "Batch", href: "/master-setup/batches", icon: Calendar },
          { title: "Subject", href: "/master-setup/subjects", icon: FileText },
          { title: "Subject Mapping", href: "/master-setup/subject-mapping", icon: Layers },
          { title: "Document Numbering", href: "/master-setup/document-numbering", icon: Tag },
        ],
      },
    ],
  },



  // 20. Help & Support
  {
    id: "support",
    order: 20,
    title: "Help & Support",
    href: "/support",
    icon: Headphones,
    categories: [
      {
        title: "Self Service & Guides",
        items: [
          { title: "User Manuals & Knowledge Base", href: "/support/manuals", icon: BookOpen },
          { title: "Video Walkthrough Tutorials", href: "/support/tutorials", icon: Video },
          { title: "Frequently Asked Questions", href: "/support/faq", icon: FileQuestion },
          { title: "Release Notes & Changelog", href: "/support/changelog", icon: List },
        ],
      },
      {
        title: "Assisted Support",
        items: [
          { title: "Submit Support Ticket", href: "/support/tickets", icon: LifeBuoy },
          { title: "Live Chat with Support Team", href: "/support/live-chat", icon: MessageSquare },
          { title: "System Health Status", href: "/support/status", icon: Activity },
          { title: "Schedule Training Session", href: "/support/training", icon: Calendar },
        ],
      },
    ],
  },
];

export const navigationConfig = [
  {
    title: "All Modules",
    items: erpModules,
  },
];
