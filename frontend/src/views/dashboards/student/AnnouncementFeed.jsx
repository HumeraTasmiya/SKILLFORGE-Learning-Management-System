import clsx from 'clsx';
import { Megaphone } from 'lucide-react';

export function AnnouncementFeed({ items, dark }) {
  const list = Array.isArray(items) ? items.slice(0, 8) : [];

  return (
    <section
      aria-label="Announcements"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
          <Megaphone className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Announcements</h2>
          <p className="text-xs text-slate-500">From your instructors and the platform</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">No announcements yet — check back after your instructors post updates.</p>
      ) : (
        <ul className="flex max-h-[340px] flex-col gap-3 overflow-y-auto pr-1">
          {list.map((a) => {
            const ts = a.createdAt ? new Date(a.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';
            const unread = !a.readAt;
            return (
              <li
                key={a._id}
                className={clsx(
                  'rounded-xl border px-3 py-3',
                  dark ? 'border-white/5 bg-slate-900/50' : 'border-slate-100 bg-slate-50',
                  unread && (dark ? 'ring-1 ring-indigo-500/30' : 'ring-1 ring-indigo-200'),
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={clsx('text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{a.title}</p>
                  {a.type ? (
                    <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {a.type}
                    </span>
                  ) : null}
                </div>
                <p className={clsx('mt-1 text-xs leading-relaxed', dark ? 'text-slate-400' : 'text-slate-600')}>{a.message}</p>
                <p className="mt-2 text-[11px] font-semibold text-slate-400">{ts}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
