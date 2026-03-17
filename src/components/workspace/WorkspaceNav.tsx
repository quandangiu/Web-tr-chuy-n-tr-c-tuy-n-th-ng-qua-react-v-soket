import React from 'react';
import clsx from 'clsx';
import { Plus, Zap, CheckCheck, BellOff, UserPlus, Settings, LogOut, Trash2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { ContextMenu } from '../ui/ContextMenu';
import type { Workspace } from '../../types/workspace.types';
import type { ContextMenuItem } from '../ui/ContextMenu';
import { workspaceService } from '../../services/workspace.service';
import { useWorkspaceStore } from '../../store/workspaceStore';
import toast from 'react-hot-toast';

interface WorkspaceNavProps {
  workspaces: Workspace[];
  current: Workspace | null;
  onSelect: (ws: Workspace) => void;
}

// Unique gradient pairs for each workspace
const GRADIENT_PAIRS = [
  { from: '#06b6d4', to: '#3b82f6' },   // cyan → blue
  { from: '#10b981', to: '#059669' },   // emerald → green
  { from: '#f59e0b', to: '#ef4444' },   // amber → red
  { from: '#8b5cf6', to: '#ec4899' },   // violet → pink
  { from: '#14b8a6', to: '#6366f1' },   // teal → indigo
  { from: '#f97316', to: '#eab308' },   // orange → yellow
  { from: '#ec4899', to: '#8b5cf6' },   // pink → violet
  { from: '#3b82f6', to: '#06b6d4' },   // blue → cyan
  { from: '#22c55e', to: '#14b8a6' },   // green → teal
  { from: '#ef4444', to: '#f97316' },   // red → orange
];

// Decorative shapes per workspace for visual uniqueness
const DECO_PATTERNS = ['●', '◆', '▲', '★', '◐', '✦', '⬡', '◉', '▣', '⬟'];

function getWorkspaceGradient(name: string): { from: string; to: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PAIRS[Math.abs(hash) % GRADIENT_PAIRS.length];
}

function getDecoPattern(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 3) - hash);
  }
  return DECO_PATTERNS[Math.abs(hash) % DECO_PATTERNS.length];
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getShortName(name: string): string {
  if (name.length <= 4) return name;
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return words.map(w => w[0]).join('').toUpperCase().slice(0, 3);
  return name.slice(0, 4);
}

/** Build context menu items for a workspace */
function getWorkspaceMenuItems(ws: Workspace, currentUserId: string | undefined, onOpenSettings?: () => void): ContextMenuItem[] {
  const isOwner = ws.owner === currentUserId ||
    ws.members?.some(m => {
      const uid = typeof m.user === 'string' ? m.user : m.user?._id;
      return uid === currentUserId && m.role === 'owner';
    });

  return [
    {
      label: 'Đánh dấu đã đọc',
      icon: <CheckCheck size={14} />,
      onClick: () => toast.success('Đã đánh dấu tất cả đã đọc'),
    },
    {
      label: 'Tắt thông báo',
      icon: <BellOff size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      separator: true,
    },
    {
      label: 'Mời bạn bè',
      icon: <UserPlus size={14} />,
      onClick: () => {
        const code = ws.inviteCode || 'N/A';
        const link = `${window.location.origin}/invite/${code}`;
        navigator.clipboard.writeText(link);
        toast.success('Đã sao chép link mời!');
      },
    },
    {
      label: 'Chỉnh sửa workspace',
      icon: <Settings size={14} />,
      onClick: onOpenSettings || (() => toast('Tính năng sắp ra mắt!', { icon: '🔜' })),
      separator: true,
      hidden: !isOwner,
    },
    {
      label: 'Rời workspace',
      icon: <LogOut size={14} />,
      danger: true,
      hidden: !!isOwner,
      onClick: async () => {
        if (!currentUserId) return;
        if (!confirm(`Bạn có chắc muốn rời "${ws.name}"?`)) return;
        try {
          await workspaceService.removeMember(ws._id, currentUserId);
          useWorkspaceStore.getState().removeWorkspace(ws._id);
          toast.success(`Đã rời ${ws.name}`);
        } catch {
          toast.error('Không thể rời workspace');
        }
      },
    },
    {
      label: 'Xóa workspace',
      icon: <Trash2 size={14} />,
      danger: true,
      hidden: !isOwner,
      onClick: async () => {
        if (!confirm(`Bạn có chắc muốn XÓA "${ws.name}"? Hành động này không thể hoàn tác!`)) return;
        try {
          await workspaceService.delete(ws._id);
          useWorkspaceStore.getState().removeWorkspace(ws._id);
          toast.success(`Đã xóa ${ws.name}`);
        } catch {
          toast.error('Không thể xóa workspace');
        }
      },
    },
  ];
}

/**
 * Vertical workspace navigation rail (78px wide)
 * Each workspace has unique gradient + decorative shape + name label
 */
