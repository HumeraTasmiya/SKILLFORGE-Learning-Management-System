import { useState } from 'react';
import clsx from 'clsx';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { api } from '../../../lib/api.js';

export function QAQueue({ items, dark, onAnswered }) {
  const list = Array.isArray(items) ? items : [];
  const [answerById, setAnswerById] = useState({});
  const [saving, setSaving] = useState(null);

  const submit = async (id) => {
    const text = String(answerById[id] || '').trim();
    if (!text) return;
    setSaving(id);
    try {
      await api.patch(`/instructor/questions/${id}`, { answer: text });
      setAnswerById((m) => ({ ...m, [id]: '' }));
      onAnswered?.();
    } catch {
      /* toast optional */
    } finally {
      setSaving(null);
    }
  };

  return (
    <section
      aria-label="Student Q and A"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
          <MessageCircleQuestion className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Student Q&A</h2>
          <p className="text-xs text-slate-500">Unanswered course questions · red = 24h+ waiting</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-slate-500">No open questions — students post via POST /courses/:id/questions when enrolled.</p>
      ) : (
        <ul className="flex max-h-[400px] flex-col gap-4 overflow-y-auto pr-1">
          {list.map((q) => (
            <li
              key={String(q._id)}
              className={clsx(
                'rounded-xl border p-3',
                q.overdue
                  ? dark
                    ? 'border-rose-500/40 bg-rose-950/30'
                    : 'border-rose-200 bg-rose-50/80'
                  : dark
                    ? 'border-white/5 bg-slate-950/50'
                    : 'border-slate-100 bg-slate-50',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{q.courseTitle}</p>
                {q.overdue ? (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    24h+
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{q.studentName}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{q.body}</p>
              <p className="mt-1 text-[11px] text-slate-400">{q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <textarea
                  value={answerById[q._id] || ''}
                  onChange={(e) => setAnswerById((m) => ({ ...m, [q._id]: e.target.value }))}
                  rows={2}
                  placeholder="Write your answer…"
                  className={clsx(
                    'min-h-[44px] flex-1 rounded-xl border px-3 py-2 text-sm outline-none ring-emerald-500/25 focus:ring-2',
                    dark ? 'border-slate-600 bg-slate-950 text-white' : 'border-slate-200 bg-white',
                  )}
                />
                <button
                  type="button"
                  disabled={saving === q._id || !(answerById[q._id] || '').trim()}
                  onClick={() => submit(q._id)}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:opacity-40"
                >
                  {saving === q._id ? '…' : <Send className="h-4 w-4" aria-hidden />}
                  Reply
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
