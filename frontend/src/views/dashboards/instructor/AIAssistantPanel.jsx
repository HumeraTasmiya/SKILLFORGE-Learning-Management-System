import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { api } from '../../../lib/api.js';

const ACTIONS = [
  {
    id: 'generate_quiz',
    label: 'Generate quiz for a chapter',
    needsCourse: true,
    extraKey: 'chapter',
    extraPh: 'e.g. REST APIs module',
  },
  {
    id: 'at_risk',
    label: 'Identify at-risk students',
    needsCourse: false,
  },
  {
    id: 'struggle_topics',
    label: 'Topics students struggle with',
    needsCourse: true,
  },
  {
    id: 'draft_announcement',
    label: 'Draft announcement',
    needsCourse: false,
    extraKey: 'topic',
    extraPh: 'e.g. Exam schedule change',
  },
];

export function AIAssistantPanel({ courses, dark }) {
  const list = Array.isArray(courses) ? courses : [];

  const [courseId, setCourseId] = useState(
    () => (list[0]?._id ? String(list[0]._id) : '')
  );

  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  const firstCourseId = list[0]?._id
    ? String(list[0]._id)
    : '';

  const didInitCourse = useRef(false);

  useEffect(() => {
    if (didInitCourse.current || !firstCourseId) return;

    setCourseId(firstCourseId);
    didInitCourse.current = true;
  }, [firstCourseId]);

  // FIXED FUNCTION
  const run = async (actionId, needsCourse, extraKey) => {
    setError('');
    setLoading(true);
    setReply('');

    try {
      const body = {
        action: actionId,
      };

      if (needsCourse && courseId) {
        body.courseId = courseId;
      }

      if (extraKey && extra.trim()) {
        body.extra = {
          [extraKey]: extra.trim(),
        };
      }

      const { data } = await api.post(
        '/instructor/ai',
        body
      );

      setReply(data?.reply || '');
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'AI request failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="instructor-ai"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark
          ? 'border-white/10 bg-slate-900'
          : 'border-slate-100 bg-white'
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
          <Sparkles
            className="h-4 w-4"
            aria-hidden
          />
        </div>

        <div>
          <h2
            className={clsx(
              'text-base font-black',
              dark
                ? 'text-white'
                : 'text-slate-900'
            )}
          >
            AI instructor assistant
          </h2>

          <p className="text-xs text-slate-500">
            Anthropic Claude — course-aware when a
            course is selected
          </p>
        </div>
      </div>

      <label className="text-[10px] font-bold uppercase text-slate-500">
        Focus course (optional for cohort tools)
      </label>

      <select
        value={courseId}
        onChange={(e) =>
          setCourseId(e.target.value)
        }
        className={clsx(
          'mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ring-emerald-500/25 focus:ring-2',
          dark
            ? 'border-slate-600 bg-slate-950 text-white'
            : 'border-slate-200 bg-white'
        )}
      >
        <option value="">
          All my courses (cohort view)
        </option>

        {list.map((c) => (
          <option
            key={String(c._id)}
            value={String(c._id)}
          >
            {c.title}
          </option>
        ))}
      </select>

      <label className="mt-3 block text-[10px] font-bold uppercase text-slate-500">
        Hint / chapter / topic (when needed)
      </label>

      <input
        value={extra}
        onChange={(e) =>
          setExtra(e.target.value)
        }
        placeholder="Used for quiz chapter or announcement topic…"
        className={clsx(
          'mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-emerald-500/25 focus:ring-2',
          dark
            ? 'border-slate-600 bg-slate-950 text-white'
            : 'border-slate-200 bg-white'
        )}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={
              loading ||
              (a.needsCourse && !courseId)
            }
            onClick={() =>
              run(
                a.id,
                a.needsCourse,
                a.extraKey
              )
            }
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-left text-[11px] font-bold transition disabled:opacity-40',
              dark
                ? 'border-slate-600 text-slate-200 hover:border-emerald-500/50'
                : 'border-slate-200 text-slate-800 hover:border-emerald-300'
            )}
            title={
              a.needsCourse && !courseId
                ? 'Select a course first'
                : undefined
            }
          >
            <Wand2
              className="h-3.5 w-3.5 shrink-0 text-emerald-500"
              aria-hidden
            />

            {a.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-xs font-semibold text-red-500">
          {error}
        </p>
      ) : null}

      <div
        className={clsx(
          'mt-4 max-h-64 overflow-y-auto rounded-xl border p-3 text-sm leading-relaxed',
          dark
            ? 'border-slate-700 bg-slate-950 text-slate-200'
            : 'border-slate-100 bg-slate-50 text-slate-800'
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-slate-500">
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden
            />
            Generating…
          </span>
        ) : reply ? (
          <div className="whitespace-pre-wrap font-medium">
            {reply}
          </div>
        ) : (
          <p className="text-slate-500">
            Tap a prompt to run Claude on
            your live course and enrollment
            data.
          </p>
        )}
      </div>
    </section>
  );
}