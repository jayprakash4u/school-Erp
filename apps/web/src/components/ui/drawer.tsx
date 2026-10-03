"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: "right" | "left";
  size?: "sm" | "md" | "lg" | "xl";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = "right",
  size = "md",
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-10 w-full bg-[var(--bg-primary)] border-[var(--border-default)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          position === "right" ? "right-0 border-l" : "left-0 border-r",
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-light)]">
          <div>
            {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
            {description && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-700)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-secondary)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
