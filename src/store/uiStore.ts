import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  createWorkspaceModalOpen: boolean;
  workspaceSettingsModalOpen: boolean;
  createChannelModalOpen: boolean;
  editChannelModalOpen: boolean;
  editingChannelId: string | null;
  taskPanelOpen: boolean;
  chatPanelOpen: boolean;
  taskPanelWidth: number;
  videoCallModalOpen: boolean;
  lightboxUrl: string | null;
  theme: 'dark' | 'light';

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setCreateWorkspaceModal: (open: boolean) => void;
  setWorkspaceSettingsModal: (open: boolean) => void;
  setCreateChannelModal: (open: boolean) => void;
  setEditChannelModal: (open: boolean, channelId?: string) => void;
  toggleTaskPanel: () => void;
  toggleChatPanel: () => void;
  setTaskPanelOpen: (open: boolean) => void;
  setChatPanelOpen: (open: boolean) => void;
  setTaskPanelWidth: (width: number) => void;
  setVideoCallModal: (open: boolean) => void;
  setLightboxUrl: (url: string | null) => void;
  toggleTheme: () => void;
}

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_TASK_PANEL_WIDTH = 320;
const MAX_TASK_PANEL_WIDTH = 980;
const DEFAULT_TASK_PANEL_WIDTH = 380;

export { MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH, DEFAULT_SIDEBAR_WIDTH };
export { MIN_TASK_PANEL_WIDTH, MAX_TASK_PANEL_WIDTH, DEFAULT_TASK_PANEL_WIDTH };

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  createWorkspaceModalOpen: false,
  workspaceSettingsModalOpen: false,
  createChannelModalOpen: false,
  editChannelModalOpen: false,
  editingChannelId: null,
  taskPanelOpen: true,
  chatPanelOpen: true,
  taskPanelWidth: DEFAULT_TASK_PANEL_WIDTH,
  videoCallModalOpen: false,
  lightboxUrl: null,
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width)) }),
  setCreateWorkspaceModal: (open) => set({ createWorkspaceModalOpen: open }),
  setWorkspaceSettingsModal: (open) => set({ workspaceSettingsModalOpen: open }),
  setCreateChannelModal: (open) => set({ createChannelModalOpen: open }),
  setEditChannelModal: (open, channelId) => set({ editChannelModalOpen: open, editingChannelId: channelId || null }),
  toggleTaskPanel: () => set((s) => ({ taskPanelOpen: !s.taskPanelOpen })),
  toggleChatPanel: () => set((s) => ({ chatPanelOpen: !s.chatPanelOpen })),
  setTaskPanelOpen: (open) => set({ taskPanelOpen: open }),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  setTaskPanelWidth: (width) => set({ taskPanelWidth: Math.max(MIN_TASK_PANEL_WIDTH, Math.min(MAX_TASK_PANEL_WIDTH, width)) }),
  setVideoCallModal: (open) => set({ videoCallModalOpen: open }),
  setLightboxUrl: (url) => set({ lightboxUrl: url }),
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}));
