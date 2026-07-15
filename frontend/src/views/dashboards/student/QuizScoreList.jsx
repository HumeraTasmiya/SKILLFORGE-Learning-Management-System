import clsx from 'clsx';
import { TrendingDown, TrendingUp } from 'lucide-react';

function tone(score) {
  if (score >= 80) return { bar: 'from-emerald-500 to-teal-500', text: 'text-emerald-600 dark:text-emerald-400', Icon: TrendingUp };
  if (score >= 65) return { bar: 'from-amber-400 to-orange-500', text: 'text-amber-700 dark:text-amber-300', Icon: TrendingUp };
  return { bar: 'from-rose-500 to-red-500', text: 'text-rose-600 dark:text-rose-400', Icon: TrendingDown };
}

export function QuizScoreList({ items, dark }) {
  const list = Array.isArray(items) ? items.slice(0, 8) : [];

  return (
    <section
      aria-label="Recent quiz scores"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
      )}
    >
      <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Recent quiz scores</h2>
      <p className="mt-0.5 text-xs text-slate-500">Color-coded for quick self-check</p>
      {list.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No quiz attempts yet — open a course and try the end-of-course quiz.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {list.map((q, i) => {
            const s = Number(q.score) || 0;
            const t = tone(s);
            const Icon = t.Icon;
            const when = q.attemptedAt ? new Date(q.attemptedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return (
              <li
                key={`${q.courseTitle}-${i}-${when}`}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border px-3 py-2.5',
                  dark ? 'border-white/5 bg-slate-900/50' : 'border-slate-100 bg-slate-50',
                )}
              >
                <div className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm', t.bar)}>
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={clsx('truncate text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{q.courseTitle}</p>
                  <p className="text-[11px] text-slate-500">{when}</p>
                </div>
                <span className={clsx('shrink-0 text-lg font-black tabular-nums', t.text)}>{s}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
