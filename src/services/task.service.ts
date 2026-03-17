import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Task, CreateTaskPayload, TaskStatus, MyTaskSummary } from '../types/task.types';

export const taskService = {
  getByChannel: async (channelId: string) => {
    const res = await api.get<ApiResponse<Task[]>>(`/tasks/channel/${channelId}`);
    return res.data.data;
  },

  getByWorkspace: async (workspaceId: string) => {
    const res = await api.get<ApiResponse<Task[]>>(`/tasks/workspace/${workspaceId}`);
    return res.data.data;
  },

  create: async (payload: CreateTaskPayload) => {
    const res = await api.post<ApiResponse<Task>>('/tasks', payload);
    return res.data.data;
  },

  update: async (taskId: string, patch: Partial<{ title: string; description: string; status: TaskStatus; priority: string; dueDate: string | null; assignee: string | null }>) => {
    const res = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, patch);
    return res.data.data;
  },

  delete: async (taskId: string) => {
    const res = await api.delete<ApiResponse<null>>(`/tasks/${taskId}`);
    return res.data;
  },

  claim: async (taskId: string) => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/claim`);
    return res.data.data;
  },

  vote: async (taskId: string, optionIndex: number) => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/vote`, { optionIndex });
    return res.data.data;
  },

  rsvp: async (taskId: string, response: 'going' | 'maybe' | 'declined') => {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/rsvp`, { response });
    return res.data.data;
  },

  getMySummary: async (workspaceId?: string, channelId?: string) => {
    const res = await api.get<ApiResponse<MyTaskSummary>>('/tasks/my-summary', {
      params: {
        ...(workspaceId ? { workspaceId } : {}),
        ...(channelId ? { channelId } : {}),
      },
    });
    return res.data.data;
  },
};
