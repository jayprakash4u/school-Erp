"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { erpModules } from "@/config/navigation";
import { NavItem } from "@/types/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelTop,
  Sparkles,
} from "lucide-react";

interface ErpSidebarProps {
  activeModuleId?: string | null;
}

export function ErpSidebar({ activeModuleId }: ErpSidebarProps) {
  const pathname = usePathname();
  const navLayout = useUIStore((state) => state.navLayout);
  const setNavLayout = useUIStore((state) => state.setNavLayout);
  const isSubmenuCollapsed = useUIStore((state) => state.isSubmenuCollapsed);
  const toggleSubmenuCollapsed = useUIStore((state) => state.toggleSubmenuCollapsed);
  const setSubmenuCollapsed = useUIStore((state) => state.setSubmenuCollapsed);

  // Determine initial active module from props or current pathname
  const initialModule = React.useMemo(() => {
    if (activeModuleId) {
      const match = erpModules.find((m) => m.id === activeModuleId);
      if (match) return match;
    }

    const matchedByPath = erpModules.find(
      (m) =>
        pathname === m.href ||
        (m.categories &&
          m.categories.some((cat) =>
            cat.items.some((item) => pathname === item.href || pathname.startsWith(item.href))
          )) ||
        (pathname !== "/" && m.href !== "/" && pathname.startsWith(m.href))
    );

    return matchedByPath || erpModules[0];
  }, [activeModuleId, pathname]);

  const [selectedModuleId, setSelectedModuleId] = React.useState<string>(initialModule.id);

  // Sync selected module if activeModuleId changes
  React.useEffect(() => {
    if (activeModuleId) {
      setSelectedModuleId(activeModuleId);
    }
  }, [activeModuleId]);

  const currentModule = erpModules.find((m) => m.id === selectedModuleId) || initialModule;
  const hasSubCategories = Boolean(
    currentModule?.categories && currentModule.categories.length > 0
  );

  const handleRailItemClick = (module: NavItem) => {
    setSelectedModuleId(module.id);

    // If module has sub options, ensure Tier 2 panel is open
    if (module.categories && module.categories.length > 0) {
      if (isSubmenuCollapsed) {
        setSubmenuCollapsed(false);
      }
    } else {
      // If direct single link (like Dashboard)
      setSubmenuCollapsed(true);
    }
  };

  if (navLayout !== "sidebar") {
    return null;
  }

  return (
    <aside
      className="select-none z-30"
      aria-label="ERP Sidebar Navigation"
    >
      {/* =================================================================== */}
      {/* TIER 1: PRIMARY SLIM ICON RAIL (72px Wide - Solid Dark Background)  */}
      {/* =================================================================== */}
      <div className="fixed top-16 bottom-0 left-0 w-[72px] bg-[#111111] border-r border-[var(--neutral-800)] z-30 flex flex-col justify-between shadow-md">
        {/* Scrollable list of ERP Modules */}
        <div className="flex-1 overflow-y-auto px-1.5 py-2.5 space-y-1.5 custom-scrollbar">
          {erpModules.map((module) => {
            const Icon = module.icon;
            const isSelected = selectedModuleId === module.id;
            const isCurrentRouteActive =
              activeModuleId === module.id ||
              pathname === module.href ||
              (pathname !== "/" && module.href !== "/" && pathname.startsWith(module.href));
            const displayTitle = module.shortTitle || module.title;
            const hasSub = Boolean(module.categories && module.categories.length > 0);

            const content = (
              <div className="flex flex-col items-center justify-center gap-1 w-full text-center">
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-150",
                    isSelected
                      ? "text-white scale-105"
                      : isCurrentRouteActive
                      ? "text-[var(--brand-primary)]"
                      : "text-[var(--neutral-400)] group-hover:text-white"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] tracking-tight font-medium w-full truncate leading-tight transition-colors",
                    isSelected
                      ? "text-white font-bold"
                      : isCurrentRouteActive
                      ? "text-[var(--brand-primary)] font-semibold"
                      : "text-[var(--neutral-400)] group-hover:text-white"
                  )}
                >
                  {displayTitle}
                </span>
              </div>
            );

            if (!hasSub) {
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  title={module.title}
                  onClick={() => handleRailItemClick(module)}
                  className={cn(
                    "w-full h-13 rounded-xl flex items-center justify-center px-1 transition-all duration-150 cursor-pointer group relative",
                    isSelected
                      ? "bg-[var(--brand-primary)] text-white shadow-md"
                      : isCurrentRouteActive
                      ? "bg-[var(--neutral-800)] text-white ring-1 ring-[var(--brand-primary)]/40"
                      : "text-[var(--neutral-400)] hover:text-white hover:bg-[var(--neutral-800)]/80"
                  )}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={module.id}
                type="button"
                title={module.title}
                onClick={() => handleRailItemClick(module)}
                className={cn(
                  "w-full h-13 rounded-xl flex items-center justify-center px-1 transition-all duration-150 cursor-pointer group relative",
                  isSelected
                    ? "bg-[var(--brand-primary)] text-white shadow-md font-bold"
                    : isCurrentRouteActive
                    ? "bg-[var(--neutral-800)] text-white ring-1 ring-[var(--brand-primary)]/40"
                    : "text-[var(--neutral-400)] hover:text-white hover:bg-[var(--neutral-800)]/80"
                )}
              >
                {content}
                {/* Active indicator pip */}
                {isSelected && !isSubmenuCollapsed && (
                  <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white rounded-l-full shadow-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Rail Actions: Expand Tier 2 & Switch back to Top Nav */}
        <div className="p-2 border-t border-[var(--neutral-800)] bg-[#0d0d0d] flex flex-col items-center gap-2">
          {/* If Tier 2 is collapsed and module has sub-items, show expand button */}
          {isSubmenuCollapsed && hasSubCategories && (
            <button
              type="button"
              onClick={() => setSubmenuCollapsed(false)}
              title="Expand Submenu Panel"
              aria-label="Expand Submenu Panel"
              className="w-10 h-8 rounded-lg bg-[var(--neutral-800)] hover:bg-[var(--neutral-700)] text-[var(--neutral-300)] hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer group"
            >
              <PanelLeftOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Quick Switch to Top Bar button */}
          <button
            type="button"
            onClick={() => setNavLayout("top")}
            title="Switch back to Top Navigation Bar"
            aria-label="Switch back to Top Navigation Bar"
            className="w-10 h-8 rounded-lg bg-[var(--neutral-900)] hover:bg-[var(--brand-primary)] border border-[var(--neutral-800)] text-[var(--neutral-400)] hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer group"
          >
            <PanelTop className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop when Submenu is open on small screens */}
      {!isSubmenuCollapsed && hasSubCategories && (
        <div
          onClick={() => setSubmenuCollapsed(true)}
          className="fixed inset-0 top-16 bg-black/40 backdrop-blur-2xs z-15 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* =================================================================== */}
      {/* TIER 2: SECONDARY FLYOUT SUBMENU PANEL (240px Wide - Crisp White)   */}
      {/* =================================================================== */}
      {!isSubmenuCollapsed && hasSubCategories && (
        <div className="fixed top-16 bottom-0 left-[72px] w-60 bg-white border-r border-[var(--border-default)] z-20 flex flex-col justify-between shadow-xl animate-in slide-in-from-left-2 duration-150">
          {/* Submenu Header */}
          <div className="px-4 py-3.5 border-b border-[var(--border-light)] bg-[var(--neutral-50)]/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1.5 rounded-lg bg-[var(--red-50)] text-[var(--brand-primary)]">
                {React.createElement(currentModule.icon, { className: "h-4 w-4" })}
              </div>
              <div className="flex flex-col truncate">
                <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {currentModule.title}
                </h2>
                <span className="text-[10px] text-[var(--neutral-500)] font-medium">
                  ERP Module
                </span>
              </div>
            </div>
          </div>

          {/* Submenu Scrollable Item List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {currentModule.categories?.map((cat, catIdx) => (
              <div key={cat.title || catIdx} className="space-y-1">
                {cat.title && (
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--neutral-500)] mb-1.5">
                    {cat.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {cat.items.map((item) => {
                    const SubIcon = item.icon || Sparkles;
                    const isItemActive =
                      pathname === item.href ||
                      (pathname !== "/" && item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href + item.title}
                        href={item.href}
                        title={item.title}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium transition-all select-none cursor-pointer group",
                          isItemActive
                            ? "bg-[var(--red-50)] text-[var(--brand-primary)] font-bold border-l-[3px] border-[var(--brand-primary)] rounded-r-[6px] shadow-2xs"
                            : "text-[var(--neutral-700)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)]/70 rounded-[6px]"
                        )}
                      >
                        <SubIcon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isItemActive
                              ? "text-[var(--brand-primary)]"
                              : "text-[var(--neutral-500)] group-hover:text-[var(--brand-primary)]"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submenu Bottom: Exactly matching the user's screenshot Collapse button */}
          <div className="p-2.5 border-t border-[var(--border-light)] bg-[var(--neutral-50)]/70 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleSubmenuCollapsed}
              title="Collapse Submenu Panel"
              aria-label="Collapse Submenu Panel"
              className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-white border border-transparent hover:border-[var(--border-default)] transition-all cursor-pointer shadow-2xs w-full"
            >
              <PanelLeftClose className="h-4 w-4 text-[var(--neutral-500)]" />
              <span>Collapse</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
