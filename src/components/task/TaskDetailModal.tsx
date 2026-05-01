import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { Task } from '../../types/task.types';
import { AlertTriangle, Clock, MapPin, AlignLeft, User as UserIcon, MessageSquare, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { taskService } from '../../services/task.service';
import toast from 'react-hot-toast';
import { Avatar } from '../ui/Avatar';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
}) => {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task || !isOpen) return null;

  const statusLabel = {
    todo: 'Todo',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
    blocked: 'Blocked',
  };

  const priorityLabel = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedTask = await taskService.addComment(task._id, commentText);
      onTaskUpdate(updatedTask);
      setCommentText('');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Không thể gửi bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Task" maxWidth="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/15 text-primary uppercase">
              {task.taskType || 'work'}
            </span>
            {task.taskType === 'work' && (
              <>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border border-blue-200 dark:border-gray-700 font-semibold ${task.status === 'done' ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-300'}`}>
                  {statusLabel[task.status as keyof typeof statusLabel]}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 ${task.priority === 'urgent' ? 'bg-red-500/15 text-red-500' : task.priority === 'high' ? 'bg-orange-500/15 text-orange-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  <AlertTriangle size={10} /> {priorityLabel[task.priority as keyof typeof priorityLabel]}
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {task.title}
          </h2>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-[#1e232d] p-4 rounded-xl border border-gray-100 dark:border-[#2b303a]">
          {task.taskType === 'work' && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1"><UserIcon size={12}/> Phụ trách</span>
                <div className="flex items-center gap-2">
                  <Avatar src={task.assignee?.avatar} name={task.assignee?.displayName || task.assignee?.username || '?'} size="sm" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                    {task.assignee?.displayName || task.assignee?.username || 'Chưa có người nhận'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1"><Clock size={12}/> Hạn chót</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString('vi-VN') : 'Không có'}
                </span>
              </div>
            </>
          )}

          {task.taskType === 'event' && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1"><Clock size={12}/> Thời gian</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  {task.eventAt ? new Date(task.eventAt).toLocaleString('vi-VN') : 'Không có'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1"><MapPin size={12}/> Địa điểm</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  {task.location || 'Không có'}
                </span>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1 col-span-2 mt-2">
            <span className="text-xs text-gray-600 font-medium flex items-center gap-1"><UserIcon size={12}/> Người tạo</span>
            <div className="flex items-center gap-2">
              <Avatar src={task.createdBy?.avatar} name={task.createdBy?.displayName || task.createdBy?.username || '?'} size="sm" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                {task.createdBy?.displayName || task.createdBy?.username} 
                <span className="text-gray-500 text-xs ml-1 font-normal">
                  ({new Date(task.createdAt).toLocaleString('vi-VN')})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold flex items-center gap-1 text-gray-900 dark:text-gray-200">
            <AlignLeft size={16} /> Mô tả công việc
          </h4>
          {task.description ? (
            <div className="bg-white dark:bg-[#151921] p-3 rounded-lg border border-gray-200 dark:border-[#2b303a] text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed shadow-sm">
              {task.description}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-[#1a1f28] p-3 rounded-lg border border-gray-200 dark:border-[#2b303a] text-sm text-gray-500 italic">
              Trống (Không có mô tả)
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-bold flex items-center gap-1 text-gray-900 dark:text-gray-200">
            <MessageSquare size={16} /> Bình luận
          </h4>
          
          <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
            {(!task.comments || task.comments.length === 0) ? (
              <p className="text-xs text-gray-500 italic text-center py-4 bg-gray-50 dark:bg-[#1a1f28] rounded-lg">
                Chưa có bình luận nào.
              </p>
            ) : (
              task.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar src={comment.user?.avatar} name={comment.user?.displayName || comment.user?.username || '?'} size="sm" />
                  <div className="flex-1 bg-gray-50 border border-gray-200 dark:border-transparent dark:bg-[#252b36] p-2.5 rounded-lg rounded-tl-none shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                        {comment.user?.displayName || comment.user?.username}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 bg-white dark:bg-[#151921] border border-gray-300 dark:border-[#2b303a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </Modal>
  );
};
