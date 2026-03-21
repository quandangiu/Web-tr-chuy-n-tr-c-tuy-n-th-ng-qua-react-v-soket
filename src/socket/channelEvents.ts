import { getSocket } from './socket';
import { useChannelStore } from '../store/channelStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../store/authStore';
import type { Channel } from '../types/channel.types';

const normalizeMembers = (channel: Channel): string[] => {
  if (!Array.isArray(channel.members)) return [];
  return channel.members
    .map((member) => {
      if (typeof member === 'string') return member;
      if (member && typeof member === 'object' && '_id' in member) {
        return String((member as any)._id || '');
      }
      return String(member || '');
    })
    .filter(Boolean);
};

const shouldShowChannel = (channel: Channel, myUserId?: string) => {
  if (channel.type !== 'private') return true;
  if (!myUserId) return false;
  return normalizeMembers(channel).includes(myUserId);
};

const upsertChannel = (channel: Channel) => {
  const store = useChannelStore.getState();
  const exists = store.channels.some((c) => c._id === channel._id);
  if (exists) {
    store.updateChannel(channel._id, channel);
    return;
  }
  store.addChannel(channel);
};

/**
 * Đồng bộ channel list theo realtime socket events.
 */
export const registerChannelEvents = (): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};

  const handleChannelCreated = ({ channel }: { channel: Channel }) => {
    if (!channel?._id) return;

    const currentWorkspaceId = useWorkspaceStore.getState().current?._id;
    const myUserId = useAuthStore.getState().user?._id;
    if (!currentWorkspaceId || channel.workspace !== currentWorkspaceId) return;

    if (!shouldShowChannel(channel, myUserId)) return;
    upsertChannel(channel);
  };

  const handleChannelUpdated = ({ channel }: { channel: Channel }) => {
    if (!channel?._id) return;

    const currentWorkspaceId = useWorkspaceStore.getState().current?._id;
    const myUserId = useAuthStore.getState().user?._id;
    if (!currentWorkspaceId || channel.workspace !== currentWorkspaceId) return;

    if (!shouldShowChannel(channel, myUserId)) {
      useChannelStore.getState().removeChannel(channel._id);
      return;
    }

    upsertChannel(channel);
  };

  const handleChannelDeleted = ({ channelId }: { channelId: string }) => {
    if (!channelId) return;
    useChannelStore.getState().removeChannel(channelId);
  };

  socket.on('channel_created', handleChannelCreated);
  socket.on('channel_updated', handleChannelUpdated);
  socket.on('channel_deleted', handleChannelDeleted);

  return () => {
    socket.off('channel_created', handleChannelCreated);
    socket.off('channel_updated', handleChannelUpdated);
    socket.off('channel_deleted', handleChannelDeleted);
  };
};
