import { create } from "zustand";

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  activeModalId: string | null;
  modalPayload: unknown;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openModal: (modalId: string, payload?: unknown) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  isCommandPaletteOpen: false,
  activeModalId: null,
  modalPayload: null,

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (isSidebarCollapsed) =>
    set({ isSidebarCollapsed }),

  setMobileSidebarOpen: (isMobileSidebarOpen) =>
    set({ isMobileSidebarOpen }),

  setCommandPaletteOpen: (isCommandPaletteOpen) =>
    set({ isCommandPaletteOpen }),

  openModal: (activeModalId, modalPayload = null) =>
    set({ activeModalId, modalPayload }),

  closeModal: () =>
    set({ activeModalId: null, modalPayload: null }),
}));
