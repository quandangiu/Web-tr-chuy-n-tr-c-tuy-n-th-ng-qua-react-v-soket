import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { User, Mail, Lock, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (!normalizedUsername) errs.username = 'Vui lòng nhập username';
    else if (normalizedUsername.length < 3) errs.username = 'Username ít nhất 3 ký tự';

    if (!normalizedEmail) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(normalizedEmail)) errs.email = 'Email không hợp lệ';

    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errs.password = 'Mật khẩu ít nhất 6 ký tự';

    if (!confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      setAuth(data.user as any, data.accessToken);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || 'Đăng ký thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070f1d] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_50%_95%,rgba(59,130,246,0.22),transparent_40%)]" />
      <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.45)] flex items-center justify-center">
                <Zap size={22} className="text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Chat Realtime</span>
            </div>
            <p className="text-slate-300">Tạo tài khoản mới để bắt đầu</p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username}
                icon={<User size={18} />}
                autoFocus
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail size={18} />}
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock size={18} />}
              />
              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={<Lock size={18} />}
              />
              <Button type="submit" fullWidth isLoading={loading} size="lg">
                Đăng ký
              </Button>
            </form>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
              <Sparkles size={14} />
              Bạn sẽ vào được workspace ngay sau khi đăng ký thành công.
            </div>

            <div className="mt-6 text-center text-sm text-slate-300">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
