"use client";

import * as React from "react";
import { FormFieldDef } from "@/types/form-schema";
import { cn } from "@/lib/utils";

interface DynamicFieldRendererProps {
  field: FormFieldDef;
  value: any;
  onChange: (name: string, value: any, type?: string) => void;
  error?: string;
}

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  error,
}: DynamicFieldRendererProps) {
  const { key, label, type, required, placeholder, options, isCustom } = field;

  // Handle standard input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      onChange(key, checked, "checkbox");
    } else {
      onChange(key, e.target.value, type);
    }
  };

  // Checkbox input
  if (type === "checkbox") {
    return (
      <div className="flex items-center gap-2.5 pt-4">
        <input
          type="checkbox"
          id={`field_${key}`}
          name={key}
          checked={Boolean(value)}
          onChange={handleInputChange}
          className="h-4 w-4 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] border-[var(--border-default)]"
        />
        <label
          htmlFor={`field_${key}`}
          className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer select-none"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      </div>
    );
  }

  // Textarea input
  if (type === "textarea") {
    return (
      <div className="space-y-1 col-span-full">
        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-600">*</span>}
          </span>
          {isCustom && (
            <span className="text-[10px] text-purple-600 font-medium">Custom Field</span>
          )}
        </label>
        <textarea
          name={key}
          value={value ?? ""}
          onChange={handleInputChange}
          rows={3}
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          className={cn(
            "w-full p-2.5 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
            error
              ? "border-red-500 bg-red-50/10 focus:border-red-500"
              : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
          )}
        />
        {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      </div>
    );
  }

  // Select dropdown
  if (type === "select") {
    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
          <span className="truncate">
            {label} {required && <span className="text-red-600">*</span>}
          </span>
          {isCustom && (
            <span className="text-[9px] text-purple-600 font-medium shrink-0">Custom</span>
          )}
        </label>
        <select
          name={key}
          value={value ?? ""}
          onChange={handleInputChange}
          className={cn(
            "w-full h-8 px-2 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
            error
              ? "border-red-500 bg-red-50/10 focus:border-red-500"
              : "border-[var(--border-default)] focus:border-[var(--brand-primary)]"
          )}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      </div>
    );
  }

  // Text, Number, Date, Email, Phone
  const inputType =
    type === "number"
      ? "number"
      : type === "date"
      ? "date"
      : type === "email"
      ? "email"
      : type === "phone"
      ? "tel"
      : "text";

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
        <span className="truncate">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        {isCustom && (
          <span className="text-[9px] text-purple-600 font-medium shrink-0">Custom</span>
        )}
      </label>
      <input
        type={inputType}
        name={key}
        value={value ?? ""}
        onChange={handleInputChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={cn(
          "w-full h-8 px-3 text-xs bg-white border rounded-[4px] focus:outline-none transition-colors",
          error
            ? "border-red-500 bg-red-50/10 focus:border-red-500"
            : "border-[var(--border-default)] focus:border-[var(--brand-primary)]",
          (type === "phone" || key.toLowerCase().includes("no") || key.toLowerCase().includes("date")) && "font-mono"
        )}
      />
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
