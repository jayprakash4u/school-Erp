import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile, UserRole } from "@/types/auth";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  activeSchoolId: string | null;
  activeAcademicYear: string;

  // Actions
  setAuth: (payload: { user: UserProfile; token: string; refreshToken?: string }) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  switchSchool: (schoolId: string) => void;
  setAcademicYear: (year: string) => void;
  logout: () => void;

  // Selectors / Helpers
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      activeSchoolId: null,
      activeAcademicYear: "2026-2027",

      setAuth: ({ user, token, refreshToken }) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("erp_token", token);
          if (user.schoolId) {
            localStorage.setItem("erp_school_id", user.schoolId);
          }
        }
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          activeSchoolId: user.schoolId || null,
        });
      },

      updateUser: (partialUser) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, ...partialUser } });
      },

      switchSchool: (schoolId) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("erp_school_id", schoolId);
        }
        set({ activeSchoolId: schoolId });
      },

      setAcademicYear: (activeAcademicYear) => {
        set({ activeAcademicYear });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("erp_token");
          localStorage.removeItem("erp_school_id");
          sessionStorage.clear();
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          activeSchoolId: null,
        });
      },

      hasRole: (roles) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        if (currentUser.role === "SUPER_ADMIN") return true;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(currentUser.role);
      },

      hasPermission: (permission) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        if (currentUser.role === "SUPER_ADMIN") return true;
        return currentUser.permissions?.includes(permission) ?? false;
      },
    }),
    {
      name: "school_erp_auth_state",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        activeSchoolId: state.activeSchoolId,
        activeAcademicYear: state.activeAcademicYear,
      }),
    }
  )
);
