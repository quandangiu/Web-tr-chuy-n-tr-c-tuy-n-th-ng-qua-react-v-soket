import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Radio, Video, Lock, Users, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { workspaceService } from '../services/workspace.service';
import toast from 'react-hot-toast';

const features = [
  {
    icon: <Radio size={18} />,
    title: 'Realtime Chat Engine',
    desc: 'Tin nhắn đến ngay lập tức, typing và trạng thái đã đọc đồng bộ theo channel.',
  },
  {
    icon: <Video size={18} />,
    title: 'Voice + Video Tốc Độ Cao',
    desc: 'Voice channel và video call P2P tối ưu độ trễ thấp cho đội nhóm làm việc liên tục.',
  },
  {
    icon: <Lock size={18} />,
    title: 'Bảo Mật Theo Mặc Định',
    desc: 'JWT auth, private channel, phân quyền theo vai trò và mã hóa nội dung quan trọng.',
  },
  {
    icon: <Users size={18} />,
    title: 'Workspace Native',
    desc: 'Quản lý theo workspace-channel, dễ phân quyền và mở rộng theo từng nhóm.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const [entering, setEntering] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);

  const heroTitle = useMemo(() => {
    if (!user) return 'Chat Realtime cho team tốc độ cao';
    return `Chào mừng trở lại, ${user.displayName || user.username}`;
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    const targets = pageRef.current.querySelectorAll<HTMLElement>('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.14 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const handleEnterApp = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEntering(true);
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
      if (!data.length) {
        toast('Bạn chưa có workspace, hãy tạo workspace đầu tiên.', { icon: '⚡' });
        navigate('/login');
        return;
      }
      navigate(`/workspace/${data[0].slug}`);
    } catch {
      toast.error('Không tải được workspace. Thử lại sau.');
    } finally {
      setEntering(false);
    }
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden bg-[#061226] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,194,255,0.22),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(0,255,153,0.16),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.24),transparent_40%)]" />
      <div
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulse"
        style={{ transform: `translateY(${scrollY * 0.12}px)` }}
      />
      <div
        className="absolute right-[-80px] top-12 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse"
        style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 md:px-10 md:py-10">
        <header className="reveal-on-scroll mb-8 flex items-center justify-between md:mb-10">
          <div className="inline-flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.45)]">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/90">Chat Realtime</p>
              <p className="text-sm text-slate-300">Nền tảng cộng tác gaming-grade</p>
            </div>
          </div>

          <button
            onClick={handleEnterApp}
            disabled={entering}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-60"
          >
            {entering ? 'Đang vào...' : user ? 'Vào ứng dụng' : 'Đăng nhập'}
            <ArrowRight size={15} />
          </button>
        </header>

        <main className="grid flex-1 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <section className="reveal-on-scroll">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              <ShieldCheck size={14} />
              Chat theo workspace với phân quyền rõ ràng
            </div>

            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-slate-300 md:mt-5 md:text-lg">
              Nền tảng chat realtime cho team, tích hợp voice-video-task trong một không gian duy nhất.
              Tối ưu cho nhóm cần tốc độ, độ ổn định và quyền hạn rõ ràng.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
              <button
                onClick={handleEnterApp}
                disabled={entering}
                className="rounded-xl bg-gradient-to-r from-sky-400 to-cyan-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_10px_30px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] disabled:opacity-60"
              >
                {user ? 'Mở Workspace' : 'Bắt đầu ngay'}
              </button>
              {!user && (
                <button
                  onClick={() => navigate('/register')}
                  className="rounded-xl border border-slate-500/50 bg-slate-800/40 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700/50"
                >
                  Tạo tài khoản
                </button>
              )}
            </div>

            <div className="reveal-on-scroll mt-7 md:mt-10 md:hidden">
              <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/60 p-4 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-sm">
                <div className="mb-3 inline-flex items-center gap-2 text-xs text-cyan-200">
                  <Sparkles size={14} />
                  Chế độ mobile premium
                </div>
                <p className="text-base font-bold text-slate-100">Live Preview</p>
                <div className="mt-3 space-y-2">
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-cyan-400/25 px-3 py-2 text-sm text-cyan-50">
                    Team ơi, 21:00 họp voice nhé!
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-700/70 px-3 py-2 text-sm text-slate-100">
                    Oke, em vào phòng ngay.
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] text-emerald-200">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Đang nhập...
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="reveal-on-scroll rounded-3xl border border-cyan-300/20 bg-slate-900/45 p-4 shadow-[0_0_60px_rgba(34,211,238,0.15)] backdrop-blur-sm"
            style={{ transform: `translateY(${scrollY * -0.04}px)` }}
          >
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-600/50 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-wider text-cyan-300">Latency</p>
                <p className="mt-2 text-2xl font-bold text-cyan-100">~40ms</p>
              </div>
              <div className="rounded-2xl border border-slate-600/50 bg-slate-800/60 p-4">
                <p className="text-xs uppercase tracking-wider text-emerald-300">Sync</p>
                <p className="mt-2 text-2xl font-bold text-emerald-100">Realtime</p>
              </div>
            </div>

            <div className="reveal-on-scroll mb-4 hidden rounded-2xl border border-slate-600/40 bg-slate-800/55 p-4 md:block">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-100">Live Preview</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                  <Activity size={12} />
                  Trực tuyến
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="ml-auto max-w-[84%] rounded-xl rounded-br-sm bg-cyan-400/25 px-3 py-2 text-cyan-50">
                  Sprint này chốt task trước 18:00 nha.
                </div>
                <div className="max-w-[84%] rounded-xl rounded-bl-sm bg-slate-700/70 px-3 py-2 text-slate-100">
                  Đã rõ, em cập nhật tiến độ ngay trong channel Work.
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] text-emerald-200">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Thành viên đang nhập...
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {features.map((item, idx) => (
                <div
                  key={item.title}
                  className="reveal-on-scroll rounded-2xl border border-slate-600/40 bg-slate-800/55 p-4 transition hover:border-cyan-300/40 hover:bg-slate-800/80"
                  style={{ transitionDelay: `${idx * 70}ms` }}
                >
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-200">
                    {item.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-100">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
