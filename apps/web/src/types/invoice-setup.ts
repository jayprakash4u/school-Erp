export interface InvoiceSetupConfig {
  // General
  documentType: "Fee Invoice" | "Payment Receipt" | "Fee Due Notice" | "Salary Voucher";
  prefix: string;
  numberStartFrom: number;
  numberFormat: string;
  autoResetSequence: boolean;

  // Financial
  currency: "NPR" | "USD" | "INR" | "EUR" | "GBP";
  taxEnabled: boolean;
  taxRate: number;
  discountEnabled: boolean;
  fineLateFeeEnabled: boolean;
  partialPaymentAllowed: boolean;

  // Printing
  paperSize: "A4" | "A5" | "Thermal 80mm";
  orientation: "Portrait" | "Landscape";
  numberOfCopies: number;
  copy1Label: string;
  copy2Label: string;
  copy3Label: string;
  printLayout: "dual-side-by-side" | "dual-stacked" | "single-page";

  // Invoice Rules
  generateUniqueNumber: boolean;
  preventDuplicateNumber: boolean;
  showPaymentStatus: boolean;
  allowReprint: boolean;
  markReprintAsCopy: boolean;
  lockInvoiceAfterPayment: boolean;
  requireCashierSignature: boolean;

  // Numbering
  separateByBranch: boolean;
  separateByFiscalYear: boolean;
  currentFiscalYear: string;

  // Footer & Policies
  termsAndConditions: string;
  footerMessage: string;
  accountsContactPhone: string;
  accountsContactEmail: string;
}

export interface InvoiceTemplateConfig {
  templateStyle: "classic" | "modern" | "college" | "custom";
  primaryColor: string;
  accentColor: string;

  // School / College Branding
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tagline: string;
  showLogo: boolean;
  logoUrl?: string;
  panVatNumber: string;
  affiliationText: string;

  // Student Fields
  showStudentName: boolean;
  showStudentId: boolean;
  showAdmissionNo: boolean;
  showClassGrade: boolean;
  showSection: boolean;
  showRollNo: boolean;
  showAcademicYear: boolean;
  showGuardianName: boolean;
  showGuardianPhone: boolean;

  // Fee Table Columns
  showSn: boolean;
  showParticulars: boolean;
  showDescription: boolean;
  showPeriodMonth: boolean;
  showOriginalAmount: boolean;
  showDiscount: boolean;
  showNetPayable: boolean;

  // Payment & Banking Box
  showBankDetails: boolean;
  bankName: string;
  accountNo: string;
  accountHolder: string;
  paymentMode: string;
  showQrCode: boolean;
  qrPaymentLabel: string;

  // Signature & Stamps
  authorizedSignatureTitle: string;
  cashierSignatureTitle: string;
  showDigitalSignature: boolean;
  showStamp: boolean;

  // Footer Decorator
  showWaveRibbon: boolean;
  showPrintTimestamp: boolean;
  showPageNumber: boolean;
}

export const DEFAULT_INVOICE_SETUP: InvoiceSetupConfig = {
  documentType: "Fee Invoice",
  prefix: "INV-",
  numberStartFrom: 100001,
  numberFormat: "INV-{YYYY}-{NO}",
  autoResetSequence: false,

  currency: "NPR",
  taxEnabled: false,
  taxRate: 13,
  discountEnabled: true,
  fineLateFeeEnabled: true,
  partialPaymentAllowed: true,

  paperSize: "A4",
  orientation: "Portrait",
  numberOfCopies: 2,
  copy1Label: "Student Copy",
  copy2Label: "Office Copy",
  copy3Label: "Accounts Copy",
  printLayout: "dual-side-by-side",

  generateUniqueNumber: true,
  preventDuplicateNumber: true,
  showPaymentStatus: true,
  allowReprint: true,
  markReprintAsCopy: true,
  lockInvoiceAfterPayment: true,
  requireCashierSignature: true,

  separateByBranch: true,
  separateByFiscalYear: false,
  currentFiscalYear: "2082/83 (2025-26)",

  termsAndConditions:
    "• This invoice/receipt is valid for the selected academic term only.\n• Please quote the invoice number when depositing in bank or online.\n• For any billing queries, please contact the cashier or accounts office within 7 days.",
  footerMessage: "Building Bright Futures • Excellence in Education",
  accountsContactPhone: "+977-1-1234567",
  accountsContactEmail: "accounts@schoolerp.edu.np",
};

export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplateConfig = {
  templateStyle: "classic",
  primaryColor: "#DC2626",
  accentColor: "#10B981",

  schoolName: "Green Valley International School",
  motto: "Knowledge | Character | Future",
  address: "Tinkune, Kathmandu, Nepal",
  phone: "+977-1-1234567",
  email: "info@greenvalley.edu.np",
  website: "www.greenvalley.edu.np",
  tagline: "Building Bright Futures",
  showLogo: true,
  panVatNumber: "PAN: 301294821",
  affiliationText: "Affiliated to NEB & Ministry of Education",

  showStudentName: true,
  showStudentId: true,
  showAdmissionNo: true,
  showClassGrade: true,
  showSection: true,
  showRollNo: true,
  showAcademicYear: true,
  showGuardianName: true,
  showGuardianPhone: false,

  showSn: true,
  showParticulars: true,
  showDescription: true,
  showPeriodMonth: false,
  showOriginalAmount: true,
  showDiscount: true,
  showNetPayable: true,

  showBankDetails: true,
  bankName: "Nepal Bank Limited",
  accountNo: "001000123456",
  accountHolder: "Green Valley International School",
  paymentMode: "Bank Transfer / Online / Cash",
  showQrCode: true,
  qrPaymentLabel: "Scan & Pay via Fonepay / eSewa",

  authorizedSignatureTitle: "Authorized Signature",
  cashierSignatureTitle: "Cashier / Accountant",
  showDigitalSignature: false,
  showStamp: true,

  showWaveRibbon: true,
  showPrintTimestamp: true,
  showPageNumber: true,
};
