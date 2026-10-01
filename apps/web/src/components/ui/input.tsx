import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--neutral-400)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            disabled={disabled}
            ref={ref}
            className={cn(
              "w-full h-10 px-3.5 text-sm rounded-md transition-colors",
              "bg-[var(--form-bg)] text-[var(--form-text)] placeholder:text-[var(--form-placeholder)]",
              "border border-[var(--form-border)] hover:border-[var(--form-hover-border)]",
              "focus:outline-none focus:border-[var(--form-focus-border)]",
              disabled && "bg-[var(--form-disabled-bg)] border-[var(--form-disabled-border)] text-[var(--form-disabled-text)] cursor-not-allowed",
              error && "border-[var(--form-error-border)] bg-[var(--form-error-bg)] text-[var(--form-error-text)]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[var(--neutral-400)]">
              {rightIcon}
            </div>
          )}
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
Input.displayName = "Input";
