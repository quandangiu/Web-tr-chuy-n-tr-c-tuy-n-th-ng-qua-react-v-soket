import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Phone, PhoneOff } from 'lucide-react';
import { useChannelStore } from '../../store/channelStore';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/user.types';
import { channelService } from '../../services/channel.service';
import toast from 'react-hot-toast';

interface ChannelMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal hiển thị danh sách thành viên channel
 * Mỗi thành viên có nút gọi điện
 */
export const ChannelMembersModal: React.FC<ChannelMembersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [callingUserId, setCallingUserId] = useState<string | null>(null);

  const currentChannel = useChannelStore((s) => s.current);
  const currentUser = useAuthStore((s) => s.user);
  const { callUser } = useWebRTC();

  // Load members khi modal mở
  useEffect(() => {
    if (!isOpen || !currentChannel) return;

    const loadMembers = async () => {
      setLoading(true);
      try {
        const data = await channelService.getMembers(currentChannel._id);
        setMembers(data);
      } catch (error) {
        console.error('Failed to load members:', error);
        toast.error('Không thể tải danh sách thành viên');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [isOpen, currentChannel]);

  const handleCall = async (targetUser: User) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập trước');
      return;
    }

    if (targetUser._id === currentUser._id) {
      toast.error('Không thể gọi cho chính mình');
      return;
    }

    try {
      setCallingUserId(targetUser._id);
      await callUser(targetUser._id);
      toast.success(`Đang gọi cho ${targetUser.username}...`);
    } catch (error) {
      console.error('Call failed:', error);
      toast.error('Lỗi khi gọi điện');
      setCallingUserId(null);
    }
  };

  const handleCancel = () => {
    setCallingUserId(null);
  };

  if (!currentChannel) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thành viên kênh" maxWidth="sm">
      <div className="w-full">
        {/* Channel info */}
        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            #{currentChannel.name} · {members.length} thành viên
          </p>
        </div>

        {/* Members list */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Đang tải...
            </div>
          ) : members.length === 0 ? (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Không có thành viên
            </div>
          ) : (
            members.map((member) => {
              const isCalling = callingUserId === member._id;
              const isCurrentUser = currentUser?._id === member._id;

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#2d3e52] transition-colors"
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar
                      src={member.avatar}
                      name={member.username}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.username}
                        {isCurrentUser && (
                          <span className="ml-1 text-[10px] text-blue-500 font-normal">
                            (Bạn)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Call button */}
                  {!isCurrentUser && (
                    <>
                      {isCalling ? (
                        <button
                          onClick={handleCancel}
                          className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                          title="Hủy gọi"
                        >
                          <PhoneOff size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCall(member)}
                          className="p-1.5 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex-shrink-0"
                          title={`Gọi cho ${member.username}`}
                        >
                          <Phone size={15} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
