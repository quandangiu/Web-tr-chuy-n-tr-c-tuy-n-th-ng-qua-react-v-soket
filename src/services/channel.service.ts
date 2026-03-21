import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Channel, CreateChannelPayload, CreateDMPayload } from '../types/channel.types';
import type { User } from '../types/user.types';

export const channelService = {
  getByWorkspace: async (workspaceId: string) => {
    const res = await api.get<ApiResponse<Channel[]>>(
      `/channels/workspace/${workspaceId}`
    );
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Channel>>(`/channels/${id}`);
    return res.data.data;
  },

  create: async (data: CreateChannelPayload) => {
    const res = await api.post<ApiResponse<Channel>>('/channels', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateChannelPayload>) => {
    const res = await api.put<ApiResponse<Channel>>(`/channels/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/channels/${id}`);
    return res.data;
  },

  createOrGetDM: async (data: CreateDMPayload) => {
    const res = await api.post<ApiResponse<Channel>>('/channels/dm', data);
    return res.data.data;
  },

  getEncryptionKey: async (channelId: string) => {
    const res = await api.get<ApiResponse<{ key: string }>>(
      `/channels/${channelId}/key`
    );
    return res.data.data.key;
  },

  getMembers: async (channelId: string) => {
    const res = await api.get<ApiResponse<User[]>>(
      `/channels/${channelId}/members`
    );
    return res.data.data;
  },

  addMember: async (channelId: string, userId: string) => {
    const res = await api.post<ApiResponse<Channel>>(
      `/channels/${channelId}/members`,
      { userId }
    );
    return res.data.data;
  },

  removeMember: async (channelId: string, userId: string) => {
    const res = await api.delete<ApiResponse<Channel>>(
      `/channels/${channelId}/members/${userId}`
    );
    return res.data.data;
  },
};
