import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';

function badgeForDue(iso) {
  const due = new Date(iso);
  const now = new Date();
  const ms = due.getTime() - now.getTime();
  const days = Math.ceil(ms / (86400000));
  if (Number.isNaN(days)) return { text: 'Soon', tone: 'slate' };
  if (days < 0) return { text: 'Overdue', tone: 'red' };
  if (days === 0) return { text: 'Today', tone: 'amber' };
  if (days === 1) return { text: '1 day', tone: 'amber' };
  return { text: `${days} days`, tone: days <= 3 ? 'amber' : 'emerald' };
}

export function UpcomingDeadlines({ items, dark }) {
  const list = Array.isArray(items) ? items.slice(0, 3) : [];

  return (
    <section
      aria-label="Upcoming deadlines"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
          <CalendarClock className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Upcoming focus</h2>
          <p className="text-xs text-slate-500">Pace reminders from your last activity (next 2–3 items)</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing urgent — you are caught up on pace reminders.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((d) => {
            const b = badgeForDue(d.dueAt);
            const tone =
              b.tone === 'red'
                ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                : b.tone === 'amber'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                  : 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-200';
            return (
              <li
                key={d.id}
                className={clsx(
                  'flex items-start justify-between gap-3 rounded-xl border px-3 py-3',
                  dark ? 'border-white/5 bg-slate-900/60' : 'border-slate-100 bg-slate-50',
                )}
              >
                <div className="min-w-0">
                  <p className={clsx('text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{d.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{d.subtitle}</p>
                  <Link
                    to={d.courseId ? `/courses/${d.courseId}` : '/courses'}
                    className="mt-2 inline-block text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Open course
                  </Link>
                </div>
                <span className={clsx('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black', tone)}>{b.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
