import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { dashboardPathForRole } from '../lib/useAuthUser.js';
import { migrateLegacyStorage, STORAGE } from '../lib/storageKeys.js';

function storedUser() {
  migrateLegacyStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE.user) || 'null');
  } catch {
    return null;
  }
}

export function DashboardRedirect() {
  const location = useLocation();
  const [state, setState] = useState(() => ({
    checking: Boolean(localStorage.getItem(STORAGE.token)),
    user: storedUser(),
    signedOut: !localStorage.getItem(STORAGE.token),
  }));

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(STORAGE.token);
    if (!token) {
      setState({ checking: false, user: null, signedOut: true });
      return undefined;
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        if (data?.user) localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
        setState({ checking: false, user: data?.user || storedUser(), signedOut: false });
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(STORAGE.token);
        localStorage.removeItem(STORAGE.user);
        setState({ checking: false, user: null, signedOut: true });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.signedOut) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (state.checking) {
    return (
      <main className="grid min-h-[calc(100vh-69px)] place-items-center px-4 py-12">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm font-black uppercase text-indigo-500">Opening dashboard</p>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Routing you to the correct workspace...</p>
        </div>
      </main>
    );
  }

  return <Navigate to={dashboardPathForRole(state.user?.role)} replace />;
}
