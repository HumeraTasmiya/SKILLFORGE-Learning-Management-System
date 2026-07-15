import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  BadgeCheck,
  Bell,
  Bookmark,
  BrainCircuit,
  ChevronRight,
  Clock3,
  Code2,
  CreditCard,
  Download,
  FileCheck2,
  Flame,
  Gauge,
  GraduationCap,
  Heart,
  Layers3,
  LineChart as LineChartIcon,
  MonitorPlay,
  NotebookPen,
  Play,
  QrCode,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  WandSparkles,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

const panelBase = 'rounded-3xl border shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl';
const panelTone = (dark) =>
  dark
    ? 'border-white/10 bg-slate-900/72 text-slate-100'
    : 'border-white/80 bg-white/78 text-slate-900';

const statusPill = (dark) =>
  clsx(
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold',
    dark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white/70 text-slate-600',
  );

const formatHours = (minutes) => {
  const n = Number(minutes || 0);
  if (!n) return '1h';
  const hours = Math.max(1, Math.round(n / 60));
  return `${hours}h`;
};

function deriveLevel(progress) {
  if (progress >= 80) return 'Advanced';
  if (progress >= 45) return 'Intermediate';
  return 'Beginner';
}

function courseRows(courses) {
  return (Array.isArray(courses) ? courses : []).map((course, index) => ({
    ...course,
    rating: (4.5 + (index % 5) * 0.08).toFixed(1),
    difficulty: course.level || deriveLevel(Number(course.progress || 0)),
    eta: formatHours(course.totalDuration),
    category: course.category || ['AI', 'Data', 'Design', 'Cloud'][index % 4],
    lastAccessedLabel: index === 0 ? 'Today' : `${index + 1}d ago`,
    xp: 240 + index * 85,
  }));
}

