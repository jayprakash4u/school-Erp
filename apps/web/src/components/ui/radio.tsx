"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  direction?: "horizontal" | "vertical";
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  direction = "vertical",
  className,
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = React.useState<string>(
    value || defaultValue || (options[0]?.value ?? "")
  );

  const groupName = name || React.useId();
  const selectedValue = value !== undefined ? value : internalValue;

  const handleSelect = (val: string) => {
    setInternalValue(val);
    if (onChange) onChange(val);
  };

  return (
    <div className={cn("flex flex-col gap-2 select-none", className)}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex gap-4",
          direction === "vertical" ? "flex-col gap-2.5" : "flex-row flex-wrap items-center"
        )}
      >
        {options.map((option) => {
          const isChecked = selectedValue === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-2.5 cursor-pointer",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isChecked}
                  disabled={option.disabled}
                  onChange={() => handleSelect(option.value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border transition-colors flex items-center justify-center",
                    "border-[var(--neutral-400)] bg-[var(--form-bg)]",
                    isChecked && "border-[var(--brand-primary)] bg-[var(--form-bg)]"
                  )}
                >
                  {isChecked && (
                    <div className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                  )}
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-[var(--form-error-text)] font-medium">{error}</p>}
    </div>
  );
}
