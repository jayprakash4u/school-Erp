/**
 * Common TypeScript Types for School ERP
 */

export type StatusType = "active" | "inactive" | "pending" | "suspended" | "error" | "success" | "warning";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Option<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}
