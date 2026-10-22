import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NavigationLayout = "top" | "sidebar";

interface UIState {
  navLayout: NavigationLayout;
  isSidebarCollapsed: boolean;
  isSubmenuCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  activeModalId: string | null;
  modalPayload: unknown;

  // Actions
  setNavLayout: (layout: NavigationLayout) => void;
  toggleNavLayout: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSubmenuCollapsed: () => void;
  setSubmenuCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openModal: (modalId: string, payload?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      navLayout: "top",
      isSidebarCollapsed: false,
      isSubmenuCollapsed: false,
      isMobileSidebarOpen: false,
      isCommandPaletteOpen: false,
      activeModalId: null,
      modalPayload: null,

      setNavLayout: (navLayout) => set({ navLayout }),
      toggleNavLayout: () =>
        set((state) => ({
          navLayout: state.navLayout === "top" ? "sidebar" : "top",
        })),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (isSidebarCollapsed) =>
        set({ isSidebarCollapsed }),
      toggleSubmenuCollapsed: () =>
        set((state) => ({ isSubmenuCollapsed: !state.isSubmenuCollapsed })),
      setSubmenuCollapsed: (isSubmenuCollapsed) =>
        set({ isSubmenuCollapsed }),
      setMobileSidebarOpen: (isMobileSidebarOpen) =>
        set({ isMobileSidebarOpen }),
      setCommandPaletteOpen: (isCommandPaletteOpen) =>
        set({ isCommandPaletteOpen }),
      openModal: (activeModalId, modalPayload = null) =>
        set({ activeModalId, modalPayload }),
      closeModal: () =>
        set({ activeModalId: null, modalPayload: null }),
    }),
    {
      name: "school_erp_ui_pref",
      partialize: (state) => ({
        navLayout: state.navLayout,
        isSidebarCollapsed: state.isSidebarCollapsed,
        isSubmenuCollapsed: state.isSubmenuCollapsed,
      }),
    }
  )
);
