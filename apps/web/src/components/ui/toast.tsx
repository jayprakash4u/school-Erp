"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Viewport at z-toast (1500) */}
      <div className="fixed bottom-4 right-4 z-[1500] flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-[var(--bg-primary)] border shadow-lg transition-all duration-200 ease-out",
                t.type === "success" && "border-[var(--success-500)] text-[var(--success-700)]",
                t.type === "error" && "border-[var(--error-600)] text-[var(--error-700)]",
                t.type === "warning" && "border-[var(--warning-500)] text-[var(--warning-700)]",
                t.type === "info" && "border-[var(--info-500)] text-[var(--info-700)]"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-normal">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded text-[var(--neutral-400)] hover:text-[var(--neutral-700)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
