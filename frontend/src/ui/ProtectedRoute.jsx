import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { migrateLegacyStorage, STORAGE } from '../lib/storageKeys.js';

const dashboardByRole = {
  admin: '/dashboard/admin',
  instructor: '/dashboard/instructor',
  student: '/dashboard/user',
  user: '/dashboard/user',
};

function getStoredUser() {
  migrateLegacyStorage();
  try {
    const rawUser = localStorage.getItem(STORAGE.user);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem(STORAGE.token);
  localStorage.removeItem(STORAGE.user);
}

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(STORAGE.token);

    if (!token) {
      setStatus('signed-out');
      return undefined;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        clearAuth();
        setStatus('signed-out');
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <main className="grid min-h-[calc(100vh-69px)] place-items-center px-4 py-12">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm font-black uppercase text-indigo-500">Checking access</p>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Verifying your dashboard permissions...</p>
        </div>
      </main>
    );
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = user?.role;

  if (!allowedRoles.includes(role)) {
    const redirectTo = dashboardByRole[role];

    if (redirectTo && redirectTo !== location.pathname) {
      return <Navigate to={redirectTo} replace />;
    }

    return (
      <main className="grid min-h-[calc(100vh-69px)] place-items-center px-4 py-12">
        <div className="glass max-w-md rounded-2xl p-6 text-center">
          <p className="text-sm font-black uppercase text-red-500">Access denied</p>
          <h1 className="mt-2 text-3xl font-black">This dashboard is not assigned to your role.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Sign in with the correct account to open this dashboard.
          </p>
          <Link to="/login" className="mt-5 inline-flex h-11 items-center rounded-full bg-indigo-600 px-5 font-bold text-white">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return children;
}
