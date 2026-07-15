import { motion } from 'framer-motion';
import { Award, BookOpen, Clock, Target } from 'lucide-react';
import clsx from 'clsx';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

function Card({ icon: Icon, label, value, sub, color, dark, delay }) {
  return (
    <motion.div
      {...fade(delay)}
      className={clsx(
        'flex flex-col gap-2 rounded-2xl border p-4 shadow-sm sm:p-5',
        dark ? 'border-white/10 bg-slate-800/90' : 'border-slate-100 bg-white',
      )}
    >
      <div
        className="grid h-9 w-9 place-items-center rounded-xl sm:h-10 sm:w-10"
        style={{ background: `${color}18`, color }}
      >
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
      </div>
      <p className={clsx('text-2xl font-black tabular-nums sm:text-[26px]', dark ? 'text-white' : 'text-slate-900')}>
        {value}
      </p>
      <p className={clsx('text-xs font-bold uppercase tracking-wide', dark ? 'text-slate-400' : 'text-slate-500')}>
        {label}
      </p>
      {sub ? <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400">{sub}</p> : null}
    </motion.div>
  );
}

export function MetricCards({ metrics, dark }) {
  const m = metrics || {};
  const avg =
    m.avgQuizScore == null || Number.isNaN(m.avgQuizScore)
      ? '—'
      : `${m.avgQuizScore}%`;

  return (
    <section aria-label="Learning metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        icon={BookOpen}
        label="Enrolled courses"
        value={m.enrolledCourses ?? 0}
        sub="Active programs"
        color="#6366f1"
        dark={dark}
        delay={0.04}
      />
      <Card
        icon={Clock}
        label="Hours this week"
        value={Number(m.hoursStudiedThisWeek ?? 0).toFixed(1)}
        sub="From lessons & quizzes"
        color="#06b6d4"
        dark={dark}
        delay={0.08}
      />
      <Card
        icon={Target}
        label="Avg quiz score"
        value={avg}
        sub="Across all attempts"
        color="#f59e0b"
        dark={dark}
        delay={0.12}
      />
      <Card
        icon={Award}
        label="Certificates earned"
        value={m.certificatesEarned ?? 0}
        sub="Approved credentials"
        color="#10b981"
        dark={dark}
        delay={0.16}
      />
    </section>
  );
}
