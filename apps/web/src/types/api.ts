import { ApiResponse, PaginationMeta } from "./common";

/**
 * Standard API error model
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[] | ApiErrorDetail[];
  statusCode: number;
  traceId?: string;
}

/**
 * Standard Paginated Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Common Filter, Sorting and Query params for ERP tables
 */
export interface TableQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  schoolId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Standard Mutation/Operation Result
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