function SectionHeader({ eyebrow, title, action, dark }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase text-indigo-500 dark:text-cyan-300">{eyebrow}</p> : null}
        <h2 className={clsx('text-xl font-black sm:text-2xl', dark ? 'text-white' : 'text-slate-950')}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Ring({ value, label, dark }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#06b6d4 ${pct * 3.6}deg, ${dark ? 'rgba(30,41,59,.95)' : 'rgba(226,232,240,.95)'} 0deg)`,
        }}
      />
      <div className={clsx('relative grid h-[86px] w-[86px] place-items-center rounded-full', dark ? 'bg-slate-950' : 'bg-white')}>
        <div className="text-center">
          <p className={clsx('text-2xl font-black', dark ? 'text-white' : 'text-slate-950')}>{pct}%</p>
          <p className="text-[11px] font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function EnterpriseHero({ user, metrics, courses, streakDays, dark }) {
  const rows = courseRows(courses);
  const avgProgress = rows.length
    ? Math.round(rows.reduce((sum, course) => sum + Number(course.progress || 0), 0) / rows.length)
    : 0;
  const goal = Math.min(100, Math.round((Number(metrics?.hoursStudiedThisWeek || 0) / 8) * 100));
  const xp = rows.reduce((sum, course) => sum + course.xp, 0) + Number(metrics?.certificatesEarned || 0) * 500;
  const level = Math.max(1, Math.floor(xp / 900) + 1);

  return (
    <section
      className={clsx(
        panelBase,
        panelTone(dark),
        'relative isolate mb-8 overflow-hidden p-5 sm:p-6 lg:p-7',
      )}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(6,182,212,.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,.20),transparent_26%),linear-gradient(135deg,rgba(79,70,229,.10),transparent_45%)]" />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className={statusPill(dark)}>
              <Sparkles className="h-3.5 w-3.5" />
              Learn. Practice. Master.
            </span>
            <span className={statusPill(dark)}>
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {streakDays || 0} day streak
            </span>
            <span className={statusPill(dark)}>
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Level {level}
            </span>
          </div>
          <h1 className={clsx('max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl', dark ? 'text-white' : 'text-slate-950')}>
            Welcome back, {user?.name?.split(/\s+/)[0] || 'Student'}
          </h1>
          <p className={clsx('mt-3 max-w-2xl text-sm leading-6 sm:text-base', dark ? 'text-slate-300' : 'text-slate-600')}>
            Your AI-powered learning cockpit is ready with progress, assessments, labs, certificates, and the next best action.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Daily goal', `${goal}%`, Target, '#06b6d4'],
              ['Overall completion', `${avgProgress}%`, Gauge, '#8b5cf6'],
              ['XP points', xp.toLocaleString(), Trophy, '#f59e0b'],
            ].map(([label, value, Icon, color]) => (
              <div
                key={label}
                className={clsx(
                  'rounded-2xl border p-4',
                  dark ? 'border-white/10 bg-white/[0.04]' : 'border-white/80 bg-white/60',
                )}
              >
                <Icon className="h-5 w-5" style={{ color }} />
                <p className={clsx('mt-3 text-2xl font-black', dark ? 'text-white' : 'text-slate-950')}>{value}</p>
                <p className="text-xs font-bold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={clsx('rounded-3xl border p-4', dark ? 'border-white/10 bg-slate-950/50' : 'border-white/80 bg-white/70')}>
          <div className="flex items-center justify-between gap-4">
            <Ring value={avgProgress} label="mastery" dark={dark} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase text-indigo-500 dark:text-cyan-300">Next best action</p>
              <p className={clsx('mt-2 text-lg font-black', dark ? 'text-white' : 'text-slate-950')}>
                {rows[0]?.lessonTitle || 'Start your next lesson'}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{rows[0]?.title || 'Browse the course catalog'}</p>
              <Link
                to={rows[0]?.courseId ? `/courses/${rows[0].courseId}` : '/courses'}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:scale-[1.02] dark:bg-white dark:text-slate-950"
              >
                Resume path <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {['AI mentor check-in', 'Practice weak concepts', 'Submit project update'].map((item, index) => (
              <div key={item} className={clsx('flex items-center gap-3 rounded-2xl px-3 py-2', dark ? 'bg-white/[0.04]' : 'bg-slate-50')}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-500/15 text-xs font-black text-indigo-600 dark:text-cyan-300">
                  {index + 1}
                </span>
                <span className="text-sm font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CourseManagementModule({ courses, dark, onResume }) {
  const rows = courseRows(courses);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [saved, setSaved] = useState(() => new Set());
  const categories = ['All', ...Array.from(new Set(rows.map((row) => row.category).filter(Boolean)))];
  const filtered = rows.filter((row) => {
    const matchesSearch = `${row.title} ${row.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || row.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="student-course-management" className="mb-8 scroll-mt-24">
      <SectionHeader
        eyebrow="Course management"
        title="Enrolled courses and saved paths"
        dark={dark}
        action={
          <Link to="/courses" className="inline-flex h-10 items-center rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white hover:bg-indigo-500">
            Explore catalog
          </Link>
        }
      />
      <div className={clsx(panelBase, panelTone(dark), 'p-4 sm:p-5')}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className={clsx('flex h-12 items-center gap-2 rounded-2xl border px-3', dark ? 'border-white/10 bg-slate-950/50' : 'border-slate-200 bg-white')}>
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your courses"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={clsx(
                  'h-12 shrink-0 rounded-2xl border px-4 text-sm font-black transition',
                  category === item
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : dark
                      ? 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-indigo-400'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const isSaved = saved.has(String(course.courseId));
            return (
              <article
                key={String(course.courseId || course.enrollmentId)}
                className={clsx(
                  'overflow-hidden rounded-3xl border transition hover:-translate-y-1 hover:shadow-2xl',
                  dark ? 'border-white/10 bg-slate-950/55' : 'border-slate-200 bg-white/80',
                )}
              >
                <div className="relative h-40 bg-slate-200">
                  {course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : null}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                  <button
                    type="button"
                    onClick={() => {
                      setSaved((current) => {
                        const next = new Set(current);
                        if (next.has(String(course.courseId))) next.delete(String(course.courseId));
                        else next.add(String(course.courseId));
                        return next;
                      });
                    }}
                    className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:scale-105"
                    aria-label={isSaved ? 'Remove from saved courses' : 'Save course'}
                  >
                    {isSaved ? <Heart className="h-4 w-4 fill-current text-rose-300" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-slate-900">
                    {course.category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={clsx('line-clamp-2 font-black', dark ? 'text-white' : 'text-slate-950')}>{course.title}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs font-black text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {course.rating}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-500">{course.lessonTitle}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      [course.difficulty, 'Difficulty'],
                      [course.eta, 'ETA'],
                      [course.lastAccessedLabel, 'Recent'],
                    ].map(([value, label]) => (
                      <div key={label} className={clsx('rounded-2xl px-2 py-2', dark ? 'bg-white/[0.04]' : 'bg-slate-50')}>
                        <p className="text-xs font-black">{value}</p>
                        <p className="text-[10px] font-bold text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className={clsx('h-2 overflow-hidden rounded-full', dark ? 'bg-slate-800' : 'bg-slate-100')}>
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500" style={{ width: `${Math.min(100, course.progress || 0)}%` }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResume?.(course)}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white transition hover:scale-[1.01] dark:bg-white dark:text-slate-950"
                  >
                    <Play className="h-4 w-4" />
                    Resume last lesson
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SmartLearningStudio({ courses, dark }) {
  const rows = courseRows(courses);
  const active = rows[0] || {};

  return (
    <section id="smart-learning" className="mb-8 scroll-mt-24">
      <SectionHeader eyebrow="Smart learning experience" title="Lecture studio, notes, tutor, and learning path" dark={dark} />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className={clsx(panelBase, panelTone(dark), 'overflow-hidden')}>
          <div className="relative aspect-video bg-slate-950">
            {active.thumbnail ? <img src={active.thumbnail} alt="" className="h-full w-full object-cover opacity-55" /> : null}
            <div className="absolute inset-0 grid place-items-center">
              <button type="button" className="grid h-20 w-20 place-items-center rounded-full bg-white/90 text-slate-950 shadow-2xl transition hover:scale-105">
                <Play className="h-8 w-8 fill-current" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-black uppercase text-cyan-200">Now playing</p>
              <h3 className="mt-1 line-clamp-1 text-xl font-black text-white">{active.lessonTitle || 'Interactive lesson'}</h3>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-4">
            {[
              ['1.25x', 'Speed', MonitorPlay],
              ['Transcript', 'Support', NotebookPen],
              ['Bookmarks', 'Lessons', Bookmark],
              ['Materials', 'Download', Download],
            ].map(([value, label, Icon]) => (
              <button
                key={label}
                type="button"
                className={clsx('flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition hover:-translate-y-0.5', dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white')}
              >
                <Icon className="h-5 w-5 text-indigo-500" />
                <span>
                  <span className="block text-sm font-black">{value}</span>
                  <span className="block text-xs font-bold text-slate-500">{label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
            <div className="flex items-center gap-3">
              <WandSparkles className="h-5 w-5 text-violet-500" />
              <h3 className="font-black">AI path generator</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {['Review weak quiz areas', 'Practice two coding drills', 'Build portfolio evidence', 'Unlock certificate checkout'].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/15 text-xs font-black text-violet-500">{index + 1}</span>
                  <span className="text-sm font-bold">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
            <div className="flex items-center gap-3">
              <NotebookPen className="h-5 w-5 text-cyan-500" />
              <h3 className="font-black">Smart notes</h3>
            </div>
            <textarea
              rows={6}
              defaultValue={`Key idea from ${active.title || 'this course'}:\n- Capture implementation decisions\n- Ask the AI tutor for examples\n- Bookmark blockers for review`}
              className={clsx('mt-4 w-full resize-none rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/25', dark ? 'border-white/10 bg-slate-950/70 text-slate-200' : 'border-slate-200 bg-white text-slate-700')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PracticeAssessmentModule({ quizScores, dark }) {
  const chart = (Array.isArray(quizScores) && quizScores.length ? quizScores : []).slice(0, 6).map((item, index) => ({
    name: `Q${index + 1}`,
    score: Number(item.score || 0),
  }));
  const fallback = chart.length ? chart : [
    { name: 'Q1', score: 72 },
    { name: 'Q2', score: 81 },
    { name: 'Q3', score: 68 },
    { name: 'Q4', score: 88 },
  ];

  return (
    <section id="practice-assessments" className="mb-8 scroll-mt-24">
      <SectionHeader eyebrow="Practice and assessment" title="Quizzes, coding drills, tests, and weak-area detection" dark={dark} />
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Timed assessment', '24 min', Clock3, '#f59e0b'],
              ['Coding problems', '18 open', Code2, '#06b6d4'],
              ['Mock exams', '3 ready', FileCheck2, '#8b5cf6'],
              ['Leaderboard rank', '#12', Trophy, '#10b981'],
            ].map(([title, value, Icon, color]) => (
              <div key={title} className={clsx('rounded-2xl border p-4', dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white')}>
                <Icon className="h-5 w-5" style={{ color }} />
                <p className="mt-4 text-2xl font-black">{value}</p>
                <p className="text-xs font-bold text-slate-500">{title}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 p-4 text-white">
            <p className="text-sm font-black">Instant feedback system</p>
            <p className="mt-1 text-sm text-white/80">Weak areas detected: recursion, prompt evaluation, cloud IAM.</p>
          </div>
        </div>
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <h3 className="font-black">Quiz history and performance trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={fallback}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.22} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectsLabsModule({ dark }) {
  return (
    <section id="projects-labs" className="mb-8 scroll-mt-24">
      <SectionHeader eyebrow="Projects and labs" title="Hands-on labs, submissions, feedback, and portfolio" dark={dark} />
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          ['Guided lab', 'AI portfolio project', 'Auto evaluation queued', Layers3, 'from-cyan-500 to-indigo-500'],
          ['Real assignment', 'Deployment checklist', 'Instructor feedback ready', FileCheck2, 'from-emerald-500 to-teal-500'],
          ['Portfolio showcase', '3 artifacts published', 'Share-ready profile', GraduationCap, 'from-violet-500 to-fuchsia-500'],
        ].map(([type, title, detail, Icon, gradient]) => (
          <article key={title} className={clsx(panelBase, panelTone(dark), 'overflow-hidden')}>
            <div className={clsx('h-2 bg-gradient-to-r', gradient)} />
            <div className="p-5">
              <Icon className="h-6 w-6 text-indigo-500" />
              <p className="mt-4 text-xs font-black uppercase text-slate-500">{type}</p>
              <h3 className="mt-1 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">{detail}</p>
              <button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-2xl border border-indigo-500/40 px-4 text-sm font-black text-indigo-600 dark:text-cyan-300">
                Open workspace <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AnalyticsGamificationModule({ metrics, streakDays, dark }) {
  const hours = Number(metrics?.hoursStudiedThisWeek || 0);
  const data = [
    { day: 'Mon', hours: Math.max(1, hours - 3), xp: 260 },
    { day: 'Tue', hours: Math.max(1, hours - 2), xp: 340 },
    { day: 'Wed', hours: Math.max(1, hours - 1), xp: 410 },
    { day: 'Thu', hours: Math.max(1, hours), xp: 520 },
    { day: 'Fri', hours: Math.max(1, hours + 1), xp: 610 },
  ];
  const skills = [
    { skill: 'Concepts', value: 82 },
    { skill: 'Practice', value: 74 },
    { skill: 'Projects', value: 68 },
    { skill: 'Quizzes', value: 79 },
    { skill: 'Consistency', value: Math.min(100, (streakDays || 0) * 10) },
  ];

  return (
    <section id="analytics-gamification" className="mb-8 scroll-mt-24">
      <SectionHeader eyebrow="Progress analytics and gamification" title="Growth charts, reports, XP, badges, and rewards" dark={dark} />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <div className="flex items-center gap-3">
            <LineChartIcon className="h-5 w-5 text-indigo-500" />
            <h3 className="font-black">Weekly learning analytics</h3>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="xp" fill="#06b6d4" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <h3 className="font-black">Skill growth map</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <RadarChart data={skills}>
                <PolarAngleAxis dataKey="skill" />
                <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.28} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ['Streak', `${streakDays || 0}d`, Flame],
              ['Badges', '12', BadgeCheck],
              ['Daily quest', 'Ready', Target],
            ].map(([label, value, Icon]) => (
              <div key={label} className={clsx('rounded-2xl p-3 text-center', dark ? 'bg-white/[0.04]' : 'bg-slate-50')}>
                <Icon className="mx-auto h-5 w-5 text-amber-500" />
                <p className="mt-2 text-sm font-black">{value}</p>
                <p className="text-[10px] font-bold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {['Fast Learner', 'Quiz Master', 'Project Builder', 'Consistency Pro'].map((badge, index) => (
          <div key={badge} className={clsx(panelBase, panelTone(dark), 'p-4 text-center')}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white">
              <Award className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-black">{badge}</p>
            <p className="text-xs font-semibold text-slate-500">{index === 0 ? 'Unlocked' : 'In progress'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CertificatesCommunityAccountModule({ certificates, readyCourses, announcements, dark }) {
  const certCount = Array.isArray(certificates) ? certificates.length : 0;
  const readyCount = Array.isArray(readyCourses) ? readyCourses.length : 0;
  const unread = (Array.isArray(announcements) ? announcements : []).filter((item) => !item.readAt).length;

  return (
    <section id="student-community-account" className="mb-8 scroll-mt-24">
      <SectionHeader eyebrow="Certificates, community, and account" title="Credentials, collaboration, notifications, and security" dark={dark} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <Award className="h-6 w-6 text-amber-500" />
          <h3 className="mt-4 text-lg font-black">Certificates</h3>
          <p className="mt-1 text-sm text-slate-500">{certCount} issued, {readyCount} ready for premium unlock.</p>
          <div className="mt-4 grid gap-2">
            {[
              ['Unlock payment', '$2-$3', CreditCard],
              ['Download PDF', 'Ready', Download],
              ['Verification QR', 'Included', QrCode],
              ['LinkedIn share', 'One click', Share2],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 font-bold"><Icon className="h-4 w-4 text-indigo-500" />{label}</span>
                <span className="font-black">{value}</span>
              </div>
            ))}
          </div>
          <Link to="/certificates" className="mt-5 inline-flex h-10 items-center rounded-2xl bg-amber-500 px-4 text-sm font-black text-white">
            Open gallery
          </Link>
        </div>
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <Users className="h-6 w-6 text-cyan-500" />
          <h3 className="mt-4 text-lg font-black">Community</h3>
          <div className="mt-4 grid gap-3">
            {[
              ['Discussion forums', '42 new posts'],
              ['Peer learning groups', '3 active rooms'],
              ['Course Q&A', 'Instructor replies'],
              ['Community leaderboard', 'Rank #12'],
            ].map(([label, value]) => (
              <div key={label} className={clsx('rounded-2xl px-3 py-3', dark ? 'bg-white/[0.04]' : 'bg-slate-50')}>
                <p className="text-sm font-black">{label}</p>
                <p className="text-xs font-semibold text-slate-500">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={clsx(panelBase, panelTone(dark), 'p-5')}>
          <Settings className="h-6 w-6 text-violet-500" />
          <h3 className="mt-4 text-lg font-black">Account center</h3>
          <div className="mt-4 grid gap-3">
            {[
              [Bell, 'Notifications', `${unread} unread`],
              [ShieldCheck, 'Security settings', 'Protected'],
              [BrainCircuit, 'Learning preferences', 'AI tuned'],
              [CreditCard, 'Payment history', 'Synced'],
            ].map(([Icon, label, value]) => (
              <button
                key={label}
                type="button"
                className={clsx('flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left', dark ? 'bg-white/[0.04]' : 'bg-slate-50')}
              >
                <span className="inline-flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-indigo-500" />{label}</span>
                <span className="text-xs font-bold text-slate-500">{value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
