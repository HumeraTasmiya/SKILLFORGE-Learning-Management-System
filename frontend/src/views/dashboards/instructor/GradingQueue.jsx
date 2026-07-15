import clsx from 'clsx';
import { ClipboardCheck, FileQuestion } from 'lucide-react';

export function GradingQueue({ items, dark }) {
  const list = Array.isArray(items) ? items.slice(0, 25) : [];

  return (
    <section
      aria-label="Pending grading"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
          <ClipboardCheck className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Pending grading</h2>
          <p className="text-xs text-slate-500">Assignments without scores · quizzes flagged for review</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">Queue is clear — new submissions and flagged quiz attempts appear here.</p>
      ) : (
        <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1">
          {list.map((row) => (
            <li
              key={row.id}
              className={clsx(
                'flex items-start gap-3 rounded-xl border px-3 py-3',
                dark ? 'border-white/5 bg-slate-950/60' : 'border-slate-100 bg-slate-50',
              )}
            >
              <div className="mt-0.5 text-slate-400">
                {row.type === 'quiz_review' ? <FileQuestion className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={clsx('text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{row.title}</p>
                <p className="text-xs text-slate-500">
                  {row.courseTitle} · {row.studentName}
                </p>
                {row.meta ? <p className="mt-1 text-[11px] font-semibold text-indigo-500 dark:text-indigo-400">{row.meta}</p> : null}
                <p className="mt-1 text-[11px] text-slate-400">
                  {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : ''}
                </p>
              </div>
              <span
                className={clsx(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase',
                  row.type === 'quiz_review'
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
                )}
              >
                {row.type === 'quiz_review' ? 'Quiz' : 'Assign'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
