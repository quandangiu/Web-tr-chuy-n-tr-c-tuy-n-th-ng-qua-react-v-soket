import { getSocket } from './socket';
import type { Task } from '../types/task.types';

type TaskRealtimeEvent =
  | { type: 'created'; task: Task }
  | { type: 'updated'; task: Task }
  | { type: 'deleted'; taskId: string; channelId: string; workspaceId?: string };

const dispatchTaskRealtimeEvent = (detail: TaskRealtimeEvent) => {
  window.dispatchEvent(new CustomEvent<TaskRealtimeEvent>('task-socket-event', { detail }));
  window.dispatchEvent(new Event('task-summary-refresh'));
};

/**
 * Đăng ký socket events cho task realtime toàn app.
 */
export const registerTaskEvents = (): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};

  const handleTaskCreated = ({ task }: { task: Task }) => {
    if (!task?._id) return;
    dispatchTaskRealtimeEvent({ type: 'created', task });
  };

  const handleTaskUpdated = ({ task }: { task: Task }) => {
    if (!task?._id) return;
    dispatchTaskRealtimeEvent({ type: 'updated', task });
  };

  const handleTaskDeleted = ({
    taskId,
    channelId,
    workspaceId,
  }: {
    taskId: string;
    channelId: string;
    workspaceId?: string;
  }) => {
    if (!taskId || !channelId) return;
    dispatchTaskRealtimeEvent({ type: 'deleted', taskId, channelId, workspaceId });
  };

  socket.on('task_created', handleTaskCreated);
  socket.on('task_updated', handleTaskUpdated);
  socket.on('task_deleted', handleTaskDeleted);

  return () => {
    socket.off('task_created', handleTaskCreated);
    socket.off('task_updated', handleTaskUpdated);
    socket.off('task_deleted', handleTaskDeleted);
  };
};
