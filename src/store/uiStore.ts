import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  createWorkspaceModalOpen: boolean;
  createChannelModalOpen: boolean;
  videoCallModalOpen: boolean;
  lightboxUrl: string | null;
  theme: 'dark' | 'light';

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setCreateWorkspaceModal: (open: boolean) => void;
  setCreateChannelModal: (open: boolean) => void;
  setVideoCallModal: (open: boolean) => void;
  setLightboxUrl: (url: string | null) => void;
  toggleTheme: () => void;
}

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 280;

export { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, DEFAULT_SIDEBAR_WIDTH };

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  createWorkspaceModalOpen: false,
  createChannelModalOpen: false,
  videoCallModalOpen: false,
  lightboxUrl: null,
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width)) }),
  setCreateWorkspaceModal: (open) => set({ createWorkspaceModalOpen: open }),
  setCreateChannelModal: (open) => set({ createChannelModalOpen: open }),
  setVideoCallModal: (open) => set({ videoCallModalOpen: open }),
  setLightboxUrl: (url) => set({ lightboxUrl: url }),
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}));
