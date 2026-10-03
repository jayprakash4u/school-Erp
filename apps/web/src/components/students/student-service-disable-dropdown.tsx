"use client";

import * as React from "react";
import {
  X,
  Coins,
  FileSpreadsheet,
  Library,
  Bus,
  Bed,
  UserX,
  ArrowRight,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvailableServiceOption {
  id: string;
  name: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ALL_RESTRICTABLE_SERVICES: AvailableServiceOption[] = [
  {
    id: "BILLING",
    name: "Billing & Fee Payment",
    shortLabel: "Billing",
    icon: Coins,
  },
  {
    id: "EXAMINATION",
    name: "Examinations & Results",
    shortLabel: "Examination",
    icon: FileSpreadsheet,
  },
  {
    id: "LIBRARY",
    name: "Library Services",
    shortLabel: "Library",
    icon: Library,
  },
  {
    id: "TRANSPORT",
    name: "Transport / Bus Service",
    shortLabel: "Bus / Transport",
    icon: Bus,
  },
  {
    id: "HOSTEL",
    name: "Hostel & Mess Facility",
    shortLabel: "Hostel",
    icon: Bed,
  },
  {
    id: "PORTAL_LOGIN",
    name: "Complete Portal Login",
    shortLabel: "Full Portal",
    icon: UserX,
  },
];

interface StudentServiceDisableDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  disabledServices?: string[];
  onDisableServices: (studentId: string, serviceIdsToDisable: string[]) => void;
  onEnableService?: (studentId: string, serviceId: string) => void;
}

export function StudentServiceDisableDropdown({
  isOpen,
  onClose,
  studentId,
  studentName,
  disabledServices = [],
  onDisableServices,
  onEnableService,
}: StudentServiceDisableDropdownProps) {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Selected services in current session
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  // View mode: "selection" or "confirmation"
  const [viewMode, setViewMode] = React.useState<"selection" | "confirmation">("selection");

  // Reset state when opening dropdown
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setViewMode("selection");
    }
  }, [isOpen]);

  // Close on click outside or escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSelection = (serviceId: string) => {
    setSelectedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleArrowClick = () => {
    if (selectedIds.length > 0) {
      setViewMode("confirmation");
    }
  };

  const handleConfirmDisable = () => {
    onDisableServices(studentId, selectedIds);
    onClose();
  };

  const handleCancelConfirmation = () => {
    setViewMode("selection");
  };

  // List of services currently disabled for this student
  const alreadyDisabledServices = ALL_RESTRICTABLE_SERVICES.filter((s) =>
    disabledServices.includes(s.id)
  );

  // Services available to select and disable
  const availableServices = ALL_RESTRICTABLE_SERVICES.filter(
    (s) => !disabledServices.includes(s.id)
  );

  const selectedServiceNames = ALL_RESTRICTABLE_SERVICES.filter((s) =>
    selectedIds.includes(s.id)
  )
    .map((s) => s.shortLabel)
    .join(", ");

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-lg border border-[var(--border-default)] shadow-2xl z-50 overflow-hidden text-left animate-in fade-in-0 zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ========================================================================= */}
      {/* 1. SELECTION VIEW: CLEAN CHECKBOX LIST                                     */}
      {/* ========================================================================= */}
      {viewMode === "selection" && (
        <div className="p-2.5 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[var(--border-light)]">
            <span className="text-xs font-bold text-neutral-800">
              Select Services to Disable
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Already Disabled Badges (if any) */}
          {alreadyDisabledServices.length > 0 && (
            <div className="p-1.5 rounded bg-red-50/70 border border-red-200/80 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-700 block">
                Currently Disabled:
              </span>
              <div className="flex flex-wrap gap-1">
                {alreadyDisabledServices.map((service) => (
                  <span
                    key={service.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white text-red-700 border border-red-300 shadow-2xs"
                  >
                    <span>{service.shortLabel}</span>
                    {onEnableService && (
                      <button
                        type="button"
                        onClick={() => onEnableService(studentId, service.id)}
                        title={`Enable ${service.shortLabel}`}
                        className="hover:text-emerald-700 font-bold ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clean Service Checkbox Options */}
          <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
            {availableServices.length > 0 ? (
              availableServices.map((service) => {
                const Icon = service.icon;
                const isChecked = selectedIds.includes(service.id);

                return (
                  <label
                    key={service.id}
                    onClick={() => toggleSelection(service.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer select-none transition-all",
                      isChecked
                        ? "bg-amber-50 border-amber-300 text-amber-950 font-semibold"
                        : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isChecked ? "text-amber-700" : "text-neutral-500"
                        )}
                      />
                      <span>{service.name}</span>
                    </div>

                    <div className="shrink-0">
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-center text-[11px] text-neutral-500 py-3">
                All services are currently disabled.
              </p>
            )}
          </div>

          {/* Dynamic Arrow Action Button (appears when 1 or more are selected) */}
          {selectedIds.length > 0 && (
            <div className="pt-1.5 border-t border-[var(--border-light)] animate-in fade-in-0 duration-150">
              <button
                type="button"
                onClick={handleArrowClick}
                className="w-full h-8 px-3 rounded-md bg-[var(--brand-primary)] hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer group"
              >
                <span>Disable ({selectedIds.length}) Selected</span>
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONFIRMATION VIEW: CLEAN & PROFESSIONAL                                */}
      {/* ========================================================================= */}
      {viewMode === "confirmation" && (
        <div className="p-3.5 space-y-3 animate-in fade-in-0 zoom-in-98 duration-150">
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-neutral-900 leading-snug">
              Are you sure you want to disable service(s)?
            </h5>
            <p className="text-[11px] text-neutral-500 leading-normal">
              This will restrict <span className="font-medium text-neutral-900">{selectedServiceNames}</span> for{" "}
              <span className="font-medium text-neutral-900">{studentName}</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleCancelConfirmation}
              className="px-2.5 py-1 rounded-[4px] border border-neutral-300 bg-white hover:bg-neutral-50 text-[11px] font-medium text-neutral-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDisable}
              className="px-3 py-1 rounded-[4px] bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
            >
              Yes, Disable
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
