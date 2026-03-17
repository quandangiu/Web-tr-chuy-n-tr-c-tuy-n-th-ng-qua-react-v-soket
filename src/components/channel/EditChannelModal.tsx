import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import { useChannelStore } from '../../store/channelStore';
import { channelService } from '../../services/channel.service';
import toast from 'react-hot-toast';

export const EditChannelModal: React.FC = () => {
  const { editChannelModalOpen, editingChannelId, setEditChannelModal } = useUIStore();
  const channels = useChannelStore((s) => s.channels);
  const updateChannel = useChannelStore((s) => s.updateChannel);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const channel = editingChannelId ? channels.find(c => c._id === editingChannelId) : null;

  useEffect(() => {
    if (editChannelModalOpen && channel) {
      setName(channel.name);
      setDescription(channel.description || '');
    }
  }, [editChannelModalOpen, channel]);

  const close = () => {
    setEditChannelModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !channel) return;

    setLoading(true);
    try {
      const updatedChannel = await channelService.update(channel._id, { 
        name: name.trim(), 
        description: description.trim() || undefined 
      });
      updateChannel(updatedChannel._id, updatedChannel);
      toast.success('Cập nhật kênh thành công!');
      close();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật kênh thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!channel) return null;

  return (
    <Modal isOpen={editChannelModalOpen} onClose={close} title="Chỉnh sửa Kênh">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên Kênh"
          placeholder="VD: general, thong-bao..."
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          required
          autoFocus
        />
        <Input
          label="Mô tả"
          placeholder="Chủ đề của kênh này..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={close} type="button">
            Hủy
          </Button>
          <Button type="submit" isLoading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
