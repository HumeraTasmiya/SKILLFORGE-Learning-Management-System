import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';

export function AtRiskStudentList({ items, dark }) {
  const list = Array.isArray(items) ? items.slice(0, 20) : [];

  return (
    <section
      aria-label="At-risk students"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>At-risk students</h2>
          <p className="text-xs text-slate-500">Idle time, progress, and quiz performance heuristics</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">No elevated risk signals right now.</p>
      ) : (
        <ul className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
          {list.map((s) => {
            const critical = s.level === 'critical';
            const tone = critical
              ? 'border-rose-500/30 bg-rose-500/5 text-rose-800 dark:text-rose-100'
              : 'border-amber-500/25 bg-amber-500/5 text-amber-900 dark:text-amber-100';
            return (
              <li
                key={String(s.enrollmentId)}
                className={clsx('rounded-xl border px-3 py-2.5', tone)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{s.studentName}</p>
                  <span className="shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-black uppercase dark:bg-white/10">
                    {critical ? 'Critical' : 'Warning'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs opacity-90">{s.courseTitle}</p>
                <p className="mt-1 text-[11px] font-semibold opacity-80">
                  Idle {s.idleDays}d · Progress {s.progress}% · Score {s.riskScore}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
