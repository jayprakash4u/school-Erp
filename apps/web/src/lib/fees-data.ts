import { StudentAccount, PaymentReceipt, FeeCharge, PaymentMethod, SettledFeeItem } from "@/types/fees";

export const INITIAL_STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    id: "stu-acc-1",
    studentId: "STU-10245",
    admissionNo: "ADM-2083-042",
    fullName: "Aarav Sharma",
    classGrade: "Grade 8",
    section: "Section A",
    rollNo: "12",
    guardianName: "Ramesh Sharma",
    guardianPhone: "9841234567",
    charges: [
      {
        id: "chg-1",
        title: "Tuition Fee",
        category: "Tuition",
        description: "Grade 8 Annual Tuition Fee",
        totalAmount: 40000,
        paidAmount: 20000,
        remainingAmount: 20000,
        dueDate: "2026-10-15",
        isMandatory: true,
      },
      {
        id: "chg-2",
        title: "Examination Fee",
        category: "Examination",
        description: "Terminal & Mid-Term Exam Charges",
        totalAmount: 10000,
        paidAmount: 0,
        remainingAmount: 10000,
        dueDate: "2026-10-20",
        isMandatory: true,
      },
      {
        id: "chg-3",
        title: "Miscellaneous Fee",
        category: "Miscellaneous",
        description: "ID Card Replacement & Annual Event Kit",
        totalAmount: 5000,
        paidAmount: 0,
        remainingAmount: 5000,
        dueDate: "2026-10-10",
        isMandatory: false,
      },
      {
        id: "chg-4",
        title: "Transport Fee",
        category: "Transport",
        description: "Bus Service (Route A - Two Way)",
        totalAmount: 5000,
        paidAmount: 5000,
        remainingAmount: 0,
        dueDate: "2026-08-10",
        isMandatory: true,
      },
    ],
  },
  {
    id: "stu-acc-2",
    studentId: "STU-10246",
    admissionNo: "ADM-2083-059",
    fullName: "Sita Rai",
    classGrade: "Grade 10",
    section: "Section B",
    rollNo: "07",
    guardianName: "Dipak Rai",
    guardianPhone: "9851029384",
    charges: [
      {
        id: "chg-201",
        title: "Tuition Fee",
        category: "Tuition",
        description: "Grade 10 Term 2 Tuition",
        totalAmount: 25000,
        paidAmount: 10000,
        remainingAmount: 15000,
        dueDate: "2026-10-15",
        isMandatory: true,
      },
      {
        id: "chg-202",
        title: "SEE Board Registration Fee",
        category: "Examination",
        description: "National Board Exam Registration",
        totalAmount: 3500,
        paidAmount: 0,
        remainingAmount: 3500,
        dueDate: "2026-10-30",
        isMandatory: true,
      },
      {
        id: "chg-203",
        title: "Science Lab Damage Penalty",
        category: "Fine",
        description: "Chemistry glassware replacement",
        totalAmount: 800,
        paidAmount: 0,
        remainingAmount: 800,
        dueDate: "2026-10-12",
        isMandatory: false,
      },
    ],
  },
  {
    id: "stu-acc-3",
    studentId: "STU-10247",
    admissionNo: "ADM-2083-112",
    fullName: "Bikash Adhikari",
    classGrade: "Grade 9",
    section: "Section A",
    rollNo: "18",
    guardianName: "Hari Adhikari",
    guardianPhone: "9841998877",
    charges: [
      {
        id: "chg-301",
        title: "Tuition Fee (Quarter 2)",
        category: "Tuition",
        description: "Grade 9 Tuition Fee",
        totalAmount: 18000,
        paidAmount: 0,
        remainingAmount: 18000,
        dueDate: "2026-10-10",
        isMandatory: true,
      },
      {
        id: "chg-302",
        title: "Computer Lab & STEM Kit",
        category: "Miscellaneous",
        description: "Practical project components",
        totalAmount: 2500,
        paidAmount: 0,
        remainingAmount: 2500,
        dueDate: "2026-10-25",
        isMandatory: false,
      },
    ],
  },
  {
    id: "stu-acc-4",
    studentId: "STU-10248",
    admissionNo: "ADM-2083-088",
    fullName: "Pooja Thapa",
    classGrade: "Grade 10",
    section: "Section B",
    rollNo: "21",
    guardianName: "Kamal Thapa",
    guardianPhone: "9841887766",
    charges: [
      {
        id: "chg-401",
        title: "Tuition Fee (Ashwin)",
        category: "Tuition",
        description: "Monthly Tuition Fee",
        totalAmount: 4500,
        paidAmount: 0,
        remainingAmount: 4500,
        dueDate: "2026-10-10",
        isMandatory: true,
      },
      {
        id: "chg-402",
        title: "Hostel Food & Lodging",
        category: "Hostel",
        description: "Ashwin Month Boarding Fee",
        totalAmount: 9000,
        paidAmount: 4500,
        remainingAmount: 4500,
        dueDate: "2026-10-10",
        isMandatory: true,
      },
    ],
  },
  {
    id: "stu-acc-5",
    studentId: "STU-10250",
    admissionNo: "ADM-2083-105",
    fullName: "Ram Kumar",
    classGrade: "Grade-10",
    section: "A",
    rollNo: "08",
    guardianName: "Shyam Kumar",
    guardianPhone: "9841556677",
    charges: [
      {
        id: "chg-501",
        title: "Tuition Fee (Quarter 2)",
        category: "Tuition",
        description: "Grade 10 Tuition Fee",
        totalAmount: 32000,
        paidAmount: 12000,
        remainingAmount: 20000,
        dueDate: "2026-10-15",
        isMandatory: true,
      },
      {
        id: "chg-502",
        title: "Board Exam Registration Fee",
        category: "Examination",
        description: "Grade 10 National Board Exam Fee",
        totalAmount: 5000,
        paidAmount: 0,
        remainingAmount: 5000,
        dueDate: "2026-10-25",
        isMandatory: true,
      },
    ],
  },
];

