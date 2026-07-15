import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { api } from '../../../lib/api.js';

const CHIPS = [
  'Quiz me on the hardest topic in this course',
  'Explain the next lesson in simple terms',
  'Give me 3 practice questions with answers',
  'Summarize what I should focus on this week',
];

export function AIChatWidget({ courses, dark }) {
  const options = useMemo(() => (Array.isArray(courses) ? courses.filter((c) => c.courseId) : []), [courses]);
  const [courseId, setCourseId] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      role: 'model',
      content: 'Pick a course (optional), tap a quick prompt, or ask anything about your learning.',
    },
  ]);

  useEffect(() => {
    if (!courseId && options[0]?.courseId) setCourseId(String(options[0].courseId));
  }, [courseId, options]);

  const send = useCallback(
    async (text) => {
      const trimmed = String(text || '').trim();
      if (!trimmed || loading) return;
      setError('');
      setLoading(true);
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'model')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      setMessages((m) => [...m, { role: 'user', content: trimmed }]);
      try {
        const body = {
          message: trimmed,
          history: history.map((h) => (h.role === 'user' ? h : { ...h, role: 'model' })),
        };
        if (courseId) body.courseId = courseId;
        const { data } = await api.post('/chatbot/chat', body);
        const reply = data?.reply || 'No response.';
        setMessages((m) => [...m, { role: 'model', content: reply }]);
      } catch (e) {
        const msg = e.response?.data?.message || 'Could not reach the AI assistant.';
        setError(msg);
        setMessages((m) => [...m, { role: 'model', content: `Sorry — ${msg}` }]);
      } finally {
        setLoading(false);
      }
    },
    [courseId, loading, messages],
  );

  return (
    <section
      id="ai-assistant"
      className={clsx(
        'flex flex-col overflow-hidden rounded-2xl border shadow-sm',
        dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
      )}
    >
      <div className={clsx('flex items-center gap-2 border-b px-4 py-3', dark ? 'border-white/10' : 'border-slate-100')}>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>AI course assistant</h2>
          <p className="text-xs text-slate-500">Course-aware when you select an enrolled course</p>
        </div>
      </div>

      <div className="border-b px-4 py-3 dark:border-white/10">
        <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Context course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className={clsx(
            'mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ring-indigo-500/25 focus:ring-2',
            dark ? 'border-slate-600 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900',
          )}
        >
          <option value="">General (all topics)</option>
          {options.map((c) => (
            <option key={String(c.courseId)} value={String(c.courseId)}>
              {c.title}
            </option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={loading}
              onClick={() => {
                setInput('');
                send(chip);
              }}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-left text-[11px] font-bold transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:hover:text-indigo-300',
                dark ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-700',
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="flex max-h-[min(52vh,420px)] min-h-[200px] flex-col gap-2 overflow-y-auto px-4 py-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={clsx(
              'max-w-[95%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
              m.role === 'user'
                ? 'ml-auto bg-indigo-600 text-white'
                : dark
                  ? 'mr-auto bg-slate-900 text-slate-200'
                  : 'mr-auto bg-slate-100 text-slate-800',
            )}
          >
            {m.role === 'model' ? (
              <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase text-indigo-400">
                <Bot className="h-3 w-3" aria-hidden /> Assistant
              </span>
            ) : null}
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
        {loading ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Thinking…
          </div>
        ) : null}
      </div>

      {error ? <p className="px-4 pb-1 text-xs font-semibold text-red-500">{error}</p> : null}

      <form
        className={clsx('flex gap-2 border-t p-3', dark ? 'border-white/10' : 'border-slate-100')}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput('');
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a lesson, quiz, or concept…"
          className={clsx(
            'min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none ring-indigo-500/25 focus:ring-2',
            dark ? 'border-slate-600 bg-slate-900 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white',
          )}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