export const WorkspaceNav: React.FC<WorkspaceNavProps> = ({
  workspaces,
  current,
  onSelect,
}) => {
  const setCreateWorkspaceModal = useUIStore((s) => s.setCreateWorkspaceModal);
  const setWorkspaceSettingsModal = useUIStore((s) => s.setWorkspaceSettingsModal);
  const currentUserId = useAuthStore((s) => s.user?._id);

  return (
    <nav className="w-[78px] bg-gradient-to-b from-blue-50 to-blue-100/80 dark:from-[#0a1628] dark:to-[#0d1f38] flex flex-col items-center py-3 gap-3 flex-shrink-0 border-r border-blue-100/50 dark:border-[#1a3050]/50 overflow-y-auto scrollbar-hide">
      {/* Home / Logo button */}
      <div className="group relative flex flex-col items-center">
        <button
          className={clsx(
            'w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white transition-all duration-300',
            'bg-gradient-to-br from-primary to-accent shadow-lg',
            'hover:shadow-primary/40 hover:scale-105 hover:rounded-xl',
            !current && 'ring-2 ring-primary/60 ring-offset-2 ring-offset-blue-50 dark:ring-offset-[#0a1628] scale-105 rounded-xl'
          )}
          title="Home"
        >
          <Zap size={24} />
        </button>

        {/* Tooltip */}
        <div className="pointer-events-none absolute left-full ml-4 px-3 py-1.5 bg-[#152238] text-white text-sm font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
          Home
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#152238]" />
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-blue-300 dark:via-[#2a4a6b] to-transparent rounded-full" />

      {/* Workspace icons */}
      {workspaces.map((ws) => {
        const isActive = current?._id === ws._id;
        const gradient = getWorkspaceGradient(ws.name);
        const initials = getInitials(ws.name);
        const shortName = getShortName(ws.name);
        const decoPattern = getDecoPattern(ws.name);
        const avatarUrl = (ws as any).avatar as string | undefined;

        return (
          <ContextMenu
            key={ws._id}
            items={getWorkspaceMenuItems(ws, currentUserId, () => setWorkspaceSettingsModal(true))}
          >
            <div className="group relative flex flex-col items-center">
              {/* Workspace icon with unique gradient */}
              <div className="relative">
                {/* Active glow ring */}
                {isActive && (
                  <div
                    className="absolute -inset-[3px] rounded-2xl opacity-60 blur-[1px] animate-pulse"
                    style={{
                      background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                    }}
                  />
                )}

                <button
                  onClick={() => onSelect(ws)}
                  title={ws.name}
                  className={clsx(
                    'relative w-[52px] h-[52px] flex items-center justify-center transition-all duration-300 overflow-hidden',
                    isActive
                      ? 'rounded-xl scale-105 shadow-lg'
                      : 'rounded-2xl hover:rounded-xl hover:scale-105 hover:shadow-lg shadow-sm'
                  )}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={ws.name} className="w-full h-full object-cover" />
                  ) : ws.icon ? (
                    <span
                      className="w-full h-full flex items-center justify-center text-xl"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                          : undefined,
                        color: isActive ? '#fff' : undefined,
                      }}
                    >
                      <span
                        className={clsx(
                          'w-full h-full flex items-center justify-center',
                          !isActive && 'bg-white dark:bg-[#152238] text-gray-700 dark:text-gray-200 group-hover:text-white'
                        )}
                      >
                        {ws.icon}
                      </span>
                    </span>
                  ) : (
                    <span
                      className="w-full h-full flex flex-col items-center justify-center text-white select-none relative"
                      style={{
                        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                      }}
                    >
                      {/* Decorative pattern */}
                      <span className="absolute top-0.5 right-1 text-[8px] opacity-40 select-none">
                        {decoPattern}
                      </span>
                      <span className="font-bold text-sm tracking-wide drop-shadow-sm">{initials}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Name label below icon */}
              <span
                className={clsx(
                  'mt-0.5 text-[9px] font-medium leading-tight text-center max-w-[56px] truncate transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-300'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                )}
              >
                {shortName}
              </span>

              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full ml-4 top-2 px-3 py-1.5 bg-[#152238] text-white text-sm font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                {ws.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#152238]" />
              </div>
            </div>
          </ContextMenu>
        );
      })}

      {/* Add workspace button */}
      <div className="group relative flex flex-col items-center pt-1">
        <button
          onClick={() => setCreateWorkspaceModal(true)}
          className="w-[52px] h-[52px] bg-transparent border-2 border-dashed border-blue-300 dark:border-[#2a4a6b] rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary text-gray-400 dark:text-sidebar-muted transition-all duration-300 hover:bg-blue-50/50 dark:hover:bg-[#152238]/50 hover:rounded-xl hover:scale-105"
          title="Tạo workspace mới"
        >
          <Plus size={22} />
        </button>
        <span className="mt-0.5 text-[9px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">
          Thêm
        </span>
        <div className="pointer-events-none absolute left-full ml-4 top-2 px-3 py-1.5 bg-[#152238] text-white text-sm font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
          Thêm workspace
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#152238]" />
        </div>
      </div>
    </nav>
  );
};
