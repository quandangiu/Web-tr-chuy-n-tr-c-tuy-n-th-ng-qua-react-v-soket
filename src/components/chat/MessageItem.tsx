import React, { useState, memo } from 'react';
import type { Message } from '../../types/message.types';
import { Avatar } from '../ui/Avatar';
import { EmojiPicker } from './EmojiPicker';
import { ReadReceipt } from './ReadReceipt';
import { formatMessageTime } from '../../utils/formatDate';
import { thumbnail, getFileIcon, formatFileSize } from '../../utils/cloudinary';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useMessageStore } from '../../store/messageStore';
import { useChannelStore } from '../../store/channelStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { messageService } from '../../services/message.service';
import {
  SmilePlus, MoreHorizontal, Reply, Trash2,
  Edit3, Copy, Pin, Forward, MessageSquare,
  User, AtSign, Ban,
} from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';
import { ContextMenu } from '../ui/ContextMenu';
import type { ContextMenuItem } from '../ui/ContextMenu';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
}

/** Build context menu items for a message */
function getMessageMenuItems(message: Message, isOwn: boolean, canDelete: boolean, onReply: () => void): ContextMenuItem[] {
  return [
    {
      label: 'Trả lời',
      icon: <Reply size={14} />,
      onClick: onReply,
    },
    {
      label: 'React',
      icon: <SmilePlus size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      separator: true,
    },
    {
      label: 'Chỉnh sửa',
      icon: <Edit3 size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: !isOwn,
    },
    {
      label: 'Sao chép nội dung',
      icon: <Copy size={14} />,
      onClick: () => {
        if (message.content) {
          navigator.clipboard.writeText(message.content);
          toast.success('Đã sao chép nội dung!');
        }
      },
    },
    {
      label: 'Ghim tin nhắn',
      icon: <Pin size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
    },
    {
      label: 'Chuyển tiếp',
      icon: <Forward size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
    },
    {
      label: 'Tạo thread',
      icon: <MessageSquare size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      separator: true,
    },
    {
      label: 'Xóa',
      icon: <Trash2 size={14} />,
      danger: true,
      hidden: !canDelete,
      onClick: async () => {
        try {
          await messageService.delete(message._id);
          useMessageStore.getState().deleteMessage(message.channel, message._id);
          toast.success('Đã xóa tin nhắn');
        } catch {
          toast.error('Không thể xóa tin nhắn');
        }
      },
    },
  ];
}

/** Build context menu items for user avatar in chat */
function getUserAvatarMenuItems(message: Message, isOwn: boolean): ContextMenuItem[] {
  return [
    {
      label: 'Xem hồ sơ',
      icon: <User size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
    },
    {
      label: 'Nhắn tin riêng',
      icon: <MessageSquare size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: isOwn,
    },
    {
      label: `Mention @${message.sender.username}`,
      icon: <AtSign size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: isOwn,
      separator: true,
    },
    {
      label: 'Chặn',
      icon: <Ban size={14} />,
      danger: true,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: isOwn,
    },
  ];
}

/**
 * Discord-style message with avatar, hover toolbar, reactions, context menus
 */
