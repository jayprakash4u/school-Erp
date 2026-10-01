import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number; disabled?: boolean }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, disabled, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            disabled={disabled}
            ref={ref}
            className={cn(
              "w-full h-10 px-3.5 pr-10 text-sm rounded-md appearance-none transition-colors cursor-pointer",
              "bg-[var(--form-bg)] text-[var(--form-text)]",
              "border border-[var(--form-border)] hover:border-[var(--form-hover-border)]",
              "focus:outline-none focus:border-[var(--form-focus-border)] focus:ring-3 focus:ring-[var(--form-focus-ring)]",
              disabled && "bg-[var(--form-disabled-bg)] border-[var(--form-disabled-border)] text-[var(--form-disabled-text)] cursor-not-allowed",
              error && "border-[var(--form-error-border)] bg-[var(--form-error-bg)] text-[var(--form-error-text)]",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 h-4 w-4 pointer-events-none text-[var(--neutral-400)]" />
        </div>
        {error ? (
          <p className="text-xs text-[var(--form-error-text)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--text-tertiary)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
