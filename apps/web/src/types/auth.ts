/**
 * Authentication and User Role Types for School ERP
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "PRINCIPAL"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "ACCOUNTANT"
  | "LIBRARIAN";

export interface SchoolBranchInfo {
  id: string;
  name: string;
  code: string;
  isPrimary?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  availableSchools?: SchoolBranchInfo[];
  permissions: string[];
  phoneNumber?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: UserProfile;
}
