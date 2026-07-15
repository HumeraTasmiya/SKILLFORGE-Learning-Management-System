import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  Settings,
  Sparkles,
  X,
  CalendarDays,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api.js';
import { STORAGE } from '../../lib/storageKeys.js';
import { MetricCards } from './student/MetricCards.jsx';
import { CourseProgressList } from './student/CourseProgressList.jsx';
import { AIChatWidget } from './student/AIChatWidget.jsx';
import { StreakTracker } from './student/StreakTracker.jsx';
import { UpcomingDeadlines } from './student/UpcomingDeadlines.jsx';
import { QuizScoreList } from './student/QuizScoreList.jsx';
import { AnnouncementFeed } from './student/AnnouncementFeed.jsx';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.user) || 'null');
  } catch {
    return null;
  }
}

function displayName(user) {
  if (!user) return 'Student';
  const n = user.name?.trim();
  if (n) return n;
  const e = user.email?.trim();
  if (e) return e.split('@')[0] || 'Student';
  return 'Student';
}

function firstNameFromUser(user) {
  const full = displayName(user);
  const p = full.split(/\s+/).filter(Boolean);
  return p[0] || 'there';
}

function initialsFromUser(user) {
  const name = user?.name?.trim();
  if (!name) {
    const e = user?.email?.trim();
    if (e) return e.slice(0, 2).toUpperCase();
    return 'S';
  }
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function roleLabel(role) {
  if (role === 'instructor') return 'Instructor';
  if (role === 'admin') return 'Admin';
  return 'Student';
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', scrollId: 'dash-top' },
  { icon: BookOpen, label: 'Continue learning', scrollId: 'continue-learning' },
  { icon: Sparkles, label: 'AI assistant', scrollId: 'ai-assistant' },
  { icon: CalendarDays, label: 'Deadlines', scrollId: 'deadlines' },
  { icon: MessageSquare, label: 'Announcements', scrollId: 'announcements' },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

function Sidebar({
  active,
  setActive,
  dark,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  user,
  onOpenSettings,
  onSignOut,
  onScrollTo,
}) {
  const asideClass = clsx(
    'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r transition-all duration-300 lg:sticky lg:top-[69px] lg:z-30 lg:h-[calc(100vh-69px)]',
    dark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white',
    'max-lg:shadow-2xl',
    collapsed && 'lg:w-[72px]',
    !mobileOpen && 'max-lg:-translate-x-full',
    mobileOpen && 'max-lg:translate-x-0',
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open student navigation"
        className={clsx(
          'fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition active:scale-95 lg:hidden',
          dark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900',
        )}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <aside className={asideClass} aria-label="Student dashboard navigation">
        <div className={clsx('flex items-center gap-2 border-b p-3', dark ? 'border-white/10' : 'border-slate-100')}>
          <button
            type="button"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
            className={clsx(
              'hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:inline-flex',
              dark ? 'border-slate-700' : 'border-slate-200',
            )}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-700 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={clsx('border-b px-3 py-4', dark ? 'border-white/10' : 'border-slate-100', collapsed && 'lg:px-2')}>
          <div className={clsx('flex items-center gap-3', collapsed && 'lg:justify-center')}>
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-md"
              aria-hidden
            >
              {initialsFromUser(user)}
            </div>
            {!collapsed && (
              <div className="min-w-0 lg:block">
                <p className={clsx('truncate text-sm font-extrabold', dark ? 'text-slate-100' : 'text-slate-900')}>{displayName(user)}</p>
                <p className="text-xs font-semibold text-indigo-500">{roleLabel(user?.role)}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-3">
          {NAV_ITEMS.map(({ icon: Icon, label, scrollId }) => {
            const sel = active === scrollId;
            return (
              <button
                key={scrollId}
                type="button"
                onClick={() => {
                  setActive(scrollId);
                  onScrollTo(scrollId);
                  setMobileOpen(false);
                }}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition',
                  sel
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : dark
                      ? 'text-slate-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:bg-slate-50',
                  collapsed && 'lg:justify-center lg:px-2',
                )}
                aria-current={sel ? 'page' : undefined}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
              </button>
            );
          })}
          <Link
            to="/courses"
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              dark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50',
              collapsed && 'lg:justify-center lg:px-2',
            )}
            title={collapsed ? 'Browse courses' : undefined}
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
            {!collapsed && <span className="flex-1 truncate">Browse courses</span>}
          </Link>
        </nav>

        <div className={clsx('mt-auto border-t p-2', dark ? 'border-white/10' : 'border-slate-100')}>
          <button
            type="button"
            onClick={onOpenSettings}
            className={clsx(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
              dark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50',
              collapsed && 'lg:justify-center',
            )}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && 'Settings'}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className={clsx(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-500/10',
              collapsed && 'lg:justify-center',
            )}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { theme } = useSelector((s) => s.ui);
  const dark = theme === 'dark';
  const [user, setUser] = useState(() => readStoredUser());
  const [activeNav, setActiveNav] = useState('dash-top');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [dash, setDash] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (cancelled || !data?.user) return;
        localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
        setUser(data.user);
      } catch {
        if (!cancelled) setUser(readStoredUser());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDashLoading(true);
    setDashError('');
    (async () => {
      try {
        const { data } = await api.get('/users/student-dashboard');
        if (!cancelled) setDash(data);
      } catch (e) {
        if (!cancelled) {
          setDash(null);
          setDashError(e.response?.data?.message || 'Could not load dashboard data.');
        }
      } finally {
        if (!cancelled) setDashLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  useEffect(() => {
    if (!profileOpen || !user) return;
    setProfileName(user.name || '');
    setProfileBio(user.bio || '');
    setProfileMessage('');
  }, [profileOpen, user]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.user);
    window.dispatchEvent(new Event('skillforge-auth'));
    navigate('/login', { replace: true });
  }, [navigate]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    try {
      const { data } = await api.put('/users/profile', {
        name: profileName.trim(),
        bio: profileBio.trim(),
      });
      if (data?.user) {
        localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
        setUser(data.user);
        setProfileMessage('Profile saved.');
        window.setTimeout(() => setProfileOpen(false), 600);
      }
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Could not save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const scrollToId = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onResume = (row) => {
    if (!row?.courseId) return;
    const lid = row.resumeLessonId ? String(row.resumeLessonId) : '';
    const q = lid ? `?lesson=${encodeURIComponent(lid)}` : '';
    navigate(`/courses/${row.courseId}${q}`);
  };

  const metrics = dash?.metrics;
  const continueList = dash?.continueLearning || [];
  const streakDays = dash?.streakDays ?? 0;
  const studyDaysLast7 = dash?.studyDaysLast7;
  const deadlines = dash?.upcomingDeadlines || [];
  const quizScores = dash?.recentQuizScores || [];
  const announcements = dash?.announcements || [];

  return (
    <div className={clsx('flex min-h-[calc(100vh-69px)] font-sans', dark ? 'bg-slate-950' : 'bg-slate-50')}>
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        dark={dark}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebar}
        setMobileOpen={setMobileSidebar}
        user={user}
        onOpenSettings={() => setProfileOpen(true)}
        onSignOut={handleSignOut}
        onScrollTo={scrollToId}
      />

      <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:pb-12">
        <motion.section
          id="dash-top"
          {...fade(0)}
          className={clsx(
            'mb-8 scroll-mt-24 rounded-3xl border p-5 shadow-sm sm:p-6',
            dark ? 'border-white/10 bg-gradient-to-br from-slate-900 to-slate-950' : 'border-slate-100 bg-gradient-to-br from-white to-indigo-50/40',
          )}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Student dashboard</p>
          <h1 className={clsx('mt-1 text-2xl font-black sm:text-3xl', dark ? 'text-white' : 'text-slate-900')}>
            Welcome back, {firstNameFromUser(user)}
          </h1>
          <p className={clsx('mt-1 max-w-2xl text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
            Your progress, deadlines, and course-aware assistant in one place. Signed in as{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email || '—'}</span>
          </p>
        </motion.section>

        {dashError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {dashError}
          </div>
        ) : null}

        {dashLoading ? (
          <p className={clsx('mb-8 text-sm font-semibold', dark ? 'text-slate-400' : 'text-slate-500')}>Loading your dashboard…</p>
        ) : (
          <div className="mb-8">
            <MetricCards metrics={metrics} dark={dark} />
          </div>
        )}

        <section id="continue-learning" className="mb-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Continue learning</h2>
              <p className="text-xs text-slate-500">Pick up exactly where you left off</p>
            </div>
            <Link to="/courses" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
              Browse catalog
            </Link>
          </div>
          <CourseProgressList items={continueList} dark={dark} onResume={onResume} />
        </section>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            <StreakTracker studyDaysLast7={studyDaysLast7} streakDays={streakDays} dark={dark} />
            <div id="deadlines" className="scroll-mt-24">
              <UpcomingDeadlines items={deadlines} dark={dark} />
            </div>
            <QuizScoreList items={quizScores} dark={dark} />
          </div>
          <div className="flex flex-col gap-6">
            <AIChatWidget courses={continueList} dark={dark} />
            <div id="announcements" className="scroll-mt-24">
              <AnnouncementFeed items={announcements} dark={dark} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {profileOpen && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => !profileSaving && setProfileOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-dialog-title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className={clsx(
                'w-full max-w-md rounded-2xl border p-6 shadow-2xl',
                dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id="profile-dialog-title" className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>
                  Profile & display name
                </h2>
                <button
                  type="button"
                  disabled={profileSaving}
                  onClick={() => setProfileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className={clsx('mt-1 text-xs', dark ? 'text-slate-400' : 'text-slate-500')}>
                Updates are saved to your account and apply everywhere you sign in.
              </p>
              <form onSubmit={saveProfile} className="mt-5 flex flex-col gap-4">
                <label className={clsx('block text-xs font-bold uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>
                  Full name
                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    minLength={2}
                    className={clsx(
                      'mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none ring-indigo-500/30 focus:ring-2',
                      dark ? 'border-slate-600 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900',
                    )}
                    autoComplete="name"
                  />
                </label>
                <label className={clsx('block text-xs font-bold uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>
                  Bio (optional)
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    rows={3}
                    className={clsx(
                      'mt-1 w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none ring-indigo-500/30 focus:ring-2',
                      dark ? 'border-slate-600 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800',
                    )}
                  />
                </label>
                {profileMessage ? (
                  <p
                    className={clsx(
                      'text-sm font-semibold',
                      profileMessage.includes('save') || profileMessage.includes('Saved') ? 'text-emerald-600' : 'text-red-600',
                    )}
                  >
                    {profileMessage}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={profileSaving}
                    onClick={() => setProfileOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold dark:border-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
