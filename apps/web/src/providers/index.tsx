"use client";

import * as React from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "@/components/ui/toast";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Root Application Providers Wrapper
 * Composes QueryClient, Auth State, and Toast Notification context.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
