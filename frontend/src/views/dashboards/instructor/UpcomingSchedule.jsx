import clsx from 'clsx';
import { CalendarRange } from 'lucide-react';

export function UpcomingSchedule({ items, dark }) {
  const list = Array.isArray(items) ? items : [];

  return (
    <section
      aria-label="Upcoming schedule"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
          <CalendarRange className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Upcoming schedule</h2>
          <p className="text-xs text-slate-500">Live sessions, assignment due dates, content review nudges</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing scheduled — add live classes or assignments with due dates.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((s) => (
            <li
              key={s.id}
              className={clsx(
                'flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5',
                dark ? 'border-white/5 bg-slate-950/50' : 'border-slate-100 bg-slate-50',
              )}
            >
              <div className="min-w-0">
                <p className={clsx('text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{s.title}</p>
                <p className="text-xs text-slate-500">{s.subtitle}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{s.meta}</p>
              </div>
              <span className="shrink-0 text-right text-[11px] font-bold text-slate-500">
                {s.at ? new Date(s.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
