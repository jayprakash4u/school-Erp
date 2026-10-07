"use client";

import * as React from "react";
import Link from "next/link";
import {
  Library as LibraryIcon,
  LayoutDashboard,
  BookOpen,
  BookMarked,
  RefreshCw,
  Users,
  Boxes,
  ShoppingBag,
  Coins,
  FileText,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  QrCode,
  DollarSign,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  X,
  Eye,
  Trash2,
  Pencil,
  ArrowRight,
  Upload,
  UserCheck,
  Building,
  Building2,
  Sparkles,
  Check,
  ShieldCheck,
  Mail,
  Smartphone,
  Layers,
  Tag,
  Grid,
  History,
  Barcode,
  Calendar,
  Filter,
  FileSpreadsheet,
  Copy,
  Bookmark,
  ExternalLink,
  GraduationCap,
  PlusCircle,
  CheckSquare,
  RotateCcw,
  Receipt,
  UserPlus,
  Percent,
  BarChart2,
} from "lucide-react";
import { ErpHeader } from "@/components/layout/erp-header";
import { ErpTopNav } from "@/components/layout/erp-top-nav";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/export-utils";
import { useToast } from "@/components/ui/toast";

// ============================================================================
// DATA MODELS FOR THE LIBRARY SUITE
// ============================================================================

export type BookType =
  | "Textbook"
  | "Reference Book"
  | "Journal"
  | "Magazine"
  | "Newspaper"
  | "Thesis / Research"
  | "Digital Resource";

