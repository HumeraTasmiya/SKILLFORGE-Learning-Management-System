import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { migrateLegacyStorage, STORAGE } from './storageKeys.js';

function readUserFromStorage() {
  migrateLegacyStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE.user) || 'null');
  } catch {
    return null;
  }
}

export function useAuthUser() {
  const [user, setUser] = useState(readUserFromStorage);
  const [ready, setReady] = useState(false);

  const applyStoredUser = useCallback(() => {
    setUser(readUserFromStorage());
  }, []);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(STORAGE.token);

    const finish = () => {
      if (active) setReady(true);
    };

    if (!token) {
      setUser(null);
      finish();
      return () => {
        active = false;
      };
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!active || !data?.user) return;
        localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(STORAGE.token);
        localStorage.removeItem(STORAGE.user);
        setUser(null);
      })
      .finally(finish);

    const onAuthEvent = () => applyStoredUser();
    const onStorage = (e) => {
      if (e.key === STORAGE.user || e.key === STORAGE.token) applyStoredUser();
    };

    window.addEventListener('skillforge-auth', onAuthEvent);
    window.addEventListener('storage', onStorage);

    return () => {
      active = false;
      window.removeEventListener('skillforge-auth', onAuthEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, [applyStoredUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.user);
    setUser(null);
    window.dispatchEvent(new Event('skillforge-auth'));
  }, []);

  return { user, setUser, ready, logout, applyStoredUser };
}

export function dashboardPathForRole(role) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'instructor') return '/dashboard/instructor';
  return '/dashboard/user';
}
