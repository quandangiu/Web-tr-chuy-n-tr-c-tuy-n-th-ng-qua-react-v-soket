import React, { useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { WorkspaceNav } from '../workspace/WorkspaceNav';
import { useUIStore, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { workspaceService } from '../../services/workspace.service';
import { useSocket } from '../../hooks/useSocket';
import { VoiceProvider } from '../../context/VoiceContext';
import clsx from 'clsx';

/**
 * Layout: Single sidebar (workspace switcher + channels) + Main content
 * Sidebar is resizable (drag handle) and collapsible
 */
export const AppLayout: React.FC = () => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useUIStore((s) => s.theme);
  const navigate = useNavigate();
  const { slug } = useParams();
  const { workspaces, current, setWorkspaces, setCurrent } = useWorkspaceStore();

  const isDragging = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Kết nối socket khi vào layout chính
  useSocket();

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Load workspaces
  useEffect(() => {
    const load = async () => {
      try {
        const data = await workspaceService.getAll();
        setWorkspaces(data);
        if (slug) {
          const ws = data.find((w) => w.slug === slug);
          if (ws) setCurrent(ws);
        } else if (data.length > 0 && !current) {
          setCurrent(data[0]);
          navigate(`/workspace/${data[0].slug}`);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      }
    };
    load();
  }, []);

  const handleSelectWorkspace = (ws: typeof current) => {
    if (!ws) return;
    setCurrent(ws);
    navigate(`/workspace/${ws.slug}`);
  };

  // --- Resizable drag logic ---
  const navWidth = 78; // WorkspaceNav fixed width

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      // Subtract the workspace nav width from mouse position
      const newWidth = ev.clientX - navWidth;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setSidebarWidth]);

  // Double-click handle to reset width
  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(280);
  }, [setSidebarWidth]);

  return (
    <VoiceProvider>
      <div className="flex h-screen bg-blue-50 dark:bg-[#0c1929] text-gray-900 dark:text-chat-text overflow-hidden font-body">
        {/* Workspace Nav — vertical rail (fixed 78px) */}
        <WorkspaceNav
          workspaces={workspaces}
          current={current}
          onSelect={handleSelectWorkspace}
        />

        {/* Channel Sidebar — resizable + collapsible */}
        <div
          ref={sidebarRef}
          className={clsx(
            'flex-shrink-0 relative transition-[width] duration-200 overflow-hidden',
            !sidebarOpen && 'w-0'
          )}
          style={sidebarOpen ? { width: sidebarWidth } : undefined}
        >
          <Sidebar />

          {/* Drag handle for resizing */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize z-20 group hover:bg-primary/40 transition-colors"
            title="Kéo để thay đổi kích thước · Double-click để reset"
          >
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[3px] h-8 rounded-full bg-transparent group-hover:bg-primary/60 transition-colors" />
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </VoiceProvider>
  );
};
