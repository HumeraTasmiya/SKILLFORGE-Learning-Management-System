import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BookOpen,
  Blocks,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageCircleQuestion,
  PanelLeftClose,
  Percent,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api.js';
import { STORAGE } from '../../lib/storageKeys.js';
import { MetricBar } from './instructor/MetricBar.jsx';
import { CourseManagementList } from './instructor/CourseManagementList.jsx';
import { CourseAnalyticsPanel, CourseBuilderStudio } from './instructor/CourseBuilderStudio.jsx';
import { GradingQueue } from './instructor/GradingQueue.jsx';
import { LessonEngagementChart } from './instructor/LessonEngagementChart.jsx';
import { AIAssistantPanel } from './instructor/AIAssistantPanel.jsx';
import { AtRiskStudentList } from './instructor/AtRiskStudentList.jsx';
import { ActivityFeed } from './instructor/ActivityFeed.jsx';
import { QAQueue } from './instructor/QAQueue.jsx';
import { UpcomingSchedule } from './instructor/UpcomingSchedule.jsx';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.user) || 'null');
  } catch {
    return null;
  }
}

function displayName(user) {
  if (!user) return 'Instructor';
  const n = user.name?.trim();
  if (n) return n;
  const e = user.email?.trim();
  if (e) return e.split('@')[0] || 'Instructor';
  return 'Instructor';
}

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, scrollId: 'inst-top' },
  { id: 'builder', label: 'Course builder', icon: Blocks, scrollId: 'instructor-builder' },
  { id: 'courses', label: 'My courses', icon: BookOpen, scrollId: 'instructor-my-courses' },
  { id: 'analytics', label: 'Analytics', icon: Percent, scrollId: 'instructor-analytics' },
  { id: 'grading', label: 'Grading', icon: ClipboardList, scrollId: 'instructor-grading' },
  { id: 'engage', label: 'Engagement', icon: Users, scrollId: 'instructor-engage' },
  { id: 'ai', label: 'AI assistant', icon: Sparkles, scrollId: 'instructor-ai' },
  { id: 'risk', label: 'At-risk', icon: Activity, scrollId: 'instructor-risk' },
  { id: 'qa', label: 'Q&A', icon: MessageCircleQuestion, scrollId: 'instructor-qa' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, scrollId: 'instructor-schedule' },
];

