import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Hash, Lock, Volume2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useChannelStore } from '../../store/channelStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { channelService } from '../../services/channel.service';
import type { WorkspaceMember } from '../../types/workspace.types';
import toast from 'react-hot-toast';

type SafeWorkspaceUser = {
  _id: string;
  username: string;
  displayName?: string;
};

export const CreateChannelModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.createChannelModalOpen);
  const close = () => useUIStore.getState().setCreateChannelModal(false);
  const addChannel = useChannelStore((s) => s.addChannel);
  const currentWorkspace = useWorkspaceStore((s) => s.current);
  const currentUser = useAuthStore((s) => s.user);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private' | 'voice'>('public');
  const [encryption, setEncryption] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getWorkspaceMemberId = (member: WorkspaceMember): string | null => {
    if (!member?.user) return null;
    return typeof member.user === 'string' ? member.user : member.user?._id || null;
  };

  const getWorkspaceMemberLabel = (member: WorkspaceMember) => {
    if (!member?.user) return 'Unknown user';
    if (typeof member.user === 'string') return member.user;
    return member.user.displayName || member.user.username;
  };

  const getWorkspaceMemberUser = (member: WorkspaceMember): SafeWorkspaceUser | null => {
    if (!member?.user || typeof member.user === 'string') return null;
    if (!member.user._id || !member.user.username) return null;
    return {
      _id: member.user._id,
      username: member.user.username,
      displayName: member.user.displayName,
    };
  };

  const isAIWorkspaceMember = (member: WorkspaceMember) => {
    const user = getWorkspaceMemberUser(member);
    if (!user) return false;
    return (
      user.username === 'AI-Assistant' ||
      user.displayName === 'AI Helper'
    );
  };

  const currentMember = currentWorkspace?.members?.find((m) => {
    if (!currentUser) return false;
    const uid = getWorkspaceMemberId(m);
    return !!uid && uid === currentUser._id;
  });
  const isAdminOrOwner = !!currentMember && ['owner', 'admin'].includes(currentMember.role);

  const selectableMembers = (currentWorkspace?.members || []).filter((m) => {
    const uid = getWorkspaceMemberId(m);
    return !!uid && uid !== currentUser?._id && !isAIWorkspaceMember(m);
  });

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  React.useEffect(() => {
    if (!isOpen) return;
    setSelectedMemberIds([]);
  }, [isOpen, currentWorkspace?._id]);

  React.useEffect(() => {
    if (type === 'private' && !isAdminOrOwner) {
      setType('public');
    }
  }, [type, isAdminOrOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentWorkspace) return;

    setLoading(true);
    try {
      const ch = await channelService.create({
        workspaceId: currentWorkspace._id,
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        type,
        description: description.trim() || undefined,
        encryptionEnabled: encryption,
        memberIds: type === 'private' ? selectedMemberIds : undefined,
      });
      addChannel(ch);
      toast.success('Tạo channel thành công!');
      setName('');
      setDescription('');
      setType('public');
      setEncryption(false);
      setSelectedMemberIds([]);
      close();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo channel thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Tạo Channel mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên Channel"
          placeholder="VD: general"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Mô tả (tùy chọn)"
          placeholder="Channel dùng để..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Loại Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'public',  icon: Hash,    label: 'Text',    desc: 'Kênh chat' },
              { value: 'private', icon: Lock,    label: 'Private', desc: 'Chỉ thành viên' },
              { value: 'voice',   icon: Volume2, label: 'Thoại',   desc: 'Kênh voice' },
            ] as const).map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  if (value === 'private' && !isAdminOrOwner) return;
                  setType(value);
                }}
                disabled={value === 'private' && !isAdminOrOwner}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                  type === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                } ${
                  value === 'private' && !isAdminOrOwner
                    ? 'opacity-50 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-700'
                    : ''
                }`}
                title={value === 'private' && !isAdminOrOwner ? 'Chỉ owner/admin mới tạo được private channel' : undefined}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] opacity-70 text-center leading-tight">{desc}</span>
              </button>
            ))}
          </div>
          {!isAdminOrOwner && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Private channel chỉ dành cho owner/admin.
            </p>
          )}
        </div>

        {type === 'private' && isAdminOrOwner && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Thành viên workspace được thêm vào private channel
            </label>
            <div className="max-h-44 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              {selectableMembers.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 px-1 py-1">Không có thành viên để thêm.</p>
              ) : (
                selectableMembers.map((member) => {
                  const memberId = getWorkspaceMemberId(member);
                  if (!memberId) return null;
                  const checked = selectedMemberIds.includes(memberId);
                  return (
                    <label
                      key={memberId}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {getWorkspaceMemberLabel(member)}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(memberId)}
                        className="rounded text-primary"
                      />
                    </label>
                  );
                })
              )}
            </div>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Bạn luôn được thêm mặc định vào private channel.
            </p>
          </div>
        )}

        {/* Encryption toggle — chỉ hiện cho text channels */}
        {type !== 'voice' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={encryption}
              onChange={(e) => setEncryption(e.target.checked)}
              className="rounded text-primary"
            />
            <span className="text-sm text-gray-900 dark:text-white">🔒 Mã hóa tin nhắn (AES-256)</span>
          </label>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={close} type="button">
            Hủy
          </Button>
          <Button type="submit" isLoading={loading}>
            Tạo Channel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
