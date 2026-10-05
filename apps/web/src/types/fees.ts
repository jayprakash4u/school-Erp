export type FeeCategory =
  | "Tuition"
  | "Admission"
  | "Examination"
  | "Transport"
  | "Hostel"
  | "Library"
  | "Uniform"
  | "Miscellaneous"
  | "Fine"
  | "Other";

export interface FeeCharge {
  id: string;
  title: string;
  category: FeeCategory;
  description?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  isMandatory?: boolean;
}

export interface StudentAccount {
  id: string;
  studentId: string;
  admissionNo: string;
  fullName: string;
  classGrade: string;
  section: string;
  rollNo: string;
  guardianName: string;
  guardianPhone: string;
  charges: FeeCharge[];
}

export interface SettledFeeItem {
  chargeId: string;
  chargeTitle: string;
  description?: string;
  category: FeeCategory;
  amountPaid: number;
  previousDue: number;
  newRemaining: number;
}

export type PaymentMethod = "Cash" | "Bank" | "Card" | "Online";

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classGrade: string;
  section: string;
  date: string;
  time: string;
  subtotalAmount?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  fineAmount?: number;
  totalAmount: number;
  amountReceived?: number;
  changeAmount?: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  proofFileName?: string;
  remarks?: string;
  cashierName: string;
  settledItems: SettledFeeItem[];
}
