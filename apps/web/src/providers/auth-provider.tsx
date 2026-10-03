"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  React.useEffect(() => {
    // Listen for unauthorized 401 events emitted from the API client
    const handleUnauthorized = () => {
      logout();
      if (pathname !== ROUTES.LOGIN) {
        router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    window.addEventListener("erp:unauthorized", handleUnauthorized);

    // Multi-tab storage sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "erp_token" && !e.newValue) {
        logout();
        if (pathname !== ROUTES.LOGIN) {
          router.push(ROUTES.LOGIN);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("erp:unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout, router, pathname]);

  return <>{children}</>;
}
