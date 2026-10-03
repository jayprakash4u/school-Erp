"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { erpModules } from "@/config/navigation";
import { NavItem } from "@/types/navigation";
import { ErpMegaMenu } from "./erp-mega-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErpTopNavProps {
  onSelectSubOption?: (module: NavItem, subOptionTitle: string, href: string) => void;
  activeModuleId?: string | null;
}

export function ErpTopNav({ onSelectSubOption, activeModuleId }: ErpTopNavProps) {
  const pathname = usePathname();
  const [openModuleId, setOpenModuleId] = React.useState<string | null>(null);
  const [activeItemMeta, setActiveItemMeta] = React.useState<{
    row: 1 | 2;
    index: number;
    rectLeft: number;
    rectWidth: number;
  } | null>(null);

  const navRef = React.useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenModuleId(null);
        setActiveItemMeta(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenModuleId(null);
        setActiveItemMeta(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeModule = erpModules.find((m) => m.id === openModuleId);

  // Split the 20 modules into 2 continuous sleek rows of 10 items each
  const firstRowModules = erpModules.slice(0, 10);
  const secondRowModules = erpModules.slice(10, 20);

  const handleModuleClick = (module: NavItem, row: 1 | 2, index: number, el: HTMLElement) => {
    if (!module.categories || module.categories.length === 0) {
      setOpenModuleId(null);
      setActiveItemMeta(null);
      return;
    }

    if (openModuleId === module.id) {
      // Toggle close if clicking the same open module
      setOpenModuleId(null);
      setActiveItemMeta(null);
    } else {
      // Open the clicked module and calculate its horizontal position
      const navRect = navRef.current?.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      const relativeLeft = navRect ? itemRect.left - navRect.left : itemRect.left;

      setOpenModuleId(module.id);
      setActiveItemMeta({
        row,
        index,
        rectLeft: relativeLeft,
        rectWidth: itemRect.width,
      });
    }
  };

  // Calculate horizontal position and caret alignment of dropdown modal
  const getDropdownStyle = () => {
    if (!activeItemMeta || !navRef.current) {
      return { left: 16, caretPercent: 20, top: 40 };
    }

    const navWidth = navRef.current.offsetWidth || 1200;
    const hasTwoCols = Boolean(activeModule?.categories && activeModule.categories.length > 1);
    const modalWidth = hasTwoCols ? 480 : 230;
    const itemCenter = activeItemMeta.rectLeft + activeItemMeta.rectWidth / 2;

    // Center modal under clicked tab item, clamped within nav bounds
    let modalLeft = hasTwoCols ? itemCenter - modalWidth / 3 : itemCenter - modalWidth / 2;
    if (modalLeft < 16) {
      modalLeft = 16;
    } else if (modalLeft + modalWidth > navWidth - 16) {
      modalLeft = Math.max(16, navWidth - modalWidth - 16);
    }

    // Caret percentage relative to modal width
    const caretPixel = itemCenter - modalLeft;
    const caretPercent = (caretPixel / modalWidth) * 100;

    // Row 1 sits at top 40px, Row 2 sits at top 80px
    const top = activeItemMeta.row === 1 ? 40 : 80;

    return {
      left: modalLeft,
      caretPercent,
      top,
    };
  };

  const dropdownPos = getDropdownStyle();

  const renderNavItem = (module: NavItem, row: 1 | 2, index: number, isLastInRow: boolean) => {
    const Icon = module.icon;
    const hasSub = module.categories && module.categories.length > 0;
    const isOpen = openModuleId === module.id;
    const isCurrentActive =
      activeModuleId === module.id ||
      pathname === module.href ||
      (pathname !== "/" && module.href !== "/" && pathname.startsWith(module.href));

    return (
      <div
        key={module.id}
        className={cn(
          "flex-1 min-w-0 h-10 flex items-center justify-center transition-colors relative",
          !isLastInRow && "border-r border-[var(--border-default)]"
        )}
      >
        {hasSub ? (
          <button
            type="button"
            onClick={(e) => handleModuleClick(module, row, index, e.currentTarget.parentElement || e.currentTarget)}
            className={cn(
              "w-full h-full px-2 sm:px-3 flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-150 select-none cursor-pointer group relative",
              isOpen || isCurrentActive
                ? "text-[var(--brand-primary)] font-semibold bg-[var(--red-50)]/50"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon
              className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors"
            />
            <span className="truncate tracking-tight">{module.title}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 shrink-0 text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)] transition-transform duration-200 ml-0.5",
                isOpen && "rotate-180 text-[var(--brand-primary)]"
              )}
            />

            {/* Subtle Active Bottom Indicator Line */}
            {(isOpen || isCurrentActive) && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-primary)]" />
            )}
          </button>
        ) : (
          <Link
            href={module.href}
            onClick={() => {
              setOpenModuleId(null);
              setActiveItemMeta(null);
            }}
            className={cn(
              "w-full h-full px-2 sm:px-3 flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-150 select-none group relative",
              isCurrentActive
                ? "text-[var(--brand-primary)] font-semibold bg-[var(--red-50)]/50"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon
              className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors"
            />
            <span className="truncate tracking-tight">{module.title}</span>

            {/* Subtle Active Bottom Indicator Line */}
            {isCurrentActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-primary)]" />
            )}
          </Link>
        )}
      </div>
    );
  };

  return (
    <nav
      ref={navRef}
      className="relative bg-[var(--bg-primary)] border-b border-[var(--border-default)] shadow-2xs z-30 overflow-visible"
      aria-label="Main ERP Modules Navigation"
    >
      <div className="max-w-[1600px] mx-auto relative overflow-visible">
        {/* Row 1: Primary Academic & Student Operations */}
        <div className="flex items-stretch border-b border-[var(--border-default)] overflow-visible">
          {firstRowModules.map((module, idx) =>
            renderNavItem(module, 1, idx, idx === firstRowModules.length - 1)
          )}
        </div>

        {/* Row 2: Management, Infrastructure & System */}
        <div className="flex items-stretch overflow-visible">
          {secondRowModules.map((module, idx) =>
            renderNavItem(module, 2, idx, idx === secondRowModules.length - 1)
          )}
        </div>

        {/* Global Anchored Submenu Popover Modal on Click */}
        {activeModule && openModuleId && (
          <div
            style={{
              position: "absolute",
              left: `${dropdownPos.left}px`,
              top: `${dropdownPos.top}px`,
            }}
          >
            <ErpMegaMenu
              module={activeModule}
              isOpen={Boolean(openModuleId)}
              caretLeftPercent={dropdownPos.caretPercent}
              onClose={() => {
                setOpenModuleId(null);
                setActiveItemMeta(null);
              }}
              onSelectSubItem={(mod, subTitle, href) => {
                onSelectSubOption?.(mod, subTitle, href);
                setOpenModuleId(null);
                setActiveItemMeta(null);
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
