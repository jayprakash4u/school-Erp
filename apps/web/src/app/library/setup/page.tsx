"use client";

import * as React from "react";
import Link from "next/link";
import {
  Library,
  BookOpen,
  BookMarked,
  QrCode,
  Grid,
  Users,
  UserCheck,
  Sliders,
  AlertCircle,
  Calendar,
  Clock,
  AlertTriangle,
  Mail,
  BarChart2,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ChevronRight,
  Download,
  Building,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
  Smartphone,
  Info,
  DollarSign,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Printer,
  ShieldCheck,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/export-utils";
import { useToast } from "@/components/ui/toast";

// ============================================================================
// 1. DATA INTERFACES FOR ALL 14 AREAS
// ============================================================================

export interface LibraryBranch {
  id: string;
  name: string;
  code: string;
  location: string;
  floor: string;
  openingTime: string;
  closingTime: string;
  daysOpen: string;
  librarian: string;
  contactEmail: string;
  contactPhone: string;
  capacity: number;
  isDefault?: boolean;
}

export interface BookCategoryItem {
  id: string;
  name: string;
  code: string;
  ddcPrefix: string;
  ageLevel: string;
  colorTag: string;
  description: string;
  totalTitles: number;
  totalCopies: number;
}

export interface BookMasterItem {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  edition: string;
  publicationYear: string;
  subject: string;
  category: string;
  language: string;
  rackShelf: string;
  price: number;
  totalCopies: number;
  availableCopies: number;
  callNumber: string;
}

export interface BookCopyItem {
  id: string;
  accessionNumber: string;
  barcode: string;
  bookTitle: string;
  isbn: string;
  copyNumber: number;
  condition: "New" | "Good" | "Fair" | "Worn" | "Damaged";
  rackShelf: string;
  status: "Available" | "Issued" | "Reserved" | "Under Repair" | "Lost";
  acquisitionDate: string;
  price: number;
}

export interface RackShelfItem {
  id: string;
  building: string;
  room: string;
  rack: string;
  shelf: string;
  category: string;
  capacity: number;
  occupied: number;
  status: "Active" | "Full" | "Maintenance";
}

export interface MemberItem {
  id: string;
  memberId: string;
  name: string;
  memberType: string;
  departmentOrGrade: string;
  referenceId: string;
  issuedCount: number;
  maxAllowed: number;
  pendingFines: number;
  status: "Active" | "Suspended" | "Expired";
  expiryDate: string;
}

export interface MemberTypeItem {
  id: string;
  name: string;
  maxBooks: number;
  loanPeriodDays: number;
  renewalLimit: number;
  fineMultiplier: number;
  securityDeposit: number;
  description: string;
}

export interface HolidayClosureItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface NotificationTriggerItem {
  id: string;
  eventTitle: string;
  timing: string;
  channels: { sms: boolean; email: boolean; push: boolean };
  templatePreview: string;
}

// ============================================================================
// 2. TAB CONFIGURATION (14 SETUP AREAS)
// ============================================================================

export interface SetupTabMeta {
  id: string;
  title: string;
  subtitle: string;
  areaGroup: "Facilities & Catalog" | "Members & Policies" | "Rules & Analytics";
  icon: React.ComponentType<{ className?: string }>;
}

const LIBRARY_SETUP_TABS: SetupTabMeta[] = [
  { id: "library", title: "Library Branches", subtitle: "Name, branch locations, working hours & facilities", areaGroup: "Facilities & Catalog", icon: Building },
  { id: "book-category", title: "Book Categories", subtitle: "Fiction, Science, History, Dewey ranges & classifications", areaGroup: "Facilities & Catalog", icon: Tag },
  { id: "book-master", title: "Book Master", subtitle: "ISBN, titles, authors, publishers, editions & subjects", areaGroup: "Facilities & Catalog", icon: BookMarked },
  { id: "book-copies", title: "Book Copies & Accession", subtitle: "Individual copy barcodes, accession numbers & condition", areaGroup: "Facilities & Catalog", icon: QrCode },
  { id: "rack-shelf", title: "Rack & Shelf Topology", subtitle: "Building → Room → Rack → Shelf physical locations", areaGroup: "Facilities & Catalog", icon: Grid },
  { id: "members", title: "Members Registry", subtitle: "Students, teachers, staff accounts and active loan limits", areaGroup: "Members & Policies", icon: Users },
  { id: "member-types", title: "Member Types", subtitle: "Privilege tiers, book quotas & loan periods per category", areaGroup: "Members & Policies", icon: UserCheck },
  { id: "library-rules", title: "Circulation Rules", subtitle: "Loan periods, maximum books, renewals & hold pickup policies", areaGroup: "Members & Policies", icon: Sliders },
  { id: "fine-rules", title: "Fine & Penalty Rules", subtitle: "Daily fine rates, grace periods, max caps & suspension thresholds", areaGroup: "Rules & Analytics", icon: AlertCircle },
  { id: "holiday-rules", title: "Holiday & Weekend Rules", subtitle: "Calendar exclusions, weekend fine waivers & auto-extensions", areaGroup: "Rules & Analytics", icon: Calendar },
  { id: "reservation", title: "Book Reservations", subtitle: "Hold queue logic, waitlist caps & ready-for-pickup window", areaGroup: "Rules & Analytics", icon: Clock },
  { id: "lost-damaged", title: "Lost / Damaged Policies", subtitle: "Replacement pricing, damage penalties & processing fees", areaGroup: "Rules & Analytics", icon: AlertTriangle },
  { id: "notifications", title: "Automated Reminders", subtitle: "Due-date alerts, overdue warnings & SMS/Email broadcasts", areaGroup: "Rules & Analytics", icon: Mail },
  { id: "reports", title: "Circulation & Reports", subtitle: "Issued items, overdue ledgers, top books & collection stats", areaGroup: "Rules & Analytics", icon: BarChart2 },
];

// ============================================================================
// 3. SEED DEFAULT DATA
// ============================================================================

const DEFAULT_LIBRARIES: LibraryBranch[] = [
  { id: "1", name: "Central Campus Library", code: "LIB-CENTRAL", location: "Main Academic Block", floor: "2nd Floor, Wing A", openingTime: "08:00 AM", closingTime: "05:30 PM", daysOpen: "Mon - Sat", librarian: "Mr. Rajan Koirala", contactEmail: "library.main@schoolerp.io", contactPhone: "+977 1-4412345", capacity: 180, isDefault: true },
  { id: "2", name: "Junior School Library", code: "LIB-JUNIOR", location: "Primary Wing", floor: "Ground Floor", openingTime: "08:30 AM", closingTime: "03:30 PM", daysOpen: "Mon - Fri", librarian: "Ms. Sunita Thapa", contactEmail: "library.junior@schoolerp.io", contactPhone: "+977 1-4412346", capacity: 60, isDefault: false },
  { id: "3", name: "Science & Tech Media Hub", code: "LIB-TECH", location: "Science & Innovation Complex", floor: "3rd Floor", openingTime: "07:30 AM", closingTime: "06:00 PM", daysOpen: "Mon - Sat", librarian: "Er. Ramesh KC", contactEmail: "tech.library@schoolerp.io", contactPhone: "+977 1-4412347", capacity: 90, isDefault: false },
];

const DEFAULT_CATEGORIES: BookCategoryItem[] = [
  { id: "1", name: "Fiction & Literature", code: "FIC", ddcPrefix: "800 - 899", ageLevel: "All Grades", colorTag: "bg-purple-100 text-purple-800 border-purple-200", description: "Novels, drama, poetry and world literary anthologies", totalTitles: 420, totalCopies: 1250 },
  { id: "2", name: "Science & Technology", code: "SCI", ddcPrefix: "500 - 699", ageLevel: "Grades 6 - 12", colorTag: "bg-blue-100 text-blue-800 border-blue-200", description: "Physics, Chemistry, Biology, Space and applied sciences", totalTitles: 580, totalCopies: 1820 },
  { id: "3", name: "Mathematics & Statistics", code: "MATH", ddcPrefix: "510 - 519", ageLevel: "Grades 1 - 12", colorTag: "bg-emerald-100 text-emerald-800 border-emerald-200", description: "Algebra, Geometry, Calculus, Arithmetic and Olympiad prep", totalTitles: 310, totalCopies: 980 },
  { id: "4", name: "History & Geography", code: "HIST", ddcPrefix: "900 - 999", ageLevel: "Grades 4 - 12", colorTag: "bg-amber-100 text-amber-800 border-amber-200", description: "World history, Nepal heritage, civilization and atlas maps", totalTitles: 290, totalCopies: 740 },
  { id: "5", name: "Computer Science & IT", code: "CS", ddcPrefix: "004 - 006", ageLevel: "Grades 5 - 12", colorTag: "bg-indigo-100 text-indigo-800 border-indigo-200", description: "Coding, AI, Web development, Algorithms and Cyber security", totalTitles: 240, totalCopies: 620 },
  { id: "6", name: "Reference & Encyclopedias", code: "REF", ddcPrefix: "030 - 039", ageLevel: "All Grades", colorTag: "bg-rose-100 text-rose-800 border-rose-200", description: "Dictionaries, encyclopedias and non-circulating references", totalTitles: 150, totalCopies: 280 },
];

const DEFAULT_BOOKS: BookMasterItem[] = [
  { id: "1", isbn: "978-0132350884", title: "Clean Code: A Handbook of Agile Software Craftsmanship", subtitle: "Best practices in software engineering", author: "Robert C. Martin", publisher: "Prentice Hall", edition: "1st Edition", publicationYear: "2008", subject: "Computer Science", category: "Computer Science & IT", language: "English", rackShelf: "Rack B - Shelf 2", price: 45.0, totalCopies: 8, availableCopies: 5, callNumber: "005.1 MAR" },
  { id: "2", isbn: "978-0451524935", title: "1984", subtitle: "Dystopian classic novel", author: "George Orwell", publisher: "Signet Classic", edition: "Centennial Ed.", publicationYear: "1950", subject: "Literature", category: "Fiction & Literature", language: "English", rackShelf: "Rack A - Shelf 1", price: 12.5, totalCopies: 15, availableCopies: 8, callNumber: "823.9 ORW" },
  { id: "3", isbn: "978-0198817802", title: "Oxford Advanced Learner's Dictionary", subtitle: "10th Edition with Digital Access", author: "A.S. Hornby", publisher: "Oxford University Press", edition: "10th Edition", publicationYear: "2020", subject: "English Reference", category: "Reference & Encyclopedias", language: "English", rackShelf: "Rack R - Shelf 1", price: 38.0, totalCopies: 10, availableCopies: 9, callNumber: "423 HOR" },
  { id: "4", isbn: "978-0321573513", title: "Algorithms (4th Edition)", subtitle: "Essential algorithms and data structures", author: "Robert Sedgewick & Kevin Wayne", publisher: "Addison-Wesley", edition: "4th Edition", publicationYear: "2011", subject: "Computer Science", category: "Computer Science & IT", language: "English", rackShelf: "Rack B - Shelf 3", price: 65.0, totalCopies: 6, availableCopies: 3, callNumber: "005.7 SED" },
  { id: "5", isbn: "978-0199138776", title: "Complete Physics for Cambridge IGCSE", subtitle: "Comprehensive secondary science text", author: "Stephen Pople", publisher: "Oxford University Press", edition: "3rd Edition", publicationYear: "2018", subject: "Physics", category: "Science & Technology", language: "English", rackShelf: "Rack C - Shelf 4", price: 28.0, totalCopies: 20, availableCopies: 12, callNumber: "530 POP" },
  { id: "6", isbn: "978-9937085412", title: "Hamro Samajik Adhyayan tatha Manabiki (Grade 10)", subtitle: "Social Studies Textbook", author: "Dr. Govinda Sharma", publisher: "Janak Education Materials", edition: "Curriculum 2080", publicationYear: "2024", subject: "Social Studies", category: "History & Geography", language: "Nepali", rackShelf: "Rack D - Shelf 1", price: 6.5, totalCopies: 35, availableCopies: 22, callNumber: "300 SHA" },
];

const DEFAULT_COPIES: BookCopyItem[] = [
  { id: "1", accessionNumber: "ACC-2026-0001", barcode: "9780132350884-01", bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship", isbn: "978-0132350884", copyNumber: 1, condition: "Good", rackShelf: "Rack B - Shelf 2", status: "Available", acquisitionDate: "2025-08-15", price: 45.0 },
  { id: "2", accessionNumber: "ACC-2026-0002", barcode: "9780132350884-02", bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship", isbn: "978-0132350884", copyNumber: 2, condition: "New", rackShelf: "Rack B - Shelf 2", status: "Issued", acquisitionDate: "2025-08-15", price: 45.0 },
  { id: "3", accessionNumber: "ACC-2026-0003", barcode: "9780451524935-01", bookTitle: "1984", isbn: "978-0451524935", copyNumber: 1, condition: "Good", rackShelf: "Rack A - Shelf 1", status: "Issued", acquisitionDate: "2024-04-10", price: 12.5 },
  { id: "4", accessionNumber: "ACC-2026-0004", barcode: "9780451524935-02", bookTitle: "1984", isbn: "978-0451524935", copyNumber: 2, condition: "Fair", rackShelf: "Rack A - Shelf 1", status: "Available", acquisitionDate: "2024-04-10", price: 12.5 },
  { id: "5", accessionNumber: "ACC-2026-0005", barcode: "9780198817802-01", bookTitle: "Oxford Advanced Learner's Dictionary", isbn: "978-0198817802", copyNumber: 1, condition: "New", rackShelf: "Rack R - Shelf 1", status: "Available", acquisitionDate: "2025-01-20", price: 38.0 },
  { id: "6", accessionNumber: "ACC-2026-0006", barcode: "9780321573513-01", bookTitle: "Algorithms (4th Edition)", isbn: "978-0321573513", copyNumber: 1, condition: "Good", rackShelf: "Rack B - Shelf 3", status: "Reserved", acquisitionDate: "2025-05-12", price: 65.0 },
  { id: "7", accessionNumber: "ACC-2026-0007", barcode: "9780199138776-01", bookTitle: "Complete Physics for Cambridge IGCSE", isbn: "978-0199138776", copyNumber: 1, condition: "Good", rackShelf: "Rack C - Shelf 4", status: "Available", acquisitionDate: "2024-09-01", price: 28.0 },
];

const DEFAULT_RACK_SHELVES: RackShelfItem[] = [
  { id: "1", building: "Main Building", room: "Reading Hall 201", rack: "Rack A", shelf: "Shelf 1", category: "Fiction & Literature", capacity: 45, occupied: 32, status: "Active" },
  { id: "2", building: "Main Building", room: "Reading Hall 201", rack: "Rack A", shelf: "Shelf 2", category: "Fiction & Literature", capacity: 45, occupied: 40, status: "Active" },
  { id: "3", building: "Main Building", room: "Reading Hall 201", rack: "Rack B", shelf: "Shelf 1", category: "Computer Science & IT", capacity: 50, occupied: 48, status: "Full" },
  { id: "4", building: "Main Building", room: "Reading Hall 201", rack: "Rack B", shelf: "Shelf 2", category: "Computer Science & IT", capacity: 50, occupied: 28, status: "Active" },
  { id: "5", building: "Science Wing", room: "Science Hub 302", rack: "Rack C", shelf: "Shelf 4", category: "Science & Technology", capacity: 60, occupied: 44, status: "Active" },
  { id: "6", building: "Main Building", room: "Reference Room", rack: "Rack R", shelf: "Shelf 1", category: "Reference & Encyclopedias", capacity: 30, occupied: 22, status: "Active" },
];

const DEFAULT_MEMBERS: MemberItem[] = [
  { id: "1", memberId: "LIB-M-101", name: "Aarav Sharma", memberType: "Student (Secondary)", departmentOrGrade: "Grade 10 - Section A", referenceId: "STU-2026-101", issuedCount: 2, maxAllowed: 4, pendingFines: 0.0, status: "Active", expiryDate: "2027-04-14" },
  { id: "2", memberId: "LIB-M-102", name: "Diya Patel", memberType: "Student (Secondary)", departmentOrGrade: "Grade 9 - Section B", referenceId: "STU-2026-102", issuedCount: 1, maxAllowed: 4, pendingFines: 2.0, status: "Active", expiryDate: "2027-04-14" },
  { id: "3", memberId: "LIB-T-201", name: "Dr. Hemant Adhikari", memberType: "Teacher / Faculty", departmentOrGrade: "Dept. of Computer Science", referenceId: "EMP-FAC-014", issuedCount: 5, maxAllowed: 10, pendingFines: 0.0, status: "Active", expiryDate: "2028-12-31" },
  { id: "4", memberId: "LIB-M-103", name: "Rohan Gupta", memberType: "Student (Secondary)", departmentOrGrade: "Grade 10 - Section A", referenceId: "STU-2026-103", issuedCount: 3, maxAllowed: 4, pendingFines: 15.0, status: "Suspended", expiryDate: "2027-04-14" },
  { id: "5", memberId: "LIB-S-301", name: "Pradeep Joshi", memberType: "Admin Staff", departmentOrGrade: "Accounts & Administration", referenceId: "EMP-ADM-005", issuedCount: 1, maxAllowed: 4, pendingFines: 0.0, status: "Active", expiryDate: "2028-12-31" },
];

const DEFAULT_MEMBER_TYPES: MemberTypeItem[] = [
  { id: "1", name: "Student (Primary: Gr 1-5)", maxBooks: 2, loanPeriodDays: 7, renewalLimit: 1, fineMultiplier: 0.5, securityDeposit: 0.0, description: "Storybooks and primary illustrated readers" },
  { id: "2", name: "Student (Secondary: Gr 6-12)", maxBooks: 4, loanPeriodDays: 14, renewalLimit: 2, fineMultiplier: 1.0, securityDeposit: 0.0, description: "Standard academic curriculum and fiction titles" },
  { id: "3", name: "Teacher / Faculty", maxBooks: 10, loanPeriodDays: 30, renewalLimit: 4, fineMultiplier: 0.0, securityDeposit: 0.0, description: "Teaching references, research texts and lesson planning aids" },
  { id: "4", name: "Admin Staff", maxBooks: 4, loanPeriodDays: 21, renewalLimit: 2, fineMultiplier: 0.5, securityDeposit: 0.0, description: "General office and personal development books" },
  { id: "5", name: "Guest / Research Scholar", maxBooks: 2, loanPeriodDays: 7, renewalLimit: 1, fineMultiplier: 1.5, securityDeposit: 50.0, description: "Temporary visitor borrowing card with caution deposit" },
];

const DEFAULT_HOLIDAY_CLOSURES: HolidayClosureItem[] = [
  { id: "1", name: "Dashain Vacation", startDate: "2026-10-18", endDate: "2026-10-27", reason: "National festival closure" },
  { id: "2", name: "Annual Library Stock Audit", startDate: "2026-12-28", endDate: "2026-12-31", reason: "Year-end inventory physical verification" },
  { id: "3", name: "Tihar Festival", startDate: "2026-11-06", endDate: "2026-11-10", reason: "Institutional holiday" },
];

const DEFAULT_NOTIFICATION_TRIGGERS: NotificationTriggerItem[] = [
  { id: "1", eventTitle: "Advance Due-Date Reminder", timing: "2 Days before Due Date (08:00 AM)", channels: { sms: true, email: true, push: true }, templatePreview: "Dear {member_name}, your borrowed book '{book_title}' is due in 2 days on {due_date}. Please return or renew online." },
  { id: "2", eventTitle: "Due-Date Day Notice", timing: "On Due Date Morning (07:30 AM)", channels: { sms: true, email: true, push: false }, templatePreview: "Reminder: '{book_title}' is due TODAY at the library counter. Avoid overdue fines by returning on time." },
  { id: "3", eventTitle: "First Overdue Notice (Fine Initiated)", timing: "1 Day after Due Date", channels: { sms: true, email: true, push: true }, templatePreview: "OVERDUE ALERT: '{book_title}' is overdue by 1 day. Fine of ${fine_amount} has started accruing. Return immediately." },
  { id: "4", eventTitle: "Critical Overdue & Hold Notice", timing: "7 Days after Due Date (Escalated to Class Teacher)", channels: { sms: true, email: true, push: true }, templatePreview: "URGENT: Book '{book_title}' is 7 days overdue. Library borrowing and report cards are on hold. Fine: ${fine_amount}." },
  { id: "5", eventTitle: "Reserved Book Ready for Pickup", timing: "Instant when book copy is checked in", channels: { sms: true, email: true, push: true }, templatePreview: "Great news {member_name}! Reserved book '{book_title}' is now available for you at Central Library. Hold expires in 48 hours." },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LibrarySetupPage() {
  const { toast } = useToast();
  const [activeTabId, setActiveTabId] = React.useState<string>("library");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Storage State for all 14 areas
  const [libraries, setLibraries] = React.useState<LibraryBranch[]>([]);
  const [categories, setCategories] = React.useState<BookCategoryItem[]>([]);
  const [books, setBooks] = React.useState<BookMasterItem[]>([]);
  const [copies, setCopies] = React.useState<BookCopyItem[]>([]);
  const [racks, setRacks] = React.useState<RackShelfItem[]>([]);
  const [members, setMembers] = React.useState<MemberItem[]>([]);
  const [memberTypes, setMemberTypes] = React.useState<MemberTypeItem[]>([]);
  const [holidayClosures, setHolidayClosures] = React.useState<HolidayClosureItem[]>([]);
  const [notificationTriggers, setNotificationTriggers] = React.useState<NotificationTriggerItem[]>([]);

  // Policy Settings States
  const [circulationRules, setCirculationRules] = React.useState({
    defaultLoanDays: 14,
    maxBooksPerUser: 4,
    maxRenewalCount: 2,
    renewalWindowDays: 3,
    allowRenewalIfOverdue: false,
    allowRenewalIfReserved: false,
    maxReservations: 2,
    referenceCheckoutPolicy: "overnight", // "none" | "overnight" | "2days"
    holdPickupWindowHours: 48,
  });

  const [fineRules, setFineRules] = React.useState({
    finePerDay: 1.0,
    gracePeriodDays: 2,
    maxFineCap: 50.0,
    autoSuspensionThreshold: 20.0,
    lostBookMultiplier: 1.5,
    processingFee: 10.0,
    waiverAuthority: "Chief Librarian & Principal",
  });

  const [holidayRules, setHolidayRules] = React.useState({
    excludeHolidaysFromFine: true,
    excludeWeekendsFromFine: true,
    autoExtendToNextWorkingDay: true,
    syncWithAcademicCalendar: true,
  });

  const [reservationRules, setReservationRules] = React.useState({
    allowReservations: true,
    maxActiveReservations: 2,
    queuePolicy: "FIFO", // "FIFO" | "Seniority"
    autoNotifyOnCheckin: true,
    holdClaimHours: 48,
    autoCancelUnclaimed: true,
    reservationFee: 0.0,
  });

  const [lostDamagedRules, setLostDamagedRules] = React.useState({
    minorDamagePercent: 25,
    majorDamagePercent: 50,
    lostReplacementPriceMultiplier: 100, // 100% of price
    fixedProcessingFee: 10.0,
    allowExactPhysicalReplacement: true,
    logDisciplinaryIncidentOnRepeated: true,
  });

  // Modal Dialog States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [activeItem, setActiveItem] = React.useState<any>(null);

  // Fine Calculator Simulator State
  const [calcBookPrice, setCalcBookPrice] = React.useState<number>(30);
  const [calcOverdueDays, setCalcOverdueDays] = React.useState<number>(8);

  // Initialize from LocalStorage or seed defaults
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && LIBRARY_SETUP_TABS.some((t) => t.id === tabParam)) {
        setActiveTabId(tabParam);
      }
    }

    const loadOrSet = (key: string, defaultVal: any, setter: (val: any) => void) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
          return;
        } catch (e) {
          console.error(`Error loading ${key}`, e);
        }
      }
      setter(defaultVal);
    };

    loadOrSet("erp_library_branches_v1", DEFAULT_LIBRARIES, setLibraries);
    loadOrSet("erp_library_categories_v1", DEFAULT_CATEGORIES, setCategories);
    loadOrSet("erp_library_books_v1", DEFAULT_BOOKS, setBooks);
    loadOrSet("erp_library_copies_v1", DEFAULT_COPIES, setCopies);
    loadOrSet("erp_library_racks_v1", DEFAULT_RACK_SHELVES, setRacks);
    loadOrSet("erp_library_members_v1", DEFAULT_MEMBERS, setMembers);
    loadOrSet("erp_library_member_types_v1", DEFAULT_MEMBER_TYPES, setMemberTypes);
    loadOrSet("erp_library_holidays_v1", DEFAULT_HOLIDAY_CLOSURES, setHolidayClosures);
    loadOrSet("erp_library_notifications_v1", DEFAULT_NOTIFICATION_TRIGGERS, setNotificationTriggers);
  }, []);

  const activeTabMeta = React.useMemo(() => {
    return LIBRARY_SETUP_TABS.find((t) => t.id === activeTabId) || LIBRARY_SETUP_TABS[0];
  }, [activeTabId]);

  const TabActiveIcon = activeTabMeta.icon;

  // Stats Calculations
  const stats = React.useMemo(() => {
    const totalTitles = books.length;
    const totalCopiesCount = copies.length;
    const issuedCopiesCount = copies.filter((c) => c.status === "Issued").length;
    const availableCopiesCount = copies.filter((c) => c.status === "Available").length;
    const activeMembersCount = members.filter((m) => m.status === "Active").length;
    const totalPendingFines = members.reduce((acc, m) => acc + (m.pendingFines || 0), 0);

    return {
      totalTitles,
      totalCopiesCount,
      issuedCopiesCount,
      availableCopiesCount,
      activeMembersCount,
      totalPendingFines,
    };
  }, [books, copies, members]);

  // Fine Calculator simulation helper
  const simulatedFine = React.useMemo(() => {
    const chargeableDays = Math.max(0, calcOverdueDays - fineRules.gracePeriodDays);
    const rawFine = chargeableDays * fineRules.finePerDay;
    return Math.min(fineRules.maxFineCap, rawFine);
  }, [calcOverdueDays, fineRules]);

  // Generic Save helpers
  const handleSaveCirculationRules = () => {
    localStorage.setItem("erp_library_circulation_rules_v1", JSON.stringify(circulationRules));
    toast({ type: "success", title: "Circulation Rules Saved", message: "Library borrowing & renewal limits updated successfully." });
  };

  const handleSaveFineRules = () => {
    localStorage.setItem("erp_library_fine_rules_v1", JSON.stringify(fineRules));
    toast({ type: "success", title: "Fine Rules Saved", message: "Overdue rate cards and penalty limits updated." });
  };

  const handleSaveHolidayRules = () => {
    localStorage.setItem("erp_library_holiday_rules_v1", JSON.stringify(holidayRules));
    toast({ type: "success", title: "Holiday Policies Saved", message: "Weekend and calendar exclusion settings updated." });
  };

  const handleSaveReservationRules = () => {
    localStorage.setItem("erp_library_reservation_rules_v1", JSON.stringify(reservationRules));
    toast({ type: "success", title: "Reservation Rules Saved", message: "Book hold queue and pickup policies updated." });
  };

  const handleSaveLostDamagedRules = () => {
    localStorage.setItem("erp_library_lost_damaged_rules_v1", JSON.stringify(lostDamagedRules));
    toast({ type: "success", title: "Lost & Damaged Policy Saved", message: "Book replacement and penalty rates updated." });
  };

  const handleExportData = () => {
    if (activeTabId === "book-master") {
      exportToCsv(
        books.map((b) => ({
          ISBN: b.isbn,
          Title: b.title,
          Author: b.author,
          Publisher: b.publisher,
          Category: b.category,
          Shelf: b.rackShelf,
          Price: `$${b.price.toFixed(2)}`,
          "Total Copies": b.totalCopies,
          "Available Copies": b.availableCopies,
        })),
        "Library-Book-Catalog.csv"
      );
    } else if (activeTabId === "book-copies") {
      exportToCsv(
        copies.map((c) => ({
          "Accession No": c.accessionNumber,
          Barcode: c.barcode,
          "Book Title": c.bookTitle,
          Condition: c.condition,
          Location: c.rackShelf,
          Status: c.status,
          Price: `$${c.price.toFixed(2)}`,
        })),
        "Library-Accession-Copies.csv"
      );
    } else if (activeTabId === "members") {
      exportToCsv(
        members.map((m) => ({
          "Member ID": m.memberId,
          "Patron Name": m.name,
          "Member Type": m.memberType,
          "Department/Grade": m.departmentOrGrade,
          "Active Loans": `${m.issuedCount}/${m.maxAllowed}`,
          "Pending Fines": `$${m.pendingFines.toFixed(2)}`,
          Status: m.status,
          "Valid Until": m.expiryDate,
        })),
        "Library-Members-Registry.csv"
      );
    } else if (activeTabId === "reports") {
      exportToCsv(
        copies.map((c) => ({
          Accession: c.accessionNumber,
          Title: c.bookTitle,
          Barcode: c.barcode,
          Status: c.status,
          Location: c.rackShelf,
          Condition: c.condition,
          Price: `$${c.price.toFixed(2)}`,
        })),
        "Library-Full-Inventory-Report.csv"
      );
    } else {
      exportToCsv(
        books.map((b) => ({
          ISBN: b.isbn,
          Title: b.title,
          Author: b.author,
          Category: b.category,
          Price: `$${b.price.toFixed(2)}`,
        })),
        "Library-Data-Export.csv"
      );
    }
    toast({ type: "success", title: "Export Complete", message: "Exported current view data to CSV file." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      {/* 1. Global Header */}
      <ErpHeader />

      {/* 2. Top Navigation */}
      <ErpTopNav activeModuleId="library" />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
            <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <Link href="/library/setup" className="hover:text-[var(--brand-primary)] transition-colors">
              Library
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <span className="font-bold text-[var(--brand-primary)]">Library Setup & Configuration</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-secondary)] shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4. Top KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-red-50 text-[var(--brand-primary)] flex items-center justify-center font-bold">
              <BookMarked className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Book Titles</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{stats.totalTitles}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Total Copies</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{stats.totalCopiesCount}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Available</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{stats.availableCopiesCount}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Checked Out</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{stats.issuedCopiesCount}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Active Members</div>
              <div className="text-base font-bold text-[var(--text-primary)]">{stats.activeMembersCount}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-[6px] border border-[var(--border-default)] shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--neutral-500)] font-medium">Pending Fines</div>
              <div className="text-base font-bold text-[var(--text-primary)]">${stats.totalPendingFines.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* 5. 14 Horizontal Setup Tabs Navigation Bar */}
        <div className="bg-white p-3 rounded-[6px] border border-[var(--border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Library Setup Configuration Modules (14 Areas)
              </span>
            </div>
            <span className="text-[11px] text-[var(--neutral-500)]">
              Click any module tab to configure rules, catalogs and policies
            </span>
          </div>

          {/* Grouped Tab Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {LIBRARY_SETUP_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTabId === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all duration-150 cursor-pointer border select-none",
                    isSelected
                      ? "bg-[var(--red-50)] text-[var(--brand-primary)] font-semibold border-[var(--brand-primary)] shadow-2xs"
                      : "bg-white text-[var(--neutral-600)] border-[var(--border-default)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)] hover:border-[var(--neutral-300)]"
                  )}
                >
                  <TabIcon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isSelected ? "text-[var(--brand-primary)]" : "text-[var(--neutral-500)]"
                    )}
                  />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Active Tab Content Canvas */}
        <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
          {/* Card Top Title Bar */}
          <div className="px-5 py-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-[6px] bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-100)]">
                <TabActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  {activeTabMeta.title}
                </h1>
                <p className="text-xs text-[var(--neutral-500)]">{activeTabMeta.subtitle}</p>
              </div>
            </div>

            {/* Right Tools / Action Search Bar */}
            <div className="flex items-center gap-2.5">
              {["book-master", "book-copies", "members", "book-category", "rack-shelf"].includes(activeTabId) && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTabMeta.title.toLowerCase()}...`}
                    className="h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] w-48 sm:w-60 transition-colors"
                  />
                </div>
              )}

              {/* Action Buttons for Tab types */}
              {activeTabId === "library" && (
                <button
                  type="button"
                  onClick={() => {
                    const newBranch: LibraryBranch = {
                      id: Date.now().toString(),
                      name: "New Extension Library",
                      code: `LIB-EXT-${libraries.length + 1}`,
                      location: "North Block",
                      floor: "1st Floor",
                      openingTime: "08:00 AM",
                      closingTime: "04:30 PM",
                      daysOpen: "Mon - Fri",
                      librarian: "Staff In-Charge",
                      contactEmail: "lib.ext@schoolerp.io",
                      contactPhone: "+977 1-4400000",
                      capacity: 50,
                      isDefault: false,
                    };
                    const updated = [...libraries, newBranch];
                    setLibraries(updated);
                    localStorage.setItem("erp_library_branches_v1", JSON.stringify(updated));
                    toast({ type: "success", title: "Branch Added", message: "New library branch created." });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Library Branch</span>
                </button>
              )}

              {activeTabId === "book-category" && (
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt("Enter Category Name (e.g. Philosophy, Geography):");
                    if (!name?.trim()) return;
                    const code = prompt("Enter Short Code (e.g. PHIL, GEO):") || name.slice(0, 4).toUpperCase();
                    const newCat: BookCategoryItem = {
                      id: Date.now().toString(),
                      name: name.trim(),
                      code: code.trim().toUpperCase(),
                      ddcPrefix: "100 - 199",
                      ageLevel: "All Grades",
                      colorTag: "bg-neutral-100 text-neutral-800 border-neutral-200",
                      description: "Newly registered category",
                      totalTitles: 0,
                      totalCopies: 0,
                    };
                    const updated = [...categories, newCat];
                    setCategories(updated);
                    localStorage.setItem("erp_library_categories_v1", JSON.stringify(updated));
                    toast({ type: "success", title: "Category Added", message: `Added "${name}" category.` });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Book Category</span>
                </button>
              )}

              {activeTabId === "book-master" && (
                <button
                  type="button"
                  onClick={() => {
                    const title = prompt("Enter Book Title:");
                    if (!title?.trim()) return;
                    const author = prompt("Enter Author Name:") || "Author";
                    const isbn = prompt("Enter ISBN (e.g. 978-0123456789):") || `978-${Date.now().toString().slice(-10)}`;
                    const newBook: BookMasterItem = {
                      id: Date.now().toString(),
                      isbn: isbn.trim(),
                      title: title.trim(),
                      author: author.trim(),
                      publisher: "Standard Publications",
                      edition: "1st Edition",
                      publicationYear: "2025",
                      subject: "General",
                      category: categories[0]?.name || "Fiction & Literature",
                      language: "English",
                      rackShelf: "Rack A - Shelf 1",
                      price: 20.0,
                      totalCopies: 1,
                      availableCopies: 1,
                      callNumber: "000 GEN",
                    };
                    const updated = [...books, newBook];
                    setBooks(updated);
                    localStorage.setItem("erp_library_books_v1", JSON.stringify(updated));
                    toast({ type: "success", title: "Book Added", message: `"${title}" registered in catalog.` });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Book Title</span>
                </button>
              )}

              {activeTabId === "book-copies" && (
                <button
                  type="button"
                  onClick={() => {
                    const accessionNumber = `ACC-${new Date().getFullYear()}-${String(copies.length + 1).padStart(4, "0")}`;
                    const targetBook = books[0] || { title: "General Book", isbn: "978-0000000000", price: 20 };
                    const newCopy: BookCopyItem = {
                      id: Date.now().toString(),
                      accessionNumber,
                      barcode: `${targetBook.isbn.replace(/-/g, "")}-${String(copies.length + 1).padStart(2, "0")}`,
                      bookTitle: targetBook.title,
                      isbn: targetBook.isbn,
                      copyNumber: copies.filter((c) => c.isbn === targetBook.isbn).length + 1,
                      condition: "New",
                      rackShelf: "Rack A - Shelf 1",
                      status: "Available",
                      acquisitionDate: new Date().toISOString().split("T")[0],
                      price: targetBook.price,
                    };
                    const updated = [...copies, newCopy];
                    setCopies(updated);
                    localStorage.setItem("erp_library_copies_v1", JSON.stringify(updated));
                    toast({ type: "success", title: "Accession Copy Generated", message: `Generated ${accessionNumber}` });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Accession Copy</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: LIBRARY BRANCHES                                                   */}
          {/* ========================================================================= */}
          {activeTabId === "library" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {libraries.map((b) => (
                  <div key={b.id} className={cn("p-4 rounded-[6px] border transition-all relative space-y-3 bg-white", b.isDefault ? "border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20 shadow-xs" : "border-[var(--border-default)]")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[var(--brand-primary)]" />
                        <h3 className="text-xs font-bold text-[var(--text-primary)]">{b.name}</h3>
                      </div>
                      {b.isDefault && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-red-50 text-[var(--brand-primary)] border border-red-200">
                          Main Branch
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1.5 text-[var(--neutral-600)] divide-y divide-[var(--border-light)]">
                      <div className="pt-1 flex justify-between"><span className="text-[var(--neutral-400)]">Branch Code:</span> <span className="font-mono font-medium">{b.code}</span></div>
                      <div className="pt-1 flex justify-between"><span className="text-[var(--neutral-400)]">Location / Floor:</span> <span className="font-medium">{b.location} ({b.floor})</span></div>
                      <div className="pt-1 flex justify-between"><span className="text-[var(--neutral-400)]">Hours:</span> <span className="font-medium">{b.openingTime} - {b.closingTime}</span></div>
                      <div className="pt-1 flex justify-between"><span className="text-[var(--neutral-400)]">Librarian:</span> <span className="font-medium">{b.librarian}</span></div>
                      <div className="pt-1 flex justify-between"><span className="text-[var(--neutral-400)]">Seating Capacity:</span> <span className="font-bold text-[var(--text-primary)]">{b.capacity} Seats</span></div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-light)]">
                      {!b.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = libraries.map((x) => ({ ...x, isDefault: x.id === b.id }));
                            setLibraries(updated);
                            localStorage.setItem("erp_library_branches_v1", JSON.stringify(updated));
                            toast({ type: "info", title: "Default Set", message: `${b.name} is now the primary library.` });
                          }}
                          className="text-[11px] text-[var(--brand-primary)] hover:underline font-semibold"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (libraries.length <= 1) {
                            alert("Cannot delete the only remaining library branch.");
                            return;
                          }
                          if (!confirm(`Delete ${b.name}?`)) return;
                          const updated = libraries.filter((x) => x.id !== b.id);
                          setLibraries(updated);
                          localStorage.setItem("erp_library_branches_v1", JSON.stringify(updated));
                        }}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BOOK CATEGORIES                                                    */}
          {/* ========================================================================= */}
          {activeTabId === "book-category" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Category Name</th>
                    <th className="py-2.5 px-4">Code / Slug</th>
                    <th className="py-2.5 px-4">Dewey Classification (DDC)</th>
                    <th className="py-2.5 px-4">Target Audience</th>
                    <th className="py-2.5 px-4 text-center">Titles / Copies</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {categories.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{c.name}</div>
                        <div className="text-[10px] text-[var(--neutral-400)]">{c.description}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[var(--brand-primary)]">{c.code}</td>
                      <td className="py-3 px-4 font-mono text-[var(--neutral-600)]">{c.ddcPrefix}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">{c.ageLevel}</span></td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-[var(--text-primary)]">{c.totalTitles}</span> <span className="text-[var(--neutral-400)]">titles</span> / <span className="font-bold text-blue-600">{c.totalCopies}</span> <span className="text-[var(--neutral-400)]">copies</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm(`Delete ${c.name}?`)) return;
                            const updated = categories.filter((x) => x.id !== c.id);
                            setCategories(updated);
                            localStorage.setItem("erp_library_categories_v1", JSON.stringify(updated));
                          }}
                          className="p-1 rounded text-[var(--neutral-400)] hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: BOOK MASTER                                                        */}
          {/* ========================================================================= */}
          {activeTabId === "book-master" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Title & Details</th>
                    <th className="py-2.5 px-4">ISBN</th>
                    <th className="py-2.5 px-4">Author / Publisher</th>
                    <th className="py-2.5 px-4">Category / Shelf</th>
                    <th className="py-2.5 px-4 text-center">Copies</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {books.filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()) || b.isbn.includes(searchQuery)).map((b, idx) => (
                    <tr key={b.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{b.title}</div>
                        <div className="text-[10px] text-[var(--neutral-400)]">{b.subtitle || b.edition}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--neutral-600)]">{b.isbn}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--text-primary)]">{b.author}</div>
                        <div className="text-[10px] text-[var(--neutral-400)]">{b.publisher} ({b.publicationYear})</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">{b.category}</span>
                        <div className="text-[10px] text-[var(--neutral-500)] mt-0.5">{b.rackShelf}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-emerald-600">{b.availableCopies}</span> / <span className="text-[var(--neutral-600)]">{b.totalCopies}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--text-primary)]">${b.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm(`Delete ${b.title}?`)) return;
                            const updated = books.filter((x) => x.id !== b.id);
                            setBooks(updated);
                            localStorage.setItem("erp_library_books_v1", JSON.stringify(updated));
                          }}
                          className="p-1 rounded text-[var(--neutral-400)] hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BOOK COPIES & ACCESSION                                            */}
          {/* ========================================================================= */}
          {activeTabId === "book-copies" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Accession Number</th>
                    <th className="py-2.5 px-4">Barcode / RFID</th>
                    <th className="py-2.5 px-4">Book Title</th>
                    <th className="py-2.5 px-4">Shelf Location</th>
                    <th className="py-2.5 px-4">Condition</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {copies.filter(c => !searchQuery || c.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) || c.accessionNumber.toLowerCase().includes(searchQuery.toLowerCase())).map((c, idx) => (
                    <tr key={c.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)]">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{c.accessionNumber}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--neutral-700)] flex items-center gap-1.5">
                        <QrCode className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
                        <span>{c.barcode}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        {c.bookTitle} <span className="text-[10px] text-[var(--neutral-400)] font-mono">(Copy #{c.copyNumber})</span>
                      </td>
                      <td className="py-3 px-4 text-[var(--neutral-600)]">{c.rackShelf}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-800">{c.condition}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", c.status === "Available" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : c.status === "Issued" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200")}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm(`Delete copy ${c.accessionNumber}?`)) return;
                            const updated = copies.filter((x) => x.id !== c.id);
                            setCopies(updated);
                            localStorage.setItem("erp_library_copies_v1", JSON.stringify(updated));
                          }}
                          className="p-1 rounded text-[var(--neutral-400)] hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: RACK & SHELF TOPOLOGY                                              */}
          {/* ========================================================================= */}
          {activeTabId === "rack-shelf" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {racks.map((r) => {
                  const percent = Math.round((r.occupied / r.capacity) * 100);
                  return (
                    <div key={r.id} className="p-4 rounded-[6px] border border-[var(--border-default)] bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Grid className="h-4 w-4 text-[var(--brand-primary)]" />
                          <h3 className="text-xs font-bold text-[var(--text-primary)]">{r.rack} - {r.shelf}</h3>
                        </div>
                        <span className={cn("px-1.5 py-0.5 text-[9px] font-bold rounded", r.status === "Full" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200")}>
                          {r.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-[var(--neutral-600)]">
                        <div>Location: <span className="font-semibold text-[var(--text-primary)]">{r.building} &gt; {r.room}</span></div>
                        <div>Category: <span className="font-semibold text-blue-600">{r.category}</span></div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[var(--neutral-500)]">
                          <span>Occupancy: {r.occupied} / {r.capacity} books</span>
                          <span className="font-mono font-bold">{percent}%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all", percent > 90 ? "bg-rose-500" : percent > 60 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: MEMBERS REGISTRY                                                   */}
          {/* ========================================================================= */}
          {activeTabId === "members" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Member ID</th>
                    <th className="py-2.5 px-4">Patron Name</th>
                    <th className="py-2.5 px-4">Member Type</th>
                    <th className="py-2.5 px-4">Grade / Dept</th>
                    <th className="py-2.5 px-4 text-center">Active Loans</th>
                    <th className="py-2.5 px-4 text-center">Pending Fine</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {members.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)]">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{m.memberId}</td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{m.name}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">{m.memberType}</span></td>
                      <td className="py-3 px-4 text-[var(--neutral-600)]">{m.departmentOrGrade}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{m.issuedCount} / {m.maxAllowed}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">${m.pendingFines.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", m.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200")}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: MEMBER TYPES & PRIVILEGES                                          */}
          {/* ========================================================================= */}
          {activeTabId === "member-types" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Member Tier Name</th>
                    <th className="py-2.5 px-4 text-center">Max Books Allowed</th>
                    <th className="py-2.5 px-4 text-center">Loan Period</th>
                    <th className="py-2.5 px-4 text-center">Renewal Limit</th>
                    <th className="py-2.5 px-4 text-center">Fine Multiplier</th>
                    <th className="py-2.5 px-4 text-right">Caution Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {memberTypes.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-[var(--neutral-50)]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[var(--neutral-500)]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--text-primary)]">{t.name}</div>
                        <div className="text-[10px] text-[var(--neutral-400)]">{t.description}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--brand-primary)]">{t.maxBooks} Books</td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">{t.loanPeriodDays} Days</td>
                      <td className="py-3 px-4 text-center font-mono">{t.renewalLimit} Times</td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--neutral-600)]">{t.fineMultiplier}x</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--text-primary)]">${t.securityDeposit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: CIRCULATION RULES                                                  */}
          {/* ========================================================================= */}
          {activeTabId === "library-rules" && (
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Default Loan Period (Days)</label>
                  <input
                    type="number"
                    value={circulationRules.defaultLoanDays}
                    onChange={(e) => setCirculationRules({ ...circulationRules, defaultLoanDays: parseInt(e.target.value) || 1 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Standard lending window before item becomes overdue</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Max Books per Patron</label>
                  <input
                    type="number"
                    value={circulationRules.maxBooksPerUser}
                    onChange={(e) => setCirculationRules({ ...circulationRules, maxBooksPerUser: parseInt(e.target.value) || 1 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Global ceiling on concurrent active loans</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Renewal Limit (Times)</label>
                  <input
                    type="number"
                    value={circulationRules.maxRenewalCount}
                    onChange={(e) => setCirculationRules({ ...circulationRules, maxRenewalCount: parseInt(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Maximum times a student/teacher can renew an issued book</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Renewal Window (Days before due date)</label>
                  <input
                    type="number"
                    value={circulationRules.renewalWindowDays}
                    onChange={(e) => setCirculationRules({ ...circulationRules, renewalWindowDays: parseInt(e.target.value) || 1 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">How many days prior to expiry renewal is unlocked</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-light)]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={circulationRules.allowRenewalIfOverdue}
                    onChange={(e) => setCirculationRules({ ...circulationRules, allowRenewalIfOverdue: e.target.checked })}
                    className="h-4 w-4 rounded text-[var(--brand-primary)]"
                  />
                  <span className="text-xs font-medium text-[var(--text-primary)]">Allow renewal even if book is currently overdue (with fine settlement)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={circulationRules.allowRenewalIfReserved}
                    onChange={(e) => setCirculationRules({ ...circulationRules, allowRenewalIfReserved: e.target.checked })}
                    className="h-4 w-4 rounded text-[var(--brand-primary)]"
                  />
                  <span className="text-xs font-medium text-[var(--text-primary)]">Allow renewal if another student has placed a hold reservation (Strict lock)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCirculationRules}
                  className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white rounded-[4px] hover:bg-red-700 shadow-xs transition-colors cursor-pointer"
                >
                  Save Circulation Rules
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: FINE & PENALTY RULES                                               */}
          {/* ========================================================================= */}
          {activeTabId === "fine-rules" && (
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Fine per Overdue Day ($ / Rs.)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={fineRules.finePerDay}
                    onChange={(e) => setFineRules({ ...fineRules, finePerDay: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Accrued daily penalty rate per overdue item</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={fineRules.gracePeriodDays}
                    onChange={(e) => setFineRules({ ...fineRules, gracePeriodDays: parseInt(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Days after due date before fine starts counting</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Maximum Fine Cap per Book ($)</label>
                  <input
                    type="number"
                    value={fineRules.maxFineCap}
                    onChange={(e) => setFineRules({ ...fineRules, maxFineCap: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Absolute penalty cap to protect students from runaway charges</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Account Suspension Threshold ($)</label>
                  <input
                    type="number"
                    value={fineRules.autoSuspensionThreshold}
                    onChange={(e) => setFineRules({ ...fineRules, autoSuspensionThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Unpaid fine amount that triggers automatic borrowing hold</p>
                </div>
              </div>

              {/* Interactive Fine Simulator Box */}
              <div className="p-4 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Interactive Fine Calculator Simulator</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-[11px] text-[var(--neutral-500)]">Book Price ($)</label>
                    <input type="number" value={calcBookPrice} onChange={(e) => setCalcBookPrice(parseFloat(e.target.value) || 0)} className="w-full h-8 px-2.5 text-xs bg-white border border-[var(--border-default)] rounded font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--neutral-500)]">Overdue Days</label>
                    <input type="number" value={calcOverdueDays} onChange={(e) => setCalcOverdueDays(parseInt(e.target.value) || 0)} className="w-full h-8 px-2.5 text-xs bg-white border border-[var(--border-default)] rounded font-mono" />
                  </div>
                  <div className="p-2 bg-white rounded border border-[var(--border-default)] text-right">
                    <span className="text-[10px] text-[var(--neutral-400)] block">Calculated Fine</span>
                    <span className="text-base font-bold text-[var(--brand-primary)] font-mono">${simulatedFine.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleSaveFineRules} className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white rounded-[4px] hover:bg-red-700 shadow-xs transition-colors cursor-pointer">
                  Save Fine Rules
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: HOLIDAY & WEEKEND RULES                                           */}
          {/* ========================================================================= */}
          {activeTabId === "holiday-rules" && (
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="space-y-3 bg-[var(--bg-secondary)] p-4 rounded-[6px] border border-[var(--border-default)]">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Exclude Official School Holidays from Overdue Days</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">Holidays will not count as overdue penalty days</div>
                  </div>
                  <input type="checkbox" checked={holidayRules.excludeHolidaysFromFine} onChange={(e) => setHolidayRules({ ...holidayRules, excludeHolidaysFromFine: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--border-light)] pt-2">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Exclude Weekends (Saturdays & Sundays) from Fine Calculation</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">Fines only accrue on official operating library working days</div>
                  </div>
                  <input type="checkbox" checked={holidayRules.excludeWeekendsFromFine} onChange={(e) => setHolidayRules({ ...holidayRules, excludeWeekendsFromFine: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--border-light)] pt-2">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Auto-Extend Due Date to Next Working Day</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">If return date falls on a closed day, automatically shift due date</div>
                  </div>
                  <input type="checkbox" checked={holidayRules.autoExtendToNextWorkingDay} onChange={(e) => setHolidayRules({ ...holidayRules, autoExtendToNextWorkingDay: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>
              </div>

              {/* Custom Closure Dates Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Custom Library Closure Dates</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt("Enter Closure Reason (e.g. Annual Audit):");
                      if (!name) return;
                      const newClosure: HolidayClosureItem = {
                        id: Date.now().toString(),
                        name,
                        startDate: "2026-11-15",
                        endDate: "2026-11-16",
                        reason: "Staff training & stock auditing",
                      };
                      setHolidayClosures([...holidayClosures, newClosure]);
                    }}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    + Add Closure Date
                  </button>
                </div>

                <table className="w-full text-left text-xs border border-[var(--border-default)] rounded">
                  <thead>
                    <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                      <th className="py-2 px-3">Holiday / Closure Name</th>
                      <th className="py-2 px-3">Start Date</th>
                      <th className="py-2 px-3">End Date</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {holidayClosures.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">{h.name}</td>
                        <td className="py-2.5 px-3 font-mono">{h.startDate}</td>
                        <td className="py-2.5 px-3 font-mono">{h.endDate}</td>
                        <td className="py-2.5 px-3 text-[var(--neutral-600)]">{h.reason}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button type="button" onClick={() => setHolidayClosures(holidayClosures.filter(x => x.id !== h.id))} className="text-red-600 hover:underline">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleSaveHolidayRules} className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white rounded-[4px] hover:bg-red-700 shadow-xs transition-colors cursor-pointer">
                  Save Holiday Rules
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 11: BOOK RESERVATION POLICIES                                         */}
          {/* ========================================================================= */}
          {activeTabId === "reservation" && (
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Hold Claim Window (Hours)</label>
                  <input
                    type="number"
                    value={reservationRules.holdClaimHours}
                    onChange={(e) => setReservationRules({ ...reservationRules, holdClaimHours: parseInt(e.target.value) || 24 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Hours the reserver has to pick up before passing to next in line</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Max Active Reservations per User</label>
                  <input
                    type="number"
                    value={reservationRules.maxActiveReservations}
                    onChange={(e) => setReservationRules({ ...reservationRules, maxActiveReservations: parseInt(e.target.value) || 1 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Limit concurrent pending hold requests per member</p>
                </div>
              </div>

              <div className="space-y-3 bg-[var(--bg-secondary)] p-4 rounded-[6px] border border-[var(--border-default)]">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Allow Online Book Reservations</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">Students and teachers can hold unavailable books via web portal</div>
                  </div>
                  <input type="checkbox" checked={reservationRules.allowReservations} onChange={(e) => setReservationRules({ ...reservationRules, allowReservations: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--border-light)] pt-2">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Automated SMS / Email Alert on Check-in</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">Immediately notify next queued member when copy is returned</div>
                  </div>
                  <input type="checkbox" checked={reservationRules.autoNotifyOnCheckin} onChange={(e) => setReservationRules({ ...reservationRules, autoNotifyOnCheckin: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleSaveReservationRules} className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white rounded-[4px] hover:bg-red-700 shadow-xs transition-colors cursor-pointer">
                  Save Reservation Policies
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 12: LOST / DAMAGED POLICIES                                           */}
          {/* ========================================================================= */}
          {activeTabId === "lost-damaged" && (
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Minor Damage Penalty (% of Book Price)</label>
                  <input
                    type="number"
                    value={lostDamagedRules.minorDamagePercent}
                    onChange={(e) => setLostDamagedRules({ ...lostDamagedRules, minorDamagePercent: parseInt(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">For light pencil markings, dog-eared pages or surface wear</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Major Damage Penalty (% of Book Price)</label>
                  <input
                    type="number"
                    value={lostDamagedRules.majorDamagePercent}
                    onChange={(e) => setLostDamagedRules({ ...lostDamagedRules, majorDamagePercent: parseInt(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">For torn bindings, water spill stains or missing pages</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Lost Book Replacement Charge (% of Book Price)</label>
                  <input
                    type="number"
                    value={lostDamagedRules.lostReplacementPriceMultiplier}
                    onChange={(e) => setLostDamagedRules({ ...lostDamagedRules, lostReplacementPriceMultiplier: parseInt(e.target.value) || 100 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">100% covers original replacement cost</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Fixed Administrative Processing Fee ($)</label>
                  <input
                    type="number"
                    value={lostDamagedRules.fixedProcessingFee}
                    onChange={(e) => setLostDamagedRules({ ...lostDamagedRules, fixedProcessingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded-[4px] font-mono focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--neutral-400)]">Accessioning, cataloging and barcode printing fee</p>
                </div>
              </div>

              <div className="space-y-3 bg-[var(--bg-secondary)] p-4 rounded-[6px] border border-[var(--border-default)]">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Accept Brand-New Physical Copy as Replacement</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">Allow student to submit the exact same ISBN edition in new condition</div>
                  </div>
                  <input type="checkbox" checked={lostDamagedRules.allowExactPhysicalReplacement} onChange={(e) => setLostDamagedRules({ ...lostDamagedRules, allowExactPhysicalReplacement: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-[var(--border-light)] pt-2">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Log Student Conduct Incident on Multiple Lost Items</div>
                    <div className="text-[11px] text-[var(--neutral-500)]">Flags student profile in Behaviour module if 2+ books are lost</div>
                  </div>
                  <input type="checkbox" checked={lostDamagedRules.logDisciplinaryIncidentOnRepeated} onChange={(e) => setLostDamagedRules({ ...lostDamagedRules, logDisciplinaryIncidentOnRepeated: e.target.checked })} className="h-4 w-4 rounded text-[var(--brand-primary)]" />
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleSaveLostDamagedRules} className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white rounded-[4px] hover:bg-red-700 shadow-xs transition-colors cursor-pointer">
                  Save Lost & Damaged Rules
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 13: AUTOMATED NOTIFICATIONS                                           */}
          {/* ========================================================================= */}
          {activeTabId === "notifications" && (
            <div className="p-6 space-y-6 max-w-4xl">
              <div className="space-y-4">
                {notificationTriggers.map((t, idx) => (
                  <div key={t.id} className="p-4 rounded-[6px] border border-[var(--border-default)] bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[var(--brand-primary)]" />
                        <h3 className="text-xs font-bold text-[var(--text-primary)]">{t.eventTitle}</h3>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--neutral-500)]">{t.timing}</span>
                    </div>

                    <div className="p-3 bg-[var(--bg-secondary)] rounded-[4px] border border-[var(--border-light)] text-xs text-[var(--neutral-700)] font-mono">
                      {t.templatePreview}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={t.channels.sms} onChange={(e) => {
                            const copy = [...notificationTriggers];
                            copy[idx].channels.sms = e.target.checked;
                            setNotificationTriggers(copy);
                          }} className="h-3.5 w-3.5" />
                          <span>SMS Gateway</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={t.channels.email} onChange={(e) => {
                            const copy = [...notificationTriggers];
                            copy[idx].channels.email = e.target.checked;
                            setNotificationTriggers(copy);
                          }} className="h-3.5 w-3.5" />
                          <span>Email Broadcast</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={t.channels.push} onChange={(e) => {
                            const copy = [...notificationTriggers];
                            copy[idx].channels.push = e.target.checked;
                            setNotificationTriggers(copy);
                          }} className="h-3.5 w-3.5" />
                          <span>In-App / Push</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newText = prompt("Edit Message Template:", t.templatePreview);
                          if (newText) {
                            const copy = [...notificationTriggers];
                            copy[idx].templatePreview = newText;
                            setNotificationTriggers(copy);
                          }
                        }}
                        className="text-xs text-[var(--brand-primary)] font-semibold hover:underline"
                      >
                        Edit Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("erp_library_notifications_v1", JSON.stringify(notificationTriggers));
                    toast({ type: "success", title: "Notification Channels Saved", message: "Automated trigger alerts configured." });
                  }}
                  className="px-5 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white rounded-[4px] hover:bg-red-700 shadow-xs transition-colors cursor-pointer"
                >
                  Save Notification Triggers
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 14: CIRCULATION REPORTS & ANALYTICS                                   */}
          {/* ========================================================================= */}
          {activeTabId === "reports" && (
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-white space-y-2">
                  <div className="text-xs font-bold text-[var(--text-primary)]">Circulation Status Overview</div>
                  <div className="space-y-1.5 text-xs text-[var(--neutral-600)]">
                    <div className="flex justify-between"><span>Total Copies in Inventory:</span> <span className="font-bold">{copies.length}</span></div>
                    <div className="flex justify-between"><span>Currently on Loan:</span> <span className="font-bold text-amber-600">{copies.filter(c => c.status === "Issued").length}</span></div>
                    <div className="flex justify-between"><span>Available on Shelves:</span> <span className="font-bold text-emerald-600">{copies.filter(c => c.status === "Available").length}</span></div>
                    <div className="flex justify-between"><span>Reserved Holds:</span> <span className="font-bold text-blue-600">{copies.filter(c => c.status === "Reserved").length}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-white space-y-2">
                  <div className="text-xs font-bold text-[var(--text-primary)]">Fines & Penalties Summary</div>
                  <div className="space-y-1.5 text-xs text-[var(--neutral-600)]">
                    <div className="flex justify-between"><span>Members with Dues:</span> <span className="font-bold">{members.filter(m => m.pendingFines > 0).length} patrons</span></div>
                    <div className="flex justify-between"><span>Total Accrued Fines:</span> <span className="font-bold text-rose-600">${stats.totalPendingFines.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Current Daily Fine Rate:</span> <span className="font-bold">${fineRules.finePerDay.toFixed(2)} / day</span></div>
                    <div className="flex justify-between"><span>Grace Period Applied:</span> <span className="font-bold">{fineRules.gracePeriodDays} days</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-white space-y-2">
                  <div className="text-xs font-bold text-[var(--text-primary)]">Catalog Health & Racks</div>
                  <div className="space-y-1.5 text-xs text-[var(--neutral-600)]">
                    <div className="flex justify-between"><span>Total Class Categories:</span> <span className="font-bold">{categories.length}</span></div>
                    <div className="flex justify-between"><span>Active Racks & Shelves:</span> <span className="font-bold">{racks.length} shelves</span></div>
                    <div className="flex justify-between"><span>Avg Copies per Title:</span> <span className="font-bold">{(copies.length / (books.length || 1)).toFixed(1)}</span></div>
                    <div className="flex justify-between"><span>Default Branch:</span> <span className="font-bold text-emerald-600">{libraries.find(l => l.isDefault)?.name || "Main Library"}</span></div>
                  </div>
                </div>
              </div>

              {/* Data Table Preview of Current Loans */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Live Checked-out / Issued Copies Register
                  </h3>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Full CSV</span>
                  </button>
                </div>

                <div className="border border-[var(--border-default)] rounded overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                        <th className="py-2.5 px-4 w-12 text-center">#</th>
                        <th className="py-2.5 px-4">Accession No</th>
                        <th className="py-2.5 px-4">Book Title</th>
                        <th className="py-2.5 px-4">Shelf Location</th>
                        <th className="py-2.5 px-4">Condition</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]">
                      {copies.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-[var(--neutral-50)]/60">
                          <td className="py-2.5 px-4 text-center text-[var(--neutral-500)]">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-[var(--brand-primary)]">{c.accessionNumber}</td>
                          <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">{c.bookTitle}</td>
                          <td className="py-2.5 px-4 text-[var(--neutral-600)]">{c.rackShelf}</td>
                          <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100">{c.condition}</span></td>
                          <td className="py-2.5 px-4">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", c.status === "Available" ? "bg-emerald-50 text-emerald-700" : c.status === "Issued" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700")}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
