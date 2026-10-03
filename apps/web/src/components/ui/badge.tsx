import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        active: "bg-[var(--badge-active-bg)] text-[var(--badge-active-text)]",
        inactive: "bg-[var(--badge-inactive-bg)] text-[var(--badge-inactive-text)]",
        pending: "bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)]",
        suspended: "bg-[var(--badge-suspended-bg)] text-[var(--badge-suspended-text)]",
        brand: "bg-[var(--red-50)] text-[var(--brand-primary)] border border-[var(--red-200)]",
        info: "bg-[var(--info-100)] text-[var(--info-700)]",
        warning: "bg-[var(--warning-100)] text-[var(--warning-700)]",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "active",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-[var(--success-600)]": variant === "active",
            "bg-[var(--neutral-500)]": variant === "inactive",
            "bg-[var(--warning-600)]": variant === "pending",
            "bg-[var(--error-600)]": variant === "suspended" || variant === "brand",
            "bg-[var(--info-600)]": variant === "info",
          })}
        />
      )}
      {children}
    </span>
  );
}
