import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { Mail, Lock, Zap, Radio, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const from = (location.state as any)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const normalizedEmail = email.trim();
    if (!normalizedEmail) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(normalizedEmail)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authService.login({ email: email.trim(), password });
      setAuth(data.user as any, data.accessToken);
      toast.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Đăng nhập thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070f1d] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.2),transparent_40%)]" />
      <div className="relative min-h-screen grid lg:grid-cols-2 items-center px-4 py-8 md:px-10">
        <section className="hidden lg:block pr-8">
          <div className="max-w-xl reveal-on-scroll reveal-visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 mb-4">
              <Radio size={14} />
              Trò chuyện realtime cho đội nhóm hiệu suất cao
            </div>
            <h1 className="text-5xl font-extrabold leading-tight">
              Vào lại không gian cộng tác của bạn
            </h1>
            <p className="mt-4 text-slate-300 text-lg">
              Đồng bộ chat, voice, video và task trong một luồng làm việc liền mạch.
            </p>
            <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-slate-900/55 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-cyan-100 mb-2">Live Preview</p>
              <div className="space-y-2 text-sm">
                <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-cyan-400/25 px-3 py-2 text-cyan-50">
                  Team ơi, check task trước 17:00 nhé.
                </div>
                <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-slate-700/70 px-3 py-2 text-slate-100">
                  Oke, mình cập nhật tiến độ ngay.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.45)] flex items-center justify-center">
                <Zap size={22} className="text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Chat Realtime</span>
            </div>
            <p className="text-slate-300">Đăng nhập để tiếp tục</p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail size={18} />}
                autoFocus
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock size={18} />}
              />
              <Button type="submit" fullWidth isLoading={loading} size="lg">
                Đăng nhập
              </Button>
            </form>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
              <ShieldCheck size={14} />
              Phiên đăng nhập được bảo vệ bằng xác thực JWT.
            </div>

            <div className="mt-6 text-center text-sm text-slate-300">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
