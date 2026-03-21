import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { channelService } from '../../services/channel.service';
import type { Channel } from '../../types/channel.types';
import type { User } from '../../types/user.types';
import type { WorkspaceMember } from '../../types/workspace.types';
import toast from 'react-hot-toast';

interface ManageChannelMembersModalProps {
  isOpen: boolean;
  channel: Channel;
  onClose: () => void;
  onChannelUpdated?: (updated: Channel) => void;
}

const isAIUser = (user: User | { username: string; displayName?: string }) => {
  return user.username === 'AI-Assistant' || user.displayName === 'AI Helper';
};

const getWorkspaceMemberUser = (member: WorkspaceMember) => {
  if (typeof member.user === 'string') return null;
  return member.user;
};

export const ManageChannelMembersModal: React.FC<ManageChannelMembersModalProps> = ({
  isOpen,
  channel,
  onClose,
  onChannelUpdated,
}) => {
  const currentWorkspace = useWorkspaceStore((s) => s.current);
  const currentUser = useAuthStore((s) => s.user);

  const getMemberUserId = (member: WorkspaceMember): string | null => {
    if (!member?.user) return null;
    if (typeof member.user === 'string') return member.user;
    return member.user?._id || null;
  };

  const [channelMembers, setChannelMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingUserId, setActingUserId] = useState<string | null>(null);

  const myWorkspaceRole = useMemo(() => {
    if (!currentWorkspace || !currentUser) return null;
    const me = currentWorkspace.members.find((m) => {
      const uid = getMemberUserId(m);
      return !!uid && uid === currentUser._id;
    });
    return me?.role || null;
  }, [currentWorkspace, currentUser]);

  const canManage = myWorkspaceRole === 'owner' || myWorkspaceRole === 'admin';
  const canSelfManage = !!currentUser;

  const loadMembers = async () => {
    setLoading(true);
    try {
      const members = await channelService.getMembers(channel._id);
      setChannelMembers(members.filter((m) => !isAIUser(m)));
    } catch {
      toast.error('Không thể tải danh sách thành viên kênh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    void loadMembers();
  }, [isOpen, channel._id]);

  const workspaceCandidates = useMemo(() => {
    if (!currentWorkspace) return [] as Array<{ _id: string; username: string; avatar: string | null; displayName?: string }>;

    return currentWorkspace.members
      .map((member) => getWorkspaceMemberUser(member))
      .filter((user): user is NonNullable<ReturnType<typeof getWorkspaceMemberUser>> => !!user)
      .filter((user) => !isAIUser(user))
      .filter((user) => !channelMembers.some((m) => m._id === user._id));
  }, [currentWorkspace, channelMembers]);

  const handleAddMember = async (userId: string) => {
    setActingUserId(userId);
    try {
      const updated = await channelService.addMember(channel._id, userId);
      onChannelUpdated?.(updated);
      await loadMembers();
      toast.success('Đã thêm user vào channel');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Không thể thêm user';
      toast.error(msg);
    } finally {
      setActingUserId(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setActingUserId(userId);
    try {
      const updated = await channelService.removeMember(channel._id, userId);
      onChannelUpdated?.(updated);
      await loadMembers();
      toast.success('Đã xóa user khỏi channel');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Không thể xóa user';
      toast.error(msg);
    } finally {
      setActingUserId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quản lý thành viên: ${channel.name}`} maxWidth="lg">
      {!canManage && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
          Member chỉ có thể thao tác trên chính mình. Owner/Admin có thể thao tác trên người khác.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Thành viên trong channel</h4>
            <div className="max-h-72 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2">
              {loading ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Đang tải...</p>
              ) : channelMembers.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Chưa có thành viên.</p>
              ) : (
                channelMembers.map((member) => {
                  const isSelf = member._id === currentUser?._id;
                  return (
                    <div key={member._id} className="flex items-center justify-between gap-2 px-1 py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar src={member.avatar} name={member.displayName || member.username} size="sm" />
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {member.displayName || member.username}
                          {isSelf ? ' (Bạn)' : ''}
                        </span>
                      </div>
                      {(canManage || (canSelfManage && isSelf)) && (
                        <Button
                          size="sm"
                          variant={isSelf ? 'ghost' : 'danger'}
                          onClick={() => handleRemoveMember(member._id)}
                          isLoading={actingUserId === member._id}
                        >
                          {isSelf ? 'Rời kênh' : 'Xóa'}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {canManage && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Member workspace có thể thêm</h4>
            <div className="max-h-72 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2">
              {workspaceCandidates.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">Không còn user nào để thêm.</p>
              ) : (
                workspaceCandidates.map((member) => (
                  <div key={member._id} className="flex items-center justify-between gap-2 px-1 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar src={member.avatar} name={member.displayName || member.username} size="sm" />
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {member.displayName || member.username}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMember(member._id)}
                      isLoading={actingUserId === member._id}
                    >
                      Thêm
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          )}
      </div>
    </Modal>
  );
};
