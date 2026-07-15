import { motion } from 'framer-motion';
import { BookOpen, Star, TrendingUp, Users } from 'lucide-react';
import clsx from 'clsx';

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: d },
});

export function MetricBar({ metrics, dark }) {
  const m = metrics || {};
  const rating = m.overallRating != null && m.overallRating > 0 ? m.overallRating.toFixed(1) : '—';

  const items = [
    { icon: Users, label: 'Students enrolled', value: m.totalStudents ?? 0, sub: 'Across your courses', color: '#10b981' },
    { icon: BookOpen, label: 'Active courses', value: m.activeCourses ?? 0, sub: 'Published', color: '#06b6d4' },
    { icon: TrendingUp, label: 'Avg completion', value: `${m.avgCompletion ?? 0}%`, sub: 'All enrollments', color: '#8b5cf6' },
    { icon: Star, label: 'Overall rating', value: rating, sub: 'Weighted by reviews', color: '#f59e0b' },
  ];

  return (
    <section aria-label="Instructor KPIs" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
        <motion.div
          key={it.label}
          {...fade(i * 0.05)}
          className={clsx(
            'rounded-2xl border p-4 shadow-sm sm:p-5',
            dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
          )}
        >
          <div
            className="mb-3 grid h-10 w-10 place-items-center rounded-xl"
            style={{ background: `${it.color}18`, color: it.color }}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <p className={clsx('text-2xl font-black tabular-nums sm:text-[28px]', dark ? 'text-white' : 'text-slate-900')}>
            {it.value}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{it.label}</p>
          <p className="mt-0.5 text-[11px] font-semibold text-emerald-600/90 dark:text-emerald-400/90">{it.sub}</p>
        </motion.div>
        );
      })}
    </section>
  );
}
