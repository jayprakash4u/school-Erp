"use client";

import * as React from "react";
import {
  X,
  ShieldAlert,
  Coins,
  FileSpreadsheet,
  Library,
  Bus,
  Bed,
  UserX,
  Check,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceRestrictionOption {
  id: string;
  name: string;
  department: string;
  departmentNepali: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  contactNote: string;
}

export const RESTRICTABLE_SERVICES: ServiceRestrictionOption[] = [
  {
    id: "BILLING",
    name: "Billing & Fee Payment",
    department: "Accounts / Finance Department",
    departmentNepali: "लेखा तथा आर्थिक शाखा",
    icon: Coins,
    description: "Restricts online payment gateway, fee receipt generation, and clearance certificates.",
    contactNote: "Visit Accounts Department (Room 102) for fee dues clearance.",
  },
  {
    id: "EXAMINATION",
    name: "Examinations & Report Cards",
    department: "Examination Department",
    departmentNepali: "परीक्षा नियन्त्रण शाखा",
    icon: FileSpreadsheet,
    description: "Restricts admit card download, exam schedule viewing, and online terminal marksheet.",
    contactNote: "Visit Examination Controller Office for admit card & exam clearance.",
  },
  {
    id: "LIBRARY",
    name: "Library Services",
    department: "Central Library Office",
    departmentNepali: "केन्द्रीय पुस्तकालय",
    icon: Library,
    description: "Blocks new book issuance, digital e-book vault access, and self-renewal.",
    contactNote: "Visit Central Library for overdue book return or fine clearance.",
  },
  {
    id: "TRANSPORT",
    name: "Transport / Bus Service",
    department: "Transport & Logistics Department",
    departmentNepali: "यातायात तथा सवारी शाखा",
    icon: Bus,
    description: "Suspends digital bus pass validity and live GPS fleet tracking for this student.",
    contactNote: "Contact Transport Coordinator (Gate 2) for route & pass renewal.",
  },
  {
    id: "HOSTEL",
    name: "Hostel & Mess Facility",
    department: "Hostel Administration & Warden",
    departmentNepali: "छात्रावास प्रशासन तथा वार्डेन",
    icon: Bed,
    description: "Restricts mess pass, night-out leave gatepass request, and room service.",
    contactNote: "Report to Hostel Chief Warden Office (Block A).",
  },
  {
    id: "PORTAL_LOGIN",
    name: "Complete Student Portal Access",
    department: "Main Administration & Principal Office",
    departmentNepali: "मुख्य प्रशासन तथा प्रधानाध्यापक शाखा",
    icon: UserX,
    description: "Completely blocks student/parent dashboard login session.",
    contactNote: "Visit School Administration Desk (Reception Block) for account reinstatement.",
  },
];

interface StudentServiceDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    fullName: string;
    rollNumber: string;
    class: string;
    admissionNumber: string;
    disabledServices?: string[];
    disabledReason?: string;
  };
  onSaveRestrictions: (studentId: string, selectedServices: string[], reason: string) => void;
}

export function StudentServiceDisableModal({
  isOpen,
  onClose,
  student,
  onSaveRestrictions,
}: StudentServiceDisableModalProps) {
  const [selectedServices, setSelectedServices] = React.useState<string[]>(() => {
    return student.disabledServices || [];
  });
  const [reason, setReason] = React.useState<string>(student.disabledReason || "");

  React.useEffect(() => {
    if (isOpen) {
      setSelectedServices(student.disabledServices || []);
      setReason(student.disabledReason || "");
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      if (id === "PORTAL_LOGIN") {
        // If selecting complete portal login, select all or just toggle
        if (prev.includes("PORTAL_LOGIN")) {
          return prev.filter((s) => s !== "PORTAL_LOGIN");
        } else {
          return [...prev, "PORTAL_LOGIN"];
        }
      }
      return prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedServices.length === RESTRICTABLE_SERVICES.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(RESTRICTABLE_SERVICES.map((s) => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRestrictions(student.id, selectedServices, reason);
    onClose();
  };

  const isAllSelected = selectedServices.length === RESTRICTABLE_SERVICES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in-0 duration-150">
      <div className="bg-white rounded-lg border border-[var(--border-default)] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-secondary)]/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Restrict Student Services / Features
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[var(--neutral-100)] text-[var(--neutral-700)] border border-[var(--border-light)]">
                  {student.admissionNumber}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Target: <strong className="text-neutral-800">{student.fullName}</strong> (Roll: {student.rollNumber}, {student.class})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Workflow Explanation Alert */}
          <div className="p-3 rounded-[6px] bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="h-4 w-4 text-amber-700 shrink-0" />
              <span>How Granular Service Disablement Works:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800 pl-5">
              Restricted features will remain visible in the Student Panel navigation, but when the student opens the page, an official restriction screen will prompt them to: <strong className="text-amber-950 font-bold">&ldquo;Please visit the Department to resolve this issue&rdquo;</strong>.
            </p>
          </div>

          {/* Quick Toggle All Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Select Services to Disable ({selectedServices.length} selected)
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              {isAllSelected ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Select All Services</span>
                </>
              )}
            </button>
          </div>

          {/* Services Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RESTRICTABLE_SERVICES.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedServices.includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all cursor-pointer select-none flex flex-col justify-between gap-2 relative",
                    isSelected
                      ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/50 shadow-2xs"
                      : "bg-white border-[var(--border-default)] hover:border-neutral-300 hover:bg-neutral-50/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "p-2 rounded-md shrink-0 transition-colors",
                          isSelected
                            ? "bg-amber-100 text-amber-800"
                            : "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            {service.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--brand-primary)] font-medium block">
                          Dept: {service.department}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-amber-700" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-600 leading-normal line-clamp-2">
                    {service.description}
                  </p>

                  <div className="pt-1 border-t border-neutral-100 text-[10px] text-neutral-500 italic">
                    Prompt: &ldquo;{service.contactNote}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reason / Administrative Note */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
              <span>Reason / Note for Restriction (Internal & Student Notice)</span>
              <span className="text-[10px] font-normal text-neutral-400">Optional</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 2nd Term Fee default clearance required / Library book overdue / Disciplinary review pending"
              rows={2}
              className="w-full px-3 py-2 text-xs bg-white border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--brand-primary)] shadow-inner transition-colors resize-none placeholder:text-neutral-400"
            />
          </div>

          {/* Footer Actions inside form */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
            <button
              type="button"
              onClick={() => {
                setSelectedServices([]);
                setReason("");
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
            >
              Reset to Active (Clear All)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-[4px] border border-[var(--border-default)] text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(
                  "px-4 py-1.5 rounded-[4px] text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5",
                  selectedServices.length > 0
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                <Check className="h-3.5 w-3.5" />
                <span>
                  {selectedServices.length > 0
                    ? `Save ${selectedServices.length} Restriction(s)`
                    : "Save (Fully Active)"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
