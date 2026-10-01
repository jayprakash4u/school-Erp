"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Use useState to ensure the QueryClient is only initialized once per client session
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time default
            gcTime: 5 * 60 * 1000, // 5 minutes cache garbage collection
            refetchOnWindowFocus: false, // Prevents unintended refetches while filling forms
            retry: (failureCount, error) => {
              // Do not retry on client errors (4xx)
              const status = (error as { status?: number })?.status;
              if (status && status >= 400 && status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
