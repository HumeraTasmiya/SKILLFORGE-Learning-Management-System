import clsx from 'clsx';
import { Activity, Bot, BookOpen, UserPlus } from 'lucide-react';

const iconFor = (type) => {
  if (type === 'enrollment') return UserPlus;
  if (type === 'submission') return BookOpen;
  if (type === 'chatbot') return Bot;
  if (type === 'at_risk') return Activity;
  return Activity;
};

export function ActivityFeed({ items, dark }) {
  const list = Array.isArray(items) ? items.slice(0, 22) : [];

  return (
    <section
      aria-label="Activity feed"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Activity feed</h2>
      <p className="mt-0.5 text-xs text-slate-500">Enrollments, submissions, AI signals, and risk flags</p>
      {list.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No recent cross-course activity.</p>
      ) : (
        <ul className="mt-4 flex max-h-[340px] flex-col gap-2 overflow-y-auto">
          {list.map((ev) => {
            const Icon = iconFor(ev.type);
            return (
              <li
                key={ev.id}
                className={clsx(
                  'flex gap-3 rounded-xl border px-3 py-2.5',
                  dark ? 'border-white/5 bg-slate-950/50' : 'border-slate-100 bg-slate-50',
                )}
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className={clsx('text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{ev.title}</p>
                  <p className="text-xs text-slate-500">{ev.detail}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400">
                    {ev.at ? new Date(ev.at).toLocaleString() : ''}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
