"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Search, ChevronDown, LayoutGrid } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { QuickAccessModal } from "./quick-access-modal";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ErpHeaderProps {
  onSearchChange?: (query: string) => void;
}

export function ErpHeader({ onSearchChange }: ErpHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isQuickMenuOpen, setIsQuickMenuOpen] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const activeAcademicYear = useAuthStore((state) => state.activeAcademicYear);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--brand-secondary)] text-white border-b border-[var(--neutral-800)] shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: School Identity & Brand Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-3 shrink-0 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-[var(--brand-accent)] transition-colors">
                  Sunrise Public School
                </span>
                <span className="hidden md:inline-flex px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded bg-[var(--brand-primary)] text-white">
                  HQ
                </span>
              </div>
              <span className="text-[11px] text-[var(--neutral-400)] font-medium tracking-wide">
                School ERP Platform
              </span>
            </div>
          </Link>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-400)] group-focus-within:text-[var(--brand-accent)] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search anything... (e.g. student, fee, report, class)"
                className="w-full h-10 pl-10 pr-12 text-xs text-white bg-[var(--neutral-900)] border border-[var(--neutral-700)] rounded-lg placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono text-[var(--neutral-400)] bg-[var(--neutral-800)] border border-[var(--neutral-700)] rounded">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Quick Menu, Fiscal Year & User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Menu Button with 4-Column Popover Modal */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsQuickMenuOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all select-none cursor-pointer border shadow-xs",
                  isQuickMenuOpen
                    ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                    : "bg-[var(--neutral-900)] text-white border-[var(--neutral-700)] hover:bg-[var(--neutral-800)] hover:border-[var(--neutral-600)]"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[var(--neutral-300)]" />
                <span>Quick Menu</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-[var(--neutral-400)] transition-transform duration-200",
                    isQuickMenuOpen && "rotate-180 text-white"
                  )}
                />
              </button>

              {/* Quick Access Modal Popup */}
              <QuickAccessModal
                isOpen={isQuickMenuOpen}
                onClose={() => setIsQuickMenuOpen(false)}
              />
            </div>

            {/* Fiscal Year (FY) Indicator */}
            <div className="flex items-center px-2.5 py-1.5 rounded-[6px] bg-[var(--neutral-900)] border border-[var(--neutral-700)] text-xs text-[var(--neutral-300)] font-medium">
              <span className="font-semibold text-white">FY- {activeAcademicYear}</span>
            </div>

            {/* User Profile Avatar Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-[var(--neutral-800)]">
              <div className="h-9 w-9 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-[var(--neutral-700)]">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "JD"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {user?.name || "demo"}
                </span>
                <span className="text-[10px] text-[var(--brand-accent)] font-medium">
                  {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Administrator"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

