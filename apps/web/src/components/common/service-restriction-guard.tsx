"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RESTRICTABLE_SERVICES } from "@/components/students/student-service-disable-modal";

interface ServiceRestrictionGuardProps {
  serviceId: string;
  studentName?: string;
  customReason?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
  isRestricted?: boolean;
}

export function ServiceRestrictionGuard({
  serviceId,
  studentName,
  customReason,
  onRetry,
  children,
  isRestricted = true,
}: ServiceRestrictionGuardProps) {
  const [isRetrying, setIsRetrying] = React.useState(false);

  if (!isRestricted) {
    return <>{children}</>;
  }

  const serviceMeta = RESTRICTABLE_SERVICES.find((s) => s.id === serviceId) || {
    id: serviceId,
    name: "This Feature / Service",
    department: "Administrative Services Department",
    departmentNepali: "प्रशासनिक सेवा शाखा",
    icon: ShieldAlert,
    description: "Access to this module is temporarily restricted for your account.",
    contactNote: "Please visit the concerned administrative department to clear holds.",
  };

  const Icon = serviceMeta.icon;

  const handleRetryClick = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      onRetry?.();
    }, 800);
  };

  return (
    <div className="w-full min-h-[460px] flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-secondary)] select-none">
      <div className="max-w-xl w-full bg-white rounded-xl border border-[var(--border-default)] shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Top Warning Ribbon */}
        <div className="bg-amber-500 h-1.5 w-full" />

        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Central Department Icon Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-700 shadow-inner">
            <Icon className="h-10 w-10" />
            <div className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow-md">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>

          {/* Restriction Notice Heading */}
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider border border-amber-300/80">
              Module Access Restricted
            </span>
            <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              {serviceMeta.name} is Temporarily On Hold
            </h1>
            <p className="text-sm font-semibold text-red-600">
              Please visit the {serviceMeta.department} to resolve this.
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              ({serviceMeta.departmentNepali}मा सम्पर्क गरी सेवा सुचारु गराउनुहोला।)
            </p>
          </div>

          {/* Department Contact & Guidance Card */}
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200/80 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
              <Building2 className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>Department Resolution Instructions:</span>
            </div>

            <div className="text-xs text-neutral-700 space-y-1.5 pl-6 list-disc">
              <p className="font-medium text-neutral-900">
                {serviceMeta.contactNote}
              </p>
              {customReason && (
                <div className="pt-1.5 mt-1.5 border-t border-neutral-200 text-amber-900 font-medium">
                  <strong>Administrative Remark:</strong> {customReason}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                <span>Location: Admin Block, Desk 4</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                <span>Helpline: +977-1-4455667</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Try Again & Return */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetryClick}
              disabled={isRetrying}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")} />
              <span>{isRetrying ? "Checking Status..." : "Try Again / Recheck Status"}</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Student Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
