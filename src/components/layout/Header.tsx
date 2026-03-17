import React, { useEffect, useState } from 'react';
import { useChannelStore } from '../../store/channelStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUIStore } from '../../store/uiStore';
import { ChannelMembersModal } from '../channel/ChannelMembersModal';
import {
  Hash,
  Lock,
  AtSign,
  Phone,
  Bell,
  Users,
  Search,
  ListTodo,
  MessageSquare,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { taskService } from '../../services/task.service';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

/**
 * Header with sidebar toggle, # channel name, description, action buttons, search
 */
export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  
  const currentChannel = useChannelStore((s) => s.current);
  const currentWorkspace = useWorkspaceStore((s) => s.current);
  const { setVideoCallModal, theme, toggleTheme, taskPanelOpen, toggleTaskPanel, chatPanelOpen, toggleChatPanel } = useUIStore();

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      try {
        const summary = await taskService.getMySummary(currentWorkspace?._id, currentChannel?._id);
        if (!active) return;
        setPendingCount(summary.pendingCount || 0);
        setOverdueCount(summary.overdueCount || 0);
      } catch {
        if (!active) return;
        setPendingCount(0);
        setOverdueCount(0);
      }
    };

    loadSummary();
    const timer = setInterval(loadSummary, 30000);
    const onRefresh = () => {
      void loadSummary();
    };
    window.addEventListener('task-summary-refresh', onRefresh as EventListener);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('task-summary-refresh', onRefresh as EventListener);
    };
  }, [currentWorkspace?._id, currentChannel?._id]);

  const menuCount = overdueCount > 0 ? overdueCount : pendingCount;

  const getChannelIcon = () => {
    if (!currentChannel) return null;
    switch (currentChannel.type) {
      case 'public':
        return <span className="text-2xl text-gray-400 dark:text-gray-500 mr-2 font-light">#</span>;
      case 'private':
        return <Lock size={18} className="text-gray-400 dark:text-gray-500 mr-2" />;
      case 'dm':
        return <AtSign size={18} className="text-gray-400 dark:text-gray-500 mr-2" />;
    }
  };

  return (
  <>
    <header className="h-12 px-4 flex items-center justify-between border-b border-blue-100 dark:border-[#243a54] shadow-sm flex-shrink-0 bg-white/80 dark:bg-chat-bg/90 backdrop-blur-md">
      {/* Left: Toggle + Channel info */}
      <div className="flex items-center text-gray-800 dark:text-white min-w-0 gap-2">
        {/* Sidebar toggle button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-[#1e3250] rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex-shrink-0"
            title={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        )}
        {currentChannel ? (
          <>
            {getChannelIcon()}
            <h3 className="font-bold mr-3 truncate">{currentChannel.name}</h3>
            {currentChannel.description && (
              <span className="hidden md:block text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-3 truncate">
                {currentChannel.description}
              </span>
            )}
          </>
        ) : currentWorkspace ? (
          <h3 className="font-bold truncate">{currentWorkspace.name}</h3>
        ) : null}
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 flex-shrink-0">
        {currentChannel && (
          <button
            onClick={toggleChatPanel}
            className={`p-1.5 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              chatPanelOpen ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={chatPanelOpen ? 'Ẩn khung chat' : 'Hiện khung chat'}
          >
            <MessageSquare size={18} />
          </button>
        )}
        {currentChannel && (
          <button
            onClick={toggleTaskPanel}
            className={`relative p-1.5 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              taskPanelOpen ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={taskPanelOpen ? 'Ẩn Task Panel' : 'Hiện Task Panel'}
          >
            <ListTodo size={18} />
            {menuCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[16px] text-center font-semibold">
                {menuCount > 99 ? '99+' : menuCount}
              </span>
            )}
          </button>
        )}
        {currentChannel && (
          <button
            onClick={() => setMembersModalOpen(true)}
            className="p-1.5 hover:text-gray-900 dark:hover:text-white transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Gọi điện"
          >
            <Phone size={18} />
          </button>
        )}
        <button
          className="p-1.5 hover:text-gray-900 dark:hover:text-white transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          onClick={() => setMembersModalOpen(true)}
          className="p-1.5 hover:text-gray-900 dark:hover:text-white transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Members"
        >
          <Users size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:text-gray-900 dark:hover:text-white transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Search */}
        <div className="relative ml-2 hidden sm:block">
          <input
            type="text"
            className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-none rounded-md text-sm py-1 pl-2 pr-8 w-36 focus:w-52 transition-all focus:ring-0 focus:outline-none placeholder-gray-500"
            placeholder="Search"
          />
          <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

    </header>

    {/* Members Modal - phải nằm ngoài header */}
    <ChannelMembersModal
      isOpen={membersModalOpen}
      onClose={() => setMembersModalOpen(false)}
    />
  </>
  );
};