export const MessageItem: React.FC<MessageItemProps> = memo(
  ({ message, showAvatar }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const currentUserId = useAuthStore((s) => s.user?._id);
    const setLightboxUrl = useUIStore((s) => s.setLightboxUrl);
    const setReplyingTo = useChannelStore((s) => s.setReplyingTo);
    const currentWorkspace = useWorkspaceStore((s) => s.current);
    const isOwn = message.sender._id === currentUserId;
    const myRole = React.useMemo(() => {
      if (!currentUserId || !currentWorkspace?.members) return 'member';
      const member = currentWorkspace.members.find((m) => {
        if (typeof m.user === 'string') return m.user === currentUserId;
        return m.user?._id === currentUserId;
      });
      return member?.role || 'member';
    }, [currentWorkspace?.members, currentUserId]);
    const canDelete = isOwn || myRole === 'admin' || myRole === 'owner';

    if (message.isDeleted) {
      return (
        <div className="px-4 py-1 text-sm text-gray-400 dark:text-chat-muted italic">
          🗑️ Tin nhắn đã bị xóa
        </div>
      );
    }

    if (message.type === 'system') {
      const isAISupport = message.content.startsWith('[AI Support]');
      const aiBody = isAISupport
        ? message.content.replace(/^\[AI Support\]\s*/i, '').trim()
        : message.content;
      const aiLines = aiBody.split('\n').filter((line, idx, arr) => !(line.trim() === '' && arr[idx - 1]?.trim() === ''));

      return (
        <div className="px-4 py-2 flex items-center justify-center">
          <div className={`max-w-[85%] rounded-2xl px-3 py-2 border ${
            isAISupport
              ? 'bg-gradient-to-br from-cyan-50/95 to-sky-50/85 dark:from-[#14344a] dark:to-[#173a54] text-cyan-900 dark:text-cyan-100 border-cyan-200/80 dark:border-cyan-700/40 shadow-[0_10px_28px_-16px_rgba(34,211,238,0.5)]'
              : 'bg-blue-100/80 dark:bg-[#243a54] text-blue-900 dark:text-blue-100 border-blue-200/80 dark:border-[#2f577d]'
          }`}>
            {isAISupport && (
              <p className="text-[11px] font-semibold tracking-wide opacity-85 mb-1.5">AI Support</p>
            )}
            <div className="text-xs whitespace-pre-wrap break-words leading-relaxed space-y-1">
              {aiLines.map((line, idx) => {
                const isRed = line.trim().startsWith('[RED]');
                const text = isRed ? line.replace(/^\[RED\]/, '') : line;
                const trimmed = text.trim();
                const isHeader = /:$/.test(trimmed) || /^recap/i.test(trimmed);
                const isBullet = /^-\s+/.test(trimmed);
                const cleanText = isBullet ? trimmed.replace(/^-\s+/, '') : text;
                return (
                  <div key={`${message._id}-${idx}`} className={isHeader ? 'pt-0.5' : ''}>
                    <p
                      className={clsx(
                        isRed ? 'text-red-500 dark:text-red-400 font-medium' : 'text-cyan-900/95 dark:text-cyan-100/95',
                        isHeader && 'font-semibold text-[12px] text-cyan-900 dark:text-cyan-100',
                        isBullet && 'pl-3 relative'
                      )}
                    >
                      {isBullet && <span className="absolute left-0 top-0 opacity-70">•</span>}
                      {cleanText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const handleReply = () => {
      setReplyingTo({
        _id: message._id,
        content: message.content,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
        },
      });
    };

    const handleReaction = async (emoji: string) => {
      try {
        const existing = message.reactions[emoji] ?? [];
        const action = existing.includes(currentUserId ?? '') ? 'remove' : 'add';
        await messageService.addReaction(message._id, emoji, action);
      } catch {
        toast.error('Không thể thêm reaction');
      }
      setShowEmojiPicker(false);
    };

    const handleDelete = async () => {
      try {
        await messageService.delete(message._id);
        useMessageStore
          .getState()
          .deleteMessage(message.channel, message._id);
        toast.success('Đã xóa tin nhắn');
      } catch {
        toast.error('Không thể xóa tin nhắn');
      }
    };

    const dropdownItems = [
      ...(canDelete
        ? [{ label: 'Xóa', icon: <Trash2 size={14} />, onClick: handleDelete, danger: true }]
        : []),
    ];

    return (
      <ContextMenu items={getMessageMenuItems(message, isOwn, canDelete, handleReply)}>
        <div
          className={clsx(
            'group relative flex hover:bg-blue-50/50 dark:hover:bg-[#1e3250] -mx-4 px-4 py-1 transition-colors',
            message.isPending && 'opacity-60'
          )}
        >
          {/* Avatar column */}
          <div className="flex-shrink-0 w-10 mr-4 mt-1">
            {showAvatar && (
              <ContextMenu items={getUserAvatarMenuItems(message, isOwn)}>
                <Avatar
                  src={message.sender.avatar}
                  name={message.sender.displayName || message.sender.username}
                  size="md"
                  className="cursor-pointer hover:shadow-md transition-shadow"
                />
              </ContextMenu>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {showAvatar && (
              <div className="flex items-center mb-0.5">
                <ContextMenu items={getUserAvatarMenuItems(message, isOwn)}>
                  <span className="font-medium text-gray-900 dark:text-white cursor-pointer hover:underline mr-2 text-sm">
                    {message.sender.displayName || message.sender.username}
                  </span>
                </ContextMenu>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatMessageTime(message.createdAt)}
                </span>
                {message.isEdited && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(edited)</span>
                )}
                {message.isPending && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">Sending...</span>
                )}
              </div>
            )}

            {/* Reply quote */}
            {message.replyTo && (
              <div className="mb-2 pl-3 py-1.5 border-l-2 border-primary bg-blue-50 dark:bg-[#1e3250] rounded-r-lg">
                <span className="text-sm font-medium text-primary">{message.replyTo.sender.username}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {message.replyTo.content?.slice(0, 150) || '[File/Image]'}
                </p>
              </div>
            )}

            {/* Text content */}
            {message.content && message.type === 'text' && (
              <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {/* Image attachment */}
            {message.type === 'image' && message.attachment && (
              <img
                src={thumbnail(message.attachment.url)}
                alt={message.attachment.name}
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity mt-1"
                onClick={() => setLightboxUrl(message.attachment!.url)}
              />
            )}

            {/* File attachment */}
            {message.type === 'file' && message.attachment && (
              <a
                href={message.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-3 py-2 bg-gray-100 dark:bg-[#2b2d31] border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">
                  {getFileIcon(message.attachment.mimeType)}
                </span>
                <div>
                  <p className="text-sm font-medium text-primary">
                    {message.attachment.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(message.attachment.size)}
                  </p>
                </div>
              </a>
            )}

            {/* Reactions */}
            {Object.keys(message.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(message.reactions).map(([emoji, userIds]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={clsx(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors cursor-pointer',
                      userIds.includes(currentUserId ?? '')
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <span className="text-sm">{emoji}</span>
                    <span className="font-bold">{userIds.length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Read receipts */}
            {message.readBy && message.readBy.length > 0 && (
              <ReadReceipt readBy={message.readBy} />
            )}
          </div>

          {/* Hover action toolbar - Discord style floating */}
          <div className="opacity-0 group-hover:opacity-100 absolute right-4 -top-3 bg-white dark:bg-[#1e3250] shadow-lg border border-blue-100 dark:border-[#2a4a6b] rounded-lg flex items-center p-0.5 transition-opacity z-10">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-[#243a54] rounded-md text-gray-500 dark:text-gray-300"
              title="Add Reaction"
            >
              <SmilePlus size={16} />
            </button>
            <button
              onClick={handleReply}
              className="p-1 hover:bg-blue-100 dark:hover:bg-[#243a54] rounded-md text-gray-500 dark:text-gray-300"
              title="Reply"
            >
              <Reply size={16} />
            </button>
            {dropdownItems.length > 0 && (
              <Dropdown
                trigger={
                  <button className="p-1 hover:bg-blue-100 dark:hover:bg-[#243a54] rounded-md text-gray-500 dark:text-gray-300" title="More">
                    <MoreHorizontal size={16} />
                  </button>
                }
                items={dropdownItems}
              />
            )}
          </div>

          {/* Emoji picker popup */}
          {showEmojiPicker && (
            <div className="absolute right-4 top-6 z-20">
              <EmojiPicker onSelect={handleReaction} />
            </div>
          )}
        </div>
      </ContextMenu>
    );
  }
);

MessageItem.displayName = 'MessageItem';
