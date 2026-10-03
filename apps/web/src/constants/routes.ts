/**
 * Centralized Route Map for School ERP
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",

  // Core ERP Modules
  DASHBOARD: "/dashboard",
  SCHOOLS: {
    ROOT: "/schools",
    CREATE: "/schools/new",
    DETAIL: (id: string) => `/schools/${id}`,
    SETTINGS: (id: string) => `/schools/${id}/settings`,
  },
  STUDENTS: {
    ROOT: "/students",
    ADMISSION: "/students/admission",
    DISABLE: "/students/disable",
    DISABLED: "/students/disabled",
    DELETED: "/students/deleted",
    DETAIL: (id: string) => `/students/${id}`,
    ATTENDANCE: "/students/attendance",
    PROMOTION: "/students/promotion",
  },
  ACADEMICS: {
    ROOT: "/academics",
    CLASSES: "/academics/classes",
    SECTIONS: "/academics/sections",
    SUBJECTS: "/academics/subjects",
    TIMETABLE: "/academics/timetable",
    SYLLABUS: "/academics/syllabus",
  },
  TEACHERS: {
    ROOT: "/teachers",
    CREATE: "/teachers/new",
    DETAIL: (id: string) => `/teachers/${id}`,
    ALLOCATION: "/teachers/allocation",
  },
  FEES: {
    ROOT: "/fees",
    COLLECTION: "/fees/collection",
    STRUCTURE: "/fees/structure",
    INVOICES: "/fees/invoices",
    REPORTS: "/fees/reports",
  },
  EXAMS: {
    ROOT: "/examinations",
    SCHEDULE: "/examinations/schedule",
    MARKS_ENTRY: "/examinations/marks",
    REPORT_CARDS: "/examinations/report-cards",
  },
  STAFF: {
    ROOT: "/staff",
    PAYROLL: "/staff/payroll",
    ATTENDANCE: "/staff/attendance",
    LEAVE: "/staff/leave",
  },
  REPORTS: {
    ROOT: "/reports",
    ATTENDANCE: "/reports/attendance",
    FINANCIAL: "/reports/financial",
    ACADEMIC: "/reports/academic",
  },
  SETTINGS: {
    ROOT: "/settings",
    GENERAL: "/settings/general",
    ROLES: "/settings/roles-permissions",
    BACKUP: "/settings/backup",
    AUDIT_LOGS: "/settings/audit-logs",
  },
} as const;