export function InstructorDashboard() {
  const dark = useSelector((s) => s.ui.theme) === 'dark';
  const [section, setSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(() => readStoredUser());
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/instructor/workspace');
      setWs(data);
    } catch (e) {
      setWs(null);
      setError(e.response?.data?.message || 'Could not load instructor workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled && data?.user) {
          localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch {
        /* keep stored */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onNav = (id, scrollId) => {
    setSection(id);
    setMobileNav(false);
    window.setTimeout(() => scrollTo(scrollId), 0);
  };

  const aside = clsx(
    'fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r transition-all duration-300 lg:sticky lg:top-[69px] lg:z-30 lg:h-[calc(100vh-69px)]',
    dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white',
    'max-lg:shadow-2xl',
    collapsed && 'lg:w-[72px]',
    !mobileNav && 'max-lg:-translate-x-full',
    mobileNav && 'max-lg:translate-x-0',
  );

  const metrics = ws?.metrics;
  const myCourses = ws?.myCourses;
  const gradingQueue = ws?.gradingQueue;
  const lessonEngagement = ws?.lessonEngagement;
  const atRisk = ws?.atRisk;
  const activityFeed = ws?.activityFeed;
  const qaQueue = ws?.qaQueue;
  const schedule = ws?.schedule;

  return (
    <div className={clsx('flex min-h-[calc(100vh-69px)]', dark ? 'bg-slate-950' : 'bg-slate-50')}>
      <AnimatePresence>
        {mobileNav && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}
      </AnimatePresence>

      <aside className={aside} aria-label="Instructor navigation">
        <div className={clsx('flex items-center gap-2 border-b p-3', dark ? 'border-slate-800' : 'border-slate-100')}>
          <div className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md', collapsed && 'lg:mx-auto')}>
            <GraduationCap className="h-5 w-5" aria-hidden />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-emerald-600 dark:text-emerald-400">Instructor</p>
              <p className={clsx('truncate text-xs font-semibold', dark ? 'text-slate-400' : 'text-slate-500')}>{displayName(user)}</p>
            </div>
          )}
          <button
            type="button"
            className="ml-auto hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 dark:border-slate-700 lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-4">
          {NAV.map(({ id, label, icon: Icon, scrollId }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNav(id, scrollId)}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition',
                section === id
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : dark
                    ? 'text-slate-400 hover:bg-slate-900'
                    : 'text-slate-600 hover:bg-slate-100',
                collapsed && 'lg:justify-center lg:px-2',
              )}
              aria-current={section === id ? 'page' : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        <div className={clsx('border-t p-3', dark ? 'border-slate-800' : 'border-slate-100')}>
          <button
            type="button"
            onClick={() => onNav('courses', 'instructor-my-courses')}
            className={clsx(
              'flex w-full items-center justify-center rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-black text-white transition hover:bg-emerald-500',
              collapsed && 'lg:px-0',
            )}
          >
            {!collapsed ? 'Manage courses' : '·'}
          </button>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Open instructor menu"
        onClick={() => setMobileNav(true)}
        className={clsx(
          'fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition active:scale-95 lg:hidden',
          dark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white',
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:pb-12">
        <header id="inst-top" className="mb-8 scroll-mt-24">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Teaching studio</p>
          <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Instructor workspace</h1>
          <p className={clsx('mt-2 max-w-2xl text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
            KPIs, course health, grading queue, lesson engagement, Anthropic-powered assistant, at-risk alerts, Q&A, and schedule — backed by your Express workspace API.
          </p>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {section !== 'builder' && section !== 'analytics' && loading ? (
          <p className={clsx('mb-8 text-sm font-semibold', dark ? 'text-slate-400' : 'text-slate-500')}>Loading workspace…</p>
        ) : section !== 'builder' && section !== 'analytics' ? (
          <div className="mb-10">
            <MetricBar metrics={metrics} dark={dark} />
          </div>
        ) : null}

        {section === 'builder' && (
        <div className="mb-10">
          <CourseBuilderStudio courses={myCourses} dark={dark} onCourseSaved={loadWorkspace} />
        </div>
        )}

        {section === 'analytics' && (
        <div className="mb-10">
          <CourseAnalyticsPanel dark={dark} />
        </div>
        )}

        {section !== 'builder' && section !== 'analytics' && (
        <>
        <div className="mb-10">
          <CourseManagementList courses={myCourses} dark={dark} onCourseChanged={loadWorkspace} />
        </div>

        <div id="instructor-grading" className="mb-10 scroll-mt-24 grid gap-6 xl:grid-cols-2">
          <GradingQueue items={gradingQueue} dark={dark} />
          <div id="instructor-schedule" className="scroll-mt-24">
            <UpcomingSchedule items={schedule} dark={dark} />
          </div>
        </div>

        <div id="instructor-engage" className="mb-10 scroll-mt-24">
          <LessonEngagementChart data={lessonEngagement} dark={dark} />
        </div>

        <div className="mb-10 grid gap-6 xl:grid-cols-2">
          <AIAssistantPanel courses={myCourses} dark={dark} />
          <div id="instructor-risk" className="scroll-mt-24">
            <AtRiskStudentList items={atRisk} dark={dark} />
          </div>
        </div>

        <div className="mb-10 grid gap-6 xl:grid-cols-2">
          <ActivityFeed items={activityFeed} dark={dark} />
          <div id="instructor-qa" className="scroll-mt-24">
            <QAQueue items={qaQueue} dark={dark} onAnswered={loadWorkspace} />
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
