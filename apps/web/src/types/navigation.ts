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
  dividerBefore?: boolean;
}

export interface NavSubCategory {
  title?: string;
  headerItem?: NavSubItem;
  items: NavSubItem[];
  secondaryTitle?: string;
  secondaryItems?: NavSubItem[];
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
  footerAction?: {
    title: string;
    href: string;
    icon?: LucideIcon;
  };
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
