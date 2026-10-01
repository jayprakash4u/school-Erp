"use client";

import * as React from "react";
import { Bell, Search, Menu, Building, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-[var(--bg-primary)] border-b border-[var(--border-default)] shadow-2xs">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative hidden md:flex items-center w-72">
          <Search className="absolute left-3 h-4 w-4 text-[var(--neutral-400)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, classes, invoices..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-md bg-[var(--bg-secondary)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Right Action Icons & School Selector */}
      <div className="flex items-center gap-4">
        {/* School Branch Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] font-medium cursor-pointer hover:bg-[var(--bg-tertiary)]">
          <Building className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
          <span>Springdale Academy (Main Campus)</span>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
        </div>

        {/* Academic Year Badge */}
        <Badge variant="brand" size="sm" className="hidden lg:inline-flex">
          AY 2026-2027
        </Badge>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--brand-primary)] ring-2 ring-white" />
        </button>

        {/* User Profile avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-default)]">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
              Dr. Robert Vance
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)]">School Administrator</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-[var(--neutral-900)] text-white text-xs font-bold flex items-center justify-center border border-[var(--neutral-700)] shadow-xs">
            RV
          </div>
        </div>
      </div>
    </header>
  );
}