export const INITIAL_TODAY_COLLECTIONS: PaymentReceipt[] = [
  {
    id: "rec-001",
    receiptNo: "REC-001",
    studentId: "STU-10245",
    studentName: "Aarav Sharma",
    admissionNo: "ADM-2083-042",
    classGrade: "Grade 8",
    section: "Section A",
    date: "2026-09-20",
    time: "09:45 AM",
    totalAmount: 20000,
    paymentMethod: "Cash",
    cashierName: "Admin Cashier",
    remarks: "Tuition installment payment at counter",
    settledItems: [
      {
        chargeId: "chg-1",
        chargeTitle: "Tuition Fee",
        category: "Tuition",
        amountPaid: 20000,
        previousDue: 40000,
        newRemaining: 20000,
      },
    ],
  },
  {
    id: "rec-000",
    receiptNo: "REC-000",
    studentId: "STU-10245",
    studentName: "Aarav Sharma",
    admissionNo: "ADM-2083-042",
    classGrade: "Grade 8",
    section: "Section A",
    date: "2026-08-10",
    time: "11:20 AM",
    totalAmount: 5000,
    paymentMethod: "Cash",
    cashierName: "Admin Cashier",
    remarks: "Transport fee payment",
    settledItems: [
      {
        chargeId: "chg-4",
        chargeTitle: "Transport Fee",
        category: "Transport",
        amountPaid: 5000,
        previousDue: 5000,
        newRemaining: 0,
      },
    ],
  },
  {
    id: "rec-002",
    receiptNo: "REC-002",
    studentId: "STU-10246",
    studentName: "Sita Rai",
    admissionNo: "ADM-2083-059",
    classGrade: "Grade 10",
    section: "Section B",
    date: "2026-10-04",
    time: "10:15 AM",
    totalAmount: 10000,
    paymentMethod: "Online",
    transactionRef: "ESW-849204",
    cashierName: "Online Portal Sync",
    remarks: "eSewa Direct Payment",
    settledItems: [
      {
        chargeId: "chg-201",
        chargeTitle: "Tuition Fee",
        category: "Tuition",
        amountPaid: 10000,
        previousDue: 25000,
        newRemaining: 15000,
      },
    ],
  },
];

