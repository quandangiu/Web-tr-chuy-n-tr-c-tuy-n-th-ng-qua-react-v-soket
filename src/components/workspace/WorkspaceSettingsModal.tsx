import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { workspaceService } from '../../services/workspace.service';
import { Camera, Users, Shield, Link, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export const WorkspaceSettingsModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.workspaceSettingsModalOpen);
  const close = () => useUIStore.getState().setWorkspaceSettingsModal(false);
  const current = useWorkspaceStore((s) => s.current);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const removeWorkspace = useWorkspaceStore((s) => s.removeWorkspace);
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'roles' | 'invite' | 'danger'>('overview');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize fields
  React.useEffect(() => {
    if (isOpen && current) {
      setName(current.name);
      setDescription(current.description || '');
      setAiEnabled(current.aiEnabled ?? true);
      setAvatarPreview(current.avatar || null);
    }
  }, [isOpen, current]);

  if (!current) return null;

  const myRole = current.members?.find((m) => {
    const uid = typeof m.user === 'string' ? m.user : m.user?._id;
    return uid === currentUser?._id;
  })?.role || 'member';

  const isOwner = myRole === 'owner';
  const isAdminOrOwner = isOwner || myRole === 'admin';
  const visibleMembers = (current.members || []).filter((m: any) => {
    const user = m.user;
    if (!user || typeof user === 'string') return true;
    return user.username !== 'AI-Assistant' && user.email !== 'ai@chatapp.com';
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      let ws = await workspaceService.update(current._id, {
        name: name.trim(),
        description: description.trim() || undefined,
        aiEnabled,
      });
      if (avatarFile) {
        ws = await workspaceService.uploadAvatar(current._id, avatarFile);
      }
      updateWorkspace(ws._id, ws);
      toast.success('Cập nhật workspace thành công!');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn XÓA "${current.name}"? Hành động này không thể hoàn tác!`)) return;
    setLoading(true);
    try {
      await workspaceService.delete(current._id);
      removeWorkspace(current._id);
      toast.success('Đã xóa workspace');
      close();
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Cài đặt Workspace">
      <div className="flex h-[400px] -mx-6 -mb-6">
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-50 dark:bg-[#1a2b42] p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-100 dark:bg-[#243a54] text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1e3250]'}`}
          >
            <Settings size={16} /> Tổng quan
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-blue-100 dark:bg-[#243a54] text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1e3250]'}`}
          >
            <Users size={16} /> Thành viên
          </button>

          {isAdminOrOwner && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'roles' ? 'bg-blue-100 dark:bg-[#243a54] text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1e3250]'}`}
            >
              <Shield size={16} /> Phân quyền
            </button>
          )}

          <button
            onClick={() => setActiveTab('invite')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'invite' ? 'bg-blue-100 dark:bg-[#243a54] text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1e3250]'}`}
          >
            <Link size={16} /> Lời mời
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-auto ${activeTab === 'danger' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500'}`}
            >
              <Trash2 size={16} /> Nguy hiểm
            </button>
          )}
        </div>

        {/* Content */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <form onSubmit={handleUpdateGeneral} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tổng quan Workspace</h3>
              <div className="flex flex-col items-center gap-2 mb-4">
                <label className="relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-blue-300 dark:border-[#2a4a6b] bg-blue-50/50 dark:bg-[#1e3250] hover:bg-blue-100 dark:hover:bg-[#243a54] hover:border-primary cursor-pointer transition-colors overflow-hidden group">
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white w-6 h-6" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-medium text-gray-500 group-hover:text-primary transition-colors">Đổi ảnh</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={!isAdminOrOwner} onChange={handleFileChange} />
                </label>
              </div>

              <Input label="Tên Workspace" value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdminOrOwner} required />
              <Input label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isAdminOrOwner} />

              <div className="rounded-lg border border-blue-100 dark:border-[#2a4a6b] bg-blue-50/50 dark:bg-[#1e3250] p-3">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Bật để cho phép lệnh @AI help, @AI stats, @AI summarize, @AI recap và @AI todo trong workspace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => isAdminOrOwner && setAiEnabled((prev) => !prev)}
                    disabled={!isAdminOrOwner}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      aiEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    } ${!isAdminOrOwner ? 'opacity-60 cursor-not-allowed' : ''}`}
                    aria-label="Toggle AI assistant"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        aiEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
              
              {isAdminOrOwner && (
                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={loading}>Cập nhật</Button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'members' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thành viên ({visibleMembers.length || 0})</h3>
              <div className="space-y-3">
                {visibleMembers.filter((m: any) => m.user).map((m: any) => (
                  <div key={m.user._id || m.user} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e3250]">
                    <div className="flex items-center gap-3">
                      <img src={m.user.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{m.user.displayName || m.user.username}</div>
                        <div className="text-xs text-gray-500 capitalize">{m.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invite' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Link mời</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Chia sẻ link này để mời bạn bè tham gia {current.name}.
              </p>
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  value={`${window.location.origin}/invite/${current.inviteCode || 'N/A'}`}
                  readOnly
                />
                <Button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/invite/${current.inviteCode || 'N/A'}`);
                  toast.success('Đã sao chép link!');
                }}>
                  Copy
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'roles' && isAdminOrOwner && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phân quyền</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Thay đổi vai trò của thành viên. Chỉ Owner mới có thể cấp quyền Owner cho người khác.
              </p>
              <div className="space-y-3">
                {visibleMembers.filter((m: any) => m.user).map((m: any) => {
                  const uid = m.user._id || m.user;
                  const isSelf = uid === currentUser?._id;
                  const canEdit = isOwner && !isSelf;
                  
                  return (
                    <div key={uid} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2b42]">
                      <div className="flex items-center gap-3">
                        <img src={m.user.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {m.user.displayName || m.user.username} {isSelf && '(Bạn)'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{m.role}</div>
                        </div>
                      </div>
                      
                      {canEdit && (
                        <select 
                          className="bg-gray-50 dark:bg-[#0f1929] border border-gray-200 dark:border-gray-700 text-sm rounded-lg p-2 text-gray-900 dark:text-white cursor-pointer"
                          value={m.role}
                          onChange={async (e) => {
                            try {
                              setLoading(true);
                              const ws = await workspaceService.updateMemberRole(current._id, uid, e.target.value);
                              updateWorkspace(ws._id, ws);
                              toast.success('Cập nhật quyền thành công');
                            } catch (error: any) {
                              toast.error(error.response?.data?.message || 'Lỗi cập nhật quyền');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'danger' && isOwner && (
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4">Khu vực nguy hiểm</h3>
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">Xóa Workspace</h4>
                <p className="text-xs text-red-600 dark:text-red-300 mb-4">Hành động này không thể hoàn tác. Tất cả kênh và tin nhắn sẽ bị xóa vĩnh viễn.</p>
                <Button variant="danger" onClick={handleDelete} isLoading={loading}>Xóa {current.name}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
