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
  const [isScrolled, setIsScrolled] = React.useState<boolean>(false);
  const [hoveredModuleId, setHoveredModuleId] = React.useState<string | null>(null);
  const [activeItemMeta, setActiveItemMeta] = React.useState<{
    row: 1 | 2;
    index: number;
    rectLeft: number;
    rectWidth: number;
  } | null>(null);

  const navRef = React.useRef<HTMLDivElement>(null);

  const isScrolledRef = React.useRef<boolean>(false);

  // Scroll detection with hysteresis to collapse 2 rows into 1 sleek icon + micro-label bar
  // Uses dual thresholds (>85px to collapse, <15px to expand) to prevent layout thrashing & jitter
  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          const currentlyScrolled = isScrolledRef.current;

          if (!currentlyScrolled && scrollY > 85) {
            isScrolledRef.current = true;
            setIsScrolled(true);
          } else if (currentlyScrolled && scrollY < 15) {
            isScrolledRef.current = false;
            setIsScrolled(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    const initialScrollY = window.scrollY || document.documentElement.scrollTop;
    if (initialScrollY > 85) {
      isScrolledRef.current = true;
      setIsScrolled(true);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Split the 20 modules into 2 continuous sleek rows of 10 items each for normal mode
  const firstRowModules = erpModules.slice(0, 10);
  const secondRowModules = erpModules.slice(10, 20);

  const handleModuleClick = (module: NavItem, row: 1 | 2, index: number, el: HTMLElement) => {
    if (!module.categories || module.categories.length === 0) {
      setOpenModuleId(null);
      setActiveItemMeta(null);
      return;
    }

    if (openModuleId === module.id) {
      setOpenModuleId(null);
      setActiveItemMeta(null);
    } else {
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
      return { left: 16, caretPercent: 20, top: isScrolled ? 52 : 40 };
    }

    const navWidth = navRef.current.offsetWidth || 1200;
    const hasTwoCols = Boolean(activeModule?.categories && activeModule.categories.length > 1);
    const modalWidth = hasTwoCols ? 560 : 240;
    const itemCenter = activeItemMeta.rectLeft + activeItemMeta.rectWidth / 2;

    let modalLeft = hasTwoCols ? itemCenter - modalWidth / 3 : itemCenter - modalWidth / 2;
    if (modalLeft < 16) {
      modalLeft = 16;
    } else if (modalLeft + modalWidth > navWidth - 16) {
      modalLeft = Math.max(16, navWidth - modalWidth - 16);
    }

    const caretPixel = itemCenter - modalLeft;
    const caretPercent = Math.max(10, Math.min(90, (caretPixel / modalWidth) * 100));

    // When scrolled (1 row mode), dropdown opens right below the single row (52px)
    // When expanded (2 rows), Row 1 sits at top 40px, Row 2 sits at top 80px
    const top = isScrolled ? 52 : activeItemMeta.row === 1 ? 40 : 80;

    return {
      left: modalLeft,
      caretPercent,
      top,
    };
  };

  const dropdownPos = getDropdownStyle();

  // Helper for expanded mode items (Default top of page)
  const renderExpandedNavItem = (
    module: NavItem,
    row: 1 | 2,
    index: number,
    isLastInRow: boolean
  ) => {
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
            onClick={(e) =>
              handleModuleClick(
                module,
                row,
                index,
                e.currentTarget.parentElement || e.currentTarget
              )
            }
            className={cn(
              "w-full h-full px-2 sm:px-3 flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-150 select-none cursor-pointer group relative",
              isOpen || isCurrentActive
                ? "text-[var(--brand-primary)] font-semibold bg-[var(--red-50)]/50"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors" />
            <span className="truncate tracking-tight">{module.title}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 shrink-0 text-[var(--neutral-400)] group-hover:text-[var(--brand-primary)] transition-transform duration-200 ml-0.5",
                isOpen && "rotate-180 text-[var(--brand-primary)]"
              )}
            />
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
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors" />
            <span className="truncate tracking-tight">{module.title}</span>
            {isCurrentActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-primary)]" />
            )}
          </Link>
        )}
      </div>
    );
  };

  // Helper for collapsed single-row mode (Shows both Icon + Micro-Text label)
  const renderCollapsedIconItem = (module: NavItem, index: number, isLast: boolean) => {
    const Icon = module.icon;
    const hasSub = module.categories && module.categories.length > 0;
    const isOpen = openModuleId === module.id;
    const isHovered = hoveredModuleId === module.id;
    const isCurrentActive =
      activeModuleId === module.id ||
      pathname === module.href ||
      (pathname !== "/" && module.href !== "/" && pathname.startsWith(module.href));

    return (
      <div
        key={module.id}
        onMouseEnter={() => setHoveredModuleId(module.id)}
        onMouseLeave={() => setHoveredModuleId(null)}
        className={cn(
          "flex-1 min-w-[56px] max-w-[90px] h-[52px] flex items-center justify-center relative group transition-colors",
          !isLast && "border-r border-[var(--border-default)]/60"
        )}
      >
        {hasSub ? (
          <button
            type="button"
            onClick={(e) =>
              handleModuleClick(
                module,
                1,
                index,
                e.currentTarget.parentElement || e.currentTarget
              )
            }
            className={cn(
              "w-full h-full px-0.5 py-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 select-none cursor-pointer relative",
              isOpen || isCurrentActive
                ? "bg-[var(--red-50)]/80 text-[var(--brand-primary)] font-bold"
                : "text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)]"
            )}
            title={module.title}
            aria-label={module.title}
          >
            <div className="transition-transform duration-150 group-hover:scale-110 shrink-0">
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isOpen || isCurrentActive
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--brand-primary)]/80 group-hover:text-[var(--brand-primary)]"
                )}
              />
            </div>

            {/* Micro-Text Label adjusted to fit single row */}
            <span
              className={cn(
                "w-full text-center text-[9px] font-semibold tracking-tighter truncate px-0.5 leading-none transition-colors",
                isOpen || isCurrentActive
                  ? "text-[var(--brand-primary)] font-bold"
                  : "text-[var(--neutral-700)] group-hover:text-[var(--brand-primary)]"
              )}
            >
              {module.title}
            </span>

            {/* Active Bottom Indicator */}
            {(isOpen || isCurrentActive) && (
              <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-t-full bg-[var(--brand-primary)]" />
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
              "w-full h-full px-0.5 py-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 select-none group relative",
              isCurrentActive
                ? "bg-[var(--red-50)]/80 text-[var(--brand-primary)] font-bold"
                : "text-[var(--neutral-600)] hover:text-[var(--brand-primary)] hover:bg-[var(--neutral-50)]"
            )}
            title={module.title}
            aria-label={module.title}
          >
            <div className="transition-transform duration-150 group-hover:scale-110 shrink-0">
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isCurrentActive
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--brand-primary)]/80 group-hover:text-[var(--brand-primary)]"
                )}
              />
            </div>

            {/* Micro-Text Label adjusted to fit single row */}
            <span
              className={cn(
                "w-full text-center text-[9px] font-semibold tracking-tighter truncate px-0.5 leading-none transition-colors",
                isCurrentActive
                  ? "text-[var(--brand-primary)] font-bold"
                  : "text-[var(--neutral-700)] group-hover:text-[var(--brand-primary)]"
              )}
            >
              {module.title}
            </span>

            {/* Active Bottom Indicator */}
            {isCurrentActive && (
              <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-t-full bg-[var(--brand-primary)]" />
            )}
          </Link>
        )}

        {/* Hover Tooltip popup for full title & submenu count */}
        {isHovered && !isOpen && (
          <div className="absolute top-full mt-1.5 z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="relative bg-neutral-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-[4px] shadow-xl whitespace-nowrap flex items-center gap-1.5">
              <span>{module.title}</span>
              {hasSub && (
                <span className="text-[9px] text-[var(--brand-accent)] font-normal">
                  ({module.categories?.length || 0} submenus)
                </span>
              )}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "sticky top-16 z-30 bg-white border-b border-[var(--border-default)] shadow-xs overflow-visible transition-colors duration-200",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : ""
      )}
      aria-label="Main ERP Modules Navigation"
    >
      <div className="max-w-[1600px] mx-auto relative overflow-visible">
        {isScrolled ? (
          /* =================================================================== */
          /* COLLAPSED SCROLLED STATE: SINGLE COMPACT ROW WITH ICONS + MICRO TEXT */
          /* =================================================================== */
          <div className="flex items-stretch justify-between overflow-x-auto custom-scrollbar no-scrollbar animate-in fade-in-0 duration-200">
            {erpModules.map((module, idx) =>
              renderCollapsedIconItem(module, idx, idx === erpModules.length - 1)
            )}
          </div>
        ) : (
          /* =================================================================== */
          /* DEFAULT TOP STATE: FULL 2-ROW NAVIGATION WITH FULL LABELS           */
          /* =================================================================== */
          <div className="animate-in fade-in-0 duration-200">
            {/* Row 1: Primary Academic & Student Operations */}
            <div className="flex items-stretch border-b border-[var(--border-default)] overflow-visible">
              {firstRowModules.map((module, idx) =>
                renderExpandedNavItem(module, 1, idx, idx === firstRowModules.length - 1)
              )}
            </div>

            {/* Row 2: Management, Infrastructure & System */}
            <div className="flex items-stretch overflow-visible">
              {secondRowModules.map((module, idx) =>
                renderExpandedNavItem(module, 2, idx, idx === secondRowModules.length - 1)
              )}
            </div>
          </div>
        )}

        {/* Global Anchored Submenu Popover Modal on Click (Works in Both Modes!) */}
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
