import { LucideIcon } from "lucide-react";
import { UserRole } from "./auth";

export interface NavSubItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  badge?: string | number;
  badgeVariant?: "brand" | "success" | "warning" | "error" | "neutral";
  roles?: UserRole[];
}

export interface NavSubCategory {
  title?: string;
  items: NavSubItem[];
}

export interface NavItem {
  id: string;
  order: number;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "brand" | "success" | "warning" | "error" | "neutral";
  roles?: UserRole[];
  disabled?: boolean;
  categories?: NavSubCategory[]; // For multi-column mega-menu
  children?: NavSubItem[]; // Fallback list
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
