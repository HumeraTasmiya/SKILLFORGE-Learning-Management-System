import clsx from 'clsx';
import { Flame } from 'lucide-react';

export function StreakTracker({ studyDaysLast7, streakDays, dark }) {
  const flags = Array.isArray(studyDaysLast7) && studyDaysLast7.length === 7 ? studyDaysLast7 : [false, false, false, false, false, false, false];
  const streak = typeof streakDays === 'number' ? streakDays : 0;

  const labels = flags.map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString(undefined, { weekday: 'narrow' });
  });

  return (
    <section
      aria-label="Study streak"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Study streak</h2>
          <p className="mt-0.5 text-xs text-slate-500">Last 7 days — complete a lesson or quiz to light up a day</p>
        </div>
        <div
          className={clsx(
            'flex shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-black',
            dark ? 'border-orange-500/25 bg-orange-500/10 text-orange-200' : 'border-orange-200 bg-orange-50 text-orange-800',
          )}
        >
          <Flame className="h-5 w-5" aria-hidden />
          {streak}d
        </div>
      </div>
      <div className="mt-5 flex justify-between gap-1 sm:gap-2">
        {flags.map((on, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={clsx(
                'flex h-11 w-full max-w-[52px] items-center justify-center rounded-xl border-2 text-xs font-black transition sm:h-12',
                on
                  ? 'border-emerald-400 bg-gradient-to-b from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                  : dark
                    ? 'border-slate-600 bg-slate-900 text-slate-600'
                    : 'border-slate-200 bg-slate-100 text-slate-400',
              )}
              aria-label={on ? 'Studied' : 'No activity'}
            >
              {on ? '✓' : ''}
            </div>
            <span className={clsx('text-[10px] font-bold uppercase', dark ? 'text-slate-500' : 'text-slate-400')}>
              {labels[i]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
