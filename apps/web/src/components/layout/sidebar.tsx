"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import { ChevronRight, GraduationCap } from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({ isCollapsed, className }: SidebarProps) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen select-none bg-[var(--sidebar-bg)] border-r border-[var(--neutral-800)] transition-all duration-300 z-30",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-5 border-b border-[var(--neutral-800)] gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--brand-primary)] text-white shadow-md">
          <GraduationCap className="h-6 w-6" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold tracking-wider text-white uppercase">
              School <span className="text-[var(--brand-accent)]">ERP</span>
            </span>
            <span className="text-[10px] text-[var(--sidebar-text)] tracking-wider uppercase font-medium">
              Enterprise Suite
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationConfig.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && section.title && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--neutral-500)] mb-2">
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isActive =
                pathname === item.href ||
                (item.children && item.children.some((child) => pathname === child.href));
              const isSubOpen = openSubMenus[item.title] ?? isActive;

              if (hasChildren && !isCollapsed) {
                return (
                  <div key={item.title} className="space-y-1">
                    <button
                      onClick={() => toggleSubMenu(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer",
                        isActive
                          ? "text-[var(--sidebar-text-active)] bg-[var(--sidebar-hover)]"
                          : "text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-[var(--brand-primary)]" : "text-[var(--sidebar-icon)]"
                          )}
                        />
                        <span>{item.title}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 text-[var(--neutral-500)] transition-transform duration-200",
                          isSubOpen && "rotate-90"
                        )}
                      />
                    </button>

                    {isSubOpen && (
                      <div className="pl-9 pr-2 py-1 space-y-1 border-l border-[var(--neutral-800)] ml-5">
                        {item.children?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                "block px-2.5 py-1.5 text-xs rounded transition-colors",
                                isSubActive
                                  ? "text-white font-semibold bg-[var(--brand-primary)]"
                                  : "text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]"
                              )}
                            >
                              {sub.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                    isActive
                      ? "text-white bg-[var(--brand-primary)] shadow-xs"
                      : "text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white" : "text-[var(--sidebar-icon)]"
                    )}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[var(--neutral-800)]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--neutral-900)] text-[var(--sidebar-text)]">
          <div className="h-8 w-8 rounded-full bg-[var(--brand-accent)] text-[var(--brand-secondary)] font-bold flex items-center justify-center text-xs">
            SA
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-xs font-semibold text-white truncate">Super Admin</span>
              <span className="text-[10px] text-[var(--neutral-400)] truncate">admin@schoolerp.io</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
