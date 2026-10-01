import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/auth";

/**
 * Enterprise RBAC Permission and Role evaluation hook
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRoleStore = useAuthStore((state) => state.hasRole);
  const hasPermissionStore = useAuthStore((state) => state.hasPermission);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isSchoolAdmin = user?.role === "SCHOOL_ADMIN" || isSuperAdmin;
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";
  const isParent = user?.role === "PARENT";
  const isAccountant = user?.role === "ACCOUNTANT";

  return {
    user,
    isAuthenticated,
    role: user?.role,
    isSuperAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
    isParent,
    isAccountant,
    can: (permission: string) => hasPermissionStore(permission),
    hasRole: (roles: UserRole | UserRole[]) => hasRoleStore(roles),
  };
}
