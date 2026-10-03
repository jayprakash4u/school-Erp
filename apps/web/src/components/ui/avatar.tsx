import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
    xl: "h-14 w-14 text-lg",
  };

  const statusSizeClasses = {
    sm: "h-2 w-2 ring-1",
    md: "h-2.5 w-2.5 ring-2",
    lg: "h-3 w-3 ring-2",
    xl: "h-3.5 w-3.5 ring-2",
  };

  const statusColors = {
    online: "bg-[var(--success-500)]",
    offline: "bg-[var(--neutral-400)]",
    busy: "bg-[var(--error-500)]",
    away: "bg-[var(--warning-500)]",
  };

  return (
    <div className="relative inline-block select-none">
      <div
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-[var(--neutral-900)] text-white font-semibold items-center justify-center border border-[var(--border-default)]",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-white",
            statusSizeClasses[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
