import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChannelStore } from '../store/channelStore';
import { channelService } from '../services/channel.service';
import { joinChannel, leaveChannel } from '../socket/socket';
import { getSocket } from '../socket/socket';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { VideoCallModal } from '../components/video/VideoCallModal';
import { ChannelTaskPanel } from '../components/task/ChannelTaskPanel';
import { MAX_TASK_PANEL_WIDTH, MIN_TASK_PANEL_WIDTH, useUIStore } from '../store/uiStore';
import { useMessages } from '../hooks/useMessages';
import { cacheChannelKey, getChannelKey } from '../utils/encryption';
import type { Attachment } from '../types/message.types';
import { Loader2 } from 'lucide-react';

export const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { current, setCurrent } = useChannelStore();
  const videoCallOpen = useUIStore((s) => s.videoCallModalOpen);
  const taskPanelOpen = useUIStore((s) => s.taskPanelOpen);
  const chatPanelOpen = useUIStore((s) => s.chatPanelOpen);
  const taskPanelWidth = useUIStore((s) => s.taskPanelWidth);
  const setTaskPanelWidth = useUIStore((s) => s.setTaskPanelWidth);
  const dragRef = useRef(false);

  // Load channel info
  useEffect(() => {
    if (!channelId) return;

    const load = async () => {
      try {
        const ch = await channelService.getById(channelId);
        setCurrent(ch);

        // Join socket room
        joinChannel(channelId);

        // Fetch encryption key nếu cần
        if (ch.encryptionEnabled && !getChannelKey(channelId)) {
          try {
            const key = await channelService.getEncryptionKey(channelId);
            cacheChannelKey(channelId, key);
          } catch {
            console.warn('Could not fetch encryption key');
          }
        }

        // Mark as read
        const socket = getSocket();
        socket?.emit('mark_read', { channelId });
      } catch (err) {
        console.error('Failed to load channel:', err);
      }
    };

    load();

    return () => {
      if (channelId) leaveChannel(channelId);
    };
  }, [channelId, setCurrent]);

  if (!channelId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Chọn một channel để bắt đầu chat
      </div>
    );
  }

  const handleSend = async (
    content: string,
    type: 'text' | 'image' | 'file' = 'text',
    attachment?: Attachment,
    replyTo?: string | null
  ) => {
    const socket = getSocket();
    if (!socket) return;

    // Gửi qua socket (realtime) thay vì HTTP để có response nhanh hơn
    socket.emit(
      'send_message',
      {
        channelId,
        content,
        type,
        replyTo: replyTo || null,
        attachment: attachment || undefined,
      },
      (response: { success?: boolean; error?: string }) => {
        if (response?.error) {
          console.error('Send message error:', response.error);
        }
      }
    );
  };

  const handleTaskPanelResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const newWidth = window.innerWidth - ev.clientX;
      setTaskPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      dragRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setTaskPanelWidth]);

  return (
    <div className="flex h-full">
      {chatPanelOpen && (
      <div className="flex flex-col h-full flex-1 min-w-0">
        {/* Message list */}
        <MessageList channelId={channelId} />

        {/* Input */}
        <MessageInput channelId={channelId} onSend={handleSend} />

        {/* Video call modal */}
        {videoCallOpen && <VideoCallModal />}
      </div>
      )}

      {current?.workspace && taskPanelOpen && (
        <div
          className={`hidden xl:flex h-full relative ${chatPanelOpen ? '' : 'flex-1 min-w-0'}`}
          style={{
            width: chatPanelOpen
              ? Math.max(MIN_TASK_PANEL_WIDTH, Math.min(MAX_TASK_PANEL_WIDTH, taskPanelWidth))
              : '100%',
          }}
        >
          {chatPanelOpen && (
            <div
              onMouseDown={handleTaskPanelResizeMouseDown}
              className="absolute left-0 top-0 h-full w-[4px] cursor-col-resize z-20 group"
              title="Kéo để đổi độ rộng Task Panel"
            >
              <div className="h-full w-[2px] bg-transparent group-hover:bg-primary/70 transition-colors" />
            </div>
          )}
          <ChannelTaskPanel
            workspaceId={current.workspace}
            channelId={channelId}
            panelWidth={chatPanelOpen ? taskPanelWidth : MAX_TASK_PANEL_WIDTH}
          />
        </div>
      )}
    </div>
  );
};