export interface Book {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher: string;
  edition: string;
  publicationYear: string;
  category: string;
  subject: string;
  language: string;
  bookType: BookType;
  description?: string;
  library: string;
  location: string;
  shelf: string;
  price: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  damagedCopies: number;
  lostCopies: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface BookCopy {
  id: string;
  bookId: string;
  bookTitle: string;
  copyNumber: number;
  accessionNo: string;
  barcode: string;
  library: string;
  location: string;
  shelf: string;
  condition: "New" | "Good" | "Fair" | "Damaged";
  status: "Available" | "Issued" | "Reserved" | "Damaged" | "Lost";
  price: number;
  acquiredDate?: string;
}

export interface Member {
  id: string;
  memberId: string;
  name: string;
  type: "School Student" | "College Student" | "Faculty" | "Staff";
  tierCategory: "School" | "College" | "Faculty";
  programOrGrade: string;
  rollOrEmpId: string;
  status: "Active" | "Suspended" | "Hold";
  currentBorrowings: string[];
  maxAllowed: number;
  outstandingFine: number;
  email: string;
  phone: string;
  joinedDate: string;
}

export interface ActiveLoan {
  id: string;
  barcode: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  memberType: string;
  issueDate: string;
  dueDate: string;
  renewCount: number;
  maxRenews: number;
  overdueDays: number;
  fineAmount: number;
  status: "On Time" | "Due Soon" | "Overdue";
}

export interface BookReservation {
  id: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  requestDate: string;
  status: "Pending" | "Ready for Pickup" | "Expired";
  expiryDate: string;
}

export interface AcquisitionItem {
  id: string;
  poNumber: string;
  bookTitle: string;
  author: string;
  requestedBy: string;
  requestRole: string;
  quantity: number;
  estimatedPrice: number;
  supplier: string;
  status: "Requested" | "Approved" | "Ordered" | "Received";
  requestDate: string;
}

export interface FineRecord {
  id: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  overdueDays: number;
  fineAmount: number;
  paidAmount: number;
  waivedAmount: number;
  status: "Pending" | "Paid" | "Waived";
  date: string;
  waiveReason?: string;
}

// ============================================================================
// SEED DEFAULT DATABASE
// ============================================================================

const SEED_BOOKS: Book[] = [
  {
    id: "b1",
    isbn: "978-0072958348",
    title: "Database Management Systems",
    subtitle: "Concepts, architecture, and relational design",
    author: "Korth, Silberschatz & Sudarshan",
    publisher: "McGraw Hill",
    edition: "7th Edition",
    publicationYear: "2023",
    category: "Computer Science",
    subject: "Database",
    language: "English",
    bookType: "Textbook",
    description: "Standard university textbook for relational database design, SQL, and indexing systems.",
    library: "Central Library",
    location: "Rack A",
    shelf: "Shelf 02",
    price: 650,
    totalCopies: 5,
    availableCopies: 3,
    issuedCopies: 1,
    damagedCopies: 1,
    lostCopies: 0,
    status: "In Stock",
  },
  {
    id: "b2",
    isbn: "978-1118230725",
    title: "Physics for Scientists and Engineers",
    subtitle: "Fundamentals of mechanics, waves, and thermodynamics",
    author: "Halliday, Resnick & Walker",
    publisher: "John Wiley & Sons",
    edition: "10th Edition",
    publicationYear: "2022",
    category: "Science",
    subject: "Physics",
    language: "English",
    bookType: "Textbook",
    description: "Calculus-based university textbook for fundamental physics.",
    library: "Central Library",
    location: "Rack B",
    shelf: "Shelf 01",
    price: 950,
    totalCopies: 12,
    availableCopies: 9,
    issuedCopies: 2,
    damagedCopies: 1,
    lostCopies: 0,
    status: "In Stock",
  },
  {
    id: "b3",
    isbn: "978-9352836260",
    title: "High School English Grammar & Composition",
    subtitle: "Standard reference for English language learning",
    author: "Wren & Martin",
    publisher: "S. Chand Publishing",
    edition: "Revised Edition",
    publicationYear: "2024",
    category: "Language",
    subject: "English",
    language: "English",
    bookType: "Textbook",
    description: "Grammar, syntax, vocabulary, and composition handbook.",
    library: "Junior Wing Library",
    location: "Rack C",
    shelf: "Shelf 01",
    price: 320,
    totalCopies: 8,
    availableCopies: 6,
    issuedCopies: 2,
    damagedCopies: 0,
    lostCopies: 0,
    status: "In Stock",
  },
  {
    id: "b4",
    isbn: "978-9352837335",
    title: "Accounting Basics & Financial Principles",
    subtitle: "Comprehensive guide to corporate & cost accounting",
    author: "P.C. Tulsian & Bharat Tulsian",
    publisher: "S. Chand Publishing",
    edition: "5th Edition",
    publicationYear: "2023",
    category: "Commerce",
    subject: "Accounting",
    language: "English",
    bookType: "Textbook",
    description: "Financial accounting principles, ledger posting, and balance sheet preparation.",
    library: "Central Library",
    location: "Rack D",
    shelf: "Shelf 02",
    price: 480,
    totalCopies: 6,
    availableCopies: 5,
    issuedCopies: 1,
    damagedCopies: 0,
    lostCopies: 0,
    status: "In Stock",
  },
  {
    id: "b5",
    isbn: "978-0132350884",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    subtitle: "Best practices in software engineering & architecture",
    author: "Robert C. Martin",
    publisher: "Prentice Hall",
    edition: "1st Edition",
    publicationYear: "2008",
    category: "Computer Science",
    subject: "Programming",
    language: "English",
    bookType: "Reference Book",
    description: "Software craftmanship guide for writing readable, maintainable code.",
    library: "Central Library",
    location: "Rack A",
    shelf: "Shelf 01",
    price: 850,
    totalCopies: 8,
    availableCopies: 5,
    issuedCopies: 3,
    damagedCopies: 0,
    lostCopies: 0,
    status: "In Stock",
  },
  {
    id: "b6",
    isbn: "978-0198817802",
    title: "Oxford Advanced Learner's Dictionary",
    subtitle: "International Reference Lexicon (C1/C2)",
    author: "A.S. Hornby",
    publisher: "Oxford University Press",
    edition: "10th Edition",
    publicationYear: "2020",
    category: "Reference",
    subject: "Languages",
    language: "English",
    bookType: "Reference Book",
    description: "Comprehensive English dictionary with phonetics and usage examples.",
    library: "Central Library",
    location: "Rack R",
    shelf: "Shelf 01",
    price: 1200,
    totalCopies: 10,
    availableCopies: 10,
    issuedCopies: 0,
    damagedCopies: 0,
    lostCopies: 0,
    status: "In Stock",
  },
  {
    id: "b7",
    isbn: "978-9937085412",
    title: "Hamro Samajik Adhyayan (Grade 9)",
    subtitle: "National Curriculum Textbook",
    author: "Dr. Govinda Sharma",
    publisher: "Janak Education Materials",
    edition: "Curriculum 2080",
    publicationYear: "2023",
    category: "Social Studies",
    subject: "Social Studies",
    language: "Nepali",
    bookType: "Textbook",
    description: "National secondary curriculum social studies textbook.",
    library: "Junior Wing Library",
    location: "Rack D",
    shelf: "Shelf 01",
    price: 180,
    totalCopies: 30,
    availableCopies: 24,
    issuedCopies: 6,
    damagedCopies: 0,
    lostCopies: 0,
    status: "In Stock",
  },
];

const SEED_COPIES: BookCopy[] = [
  { id: "c1", bookId: "b1", bookTitle: "Database Management Systems", copyNumber: 1, accessionNo: "LIB-00001", barcode: "LIB-00001", library: "Central Library", location: "Rack A", shelf: "Shelf 02", condition: "Good", status: "Available", price: 650, acquiredDate: "2025-04-10" },
  { id: "c2", bookId: "b1", bookTitle: "Database Management Systems", copyNumber: 2, accessionNo: "LIB-00002", barcode: "LIB-00002", library: "Central Library", location: "Rack A", shelf: "Shelf 02", condition: "Good", status: "Issued", price: 650, acquiredDate: "2025-04-10" },
  { id: "c3", bookId: "b1", bookTitle: "Database Management Systems", copyNumber: 3, accessionNo: "LIB-00003", barcode: "LIB-00003", library: "Central Library", location: "Rack A", shelf: "Shelf 02", condition: "Good", status: "Available", price: 650, acquiredDate: "2025-04-10" },
  { id: "c4", bookId: "b1", bookTitle: "Database Management Systems", copyNumber: 4, accessionNo: "LIB-00004", barcode: "LIB-00004", library: "Central Library", location: "Rack A", shelf: "Shelf 03", condition: "Damaged", status: "Damaged", price: 650, acquiredDate: "2025-04-10" },
  { id: "c5", bookId: "b1", bookTitle: "Database Management Systems", copyNumber: 5, accessionNo: "LIB-00005", barcode: "LIB-00005", library: "Central Library", location: "Rack A", shelf: "Shelf 03", condition: "New", status: "Available", price: 650, acquiredDate: "2025-04-10" },

  { id: "c6", bookId: "b2", bookTitle: "Physics for Scientists and Engineers", copyNumber: 1, accessionNo: "LIB-00006", barcode: "LIB-00006", library: "Central Library", location: "Rack B", shelf: "Shelf 01", condition: "New", status: "Available", price: 950, acquiredDate: "2025-06-15" },
  { id: "c7", bookId: "b2", bookTitle: "Physics for Scientists and Engineers", copyNumber: 2, accessionNo: "LIB-00007", barcode: "LIB-00007", library: "Central Library", location: "Rack B", shelf: "Shelf 01", condition: "Good", status: "Issued", price: 950, acquiredDate: "2025-06-15" },
  { id: "c8", bookId: "b2", bookTitle: "Physics for Scientists and Engineers", copyNumber: 3, accessionNo: "LIB-00008", barcode: "LIB-00008", library: "Central Library", location: "Rack B", shelf: "Shelf 01", condition: "Damaged", status: "Damaged", price: 950, acquiredDate: "2025-06-15" },

  { id: "c9", bookId: "b3", bookTitle: "High School English Grammar & Composition", copyNumber: 1, accessionNo: "LIB-00009", barcode: "LIB-00009", library: "Junior Wing Library", location: "Rack C", shelf: "Shelf 01", condition: "Good", status: "Available", price: 320, acquiredDate: "2025-08-01" },
  { id: "c10", bookId: "b3", bookTitle: "High School English Grammar & Composition", copyNumber: 2, accessionNo: "LIB-00010", barcode: "LIB-00010", library: "Junior Wing Library", location: "Rack C", shelf: "Shelf 01", condition: "Good", status: "Issued", price: 320, acquiredDate: "2025-08-01" },

  { id: "c11", bookId: "b4", bookTitle: "Accounting Basics & Financial Principles", copyNumber: 1, accessionNo: "LIB-00011", barcode: "LIB-00011", library: "Central Library", location: "Rack D", shelf: "Shelf 02", condition: "New", status: "Available", price: 480, acquiredDate: "2025-09-12" },
  { id: "c12", bookId: "b4", bookTitle: "Accounting Basics & Financial Principles", copyNumber: 2, accessionNo: "LIB-00012", barcode: "LIB-00012", library: "Central Library", location: "Rack D", shelf: "Shelf 02", condition: "Good", status: "Issued", price: 480, acquiredDate: "2025-09-12" },
];

const SEED_MEMBERS: Member[] = [
  { id: "m1", memberId: "STU-1024", name: "Amit Sharma", type: "College Student", tierCategory: "College", programOrGrade: "BCA Semester 3", rollOrEmpId: "BCA-2024-012", status: "Active", currentBorrowings: ["Database Management Systems"], maxAllowed: 5, outstandingFine: 50, email: "amit.sharma@schoolerp.io", phone: "+977 9841234567", joinedDate: "2024-08-15" },
  { id: "m2", memberId: "STU-1088", name: "Riya Sen", type: "School Student", tierCategory: "School", programOrGrade: "Grade 10 - Section A", rollOrEmpId: "101", status: "Active", currentBorrowings: ["Physics for Scientists and Engineers"], maxAllowed: 3, outstandingFine: 20, email: "riya.sen@schoolerp.io", phone: "+977 9841234568", joinedDate: "2024-04-10" },
  { id: "m3", memberId: "FAC-042", name: "Dr. Hemant Adhikari", type: "Faculty", tierCategory: "Faculty", programOrGrade: "Dept. of Computer Science", rollOrEmpId: "EMP-FAC-014", status: "Active", currentBorrowings: ["Clean Code: A Handbook of Agile Software Craftsmanship"], maxAllowed: 10, outstandingFine: 0, email: "h.adhikari@schoolerp.io", phone: "+977 9841234569", joinedDate: "2022-01-10" },
  { id: "m4", memberId: "STU-1095", name: "Kiran Poudel", type: "School Student", tierCategory: "School", programOrGrade: "Grade 9 - Section B", rollOrEmpId: "205", status: "Active", currentBorrowings: ["Hamro Samajik Adhyayan (Grade 9)"], maxAllowed: 3, outstandingFine: 0, email: "kiran.p@schoolerp.io", phone: "+977 9841234570", joinedDate: "2025-04-12" },
  { id: "m5", memberId: "STU-1011", name: "Suman Joshi", type: "College Student", tierCategory: "College", programOrGrade: "BBA Semester 5", rollOrEmpId: "BBA-2023-044", status: "Suspended", currentBorrowings: ["Accounting Basics & Financial Principles"], maxAllowed: 5, outstandingFine: 120, email: "suman.j@schoolerp.io", phone: "+977 9841234571", joinedDate: "2023-08-20" },
];

const SEED_ACTIVE_LOANS: ActiveLoan[] = [
  { id: "l1", barcode: "LIB-00002", bookTitle: "Database Management Systems", memberId: "STU-1024", memberName: "Amit Sharma", memberType: "BCA Sem 3", issueDate: "2026-09-18", dueDate: "2026-10-02", renewCount: 1, maxRenews: 2, overdueDays: 5, fineAmount: 25, status: "Overdue" },
  { id: "l2", barcode: "LIB-00007", bookTitle: "Physics for Scientists and Engineers", memberId: "STU-1088", memberName: "Riya Sen", memberType: "Grade 10-A", issueDate: "2026-09-20", dueDate: "2026-10-04", renewCount: 0, maxRenews: 1, overdueDays: 3, fineAmount: 15, status: "Overdue" },
  { id: "l3", barcode: "LIB-00010", bookTitle: "High School English Grammar & Composition", memberId: "STU-1095", memberName: "Kiran Poudel", memberType: "Grade 9-B", issueDate: "2026-09-28", dueDate: "2026-10-12", renewCount: 0, maxRenews: 1, overdueDays: 0, fineAmount: 0, status: "On Time" },
  { id: "l4", barcode: "LIB-00012", bookTitle: "Accounting Basics & Financial Principles", memberId: "STU-1011", memberName: "Suman Joshi", memberType: "BBA Sem 5", issueDate: "2026-09-25", dueDate: "2026-10-09", renewCount: 0, maxRenews: 2, overdueDays: 0, fineAmount: 0, status: "On Time" },
];

const SEED_ACQUISITIONS: AcquisitionItem[] = [
  { id: "ac1", poNumber: "PO-LIB-2026-01", bookTitle: "Artificial Intelligence: A Modern Approach (4th Ed)", author: "Stuart Russell & Peter Norvig", requestedBy: "Dr. Hemant Adhikari", requestRole: "Faculty (CS)", quantity: 5, estimatedPrice: 3500, supplier: "Heritage Book Distributors", status: "Approved", requestDate: "2026-10-01" },
  { id: "ac2", poNumber: "PO-LIB-2026-02", bookTitle: "Principles of Marketing (18th Ed)", author: "Philip Kotler", requestedBy: "Prof. Anjali KC", requestRole: "Faculty (Management)", quantity: 8, estimatedPrice: 4200, supplier: "Nepal Educational Book House", status: "Ordered", requestDate: "2026-10-03" },
  { id: "ac3", poNumber: "PO-LIB-2026-03", bookTitle: "Cambridge IGCSE Chemistry Coursebook", author: "Richard Harwood", requestedBy: "Riya Sen", requestRole: "Student (Grade 10)", quantity: 10, estimatedPrice: 2800, supplier: "Global Academic Books", status: "Requested", requestDate: "2026-10-06" },
];

const SEED_FINES: FineRecord[] = [
  { id: "f1", memberId: "STU-1024", memberName: "Amit Sharma", bookTitle: "Database Management Systems", overdueDays: 5, fineAmount: 25, paidAmount: 0, waivedAmount: 0, status: "Pending", date: "2026-10-02" },
  { id: "f2", memberId: "STU-1088", memberName: "Riya Sen", bookTitle: "Physics for Scientists and Engineers", overdueDays: 3, fineAmount: 15, paidAmount: 0, waivedAmount: 0, status: "Pending", date: "2026-10-04" },
  { id: "f3", memberId: "STU-1011", memberName: "Suman Joshi", bookTitle: "Clean Code", overdueDays: 13, fineAmount: 65, paidAmount: 0, waivedAmount: 0, status: "Pending", date: "2026-09-24" },
  { id: "f4", memberId: "STU-1095", memberName: "Kiran Poudel", bookTitle: "Hamro Samajik Adhyayan (Grade 9)", overdueDays: 2, fineAmount: 10, paidAmount: 10, waivedAmount: 0, status: "Paid", date: "2026-09-28" },
];

export default function LibraryPage() {
  const { toast } = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = React.useState<
    | "dashboard"
    | "books"
    | "circulation"
    | "members"
    | "acquisition"
    | "fines"
    | "reports"
  >("books");

  const [subTab, setSubTab] = React.useState<string>("entry");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Master Data State
  const [books, setBooks] = React.useState<Book[]>(SEED_BOOKS);
  const [copies, setCopies] = React.useState<BookCopy[]>(SEED_COPIES);
  const [members, setMembers] = React.useState<Member[]>(SEED_MEMBERS);
  const [loans, setLoans] = React.useState<ActiveLoan[]>(SEED_ACTIVE_LOANS);
  const [acquisitions, setAcquisitions] = React.useState<AcquisitionItem[]>(SEED_ACQUISITIONS);
  const [fines, setFines] = React.useState<FineRecord[]>(SEED_FINES);

  // Selected State for Drawers / Modals
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  // Book Entry Form State
  const [entryForm, setEntryForm] = React.useState({
    title: "",
    isbn: "",
    author: "",
    publisher: "",
    edition: "1st Edition",
    publicationYear: "2024",
    category: "Computer Science",
    subject: "",
    language: "English",
    bookType: "Textbook" as BookType,
    description: "",
    library: "Central Library",
    location: "Rack A",
    shelf: "Shelf 02",
    numberOfCopies: 10,
    price: 500,
  });

  // Generated Copies Preview for Book Entry
  const [generatedCopiesPreview, setGeneratedCopiesPreview] = React.useState<
    Array<{
      copyNumber: number;
      accessionNo: string;
      barcode: string;
      library: string;
      location: string;
      shelf: string;
      status: "Available";
      condition: "New" | "Good";
    }>
  >([]);

  // Member Registration State
  const [newMemberForm, setNewMemberForm] = React.useState({
    name: "",
    type: "School Student" as "School Student" | "College Student" | "Faculty" | "Staff",
    programOrGrade: "Grade 10 - Section A",
    rollOrEmpId: "",
    email: "",
    phone: "",
    maxAllowed: 3,
  });

  // Fast Circulation State
  const [issueMemberQuery, setIssueMemberQuery] = React.useState("");
  const [issueBarcodeQuery, setIssueBarcodeQuery] = React.useState("");
  const [issueMatchedMember, setIssueMatchedMember] = React.useState<Member | null>(null);
  const [issueMatchedCopy, setIssueMatchedCopy] = React.useState<BookCopy | null>(null);

  // Sync tab query params on load
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const subParam = params.get("sub");

      if (tabParam) {
        if (tabParam === "entry") {
          setActiveTab("books");
          setSubTab(subParam === "list" ? "list" : "entry");
        } else if (tabParam === "catalog") {
          setActiveTab("books");
          setSubTab(subParam || "categories");
        } else if (["dashboard", "books", "circulation", "members", "acquisition", "fines", "reports"].includes(tabParam)) {
          setActiveTab(tabParam as any);
          if (subParam) setSubTab(subParam);
        }
      } else if (subParam) {
        setSubTab(subParam);
      }
    }
  }, []);

  // 1. Generate Physical Copies in Book Entry Form
  const handleGenerateCopies = () => {
    if (!entryForm.title.trim() || !entryForm.author.trim()) {
      toast({ type: "error", title: "Missing Information", message: "Please enter Title and Author before generating copies." });
      return;
    }

    const count = Math.max(1, Number(entryForm.numberOfCopies) || 1);
    const startIdx = copies.length + 1;
    const generated = [];

    for (let i = 0; i < count; i++) {
      const formattedNum = String(startIdx + i).padStart(5, "0");
      const code = `LIB-${formattedNum}`;
      generated.push({
        copyNumber: i + 1,
        accessionNo: code,
        barcode: code,
        library: entryForm.library,
        location: entryForm.location,
        shelf: entryForm.shelf,
        status: "Available" as const,
        condition: "New" as const,
      });
    }

    setGeneratedCopiesPreview(generated);
    toast({
      type: "success",
      title: "Physical Copies Generated",
      message: `Generated ${count} sequential barcodes (${generated[0]?.barcode} to ${generated[generated.length - 1]?.barcode}).`,
    });
  };

  // 2. Save Book and Its Physical Copies
  const handleSaveBookAndCopies = (e: React.FormEvent) => {
    e.preventDefault();

    if (!entryForm.title.trim() || !entryForm.author.trim()) {
      toast({ type: "error", title: "Validation Error", message: "Title and Author are required." });
      return;
    }

    let previewList = generatedCopiesPreview;
    const count = Math.max(1, Number(entryForm.numberOfCopies) || 1);

    if (previewList.length === 0) {
      const startIdx = copies.length + 1;
      previewList = [];
      for (let i = 0; i < count; i++) {
        const formattedNum = String(startIdx + i).padStart(5, "0");
        const code = `LIB-${formattedNum}`;
        previewList.push({
          copyNumber: i + 1,
          accessionNo: code,
          barcode: code,
          library: entryForm.library,
          location: entryForm.location,
          shelf: entryForm.shelf,
          status: "Available",
          condition: "New",
        });
      }
    }

    const bookId = `b-${Date.now()}`;
    const newBook: Book = {
      id: bookId,
      isbn: entryForm.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      title: entryForm.title,
      author: entryForm.author,
      publisher: entryForm.publisher || "General Publisher",
      edition: entryForm.edition || "1st Edition",
      publicationYear: entryForm.publicationYear || "2024",
      category: entryForm.category || "General",
      subject: entryForm.subject || entryForm.category,
      language: entryForm.language || "English",
      bookType: entryForm.bookType || "Textbook",
      description: entryForm.description,
      library: entryForm.library,
      location: entryForm.location,
      shelf: entryForm.shelf,
      price: Number(entryForm.price) || 0,
      totalCopies: previewList.length,
      availableCopies: previewList.length,
      issuedCopies: 0,
      damagedCopies: 0,
      lostCopies: 0,
      status: "In Stock",
    };

    const newPhysicalCopies: BookCopy[] = previewList.map((p, idx) => ({
      id: `c-${Date.now()}-${idx + 1}`,
      bookId: bookId,
      bookTitle: newBook.title,
      copyNumber: p.copyNumber,
      accessionNo: p.accessionNo,
      barcode: p.barcode,
      library: p.library,
      location: p.location,
      shelf: p.shelf,
      condition: p.condition,
      status: p.status,
      price: Number(entryForm.price) || 0,
      acquiredDate: new Date().toISOString().split("T")[0],
    }));

    setBooks([newBook, ...books]);
    setCopies([...copies, ...newPhysicalCopies]);

    toast({
      type: "success",
      title: "Book Saved Successfully",
      message: `"${newBook.title}" registered with ${newPhysicalCopies.length} physical copies.`,
    });

    setEntryForm({
      title: "",
      isbn: "",
      author: "",
      publisher: "",
      edition: "1st Edition",
      publicationYear: "2024",
      category: "Computer Science",
      subject: "",
      language: "English",
      bookType: "Textbook",
      description: "",
      library: "Central Library",
      location: "Rack A",
      shelf: "Shelf 02",
      numberOfCopies: 10,
      price: 500,
    });
    setGeneratedCopiesPreview([]);
    setSubTab("list");
  };

  // Register New Member
  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim()) {
      toast({ type: "error", title: "Validation Error", message: "Member name is required." });
      return;
    }

    const memberId = `MEM-${Date.now().toString().slice(-4)}`;
    const newMember: Member = {
      id: `m-${Date.now()}`,
      memberId: memberId,
      name: newMemberForm.name,
      type: newMemberForm.type,
      tierCategory: newMemberForm.type === "Faculty" || newMemberForm.type === "Staff" ? "Faculty" : newMemberForm.type === "College Student" ? "College" : "School",
      programOrGrade: newMemberForm.programOrGrade,
      rollOrEmpId: newMemberForm.rollOrEmpId || memberId,
      status: "Active",
      currentBorrowings: [],
      maxAllowed: Number(newMemberForm.maxAllowed) || 3,
      outstandingFine: 0,
      email: newMemberForm.email || `${memberId.toLowerCase()}@schoolerp.io`,
      phone: newMemberForm.phone || "+977 9800000000",
      joinedDate: new Date().toISOString().split("T")[0],
    };

    setMembers([newMember, ...members]);
    toast({ type: "success", title: "Member Registered", message: `${newMember.name} (${newMember.memberId}) registered successfully.` });
    setNewMemberForm({ name: "", type: "School Student", programOrGrade: "Grade 10 - Section A", rollOrEmpId: "", email: "", phone: "", maxAllowed: 3 });
    setSubTab("list");
  };

  // Issue Book Logic
  const handlePerformIssue = () => {
    if (!issueMatchedMember || !issueMatchedCopy) return;

    const newLoan: ActiveLoan = {
      id: `l-${Date.now()}`,
      barcode: issueMatchedCopy.barcode,
      bookTitle: issueMatchedCopy.bookTitle,
      memberId: issueMatchedMember.memberId,
      memberName: issueMatchedMember.name,
      memberType: issueMatchedMember.programOrGrade,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      renewCount: 0,
      maxRenews: issueMatchedMember.tierCategory === "Faculty" ? 3 : 2,
      overdueDays: 0,
      fineAmount: 0,
      status: "On Time",
    };

    setLoans([newLoan, ...loans]);
    setCopies(copies.map((c) => (c.id === issueMatchedCopy.id ? { ...c, status: "Issued" as const } : c)));
    setMembers(members.map((m) => (m.id === issueMatchedMember.id ? { ...m, currentBorrowings: [...m.currentBorrowings, issueMatchedCopy.bookTitle] } : m)));

    toast({ type: "success", title: "Book Issued", message: `"${issueMatchedCopy.bookTitle}" issued to ${issueMatchedMember.name}.` });
    setIssueBarcodeQuery("");
    setIssueMatchedCopy(null);
  };

  // Return Book Logic
  const handlePerformReturn = (barcode: string) => {
    const loan = loans.find((l) => l.barcode === barcode);
    if (!loan) return;

    setLoans(loans.filter((l) => l.id !== loan.id));
    setCopies(copies.map((c) => (c.barcode === barcode ? { ...c, status: "Available" as const } : c)));
    setMembers(members.map((m) => (m.memberId === loan.memberId ? { ...m, currentBorrowings: m.currentBorrowings.filter((title) => title !== loan.bookTitle) } : m)));

    toast({ type: "success", title: "Book Returned", message: `"${loan.bookTitle}" returned.` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] select-none">
      {/* 1. Global Header */}
      <ErpHeader />

      {/* 2. Top Navigation */}
      <ErpTopNav activeModuleId="library" />

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Breadcrumbs & Top Shortcuts */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--neutral-500)] font-medium">
            <Link href={ROUTES.DASHBOARD} className="hover:text-[var(--brand-primary)] transition-colors">
              ERP
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <span className="font-bold text-[var(--brand-primary)]">Library</span>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
            <span className="capitalize font-semibold text-[var(--text-primary)]">{activeTab}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("books");
                setSubTab("entry");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>+ Book Entry</span>
            </button>
            <Link
              href="/library/setup"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-[var(--border-default)] hover:bg-[var(--neutral-50)] text-xs font-semibold text-[var(--text-secondary)] shadow-2xs transition-colors cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
              <span>Library Setup</span>
            </Link>
          </div>
        </div>

        {/* 7 Core Direct Section Tabs */}
        <div className="bg-white p-2 rounded-[6px] border border-[var(--border-default)] shadow-xs">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "books", label: "Books", icon: BookMarked },
              { id: "circulation", label: "Circulation", icon: RefreshCw },
              { id: "members", label: "Members", icon: Users },
              { id: "acquisition", label: "Acquisition", icon: ShoppingBag },
              { id: "fines", label: "Fines", icon: Coins },
              { id: "reports", label: "Reports", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "books") setSubTab("entry");
                    else if (tab.id === "circulation") setSubTab("issue");
                    else if (tab.id === "members") setSubTab("list");
                    else setSubTab("all");
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all duration-150 cursor-pointer border select-none",
                    isSelected
                      ? "bg-[var(--red-50)] text-[var(--brand-primary)] font-bold border-[var(--brand-primary)] shadow-2xs"
                      : "bg-white text-[var(--neutral-700)] border-transparent hover:border-[var(--border-default)] hover:bg-[var(--neutral-50)]"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-[var(--brand-primary)]" : "text-[var(--neutral-500)]")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. DASHBOARD                                                              */}
        {/* ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-2xs">
                <div className="text-[11px] text-[var(--neutral-500)] font-medium uppercase tracking-wider">Total Titles</div>
                <div className="text-xl font-bold text-[var(--text-primary)] mt-1">{books.length} Titles</div>
              </div>
              <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-2xs">
                <div className="text-[11px] text-[var(--neutral-500)] font-medium uppercase tracking-wider">Physical Copies</div>
                <div className="text-xl font-bold text-blue-600 mt-1">{copies.length} Copies</div>
              </div>
              <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-2xs">
                <div className="text-[11px] text-[var(--neutral-500)] font-medium uppercase tracking-wider">Available</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">{copies.filter(c => c.status === "Available").length}</div>
              </div>
              <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-2xs">
                <div className="text-[11px] text-[var(--neutral-500)] font-medium uppercase tracking-wider">Issued</div>
                <div className="text-xl font-bold text-amber-600 mt-1">{loans.length}</div>
              </div>
              <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-2xs">
                <div className="text-[11px] text-[var(--neutral-500)] font-medium uppercase tracking-wider">Members</div>
                <div className="text-xl font-bold text-purple-600 mt-1">{members.length}</div>
              </div>
              <div className="bg-white p-4 rounded-[6px] border border-[var(--border-default)] shadow-2xs">
                <div className="text-[11px] text-[var(--neutral-500)] font-medium uppercase tracking-wider">Pending Fine</div>
                <div className="text-xl font-bold text-[var(--brand-primary)] mt-1">Rs. {fines.filter(f => f.status === "Pending").reduce((acc, f) => acc + f.fineAmount, 0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. BOOKS SECTION (BOOK ENTRY, BOOKS, CATEGORIES, AUTHORS, PUBLISHERS, LOC)*/}
        {/* ========================================================================= */}
        {activeTab === "books" && (
          <div className="space-y-4">
            {/* Books Sub-Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[6px] border border-[var(--border-default)]">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "entry", label: "Book Entry", icon: PlusCircle },
                  { id: "list", label: "Books", icon: BookMarked },
                  { id: "categories", label: "Categories", icon: List },
                  { id: "authors", label: "Authors", icon: Users },
                  { id: "publishers", label: "Publishers", icon: Building },
                  { id: "locations", label: "Locations", icon: Grid },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = subTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubTab(item.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5",
                        isSelected ? "bg-[var(--brand-primary)] text-white shadow-2xs" : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3 py-1 text-xs font-semibold bg-white border border-[var(--border-default)] rounded hover:bg-neutral-50 cursor-pointer"
                >
                  Import Books
                </button>
              </div>
            </div>

            {/* SUB-VIEW 1: BOOK ENTRY (SINGLE UNIFIED WORKFLOW) */}
            {subTab === "entry" && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-6 space-y-6">
                <div className="border-b border-[var(--border-light)] pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-[var(--brand-primary)]" />
                    Book Entry
                  </h2>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                    Enter book information and generate physical copies in one operational workflow.
                  </p>
                </div>

                <form onSubmit={handleSaveBookAndCopies} className="space-y-6">
                  {/* Book Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] border-b pb-1 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Book Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={entryForm.title}
                          onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                          placeholder="e.g. Database Management Systems"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded focus:border-[var(--brand-primary)]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">ISBN</label>
                        <input
                          type="text"
                          value={entryForm.isbn}
                          onChange={(e) => setEntryForm({ ...entryForm, isbn: e.target.value })}
                          placeholder="e.g. 978-0072958348"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Author *</label>
                        <input
                          type="text"
                          required
                          value={entryForm.author}
                          onChange={(e) => setEntryForm({ ...entryForm, author: e.target.value })}
                          placeholder="e.g. Korth, Silberschatz"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded focus:border-[var(--brand-primary)]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Publisher</label>
                        <input
                          type="text"
                          value={entryForm.publisher}
                          onChange={(e) => setEntryForm({ ...entryForm, publisher: e.target.value })}
                          placeholder="e.g. McGraw Hill"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Edition</label>
                        <input
                          type="text"
                          value={entryForm.edition}
                          onChange={(e) => setEntryForm({ ...entryForm, edition: e.target.value })}
                          placeholder="e.g. 7th Edition"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Publication Year</label>
                        <input
                          type="text"
                          value={entryForm.publicationYear}
                          onChange={(e) => setEntryForm({ ...entryForm, publicationYear: e.target.value })}
                          placeholder="e.g. 2024"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Category *</label>
                        <select
                          value={entryForm.category}
                          onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                          className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Language">Language</option>
                          <option value="Literature">Literature</option>
                          <option value="Social Studies">Social Studies</option>
                          <option value="Reference">Reference</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Subject</label>
                        <input
                          type="text"
                          value={entryForm.subject}
                          onChange={(e) => setEntryForm({ ...entryForm, subject: e.target.value })}
                          placeholder="e.g. Database Systems"
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Language</label>
                        <select
                          value={entryForm.language}
                          onChange={(e) => setEntryForm({ ...entryForm, language: e.target.value })}
                          className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        >
                          <option value="English">English</option>
                          <option value="Nepali">Nepali</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Sanskrit">Sanskrit</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Book Type</label>
                        <select
                          value={entryForm.bookType}
                          onChange={(e) => setEntryForm({ ...entryForm, bookType: e.target.value as any })}
                          className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded font-semibold text-blue-700"
                        >
                          <option value="Textbook">Textbook</option>
                          <option value="Reference Book">Reference Book</option>
                          <option value="Journal">Journal</option>
                          <option value="Magazine">Magazine</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Price (Rs.)</label>
                        <input
                          type="number"
                          value={entryForm.price}
                          onChange={(e) => setEntryForm({ ...entryForm, price: Number(e.target.value) })}
                          className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Information */}
                  <div className="space-y-4 pt-2 border-t border-[var(--border-light)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] border-b pb-1 flex items-center gap-1.5">
                      <Grid className="h-3.5 w-3.5" />
                      Physical Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Library *</label>
                        <select
                          value={entryForm.library}
                          onChange={(e) => setEntryForm({ ...entryForm, library: e.target.value })}
                          className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        >
                          <option value="Central Library">Central Library</option>
                          <option value="Junior Wing Library">Junior Wing Library</option>
                          <option value="Departmental Library (CS)">Departmental Library (CS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Location (Rack) *</label>
                        <select
                          value={entryForm.location}
                          onChange={(e) => setEntryForm({ ...entryForm, location: e.target.value })}
                          className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        >
                          <option value="Rack A">Rack A</option>
                          <option value="Rack B">Rack B</option>
                          <option value="Rack C">Rack C</option>
                          <option value="Rack D">Rack D</option>
                          <option value="Rack R">Rack R</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Shelf *</label>
                        <select
                          value={entryForm.shelf}
                          onChange={(e) => setEntryForm({ ...entryForm, shelf: e.target.value })}
                          className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                        >
                          <option value="Shelf 01">Shelf 01</option>
                          <option value="Shelf 02">Shelf 02</option>
                          <option value="Shelf 03">Shelf 03</option>
                          <option value="Shelf 04">Shelf 04</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Number of Copies *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={entryForm.numberOfCopies}
                            onChange={(e) => setEntryForm({ ...entryForm, numberOfCopies: Number(e.target.value) })}
                            className="w-full h-8 px-3 text-xs bg-white border border-[var(--border-default)] rounded font-mono font-bold text-emerald-700"
                          />
                          <button
                            type="button"
                            onClick={handleGenerateCopies}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded shrink-0 cursor-pointer"
                          >
                            Generate Copies
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Physical Copies Live Preview */}
                  {generatedCopiesPreview.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-[var(--border-light)]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                          <Barcode className="h-4 w-4 text-emerald-600" />
                          Physical Copies
                        </h3>
                        <span className="text-[11px] text-emerald-700 font-bold">{generatedCopiesPreview.length} Barcodes Ready</span>
                      </div>

                      <div className="border border-[var(--border-default)] rounded-[6px] overflow-hidden max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                              <th className="py-2 px-4">Copy</th>
                              <th className="py-2 px-4">Accession No.</th>
                              <th className="py-2 px-4">Barcode</th>
                              <th className="py-2 px-4">Location</th>
                              <th className="py-2 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-default)]">
                            {generatedCopiesPreview.map((p) => (
                              <tr key={p.copyNumber}>
                                <td className="py-2 px-4 font-bold font-mono">Copy #{p.copyNumber}</td>
                                <td className="py-2 px-4 font-mono text-[var(--brand-primary)] font-bold">{p.accessionNo}</td>
                                <td className="py-2 px-4 font-mono font-bold">{p.barcode}</td>
                                <td className="py-2 px-4 text-[var(--neutral-600)]">{p.library} → {p.location} ({p.shelf})</td>
                                <td className="py-2 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{p.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Submit Bar */}
                  <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEntryForm({
                          title: "",
                          isbn: "",
                          author: "",
                          publisher: "",
                          edition: "1st Edition",
                          publicationYear: "2024",
                          category: "Computer Science",
                          subject: "",
                          language: "English",
                          bookType: "Textbook",
                          description: "",
                          library: "Central Library",
                          location: "Rack A",
                          shelf: "Shelf 02",
                          numberOfCopies: 10,
                          price: 500,
                        });
                        setGeneratedCopiesPreview([]);
                      }}
                      className="px-4 py-2 bg-white border border-[var(--border-default)] text-xs font-semibold rounded hover:bg-neutral-50 cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
                    >
                      Save Book
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-VIEW 2: BOOKS LIST */}
            {subTab === "list" && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-light)]">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, author, ISBN..."
                      className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--neutral-600)]">{books.length} Books</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4">Author</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4 text-center">Copies</th>
                        <th className="py-2.5 px-4">Location</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]">
                      {books
                        .filter(
                          (b) =>
                            !searchQuery ||
                            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.isbn.includes(searchQuery)
                        )
                        .map((b) => (
                          <tr key={b.id} className="hover:bg-[var(--neutral-50)]">
                            <td className="py-3 px-4 font-bold text-[var(--brand-primary)]">
                              <button type="button" onClick={() => setSelectedBook(b)} className="hover:underline text-left cursor-pointer">
                                {b.title}
                              </button>
                              <div className="text-[10px] text-[var(--neutral-400)] font-normal">{b.subtitle || `ISBN: ${b.isbn}`}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{b.author}</td>
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">{b.category}</span></td>
                            <td className="py-3 px-4 text-center font-bold font-mono">
                              <span>{b.totalCopies}</span>
                              <span className="text-[10px] text-emerald-600 block">{b.availableCopies} avail</span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[var(--neutral-700)]">{b.location} ({b.shelf})</td>
                            <td className="py-3 px-4">
                              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", b.status === "In Stock" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedBook(b)}
                                className="px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)] hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: CATEGORIES */}
            {subTab === "categories" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-[6px] border border-[var(--border-default)]">
                {Array.from(new Set(books.map((b) => b.category))).map((cat) => {
                  const catBooks = books.filter((b) => b.category === cat);
                  return (
                    <div key={cat} className="p-4 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-1">
                      <div className="font-bold text-xs text-[var(--text-primary)] flex items-center justify-between">
                        <span>{cat}</span>
                        <Tag className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                      </div>
                      <div className="text-[11px] text-[var(--neutral-500)]">{catBooks.length} Titles</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUB-VIEW 4: AUTHORS */}
            {subTab === "authors" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-[6px] border border-[var(--border-default)]">
                {Array.from(new Set(books.map((b) => b.author))).map((author) => {
                  const authorBooks = books.filter((b) => b.author === author);
                  return (
                    <div key={author} className="p-4 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-1">
                      <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                        <span>{author}</span>
                      </div>
                      <div className="text-[11px] text-[var(--neutral-500)]">{authorBooks.length} Published Title(s)</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUB-VIEW 5: PUBLISHERS */}
            {subTab === "publishers" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-[6px] border border-[var(--border-default)]">
                {Array.from(new Set(books.map((b) => b.publisher))).map((pub) => {
                  const pubBooks = books.filter((b) => b.publisher === pub);
                  return (
                    <div key={pub} className="p-4 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-1">
                      <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-purple-600" />
                        <span>{pub}</span>
                      </div>
                      <div className="text-[11px] text-[var(--neutral-500)]">{pubBooks.length} Cataloged Title(s)</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUB-VIEW 6: LOCATIONS */}
            {subTab === "locations" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-[6px] border border-[var(--border-default)]">
                {Array.from(new Set(copies.map((c) => c.location))).map((loc) => {
                  const locCopies = copies.filter((c) => c.location === loc);
                  return (
                    <div key={loc} className="p-4 bg-[var(--bg-secondary)] rounded-[6px] border border-[var(--border-default)] space-y-1">
                      <div className="font-bold font-mono text-xs text-[var(--brand-primary)] flex items-center justify-between">
                        <span>{loc}</span>
                        <Grid className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
                      </div>
                      <div className="text-[11px] text-[var(--neutral-600)]">{locCopies.length} Physical Copies</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CIRCULATION SECTION (ISSUE, RETURN, RENEW, RESERVATIONS, OVERDUE)       */}
        {/* ========================================================================= */}
        {activeTab === "circulation" && (
          <div className="space-y-4">
            {/* Circulation Sub-Navigation */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-[6px] border border-[var(--border-default)]">
              {[
                { id: "issue", label: "Issue Book", icon: Upload },
                { id: "return", label: "Return Book", icon: RefreshCw },
                { id: "renew", label: "Renew Book", icon: RotateCcw },
                { id: "reservations", label: "Reservations", icon: Clock },
                { id: "overdue", label: "Overdue", icon: AlertCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = subTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubTab(item.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5",
                      isSelected ? "bg-[var(--brand-primary)] text-white shadow-2xs" : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Fast Issue / Return Counter */}
            {(subTab === "issue" || subTab === "return" || subTab === "renew") && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Fast Circulation Desk ({subTab === "issue" ? "Issue Book" : subTab === "return" ? "Return Book" : "Renew Book"})
                  </h3>
                  <span className="text-[11px] text-[var(--neutral-400)]">Active Live Counter</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Member */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">1. Select Member</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                      <input
                        type="text"
                        value={issueMemberQuery}
                        onChange={(e) => {
                          setIssueMemberQuery(e.target.value);
                          const match = members.find((m) => m.name.toLowerCase().includes(e.target.value.toLowerCase()) || m.memberId.toLowerCase().includes(e.target.value.toLowerCase()));
                          setIssueMatchedMember(match || null);
                        }}
                        placeholder="Search student ID, name, or roll no..."
                        className="w-full h-9 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded focus:border-[var(--brand-primary)]"
                      />
                    </div>
                    {issueMatchedMember && (
                      <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-[var(--text-primary)]">
                          <span>{issueMatchedMember.name}</span>
                          <span className="font-mono text-purple-700">{issueMatchedMember.memberId}</span>
                        </div>
                        <div className="text-[11px] text-[var(--neutral-600)]">Program: {issueMatchedMember.programOrGrade} | Current: <b>{issueMatchedMember.currentBorrowings.length} / {issueMatchedMember.maxAllowed}</b></div>
                      </div>
                    )}
                  </div>

                  {/* Scan Book Barcode */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">2. Scan / Enter Book Barcode</label>
                    <div className="relative">
                      <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--neutral-400)]" />
                      <input
                        type="text"
                        value={issueBarcodeQuery}
                        onChange={(e) => {
                          setIssueBarcodeQuery(e.target.value);
                          const match = copies.find((c) => c.barcode.toLowerCase() === e.target.value.toLowerCase());
                          setIssueMatchedCopy(match || null);
                        }}
                        placeholder="Scan barcode (e.g. LIB-00001, LIB-00002)..."
                        className="w-full h-9 pl-8 pr-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded font-mono"
                      />
                    </div>
                    {issueMatchedCopy && (
                      <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs space-y-1">
                        <div className="font-bold text-[var(--text-primary)]">{issueMatchedCopy.bookTitle}</div>
                        <div className="text-[11px] text-[var(--neutral-600)]">Barcode: <span className="font-mono font-bold">{issueMatchedCopy.barcode}</span> | Status: <b className="text-emerald-600">{issueMatchedCopy.status}</b></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePerformIssue}
                    className="px-6 py-2 bg-[var(--brand-primary)] text-white text-xs font-bold rounded hover:bg-red-700 cursor-pointer shadow-xs"
                  >
                    Process Circulation
                  </button>
                </div>
              </div>
            )}

            {/* Loans Table */}
            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {subTab === "overdue" ? "Overdue Issued Books" : "Currently Issued Books"}
                </h3>
                <span className="text-xs font-mono font-bold text-[var(--neutral-500)]">{loans.length} Active Loans</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border-default)]">
                      <th className="py-2.5 px-4">Barcode</th>
                      <th className="py-2.5 px-4">Book Title</th>
                      <th className="py-2.5 px-4">Member Name</th>
                      <th className="py-2.5 px-4">Issue Date</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {loans
                      .filter((l) => (subTab === "overdue" ? l.status === "Overdue" : true))
                      .map((l) => (
                        <tr key={l.id} className="hover:bg-[var(--neutral-50)]">
                          <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{l.barcode}</td>
                          <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{l.bookTitle}</td>
                          <td className="py-3 px-4">{l.memberName}</td>
                          <td className="py-3 px-4 font-mono">{l.issueDate}</td>
                          <td className="py-3 px-4 font-mono font-bold text-rose-600">{l.dueDate}</td>
                          <td className="py-3 px-4">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", l.status === "Overdue" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700")}>
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handlePerformReturn(l.barcode)}
                              className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                            >
                              Return Book
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. MEMBERS SECTION (REGISTER MEMBER, MEMBERS, MEMBERSHIP HISTORY)         */}
        {/* ========================================================================= */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white p-3 rounded-[6px] border border-[var(--border-default)]">
              {[
                { id: "register", label: "Register Member", icon: UserPlus },
                { id: "list", label: "Members", icon: Users },
                { id: "history", label: "Membership History", icon: History },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = subTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubTab(item.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5",
                      isSelected ? "bg-[var(--brand-primary)] text-white shadow-2xs" : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Register Member Form */}
            {subTab === "register" && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b pb-2">
                  Register New Library Member
                </h3>
                <form onSubmit={handleRegisterMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newMemberForm.name}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                      placeholder="e.g. Amit Sharma"
                      className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Member Type</label>
                    <select
                      value={newMemberForm.type}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, type: e.target.value as any })}
                      className="w-full h-8 px-2.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                    >
                      <option value="School Student">School Student</option>
                      <option value="College Student">College Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-primary)] block mb-1">Program / Grade</label>
                    <input
                      type="text"
                      value={newMemberForm.programOrGrade}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, programOrGrade: e.target.value })}
                      placeholder="e.g. BCA Sem 3 or Grade 10"
                      className="w-full h-8 px-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-[var(--brand-primary)] text-white text-xs font-bold rounded hover:bg-red-700 cursor-pointer shadow-xs">
                      Register Member
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Members Directory */}
            {subTab === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {members.map((m) => (
                  <div key={m.id} className="p-4 rounded-[6px] border border-[var(--border-default)] bg-white space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{m.name}</h4>
                        <p className="text-[11px] font-mono text-[var(--brand-primary)] font-semibold">{m.memberId}</p>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700">
                        {m.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-[var(--neutral-600)]">
                      <div>Type: <b>{m.type}</b> ({m.programOrGrade})</div>
                      <div>Borrowings: <b>{m.currentBorrowings.length} / {m.maxAllowed}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Membership History */}
            {subTab === "history" && (
              <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                  Membership Activity History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b">
                        <th className="py-2.5 px-4">Member ID</th>
                        <th className="py-2.5 px-4">Member Name</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Join Date</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {members.map((m) => (
                        <tr key={m.id}>
                          <td className="py-2.5 px-4 font-mono font-bold text-[var(--brand-primary)]">{m.memberId}</td>
                          <td className="py-2.5 px-4 font-semibold">{m.name}</td>
                          <td className="py-2.5 px-4">{m.type}</td>
                          <td className="py-2.5 px-4 font-mono">{m.joinedDate}</td>
                          <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">{m.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. ACQUISITION SECTION (BOOK REQUESTS, PURCHASES, SUPPLIERS)               */}
        {/* ========================================================================= */}
        {activeTab === "acquisition" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white p-3 rounded-[6px] border border-[var(--border-default)]">
              {[
                { id: "requests", label: "Book Requests", icon: ShoppingBag },
                { id: "purchases", label: "Purchases", icon: Receipt },
                { id: "suppliers", label: "Suppliers", icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = subTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubTab(item.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5",
                      isSelected ? "bg-[var(--brand-primary)] text-white shadow-2xs" : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                {subTab === "purchases" ? "Purchase Orders Registry" : subTab === "suppliers" ? "Approved Library Suppliers" : "Book Acquisition Requests"}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b">
                      <th className="py-2.5 px-4">PO #</th>
                      <th className="py-2.5 px-4">Book Title</th>
                      <th className="py-2.5 px-4">Requested By</th>
                      <th className="py-2.5 px-4">Supplier</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {acquisitions.map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">{a.poNumber}</td>
                        <td className="py-3 px-4 font-semibold">{a.bookTitle}</td>
                        <td className="py-3 px-4">{a.requestedBy}</td>
                        <td className="py-3 px-4 text-[var(--neutral-600)]">{a.supplier}</td>
                        <td className="py-3 px-4 text-center font-bold font-mono">{a.quantity}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. FINES SECTION (PENDING FINES, PAYMENTS, WAIVERS)                        */}
        {/* ========================================================================= */}
        {activeTab === "fines" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white p-3 rounded-[6px] border border-[var(--border-default)]">
              {[
                { id: "pending", label: "Pending Fines", icon: AlertTriangle },
                { id: "payments", label: "Payments", icon: DollarSign },
                { id: "waivers", label: "Waivers", icon: Percent },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = subTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubTab(item.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5",
                      isSelected ? "bg-[var(--brand-primary)] text-white shadow-2xs" : "text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-[6px] border border-[var(--border-default)] shadow-xs p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                {subTab === "payments" ? "Fine Payments Log" : subTab === "waivers" ? "Fine Waivers Ledger" : "Pending Overdue Fines"}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold tracking-wider border-b">
                      <th className="py-2.5 px-4">Member</th>
                      <th className="py-2.5 px-4">Book Title</th>
                      <th className="py-2.5 px-4">Overdue Days</th>
                      <th className="py-2.5 px-4">Fine Amount</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fines.map((f) => (
                      <tr key={f.id}>
                        <td className="py-3 px-4 font-semibold">{f.memberName}</td>
                        <td className="py-3 px-4">{f.bookTitle}</td>
                        <td className="py-3 px-4 font-mono text-rose-600 font-bold">{f.overdueDays} Days</td>
                        <td className="py-3 px-4 font-mono font-bold text-[var(--brand-primary)]">Rs. {f.fineAmount}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">{f.status}</span></td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toast({ type: "success", title: "Payment Recorded", message: "Fine collected." })}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                          >
                            Collect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. REPORTS SECTION                                                        */}
        {/* ========================================================================= */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-[6px] border border-[var(--border-default)] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Library Reports Hub
              </h3>
              <p className="text-xs text-[var(--neutral-500)]">Export circulation, book inventory, members, and fines data.</p>
              <button
                type="button"
                onClick={() => {
                  exportToCsv(
                    books.map((b) => ({
                      Title: b.title,
                      Author: b.author,
                      ISBN: b.isbn,
                      Category: b.category,
                      Location: b.location,
                      "Total Copies": b.totalCopies,
                      "Available Copies": b.availableCopies,
                    })),
                    "Library-Catalog-Report.csv"
                  );
                  toast({ type: "success", title: "Export Complete", message: "Catalog report CSV downloaded." });
                }}
                className="px-4 py-1.5 bg-[var(--brand-primary)] text-white text-xs font-semibold rounded hover:bg-red-700 cursor-pointer"
              >
                Export Catalog CSV
              </button>
            </div>
          </div>
        )}

        {/* Book Details Modal */}
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
            <div className="w-full max-w-2xl bg-white rounded-[6px] border border-[var(--border-default)] shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-[var(--border-default)] flex items-start justify-between bg-[var(--neutral-50)]">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-tight">{selectedBook.title}</h2>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{selectedBook.subtitle || "Catalog Master & Physical Copies"}</p>
                </div>
                <button type="button" onClick={() => setSelectedBook(null)} className="p-1 text-[var(--neutral-400)] hover:text-black cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="p-4 bg-[var(--bg-secondary)] rounded border grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><span className="text-[10px] text-[var(--neutral-400)] block uppercase font-bold">Author</span><span className="font-semibold">{selectedBook.author}</span></div>
                  <div><span className="text-[10px] text-[var(--neutral-400)] block uppercase font-bold">ISBN</span><span className="font-mono">{selectedBook.isbn}</span></div>
                  <div><span className="text-[10px] text-[var(--neutral-400)] block uppercase font-bold">Category</span><span className="font-semibold text-blue-700">{selectedBook.category}</span></div>
                  <div><span className="text-[10px] text-[var(--neutral-400)] block uppercase font-bold">Location</span><span className="font-mono font-bold text-[var(--brand-primary)]">{selectedBook.location} ({selectedBook.shelf})</span></div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Physical Copies</h4>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[var(--neutral-50)] text-[var(--text-secondary)] uppercase text-[10px] font-bold border-b">
                          <th className="py-2 px-3">Barcode</th>
                          <th className="py-2 px-3">Location</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {copies
                          .filter((c) => c.bookId === selectedBook.id)
                          .map((c) => (
                            <tr key={c.id}>
                              <td className="py-2 px-3 font-mono font-bold text-[var(--brand-primary)]">{c.barcode}</td>
                              <td className="py-2 px-3 text-[var(--neutral-600)]">{c.library} → {c.location}</td>
                              <td className="py-2 px-3"><span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">{c.status}</span></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] border-t flex justify-end">
                <button type="button" onClick={() => setSelectedBook(null)} className="px-4 py-1.5 bg-white border rounded text-xs font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-[6px] border shadow-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Import Books (CSV)</h3>
                <button type="button" onClick={() => setIsImportModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <div className="border-2 border-dashed rounded p-6 text-center text-xs text-neutral-500 bg-neutral-50">
                <Upload className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                Drop CSV file here or click to browse
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-3 py-1.5 bg-white border text-xs font-semibold rounded">Cancel</button>
                <button type="button" onClick={() => { setIsImportModalOpen(false); toast({ type: "success", title: "Imported", message: "Books imported." }); }} className="px-4 py-1.5 bg-[var(--brand-primary)] text-white text-xs font-semibold rounded">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
