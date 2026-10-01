import { LucideIcon } from "lucide-react";
import { UserRole } from "./auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "brand" | "success" | "warning" | "error" | "neutral";
  roles?: UserRole[];
  disabled?: boolean;
  children?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
  badge?: string | number;
  roles?: UserRole[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
