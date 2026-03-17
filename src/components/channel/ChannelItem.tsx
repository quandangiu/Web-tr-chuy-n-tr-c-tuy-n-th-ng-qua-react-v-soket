import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  Lock, Volume2, UserPlus, Edit3, Trash2, BellOff, Link2, Pin,
  User, MessageSquare, MicOff, LogOut, Volume1, MessageCircle, ShieldCheck, Waypoints,
} from 'lucide-react';
import type { Channel, VoiceMember } from '../../types/channel.types';
import { useChannelStore } from '../../store/channelStore';
import { useAuthStore } from '../../store/authStore';
import { useVoiceStore } from '../../store/voiceStore';
import { useUIStore } from '../../store/uiStore';
import { ContextMenu } from '../ui/ContextMenu';
import type { ContextMenuItem } from '../ui/ContextMenu';
import { channelService } from '../../services/channel.service';
import toast from 'react-hot-toast';

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  unreadCount: number;
  onClick: () => void;
}

// Hook đếm thời gian online trong voice channel
function useVoiceTimer(joinedAt: string | undefined): string {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!joinedAt) return;
    const update = () => {
      const secs = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setElapsed(`${m}:${String(s).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [joinedAt]);
  return elapsed;
}

/** Build context menu items for voice member row */
function getVoiceMemberMenuItems(member: VoiceMember, isMe: boolean): ContextMenuItem[] {
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
      hidden: isMe,
      separator: true,
    },
    {
      label: member.isMuted ? 'Bật mic người này' : 'Tắt mic người này',
      icon: <MicOff size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: isMe,
    },
    {
      label: 'Kick khỏi voice',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: isMe,
    },
    {
      label: 'Chỉnh âm lượng',
      icon: <Volume1 size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: isMe,
      separator: true,
    },
  ];
}

// Avatar nhỏ trong voice member list — sáng lên khi user đang nói
const VoiceMemberRow: React.FC<{ member: VoiceMember; isMe: boolean }> = ({ member, isMe }) => {
  const timer = useVoiceTimer(member.joinedAt);
  const isSpeaking = useChannelStore((s) => s.speakingUsers.has(member.userId));

  return (
    <ContextMenu items={getVoiceMemberMenuItems(member, isMe)}>
      <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700/50 group/vm">
        <div className="relative flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.username}
              className={clsx(
                'w-7 h-7 rounded-full object-cover ring-2 transition-all duration-200',
                isSpeaking
                  ? 'ring-green-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]'
                  : isMe ? 'ring-green-400/40' : 'ring-gray-500/30'
              )}
            />
          ) : (
            <div
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold ring-2 transition-all duration-200',
                isSpeaking
                  ? 'bg-green-500 ring-green-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]'
                  : isMe ? 'bg-green-600/70 ring-green-400/40' : 'bg-primary/70 ring-gray-500/30'
              )}
            >
              {member.username.slice(0, 1).toUpperCase()}
            </div>
          )}
          {/* Green dot — nhấp nháy khi đang nói */}
          <span
            className={clsx(
              'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800',
              isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            )}
          />
        </div>
        <span className={clsx(
          'text-xs truncate flex-1',
          isSpeaking ? 'text-green-400 font-semibold' : isMe ? 'text-green-400/70 font-medium' : 'text-gray-400'
        )}>
          {member.displayName || member.username}
        </span>
        {/* Muted icon */}
        {member.isMuted && (
          <span className="text-red-400 text-[10px] flex-shrink-0" title="Đã tắt mic">🔇</span>
        )}
        {timer && (
          <span className="text-[10px] text-green-400/70 font-mono flex-shrink-0">{timer}</span>
        )}
      </div>
    </ContextMenu>
  );
};

/** Build context menu items for a channel */
function getChannelMenuItems(channel: Channel, onEdit: () => void): ContextMenuItem[] {
  const isVoice = channel.type === 'voice';

  return [
    {
      label: 'Chỉnh sửa kênh',
      icon: <Edit3 size={14} />,
      onClick: onEdit,
    },
    {
      label: 'Tắt thông báo',
      icon: <BellOff size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
    },
    {
      label: 'Sao chép link kênh',
      icon: <Link2 size={14} />,
      onClick: () => {
        const link = `${window.location.origin}/channels/${channel._id}`;
        navigator.clipboard.writeText(link);
        toast.success('Đã sao chép link kênh!');
      },
    },
    {
      label: 'Ghim kênh',
      icon: <Pin size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      separator: true,
    },
    // Voice channel extras
    {
      label: 'Giới hạn người',
      icon: <UserPlus size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: !isVoice,
    },
    {
      label: 'Chỉnh bitrate',
      icon: <Volume2 size={14} />,
      onClick: () => toast('Tính năng sắp ra mắt!', { icon: '🔜' }),
      hidden: !isVoice,
      separator: isVoice,
    },
    {
      label: 'Xóa kênh',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: async () => {
        if (!confirm(`Bạn có chắc muốn xóa kênh "${channel.name}"?`)) return;
        try {
          await channelService.delete(channel._id);
          toast.success(`Đã xóa kênh ${channel.name}`);
        } catch {
          toast.error('Không thể xóa kênh');
        }
      },
    },
  ];
}

/**
 * Modern channel item with gradient icons and glow effects
 * - Voice channel: hiện danh sách members đang ở trong kênh
 */
export const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  isActive,
  unreadCount,
  onClick,
}) => {
  const voiceMembers = useChannelStore((s) => s.voiceMembers.get(channel._id) ?? []);
  const setEditChannelModal = useUIStore((s) => s.setEditChannelModal);
  const currentUserId = useAuthStore((s) => s.user?._id);
  const voiceSession = useVoiceStore((s) => s.session);
  const isVoice = channel.type === 'voice';
  const hasVoiceMembers = voiceMembers.length > 0;
  const isMeInVoice = isVoice && voiceSession?.channelId === channel._id;

  // Channel icon — modern styled with glow
  const renderChannelIcon = () => {
    if (isVoice) {
      return (
        <span className="relative mr-2.5 flex-shrink-0">
          <span
            className={clsx(
              'w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300',
              isActive || isMeInVoice
                ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg shadow-green-500/40'
                : 'bg-[#1a2e1a] dark:bg-[#132b13] text-green-400 group-hover:bg-gradient-to-br group-hover:from-emerald-400 group-hover:to-green-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-green-500/30'
            )}
          >
            <Waypoints size={15} />
          </span>
          {(isActive || isMeInVoice) && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-sidebar-dark animate-pulse" />
          )}
        </span>
      );
    }
    if (channel.type === 'private') {
      return (
        <span className="relative mr-2.5 flex-shrink-0">
          <span
            className={clsx(
              'w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300',
              isActive
                ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                : 'bg-[#2a2010] dark:bg-[#261d0e] text-amber-400 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30'
            )}
          >
            <ShieldCheck size={15} />
          </span>
        </span>
      );
    }
    if (channel.type === 'dm') {
      return (
        <span className="relative mr-2.5 flex-shrink-0">
          <span
            className={clsx(
              'w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300',
              isActive
                ? 'bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                : 'bg-[#1f1530] dark:bg-[#1a1228] text-violet-400 group-hover:bg-gradient-to-br group-hover:from-violet-400 group-hover:to-purple-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/30'
            )}
          >
            <MessageSquare size={15} />
          </span>
        </span>
      );
    }
    // Public text channel — replaces # with MessageCircle icon
    return (
      <span className="relative mr-2.5 flex-shrink-0">
        <span
          className={clsx(
            'w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300',
            isActive
              ? 'bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/40'
              : 'bg-[#0f1f30] dark:bg-[#0d1a28] text-blue-400 group-hover:bg-gradient-to-br group-hover:from-blue-400 group-hover:to-cyan-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30'
          )}
        >
          <MessageCircle size={15} />
        </span>
      </span>
    );
  };

  return (
    <div>
      {/* Channel row */}
      <ContextMenu items={getChannelMenuItems(channel, () => setEditChannelModal(true, channel._id))}>
        <button
          onClick={onClick}
          className={clsx(
            'w-full flex items-center px-2 py-1.5 rounded-xl text-[13px] transition-all duration-300 group relative overflow-hidden',
            isActive || isMeInVoice
              ? 'bg-white/5 dark:bg-white/[0.06] text-white backdrop-blur-sm shadow-sm border border-white/[0.06]'
              : 'text-gray-400 dark:text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'
          )}
        >
          {/* Active glow line on left */}
          {(isActive || isMeInVoice) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          )}
          {/* Channel icon */}
          {renderChannelIcon()}

          {/* Channel name */}
          <span
            className={clsx(
              'truncate flex-1 text-left',
              isActive && 'font-semibold',
              unreadCount > 0 && !isActive && 'font-semibold text-gray-800 dark:text-white'
            )}
          >
            {channel.name}
          </span>

          {/* Voice: user count badge or invite icon */}
          {isVoice && hasVoiceMembers && !isMeInVoice && (
            <span className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 transition-opacity">
              <UserPlus size={14} />
            </span>
          )}

          {/* Text channel unread badge */}
          {!isVoice && unreadCount > 0 && (
            <span className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 shadow-sm shadow-blue-500/30">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </ContextMenu>

      {/* Voice members list (shown khi có người trong kênh) */}
      {isVoice && hasVoiceMembers && (
        <div className="ml-5 mt-0.5 mb-1 space-y-0.5 pl-3 border-l border-white/[0.04]">
          {/* Invite row */}
          <button className="flex items-center gap-1.5 px-2 py-0.5 w-full rounded-lg text-xs text-gray-500 dark:text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] group/inv">
            <UserPlus size={12} />
            <span>Mời vào Kênh thoại</span>
            <span className="ml-auto opacity-0 group-hover/inv:opacity-100">›</span>
          </button>
          {/* Member rows */}
          {voiceMembers.map((member) => (
            <VoiceMemberRow
              key={member.userId}
              member={member}
              isMe={member.userId === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
