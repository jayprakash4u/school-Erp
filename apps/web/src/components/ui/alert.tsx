import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-md border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        info: "bg-[var(--info-50)] border-[var(--info-500)] text-[var(--info-700)] [&>svg]:text-[var(--info-600)]",
        success:
          "bg-[var(--success-50)] border-[var(--success-500)] text-[var(--success-700)] [&>svg]:text-[var(--success-600)]",
        warning:
          "bg-[var(--warning-50)] border-[var(--warning-500)] text-[var(--warning-700)] [&>svg]:text-[var(--warning-600)]",
        error:
          "bg-[var(--error-50)] border-[var(--error-600)] text-[var(--error-700)] [&>svg]:text-[var(--error-600)]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const Icon = iconMap[variant || "info"];

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        {title && <h5 className="mb-1 font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 p-1 rounded hover:opacity-75 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
