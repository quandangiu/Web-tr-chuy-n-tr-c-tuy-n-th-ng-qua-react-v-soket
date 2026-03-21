import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ChannelPage } from './pages/ChannelPage';
import { JoinInvitePage } from './pages/JoinInvitePage';
import { HomePage } from './pages/HomePage';

/* ── Protected Route wrapper ── */
const ProtectedRoute: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
};

/* ── Guest Route wrapper (đã login → redirect về trang trước đó) ── */
const GuestRoute: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  if (user) return <Navigate to={from} replace />;
  return <Outlet />;
};

/* ── Router ── */
export const router = createBrowserRouter([
  // Public home
  {
    path: '/',
    element: <HomePage />,
  },
  // Guest routes
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'workspace',
        element: <AppLayout />,
        children: [
          {
            path: ':slug',
            element: <WorkspacePage />,
          },
          {
            path: ':slug/channel/:channelId',
            element: <ChannelPage />,
          },
          {
            path: 'join/:inviteCode',
            element: <JoinInvitePage />,
          },
        ],
      },
    ],
  },
  // Catch all
  { path: '*', element: <Navigate to="/" replace /> },
]);
