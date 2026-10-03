"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-48 rounded-md bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-md py-1 transition-all duration-150 ease-out",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 h-px bg-[var(--border-light)]" />;
            }

            const Icon = item.icon;
            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors cursor-pointer",
                  item.destructive
                    ? "text-[var(--action-destructive-default)] hover:bg-[var(--red-50)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
                  item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
