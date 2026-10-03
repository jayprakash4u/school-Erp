"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  description,
  className,
}: SwitchProps) {
  const id = React.useId();

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <label htmlFor={id} className="flex flex-col cursor-pointer text-left">
          {label && (
            <span
              className={cn(
                "text-sm font-medium leading-none text-[var(--text-primary)]",
                disabled && "opacity-50"
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-[var(--text-tertiary)] mt-1">{description}</span>
          )}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2",
          checked ? "bg-[var(--brand-primary)]" : "bg-[var(--neutral-300)]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
