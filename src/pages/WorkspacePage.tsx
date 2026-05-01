import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../store/workspaceStore';
import { workspaceService } from '../services/workspace.service';
import { joinWorkspace } from '../socket/socket';
import { Loader2, Users, Link as LinkIcon, Settings } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const WorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { current, setCurrent, workspaces } = useWorkspaceStore();

  // Load workspace khi có slug
  useEffect(() => {
    if (!slug) return;

    const ws = workspaces.find((w) => w.slug === slug);
    if (ws) {
      setCurrent(ws);
      joinWorkspace(ws._id);
    }
  }, [slug, workspaces, setCurrent]);

  if (!current) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto" size={35} />
          <p className="text-gray-500 dark:text-gray-400 mt-2">Đang tải workspace...</p>
        </div>
      </div>
    );
  }

  const inviteLink = current.inviteCode
    ? `${window.location.origin}/workspace/join/${current.inviteCode}`
    : '';

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Đã copy invite link!');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#1e293b] scrollbar-thin">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl bg-white/80 dark:bg-[#1a2235]/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 dark:border-gray-800 p-6 sm:p-8 md:p-10 text-center transform transition-all duration-500 hover:shadow-primary/5 my-4">

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] bg-gradient-to-tr from-primary to-blue-400 text-white text-4xl sm:text-5xl shadow-lg shadow-primary/30 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="transform -translate-y-1">{current.icon || '💬'}</span>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-300 tracking-tight leading-tight">
              Chào mừng đến <br className="sm:hidden" /> {current.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Bạn đang ở sảnh chính của không gian làm việc. Hãy chọn một kênh bên tay trái để bắt đầu trò chuyện và kết nối với mọi người.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex flex-col items-center p-4 bg-gray-50/50 dark:bg-[#111827]/50 rounded-2xl min-w-[120px] border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-2">
                <Users size={20} />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white mb-0.5">
                {current.members?.length ?? 0}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                Thành viên
              </span>
            </div>
          </div>

          {/* Invite box */}
          {inviteLink && (
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-[#1e2b45] dark:to-[#172033] rounded-2xl p-5 sm:p-6 text-left border border-blue-100 dark:border-blue-900/30 shadow-inner group">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1.5">
                  <LinkIcon size={18} className="text-primary" />
                  Mời thêm đồng đội
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Chia sẻ liên kết bên dưới cho những người bạn muốn mời tham gia. Không gian làm việc sẽ tuyệt vời hơn khi có nhiều người!
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-blue-800/50 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-mono focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    onClick={copyInviteLink}
                    className="rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Sao chép
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
