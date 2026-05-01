import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Modal } from '../ui/Modal';
import { userService } from '../../services/user.service';
import { Loader2, Upload, Trash2, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfileModal: React.FC = () => {
  const { userProfileModalOpen, setUserProfileModal } = useUIStore();
  const { user, updateUser } = useAuthStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<'displayName' | 'bio' | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (userProfileModalOpen && user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatar || '');
      setAvatarFile(null);
      setRemoveAvatar(false);
      setEditingField(null);
    }
  }, [userProfileModalOpen, user]);

  if (!userProfileModalOpen || !user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      
      // Auto save avatar
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        const updatedUser = await userService.updateProfile(user._id, formData);
        updateUser(updatedUser);
        toast.success('Đã cập nhật ảnh đại diện');
      } catch (error: any) {
        toast.error('Không thể tải lên ảnh đại diện');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Auto save avatar removal
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', '');
      const updatedUser = await userService.updateProfile(user._id, formData);
      updateUser(updatedUser);
      toast.success('Đã xóa ảnh đại diện');
    } catch (error: any) {
      toast.error('Không thể xóa ảnh đại diện');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (field: 'displayName' | 'bio') => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (field === 'displayName') formData.append('displayName', displayName);
      if (field === 'bio') formData.append('bio', bio);
      
      const updatedUser = await userService.updateProfile(user._id, formData);
      updateUser(updatedUser);
      toast.success('Cập nhật thành công');
      setEditingField(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={userProfileModalOpen}
      onClose={() => setUserProfileModal(false)}
      title="Thông tin cá nhân"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Header - Avatar */}
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 dark:bg-[#1a2333] rounded-2xl border border-gray-200 dark:border-[#243a54]">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-4 ring-white dark:ring-[#2b2d31] shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-[#2a3a50] dark:to-[#1a2333]">
                  {user.displayName?.[0]?.toUpperCase() || user.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/60 rounded-full transition-all duration-200">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors disabled:opacity-50"
                title="Tải ảnh lên"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              </button>
              {(avatarPreview || avatarFile) && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRemoveAvatar}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors disabled:opacity-50"
                  title="Xóa ảnh"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {user.displayName || user.username}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              @{user.username}
            </p>
          </div>
        </div>

        {/* Profile Info Fields */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-600 dark:text-gray-500 uppercase tracking-wider px-1">Giới thiệu về tôi</h4>
          
          <div className="space-y-3 bg-white dark:bg-[#1e232d] p-3 rounded-xl border border-gray-200 dark:border-[#2b303a] shadow-sm">
            {/* Display Name Field */}
            <div className="flex flex-col gap-1 p-2 hover:bg-gray-50 dark:hover:bg-[#252b36] rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-400">Tên hiển thị</span>
                {editingField !== 'displayName' && (
                  <button onClick={() => setEditingField('displayName')} className="text-gray-400 hover:text-primary transition-colors p-1" title="Sửa tên">
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              {editingField === 'displayName' ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#151921] border border-blue-300 dark:border-blue-900/50 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                    autoFocus
                    placeholder="Nhập tên hiển thị"
                  />
                  <button onClick={() => handleSaveField('displayName')} disabled={loading} className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setEditingField(null); setDisplayName(user.displayName || ''); }} disabled={loading} className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                  {user.displayName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </p>
              )}
            </div>

            {/* Bio Field */}
            <div className="flex flex-col gap-1 p-2 hover:bg-gray-50 dark:hover:bg-[#252b36] rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-400">Tiểu sử (Bio)</span>
                {editingField !== 'bio' && (
                  <button onClick={() => setEditingField('bio')} className="text-gray-400 hover:text-primary transition-colors p-1" title="Sửa tiểu sử">
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              {editingField === 'bio' ? (
                <div className="flex items-start gap-2 mt-1">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#151921] border border-blue-300 dark:border-blue-900/50 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white resize-none"
                    autoFocus
                    rows={3}
                    placeholder="Giới thiệu đôi nét về bản thân..."
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleSaveField('bio')} disabled={loading} className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setEditingField(null); setBio(user.bio || ''); }} disabled={loading} className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
                  {user.bio || <span className="text-gray-400 italic">Chưa có tiểu sử</span>}
                </p>
              )}
            </div>
            
            {/* Read-only fields */}
            <div className="flex flex-col gap-1 p-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-400">Email</span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-400">{user.email}</p>
            </div>
            
            <div className="flex flex-col gap-1 p-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-400">Ngày tham gia</span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
