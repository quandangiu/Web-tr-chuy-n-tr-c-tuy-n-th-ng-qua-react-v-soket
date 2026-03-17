import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { taskService } from '../../services/task.service';
import type { Task, TaskStatus } from '../../types/task.types';
import { channelService } from '../../services/channel.service';
import type { User } from '../../types/user.types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface ChannelTaskPanelProps {
  workspaceId: string;
  channelId: string;
  panelWidth?: number;
}

const statusLabel: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  blocked: 'Blocked',
};

export const ChannelTaskPanel: React.FC<ChannelTaskPanelProps> = ({ workspaceId, channelId, panelWidth = 380 }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<'work' | 'event' | 'poll'>('work');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [eventAt, setEventAt] = useState('');
  const [location, setLocation] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptionsText, setPollOptionsText] = useState('');
  const [pollExpiresAt, setPollExpiresAt] = useState('');
  const [formOpen, setFormOpen] = useState(true);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const currentWorkspace = useWorkspaceStore((s) => s.current);

  const myRole = useMemo(() => {
    if (!user?._id || !currentWorkspace?.members) return 'member';
    const member = currentWorkspace.members.find((m) => {
      if (typeof m.user === 'string') return m.user === user._id;
      return m.user?._id === user._id;
    });
    return member?.role || 'member';
  }, [currentWorkspace?.members, user?._id]);
  const canManageWorkTask = myRole === 'admin' || myRole === 'owner';

  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);
  const visibleTasks = useMemo(
    () => tasks.filter((t) => (t.taskType || 'work') === mode),
    [tasks, mode]
  );
  const isWideWorkBoard = mode === 'work' && panelWidth >= 700;
  const workCount = useMemo(
    () => tasks.filter((t) => (t.taskType || 'work') === 'work' && t.status !== 'done').length,
    [tasks]
  );
  const eventCount = useMemo(
    () => tasks.filter((t) => t.taskType === 'event' && t.status !== 'done').length,
    [tasks]
  );
  const pollCount = useMemo(
    () => tasks.filter((t) => t.taskType === 'poll' && t.status !== 'done').length,
    [tasks]
  );
  const memberDelayCount = useMemo(() => {
    if (!user?._id) return 0;
    const now = Date.now();
    return tasks.filter((t) => {
      if ((t.taskType || 'work') !== 'work') return false;
      if (!t.assignee || t.assignee._id !== user._id) return false;
      if (t.status !== 'in_progress') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() < now;
    }).length;
  }, [tasks, user?._id]);
  const votePendingCount = useMemo(() => {
    if (!user?._id) return 0;
    const now = Date.now();
    return tasks.filter((t) => {
      if (t.taskType !== 'poll' || !t.pollOptions || t.pollOptions.length === 0) return false;
      if (t.status === 'done') return false;
      if (t.pollExpiresAt && new Date(t.pollExpiresAt).getTime() < now) return false;
      return !t.pollOptions.some((o) => o.votes.includes(user._id));
    }).length;
  }, [tasks, user?._id]);

  const emitTaskSummaryRefresh = () => {
    window.dispatchEvent(new Event('task-summary-refresh'));
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getByChannel(channelId);
      setTasks(data);
    } catch {
      toast.error('Không thể tải task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!channelId) return;
    loadTasks();
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;
    channelService.getMembers(channelId).then(setMembers).catch(() => setMembers([]));
  }, [channelId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignee('');
    setDueDate('');
    setPriority('medium');
    setEventAt('');
    setLocation('');
    setPollQuestion('');
    setPollOptionsText('');
    setPollExpiresAt('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    const pollQuestionTrimmed = pollQuestion.trim();
    const parsedOptions = pollOptionsText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (mode === 'work' && !trimmed) return;
    if (mode === 'work' && !canManageWorkTask) {
      toast.error('Chỉ admin/owner mới được tạo Work task');
      return;
    }
    if (mode === 'event' && (!trimmed || !eventAt)) return;
    if (mode === 'poll' && (!pollQuestionTrimmed || parsedOptions.length < 2)) return;

    setCreating(true);
    try {
      const payload: any = {
        workspaceId,
        channelId,
        taskType: mode,
      };

      if (mode === 'work') {
        payload.title = trimmed;
        payload.description = description.trim() || undefined;
        payload.priority = priority;
        payload.assignee = assignee || null;
        payload.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
      } else if (mode === 'event') {
        payload.title = trimmed;
        payload.eventAt = new Date(eventAt).toISOString();
        payload.location = location.trim() || '';
        payload.status = 'todo';
      } else {
        payload.title = `Poll: ${pollQuestionTrimmed}`;
        payload.pollQuestion = pollQuestionTrimmed;
        payload.pollOptions = parsedOptions;
        payload.pollExpiresAt = pollExpiresAt ? new Date(pollExpiresAt).toISOString() : null;
      }

      const task = await taskService.create(payload);
      setTasks((prev) => [task, ...prev]);
      emitTaskSummaryRefresh();
      resetForm();
    } catch {
      toast.error('Tạo task thất bại');
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    const old = tasks;
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      const updated = await taskService.update(taskId, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      emitTaskSummaryRefresh();
    } catch {
      setTasks(old);
      toast.error('Cập nhật task thất bại');
    }
  };

  const removeTask = async (taskId: string) => {
    const old = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await taskService.delete(taskId);
      emitTaskSummaryRefresh();
    } catch (error: any) {
      setTasks(old);
      toast.error(error?.response?.data?.error?.message || 'Xóa task thất bại');
    }
  };

  const claimTask = async (taskId: string) => {
    try {
      const updated = await taskService.claim(taskId);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      emitTaskSummaryRefresh();
      toast.success('Đã nhận task');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Không thể nhận task');
    }
  };

  const votePoll = async (taskId: string, optionIndex: number) => {
    try {
      const updated = await taskService.vote(taskId, optionIndex);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Vote thất bại');
    }
  };

  const rsvpEvent = async (taskId: string, response: 'going' | 'maybe' | 'declined') => {
    try {
      const updated = await taskService.rsvp(taskId, response);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'RSVP thất bại');
    }
  };

  function getDelayInfo(task: Task) {
    const now = Date.now();
    const deadline = task.taskType === 'work'
      ? task.dueDate
      : task.taskType === 'event'
      ? task.eventAt
      : task.pollExpiresAt;
    if (!deadline) return null;

    const ms = new Date(deadline).getTime() - now;
    const hours = Math.floor(Math.abs(ms) / (1000 * 60 * 60));
    if (ms < 0) return { overdue: true, label: `Trễ ${hours}h` };
    return { overdue: false, label: `Còn ${hours}h` };
  }

  const getRsvpCounts = (task: Task) => {
    const list = task.eventRsvps || [];
    const going = list.filter((x) => x.response === 'going').length;
    const maybe = list.filter((x) => x.response === 'maybe').length;
    const declined = list.filter((x) => x.response === 'declined').length;
    return { going, maybe, declined };
  };

  const canDeleteTask = (task: Task) => {
    if (task.taskType === 'work') return canManageWorkTask;
    return true;
  };

  const canDragWorkTask = (task: Task) => {
    if ((task.taskType || 'work') !== 'work') return false;
    if (canManageWorkTask) return true;
    const mine = !!user?._id && !!task.assignee && task.assignee._id === user._id;
    if (!mine) return false;
    return task.status === 'in_progress' || task.status === 'todo' || task.status === 'review' || task.status === 'blocked';
  };

  const mapToWorkColumn = (task: Task): 'todo' | 'in_progress' | 'done' => {
    if (task.status === 'done') return 'done';
    if (task.status === 'in_progress' || task.status === 'review' || task.status === 'blocked') return 'in_progress';
    return 'todo';
  };

  const groupedWorkTasks = useMemo(() => {
    const workTasks = visibleTasks.filter((t) => (t.taskType || 'work') === 'work');
    return {
      todo: workTasks.filter((t) => mapToWorkColumn(t) === 'todo'),
      in_progress: workTasks.filter((t) => mapToWorkColumn(t) === 'in_progress'),
      done: workTasks.filter((t) => mapToWorkColumn(t) === 'done'),
    };
  }, [visibleTasks]);

  const moveTaskToColumn = async (taskId: string, column: 'todo' | 'in_progress' | 'done') => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    if (!canDragWorkTask(task)) {
      toast.error('Bạn chỉ có thể kéo task của mình');
      return;
    }

    const targetStatus: TaskStatus = column === 'done' ? 'done' : column === 'in_progress' ? 'in_progress' : 'todo';
    if (task.status === targetStatus) return;
    await updateStatus(taskId, targetStatus);
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task._id}
      className="rounded-xl border border-blue-100 dark:border-[#2a4a6b] bg-white/95 dark:bg-[#1e3250] p-2.5 shadow-[0_8px_24px_-16px_rgba(37,99,235,0.45)]"
      draggable={mode === 'work' && canDragWorkTask(task)}
      onDragStart={() => setDraggingTaskId(task._id)}
      onDragEnd={() => setDraggingTaskId(null)}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => updateStatus(task._id, task.status === 'done' ? 'todo' : 'done')}
          className="mt-0.5 text-primary"
          title="Toggle done"
        >
          {task.status === 'done' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          {(() => {
            const delay = getDelayInfo(task);
            if (!delay) return null;
            return (
              <span className={`inline-flex mb-1 text-[10px] px-1.5 py-0.5 rounded ${delay.overdue ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                {delay.label}
              </span>
            );
          })()}
          <p className={`text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </p>
          <p className="text-[11px] text-primary mt-0.5 uppercase tracking-wide">{task.taskType || 'work'}</p>
          {task.taskType === 'work' && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {task.assignee ? `Phụ trách: ${task.assignee.displayName || task.assignee.username}` : 'Chưa có người nhận'}
            </p>
          )}
          {task.taskType === 'event' && (
            <>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {task.eventAt ? `🗓 ${new Date(task.eventAt).toLocaleString()}` : 'Chưa có thời gian'}
                {task.location ? ` · 📍 ${task.location}` : ''}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(['going', 'maybe', 'declined'] as const).map((response) => {
                  const mine = (task.eventRsvps || []).find((x) => x.user === user?._id)?.response;
                  const active = mine === response;
                  const label = response === 'going' ? 'Tham gia' : response === 'maybe' ? 'Có thể' : 'Không';
                  return (
                    <button
                      key={response}
                      onClick={() => rsvpEvent(task._id, response)}
                      className={`text-[10px] px-2 py-1 rounded border ${active ? 'bg-primary text-white border-primary' : 'border-blue-100 dark:border-[#2a4a6b] text-gray-600 dark:text-gray-300'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {(() => {
                const counts = getRsvpCounts(task);
                return (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    RSVP: {counts.going} tham gia • {counts.maybe} có thể • {counts.declined} từ chối
                  </p>
                );
              })()}
            </>
          )}
          {task.taskType === 'poll' && task.pollOptions && task.pollOptions.length > 0 && (
            <div className="mt-1 space-y-1">
              {task.pollQuestion && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{task.pollQuestion}</p>
              )}
              {task.pollOptions.map((o, idx) => {
                const voted = !!user?._id && o.votes.includes(user._id);
                return (
                  <button
                    key={`${task._id}-${idx}`}
                    onClick={() => votePoll(task._id, idx)}
                    className={`w-full text-left text-[11px] rounded px-2 py-1 border ${voted ? 'bg-primary/15 border-primary text-primary' : 'border-blue-100 dark:border-[#2a4a6b] text-gray-600 dark:text-gray-300'}`}
                  >
                    {o.option} <span className="opacity-70">({o.votes.length})</span>
                  </button>
                );
              })}
            </div>
          )}
          {task.taskType === 'work' && (
            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <select
                value={task.status}
                onChange={(e) => updateStatus(task._id, e.target.value as TaskStatus)}
                className="bg-transparent border border-blue-100 dark:border-[#2a4a6b] rounded px-1.5 py-0.5"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
              <span className="inline-flex items-center gap-1">
                <AlertTriangle size={11} /> {statusLabel[task.status]}
              </span>
              {!task.assignee && task.status !== 'done' && (
                <button
                  onClick={() => claimTask(task._id)}
                  className="ml-auto text-[10px] px-2 py-1 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                >
                  Nhận
                </button>
              )}
            </div>
          )}
        </div>
        {canDeleteTask(task) && (
          <button onClick={() => removeTask(task._id)} className="text-red-500 hover:text-red-600" title="Xóa task">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <aside className="w-full border-l border-blue-100 dark:border-[#243a54] bg-gradient-to-b from-blue-50/70 to-blue-100/30 dark:from-[#0f1929] dark:to-[#0b1422] flex flex-col">
      <div className="px-4 py-3 border-b border-blue-100 dark:border-[#243a54]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Task Kênh</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">{activeTasks.length} mở</span>
        </div>
        {canManageWorkTask ? (
          <div className="mt-2 text-[10px]">
            <span className="inline-flex rounded-md px-2 py-1 bg-violet-500/10 text-violet-500">
              Poll cần vote: {votePendingCount}
            </span>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
            <span className="rounded-md px-2 py-1 bg-red-500/10 text-red-500">Delay đang làm: {memberDelayCount}</span>
            <span className="rounded-md px-2 py-1 bg-emerald-500/10 text-emerald-500">Poll cần vote: {votePendingCount}</span>
          </div>
        )}
      </div>

      <div className="p-3 border-b border-blue-100 dark:border-[#243a54] space-y-2">
        <div className="grid grid-cols-3 gap-1">
          <button onClick={() => setMode('work')} className={`text-xs rounded-md py-1 ${mode === 'work' ? 'bg-primary text-white' : 'bg-white dark:bg-[#1e3250] text-gray-600 dark:text-gray-300'}`}>Work ({workCount})</button>
          <button onClick={() => setMode('event')} className={`text-xs rounded-md py-1 ${mode === 'event' ? 'bg-primary text-white' : 'bg-white dark:bg-[#1e3250] text-gray-600 dark:text-gray-300'}`}>Event ({eventCount})</button>
          <button onClick={() => setMode('poll')} className={`text-xs rounded-md py-1 ${mode === 'poll' ? 'bg-primary text-white' : 'bg-white dark:bg-[#1e3250] text-gray-600 dark:text-gray-300'}`}>Poll ({pollCount})</button>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 bg-white/80 dark:bg-[#1b2b44] border border-blue-100 dark:border-[#2a4a6b] text-xs text-gray-700 dark:text-gray-200"
        >
          <span>{formOpen ? 'Ẩn form tạo task' : 'Hiện form tạo task'}</span>
          {formOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {formOpen && (
        <form onSubmit={handleCreate} className="space-y-2">
          {mode === 'work' && canManageWorkTask && (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên công việc" className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2.5 py-2 text-sm" />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả (tuỳ chọn)" className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2.5 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={!canManageWorkTask} className="bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2 py-2 text-xs disabled:opacity-60">
                  <option value="">Chưa assign</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.displayName || m.username}</option>
                  ))}
                </select>
                <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2 py-2 text-xs" />
              </div>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2 py-2 text-xs">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </>
          )}

          {mode === 'work' && !canManageWorkTask && (
            <div className="rounded-lg px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20">
              Work form chỉ dành cho admin/owner. Member dùng nút <b>Nhận</b> ở danh sách task.
            </div>
          )}

          {mode === 'event' && (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên sự kiện" className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2.5 py-2 text-sm" />
              <input type="datetime-local" value={eventAt} onChange={(e) => setEventAt(e.target.value)} className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2 py-2 text-xs" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Địa điểm (tuỳ chọn)" className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2.5 py-2 text-sm" />
            </>
          )}

          {mode === 'poll' && (
            <>
              <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Câu hỏi poll" className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2.5 py-2 text-sm" />
              <textarea value={pollOptionsText} onChange={(e) => setPollOptionsText(e.target.value)} placeholder="Mỗi lựa chọn một dòng (2-6 lựa chọn)" rows={3} className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2.5 py-2 text-xs resize-none" />
              <input type="datetime-local" value={pollExpiresAt} onChange={(e) => setPollExpiresAt(e.target.value)} className="w-full bg-white dark:bg-[#1e3250] border border-blue-100 dark:border-[#2a4a6b] rounded-lg px-2 py-2 text-xs" />
            </>
          )}

          {(mode !== 'work' || canManageWorkTask) && (
            <button type="submit" disabled={creating} className="w-full px-2.5 py-2 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-white disabled:opacity-50 text-sm flex items-center justify-center gap-1 shadow-sm">
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Tạo {mode === 'work' ? 'Work' : mode === 'event' ? 'Event' : 'Poll'} Task
            </button>
          )}
        </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="py-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Chưa có task {mode === 'work' ? 'Work' : mode === 'event' ? 'Event' : 'Poll'} trong kênh này
          </div>
        ) : (
          mode !== 'work' ? (
            visibleTasks.map((task) => renderTaskCard(task))
          ) : isWideWorkBoard ? (
            <div className="grid grid-cols-3 gap-2 h-full">
              {([
                { key: 'todo', label: 'Chuẩn bị', items: groupedWorkTasks.todo },
                { key: 'in_progress', label: 'Đang làm', items: groupedWorkTasks.in_progress },
                { key: 'done', label: 'Xong', items: groupedWorkTasks.done },
              ] as const).map((col) => (
                <div
                  key={col.key}
                  className={`rounded-xl border border-blue-100 dark:border-[#2a4a6b] bg-white/40 dark:bg-[#16273d]/60 p-2 min-h-[140px] ${draggingTaskId ? 'ring-1 ring-primary/30' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => draggingTaskId && moveTaskToColumn(draggingTaskId, col.key)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{col.label}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">{col.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.items.length === 0 ? (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Thả task vào đây</p>
                    ) : (
                      col.items.map((task) => renderTaskCard(task))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {([
                { key: 'todo', label: 'Chuẩn bị', items: groupedWorkTasks.todo },
                { key: 'in_progress', label: 'Đang làm', items: groupedWorkTasks.in_progress },
                { key: 'done', label: 'Xong', items: groupedWorkTasks.done },
              ] as const).map((section) => (
                <div key={section.key} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{section.label}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">{section.items.length}</span>
                  </div>
                  {section.items.length === 0 ? (
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 px-1">Không có task</div>
                  ) : (
                    section.items.map((task) => renderTaskCard(task))
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </aside>
  );
};
