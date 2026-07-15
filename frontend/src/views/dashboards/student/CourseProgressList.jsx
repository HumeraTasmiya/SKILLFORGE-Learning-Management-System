import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import clsx from 'clsx';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] },
});

export function CourseProgressList({ items, dark, onResume }) {
  const list = Array.isArray(items) ? items : [];

  if (list.length === 0) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-dashed px-6 py-12 text-center',
          dark ? 'border-slate-600 bg-slate-900/40' : 'border-slate-200 bg-slate-50',
        )}
      >
        <p className={clsx('font-bold', dark ? 'text-slate-200' : 'text-slate-800')}>No courses in progress</p>
        <p className="mt-2 text-sm text-slate-500">Enroll in a course to see your next lesson and resume shortcut here.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((row, i) => (
        <motion.li
          key={row.courseId || row.enrollmentId || i}
          {...fade(0.05 + i * 0.05)}
          className={clsx(
            'flex flex-col overflow-hidden rounded-2xl border shadow-sm',
            dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
          )}
        >
          <div className="relative h-28 bg-slate-200 dark:bg-slate-900">
            {row.thumbnail ? (
              <img src={row.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-600/30 to-violet-600/40 text-lg font-black text-white">
                {(row.title || 'C').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
              {row.category || 'Course'}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className={clsx('line-clamp-2 text-sm font-extrabold leading-snug', dark ? 'text-white' : 'text-slate-900')}>
              {row.title}
            </h3>
            <p className="mt-1 text-xs font-semibold text-indigo-500 dark:text-indigo-400">{row.chapterLabel}</p>
            <p className={clsx('mt-1 line-clamp-2 text-xs', dark ? 'text-slate-400' : 'text-slate-600')}>
              <span className="font-bold text-slate-700 dark:text-slate-300">Now: </span>
              {row.lessonTitle}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-500">
                <span>Progress</span>
                <span>{row.progress ?? 0}%</span>
              </div>
              <div className={clsx('h-2 overflow-hidden rounded-full', dark ? 'bg-slate-700' : 'bg-slate-100')}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, row.progress ?? 0)}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onResume?.(row)}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white transition hover:bg-indigo-500 active:scale-[0.99]"
            >
              <PlayCircle className="h-4 w-4" aria-hidden />
              Resume
            </button>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
