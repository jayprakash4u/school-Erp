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
  const [isExpandedRows, setIsExpandedRows] = React.useState<boolean>(false);
  const [activeItemMeta, setActiveItemMeta] = React.useState<{
    row: number;
    index: number;
    rectLeft: number;
    rectTop: number;
    rectWidth: number;
  } | null>(null);

  const navRef = React.useRef<HTMLDivElement>(null);
  const innerContainerRef = React.useRef<HTMLDivElement>(null);

  // Desktop: 2 continuous rows of 10 items each (All 20 modules visible)
  const desktopRow1 = erpModules.slice(0, 10);
  const desktopRow2 = erpModules.slice(10, 20);

  // Mobile: 3 items per row (Row 1 & 2 visible by default, Row 3-7 expandable)
  const mobileRow1 = erpModules.slice(0, 3);
  const mobileRow2 = erpModules.slice(3, 6);
  const mobileRow3 = erpModules.slice(6, 9);
  const mobileRow4 = erpModules.slice(9, 12);
  const mobileRow5 = erpModules.slice(12, 15);
  const mobileRow6 = erpModules.slice(15, 18);
  const mobileRow7 = erpModules.slice(18, 20);

  // Auto-expand on mobile if active page is in row 3 onwards (index 6+)
  React.useEffect(() => {
    const isDeepActive = erpModules.slice(6).some(
      (m) =>
        m.id === activeModuleId ||
        pathname === m.href ||
        (pathname !== "/" && m.href !== "/" && pathname.startsWith(m.href))
    );
    if (isDeepActive) {
      setIsExpandedRows(true);
    }
  }, [pathname, activeModuleId]);

  // Close menus on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
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
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close open mega menu on route change
  React.useEffect(() => {
    setOpenModuleId(null);
    setActiveItemMeta(null);
  }, [pathname]);

  const activeModule = erpModules.find((m) => m.id === openModuleId);

  const handleModuleClick = (
    module: NavItem,
    row: number,
    index: number,
    el: HTMLElement,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!module.categories || module.categories.length === 0) {
      setOpenModuleId(null);
      setActiveItemMeta(null);
      return;
    }

    if (openModuleId === module.id) {
      setOpenModuleId(null);
      setActiveItemMeta(null);
    } else {
      const containerRect = innerContainerRef.current?.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      const relativeLeft = containerRect ? itemRect.left - containerRect.left : itemRect.left;
      const relativeTop = containerRect ? itemRect.bottom - containerRect.top : itemRect.bottom;

      setOpenModuleId(module.id);
      setActiveItemMeta({
        row,
        index,
        rectLeft: relativeLeft,
        rectTop: relativeTop,
        rectWidth: itemRect.width,
      });
    }
  };

  // Calculate dropdown modal alignment
  const getDropdownStyle = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const containerWidth = innerContainerRef.current?.offsetWidth || 1200;
    const colCount = activeModule?.categories?.length || 1;

    if (isMobile) {
      return {
        left: 8,
        caretPercent: 20,
        top: activeItemMeta ? activeItemMeta.rectTop + 2 : 80,
      };
    }

    const modalWidth =
      colCount >= 3
        ? Math.min(840, containerWidth - 16)
        : colCount === 2
        ? Math.min(560, containerWidth - 16)
        : 240;

    if (!activeItemMeta) {
      return { left: 8, caretPercent: 20, top: 80 };
    }

    const itemCenter = activeItemMeta.rectLeft + activeItemMeta.rectWidth / 2;

    let modalLeft =
      colCount >= 3
        ? itemCenter - modalWidth / 3
        : colCount === 2
        ? itemCenter - modalWidth / 3
        : itemCenter - modalWidth / 2;

    if (modalLeft < 8) {
      modalLeft = 8;
    } else if (modalLeft + modalWidth > containerWidth - 8) {
      modalLeft = Math.max(8, containerWidth - modalWidth - 8);
    }

    const caretPixel = itemCenter - modalLeft;
    const caretPercent = Math.max(6, Math.min(94, (caretPixel / modalWidth) * 100));
    const top = activeItemMeta.rectTop + 2;

    return {
      left: modalLeft,
      caretPercent,
      top,
    };
  };

  const dropdownPos = getDropdownStyle();

  // Desktop nav item renderer (10 items per row)
  const renderDesktopItem = (
    module: NavItem,
    row: number,
    index: number,
    isLastInRow: boolean
  ) => {
    const Icon = module.icon;
    const hasSub = Boolean(module.categories && module.categories.length > 0);
    const isOpen = openModuleId === module.id;
    const displayTitle = module.shortTitle || module.title;
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
            title={module.title}
            onClick={(e) =>
              handleModuleClick(
                module,
                row,
                index,
                e.currentTarget.parentElement || e.currentTarget,
                e
              )
            }
            className={cn(
              "w-full h-full px-1.5 lg:px-2.5 flex items-center justify-center gap-1 lg:gap-1.5 text-xs font-semibold transition-all duration-150 select-none cursor-pointer group relative whitespace-nowrap",
              isOpen || isCurrentActive
                ? "text-[var(--brand-primary)] font-bold bg-[var(--red-50)]/60"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors" />
            <span className="tracking-tight font-medium whitespace-nowrap truncate">
              {displayTitle}
            </span>
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
            title={module.title}
            onClick={() => {
              setOpenModuleId(null);
              setActiveItemMeta(null);
            }}
            className={cn(
              "w-full h-full px-1.5 lg:px-2.5 flex items-center justify-center gap-1 lg:gap-1.5 text-xs font-semibold transition-all duration-150 select-none group relative whitespace-nowrap",
              isCurrentActive
                ? "text-[var(--brand-primary)] font-bold bg-[var(--red-50)]/60"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors" />
            <span className="tracking-tight font-medium whitespace-nowrap truncate">
              {displayTitle}
            </span>
            {isCurrentActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--brand-primary)]" />
            )}
          </Link>
        )}
      </div>
    );
  };

  // Mobile nav item renderer (3 items per row)
  const renderMobileItem = (
    module: NavItem,
    row: number,
    index: number,
    isLastInRow: boolean
  ) => {
    const Icon = module.icon;
    const hasSub = Boolean(module.categories && module.categories.length > 0);
    const isOpen = openModuleId === module.id;
    const displayTitle = module.shortTitle || module.title;
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
            title={module.title}
            onClick={(e) =>
              handleModuleClick(
                module,
                row,
                index,
                e.currentTarget.parentElement || e.currentTarget,
                e
              )
            }
            className={cn(
              "w-full h-full px-2 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-150 select-none cursor-pointer group relative whitespace-nowrap",
              isOpen || isCurrentActive
                ? "text-[var(--brand-primary)] font-bold bg-[var(--red-50)]/60"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors" />
            <span className="tracking-tight font-medium whitespace-nowrap text-xs">
              {displayTitle}
            </span>
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
            title={module.title}
            onClick={() => {
              setOpenModuleId(null);
              setActiveItemMeta(null);
            }}
            className={cn(
              "w-full h-full px-2 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-150 select-none group relative whitespace-nowrap",
              isCurrentActive
                ? "text-[var(--brand-primary)] font-bold bg-[var(--red-50)]/60"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-50)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)] transition-colors" />
            <span className="tracking-tight font-medium whitespace-nowrap text-xs">
              {displayTitle}
            </span>
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
      className="sticky top-16 z-30 bg-white border-b border-[var(--border-default)] shadow-xs overflow-visible transition-colors duration-200 select-none"
      aria-label="Main ERP Navigation"
    >
      <div
        ref={innerContainerRef}
        className="max-w-[1600px] mx-auto relative overflow-visible"
      >
        {/* =================================================================== */}
        {/* DESKTOP VIEW (MD+): 2 CONTINUOUS ROWS OF 10 ITEMS EACH              */}
        {/* =================================================================== */}
        <div className="hidden md:flex flex-col">
          {/* Desktop Row 1 (10 items) */}
          <div className="flex items-stretch border-b border-[var(--border-default)] overflow-visible">
            {desktopRow1.map((module, idx) =>
              renderDesktopItem(module, 1, idx, idx === desktopRow1.length - 1)
            )}
          </div>

          {/* Desktop Row 2 (10 items) */}
          <div className="flex items-stretch overflow-visible">
            {desktopRow2.map((module, idx) =>
              renderDesktopItem(module, 2, idx, idx === desktopRow2.length - 1)
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MOBILE VIEW (< MD): 3 ITEMS PER ROW WITH SLEEK BOTTOM DROPDOWN     */}
        {/* =================================================================== */}
        <div className="block md:hidden">
          <div className="flex flex-col">
            {/* Mobile Row 1 (3 items) */}
            <div className="grid grid-cols-3 border-b border-[var(--border-default)] overflow-visible">
              {mobileRow1.map((module, idx) =>
                renderMobileItem(module, 1, idx, idx === mobileRow1.length - 1)
              )}
            </div>

            {/* Mobile Row 2 (3 items) */}
            <div className="grid grid-cols-3 overflow-visible">
              {mobileRow2.map((module, idx) =>
                renderMobileItem(module, 2, idx, idx === mobileRow2.length - 1)
              )}
            </div>

            {/* Expandable Rows 3-7 on Mobile */}
            {isExpandedRows && (
              <div className="animate-in slide-in-from-top-1 duration-150 border-t border-[var(--border-default)] bg-neutral-50/30">
                {/* Mobile Row 3 */}
                <div className="grid grid-cols-3 border-b border-[var(--border-default)] overflow-visible">
                  {mobileRow3.map((module, idx) =>
                    renderMobileItem(module, 3, idx, idx === mobileRow3.length - 1)
                  )}
                </div>

                {/* Mobile Row 4 */}
                <div className="grid grid-cols-3 border-b border-[var(--border-default)] overflow-visible">
                  {mobileRow4.map((module, idx) =>
                    renderMobileItem(module, 4, idx, idx === mobileRow4.length - 1)
                  )}
                </div>

                {/* Mobile Row 5 */}
                <div className="grid grid-cols-3 border-b border-[var(--border-default)] overflow-visible">
                  {mobileRow5.map((module, idx) =>
                    renderMobileItem(module, 5, idx, idx === mobileRow5.length - 1)
                  )}
                </div>

                {/* Mobile Row 6 */}
                <div className="grid grid-cols-3 border-b border-[var(--border-default)] overflow-visible">
                  {mobileRow6.map((module, idx) =>
                    renderMobileItem(module, 6, idx, idx === mobileRow6.length - 1)
                  )}
                </div>

                {/* Mobile Row 7 */}
                <div className="grid grid-cols-3 overflow-visible">
                  {mobileRow7.map((module, idx) =>
                    renderMobileItem(module, 7, idx, false)
                  )}
                  <div className="flex-1 min-h-[40px] bg-neutral-50/50 flex items-center justify-center px-2 text-[10px] text-[var(--text-tertiary)] italic">
                    <span>ERP Suite</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Bottom Minimal Dropdown Handle */}
          <div className="flex items-center justify-center py-0.5 bg-neutral-50/70 border-t border-[var(--border-light)]">
            <button
              type="button"
              onClick={() => setIsExpandedRows((prev) => !prev)}
              title={isExpandedRows ? "Collapse navigation" : "Show more modules"}
              aria-label={isExpandedRows ? "Collapse navigation" : "Show more modules"}
              className="flex items-center justify-center w-20 h-4 rounded-full hover:bg-white text-[var(--neutral-400)] hover:text-[var(--brand-primary)] border border-transparent hover:border-[var(--border-default)] shadow-2xs transition-all cursor-pointer group"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200 text-neutral-500 group-hover:text-[var(--brand-primary)]",
                  isExpandedRows && "rotate-180 text-[var(--brand-primary)]"
                )}
              />
            </button>
          </div>
        </div>

        {/* Global Anchored Submenu Popover Modal on Click */}
        {activeModule && openModuleId && (
          <div
            className="z-50"
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




