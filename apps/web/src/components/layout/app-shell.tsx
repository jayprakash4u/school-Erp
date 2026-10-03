"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useUIStore } from "@/stores/ui-store";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isMobileMenuOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-secondary)]">
      {/* Desktop Persistent / Collapsible Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1300] lg:hidden flex">
          <div
            className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-full bg-[var(--sidebar-bg)] h-full flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-4 p-2 text-[var(--sidebar-text)] hover:text-white"
              aria-label="Close mobile menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar isCollapsed={false} className="w-full border-r-0" />
          </div>
        </div>
      )}

      {/* Main Application Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileMenuOpen(true);
            } else {
              toggleSidebar();
            }
          }}
        />

        {/* Scrollable Content Viewport constrained to 1440px max width for optimal data density */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px] space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
