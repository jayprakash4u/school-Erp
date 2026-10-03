"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, disabled, onChange, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-start gap-2.5 select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded-[4px] border transition-colors flex items-center justify-center cursor-pointer",
              "border-[var(--neutral-400)] bg-[var(--form-bg)]",
              "peer-checked:bg-[var(--brand-primary)] peer-checked:border-[var(--brand-primary)] peer-checked:text-white",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--brand-primary)] peer-focus-visible:ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed bg-[var(--form-disabled-bg)] border-[var(--form-disabled-border)]",
              className
            )}
            onClick={(e) => {
              if (disabled) return;
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              input?.click();
            }}
          >
            {checked && <Check className="h-3 w-3 stroke-[3] text-white" />}
          </div>
        </div>
        {(label || description) && (
          <label htmlFor={checkboxId} className="flex flex-col cursor-pointer text-left">
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
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
