import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--action-primary-default)] text-[var(--action-primary-text)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-active)] disabled:bg-[var(--action-primary-disabled)]",
        secondary:
          "bg-[var(--action-secondary-default)] text-[var(--action-secondary-text)] border border-[var(--action-secondary-border)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-active)]",
        destructive:
          "bg-[var(--action-destructive-default)] text-[var(--action-destructive-text)] hover:bg-[var(--action-destructive-hover)] active:bg-[var(--action-destructive-active)]",
        ghost:
          "bg-transparent text-[var(--action-ghost-text)] hover:bg-[var(--action-ghost-hover)] active:bg-[var(--action-ghost-active)]",
        link:
          "bg-transparent text-[var(--link-default)] hover:text-[var(--link-hover)] hover:underline p-0 h-auto font-normal",
        outline:
          "bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-11 px-6 text-base rounded-md",
        icon: "h-9 w-9 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