const LOCAL_STORAGE_KEY_STUDENTS = "erp_fee_student_accounts_v3";
const LOCAL_STORAGE_KEY_RECEIPTS = "erp_fee_today_receipts_v3";

export function getStoredStudentAccounts(): StudentAccount[] {
  if (typeof window === "undefined") return INITIAL_STUDENT_ACCOUNTS;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
  if (saved) {
    try {
      const parsed: StudentAccount[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((p) => p.studentId));
      const missing = INITIAL_STUDENT_ACCOUNTS.filter((init) => !existingIds.has(init.studentId));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse stored fee accounts", e);
    }
  }
  return INITIAL_STUDENT_ACCOUNTS;
}

export function saveStoredStudentAccounts(accounts: StudentAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(accounts));
}

export function getStoredReceipts(): PaymentReceipt[] {
  if (typeof window === "undefined") return INITIAL_TODAY_COLLECTIONS;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RECEIPTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse stored receipts", e);
    }
  }
  return INITIAL_TODAY_COLLECTIONS;
}

export function saveStoredReceipts(receipts: PaymentReceipt[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_RECEIPTS, JSON.stringify(receipts));
}

export function calculateStudentTotals(account: StudentAccount) {
  let totalFees = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  account.charges.forEach((c) => {
    totalFees += c.totalAmount;
    totalPaid += c.paidAmount;
    totalOutstanding += c.remainingAmount;
  });

  return { totalFees, totalPaid, totalOutstanding };
}

/**
 * Record a payment made externally (e.g. Bank Transfer / Deposit Slip / Cheque)
 * Automatically settles the student's charges and adds an entry to Payment History.
 */
export function recordExternalBankPayment({
  studentId,
  amount,
  date,
  method,
  referenceNo,
  proofFileName,
  remarks,
  cashierName = "Accountant",
}: {
  studentId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  referenceNo?: string;
  proofFileName?: string;
  remarks?: string;
  cashierName?: string;
}): { updatedAccounts: StudentAccount[]; newReceipt: PaymentReceipt } | null {
  const accounts = getStoredStudentAccounts();
  const student = accounts.find((a) => a.studentId === studentId);
  if (!student) return null;

  let unallocated = amount;
  const settledItems: SettledFeeItem[] = [];

  const updatedCharges = student.charges.map((c) => {
    if (unallocated <= 0 || c.remainingAmount <= 0) return c;

    const payForThis = Math.min(unallocated, c.remainingAmount);
    const previousDue = c.remainingAmount;
    const newRemaining = previousDue - payForThis;
    const newPaid = c.paidAmount + payForThis;
    unallocated -= payForThis;

    settledItems.push({
      chargeId: c.id,
      chargeTitle: c.title,
      description: c.description,
      category: c.category,
      amountPaid: payForThis,
      previousDue,
      newRemaining,
    });

    return {
      ...c,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
    };
  });

  const updatedStudent: StudentAccount = {
    ...student,
    charges: updatedCharges,
  };

  const newReceipt: PaymentReceipt = {
    id: `rec-${Date.now()}`,
    receiptNo: `REC-${Date.now().toString().slice(-4)}`,
    studentId: student.studentId,
    studentName: student.fullName,
    admissionNo: student.admissionNo,
    classGrade: student.classGrade,
    section: student.section,
    date,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    totalAmount: amount,
    paymentMethod: method,
    transactionRef: referenceNo,
    proofFileName,
    remarks,
    cashierName,
    settledItems,
  };

  const updatedAccounts = accounts.map((a) =>
    a.studentId === studentId ? updatedStudent : a
  );
  const receipts = [newReceipt, ...getStoredReceipts()];

  saveStoredStudentAccounts(updatedAccounts);
  saveStoredReceipts(receipts);

  return { updatedAccounts, newReceipt };
}
