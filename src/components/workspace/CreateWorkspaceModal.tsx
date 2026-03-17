import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Camera } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { workspaceService } from '../../services/workspace.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CreateWorkspaceModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.createWorkspaceModalOpen);
  const close = () => useUIStore.getState().setCreateWorkspaceModal(false);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);
  const setCurrent = useWorkspaceStore((s) => s.setCurrent);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      let ws = await workspaceService.create({ name: name.trim(), description: description.trim() || undefined });
      
      if (avatarFile) {
        try {
          ws = await workspaceService.uploadAvatar(ws._id, avatarFile);
        } catch (uploadError) {
          console.error('[Client AvatarUpload] Failed:', uploadError);
          toast.error('Tạo workspace thành công nhưng không thể tải ảnh lên');
        }
      }
      
      addWorkspace(ws);
      setCurrent(ws);
      navigate(`/workspace/${ws.slug}`);
      toast.success('Tạo workspace thành công!');
      setName('');
      setDescription('');
      setAvatarFile(null);
      setAvatarPreview(null);
      close();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo workspace thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Tạo Workspace mới">
      <form onSubmit={handleSubmit} className="space-y-4">
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
                <span className="text-[10px] font-medium text-gray-500 group-hover:text-primary transition-colors">Tải ảnh lên</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>

        <Input
          label="Tên Workspace"
          placeholder="VD: Công ty ABC"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Mô tả (tùy chọn)"
          placeholder="Mô tả ngắn về workspace..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={close} type="button">
            Hủy
          </Button>
          <Button type="submit" isLoading={loading}>
            Tạo Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
