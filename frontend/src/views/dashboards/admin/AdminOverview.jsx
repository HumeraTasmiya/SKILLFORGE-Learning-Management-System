import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CircleDollarSign,
  ChevronRight,
  GraduationCap,
  LineChart,
  ShoppingBag,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

const formatNumber = (value) => Number(value || 0).toLocaleString();
const percent = (value) => `${Number(value || 0).toLocaleString()}%`;
const money = (value) => `$${Number(value || 0).toLocaleString()}`;
const shortDate = (value) => (value ? new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now');

const fallbackCourses = [
  { title: 'Cloud Certifications', studentCount: 0, lessons: Array.from({ length: 6 }), contentBuiltPct: 60, tone: 'cyan' },
  { title: 'Data Analytics Certification', studentCount: 0, lessons: Array.from({ length: 6 }), contentBuiltPct: 68, tone: 'violet' },
  { title: 'Scrum Master', studentCount: 0, lessons: Array.from({ length: 6 }), contentBuiltPct: 76, tone: 'emerald' },
  { title: 'PMP', studentCount: 0, lessons: Array.from({ length: 6 }), contentBuiltPct: 84, tone: 'orange' },
];

const fallbackReviews = [
  { id: 'r1', title: 'Priya Kapoor', detail: 'ML Assignment 4', at: new Date().toISOString() },
  { id: 'r2', title: 'Ravi Nair', detail: 'Python Project 2', at: new Date().toISOString() },
  { id: 'r3', title: 'Sneha Mehta', detail: 'DL Quiz 3', at: new Date().toISOString() },
  { id: 'r4', title: 'Aisha Khan', detail: 'React Capstone', at: new Date().toISOString() },
];

function courseProgress(course, index) {
  return Math.min(100, Number(course.contentBuiltPct ?? course.progress ?? 60 + index * 8));
}

function courseLessonCount(course) {
  if (Array.isArray(course.lessons)) return course.lessons.length;
  return Number(course.lessonCount || course.totalLessons || 0);
}

function initials(value) {
  return String(value || 'NA')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function AdminOverview({ stats, recentActivities, topCourses }) {
  const courses = useMemo(() => {
    const live = Array.isArray(topCourses) && topCourses.length ? topCourses : fallbackCourses;
    return live.slice(0, 4);
  }, [topCourses]);

  const reviewRows = useMemo(() => {
    const live = Array.isArray(recentActivities) && recentActivities.length ? recentActivities : fallbackReviews;
    return live.slice(0, 4);
  }, [recentActivities]);

  const statCards = useMemo(
    () => [
      { label: 'Total students', value: formatNumber(stats?.totalStudents), delta: `${formatNumber(stats?.activeStudents)} active accounts`, tone: 'emerald', icon: GraduationCap },
      { label: 'Active learners', value: formatNumber(stats?.activeLearners), delta: 'last 30 days', tone: 'emerald', icon: UserCheck },
      { label: 'Revenue', value: money(stats?.revenue ?? stats?.certificateRevenue), delta: 'paid payments', tone: 'amber', icon: CircleDollarSign },
      { label: 'Course completion rate', value: percent(stats?.courseCompletionRate), delta: `${percent(stats?.averageProgress)} avg progress`, tone: 'cyan', icon: LineChart },
      { label: 'New enrollments', value: formatNumber(stats?.newEnrollments), delta: 'last 7 days', tone: 'emerald', icon: UserPlus },
      { label: 'AI usage stats', value: formatNumber(stats?.aiUsageTotal), delta: `${formatNumber(stats?.aiUsageWeek)} this week`, tone: 'violet', icon: BrainCircuit },
      { label: 'Live classes today', value: formatNumber(stats?.liveClassesToday), delta: 'scheduled sessions', tone: 'cyan', icon: CalendarDays },
      { label: 'Pending instructor approvals', value: formatNumber(stats?.pendingInstructorApprovals), delta: 'needs review', tone: 'amber', icon: UserCog },
      { label: 'Certificate purchases', value: formatNumber(stats?.certificatePurchases), delta: `${formatNumber(stats?.totalCertificates)} approved`, tone: 'emerald', icon: ShoppingBag },
      { label: 'Total enrollments', value: formatNumber(stats?.totalEnrollments), delta: `${formatNumber(stats?.totalCourses || courses.length)} courses`, tone: 'emerald', icon: Users },
      { label: 'Pending certificates', value: formatNumber(stats?.pendingCertificates), delta: 'approval queue', tone: 'violet', icon: Award },
    ],
    [courses.length, stats],
  );

  return (
    <div className="admin-overview-grid space-y-10">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group min-h-[146px] rounded-[20px] border border-slate-100 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(15,23,42,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="max-w-[13rem] text-sm font-black uppercase leading-5 text-slate-500">{card.label}</p>
                <span
                  className={clsx(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
                    card.tone === 'cyan' && 'bg-cyan-100 text-cyan-600',
                    card.tone === 'violet' && 'bg-violet-100 text-violet-600',
                    card.tone === 'amber' && 'bg-amber-100 text-amber-700',
                    card.tone === 'emerald' && 'bg-emerald-100 text-emerald-600',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <div className="mt-7 flex items-end justify-between gap-3">
                <p className="text-3xl font-black leading-none text-slate-950">{card.value}</p>
                <span
                  className={clsx(
                    'max-w-[9.5rem] rounded-full px-3 py-1 text-right text-xs font-black leading-5',
                    card.tone === 'cyan' && 'bg-cyan-100 text-cyan-800',
                    card.tone === 'violet' && 'bg-violet-100 text-violet-700',
                    card.tone === 'amber' && 'bg-amber-100 text-amber-800',
                    card.tone === 'emerald' && 'bg-emerald-100 text-emerald-800',
                  )}
                >
                  {card.delta}
                </span>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.7fr)]">
        <div className="rounded-[20px] border border-slate-100 bg-white/92 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-500">Content progress</p>
              <h2 className="text-lg font-black text-slate-950">Course production</h2>
            </div>
            <button
              type="button"
              className="h-11 rounded-lg border border-slate-300 bg-slate-100 px-4 text-sm font-black text-slate-950 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              See all
            </button>
          </div>

          <div className="grid gap-4 p-5">
            {courses.map((course, index) => {
              const progress = courseProgress(course, index);
              return (
                <motion.div
                  key={course._id || course.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.04 }}
                  className="grid gap-4 rounded-lg bg-white px-4 py-3 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:grid-cols-[minmax(0,1fr)_220px]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className={clsx(
                        'h-3 w-3 shrink-0 rounded-full',
                        course.tone === 'violet' ? 'bg-violet-500' :
                          course.tone === 'emerald' ? 'bg-emerald-400' :
                            course.tone === 'orange' ? 'bg-orange-500' : 'bg-cyan-400',
                      )}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-slate-950">{course.title || 'Untitled course'}</h3>
                      <p className="text-sm font-bold text-slate-500">
                        {formatNumber(course.studentCount)} students - {courseLessonCount(course)} lessons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7, delay: 0.12 + index * 0.04 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                      />
                    </div>
                    <span className="w-11 text-right text-sm font-black text-slate-500">{percent(progress)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-100 bg-white/92 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-500">Needs attention</p>
              <h2 className="text-lg font-black text-slate-950">Review queue</h2>
            </div>
            <button
              type="button"
              className="h-11 rounded-lg border border-slate-300 bg-slate-100 px-4 text-sm font-black text-slate-950 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              Open
            </button>
          </div>

          <div className="divide-y divide-slate-200/80">
            {reviewRows.map((item) => (
              <button
                type="button"
                key={item.id || item.title}
                className="grid w-full grid-cols-[3rem_minmax(0,1fr)_1.5rem] items-center gap-3 px-5 py-4 text-left transition hover:bg-cyan-50/70"
              >
                <span className="text-sm font-black text-cyan-300">{initials(item.title)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-black text-slate-950">{item.title}</span>
                  <span className="block truncate text-sm font-semibold text-slate-500">{item.detail || shortDate(item.at)}</span>
                </span>
                <ChevronRight className="h-5 w-5 text-slate-700" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[20px] border border-slate-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl md:grid-cols-3">
        {[
          ['Active admins', formatNumber(stats?.totalAdmins || 1)],
          ['Completion rate', percent(stats?.courseCompletionRate)],
          ['Certificates sold', formatNumber(stats?.certificatePurchases)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-cyan-500">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-xs font-black uppercase text-slate-500">{label}</span>
              <span className="block text-xl font-black text-slate-950">{value}</span>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
