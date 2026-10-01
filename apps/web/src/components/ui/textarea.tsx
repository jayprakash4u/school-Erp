import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLength,
      showCount,
      id,
      disabled,
      value,
      defaultValue,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const [charCount, setCharCount] = React.useState<number>(
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
        ? defaultValue.length
        : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) onChange(e);
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
            >
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {charCount} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm rounded-md transition-colors resize-y min-h-[80px]",
            "bg-[var(--form-bg)] text-[var(--form-text)] placeholder:text-[var(--form-placeholder)]",
            "border border-[var(--form-border)] hover:border-[var(--form-hover-border)]",
            "focus:outline-none focus:border-[var(--form-focus-border)] focus:ring-3 focus:ring-[var(--form-focus-ring)]",
            disabled &&
              "bg-[var(--form-disabled-bg)] border-[var(--form-disabled-border)] text-[var(--form-disabled-text)] cursor-not-allowed",
            error &&
              "border-[var(--form-error-border)] bg-[var(--form-error-bg)] text-[var(--form-error-text)]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-[var(--form-error-text)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--text-tertiary)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
