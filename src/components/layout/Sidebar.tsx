import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { ChannelList } from '../channel/ChannelList';
import { CreateWorkspaceModal } from '../workspace/CreateWorkspaceModal';
import { WorkspaceSettingsModal } from '../workspace/WorkspaceSettingsModal';
import { CreateChannelModal } from '../channel/CreateChannelModal';
import { EditChannelModal } from '../channel/EditChannelModal';
import { Avatar } from '../ui/Avatar';
import { VoiceChannelBar } from '../voice/VoiceChannelBar';
import { Mic, Headphones, Settings } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { disconnectSocket } from '../../socket/socket';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { current } = useWorkspaceStore();
  const { setCreateChannelModal } = useUIStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    disconnectSocket();
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col bg-blue-50/50 dark:bg-sidebar-dark border-r border-blue-100 dark:border-[#243a54] relative overflow-hidden">
      {/* Ambient background effects (dark mode only) */}
      <div className="absolute inset-0 pointer-events-none dark:block hidden">
        <div className="sidebar-ambient-orb-1 absolute top-20 -left-10 w-32 h-32 bg-blue-500/[0.04] rounded-full blur-3xl" />
        <div className="sidebar-ambient-orb-2 absolute bottom-40 -right-10 w-28 h-28 bg-cyan-500/[0.04] rounded-full blur-3xl" />
        <div className="sidebar-ambient-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Workspace name banner */}
      <div 
        className="relative h-11 px-4 flex items-center justify-between border-b border-blue-100/50 dark:border-white/[0.06] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
        onClick={() => current && useUIStore.getState().setWorkspaceSettingsModal(true)}
      >
        <h1 className="font-bold truncate text-gray-800 dark:text-white text-sm tracking-wide">
          {current?.name || 'Select Workspace'}
        </h1>
        {current && <Settings size={14} className="text-gray-500" />}
      </div>

      {/* Channel list */}
      <div className="relative flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {current && (
          <ChannelList
            workspaceId={current._id}
            workspaceSlug={current.slug}
          />
        )}
      </div>

      {/* Voice channel bar — xuất hiện khi đang ở trong voice channel */}
      <VoiceChannelBar />

      {/* User panel */}
      <div className="relative h-[52px] bg-blue-50 dark:bg-[#070e1a] flex items-center px-2 space-x-2 border-t border-blue-100 dark:border-white/[0.06]">
        <div className="relative group cursor-pointer" onClick={handleLogout} title="Click to logout">
          <Avatar
            src={user?.avatar}
            name={user?.displayName || user?.username || '?'}
            size="sm"
            isOnline={true}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user?.displayName || user?.username}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Online
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-[#1e3250] rounded-lg text-gray-500 dark:text-sidebar-muted hover:text-primary transition-colors" title="Mic">
            <Mic size={16} />
          </button>
          <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-[#1e3250] rounded-lg text-gray-500 dark:text-sidebar-muted hover:text-primary transition-colors" title="Headset">
            <Headphones size={16} />
          </button>
          <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-[#1e3250] rounded-lg text-gray-500 dark:text-sidebar-muted hover:text-primary transition-colors" title="Settings">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateWorkspaceModal />
      <WorkspaceSettingsModal />
      <CreateChannelModal />
      <EditChannelModal />
    </div>
  );
};
