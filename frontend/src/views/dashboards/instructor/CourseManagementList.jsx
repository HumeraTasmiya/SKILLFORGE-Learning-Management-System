import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Eye, Layers, Plus, Save, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../../lib/api.js';

const CATEGORY_OPTIONS = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Java', 'C', 'C++', 'TypeScript', 'Next.js', 'DevOps', 'Git', 'DSA', 'Other'];
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

const emptyDraft = {
  title: '',
  description: '',
  thumbnail: '',
  category: 'React',
  level: 'Beginner',
  language: 'English',
  price: '0',
  isPublished: true,
  tags: '',
};

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, delay: d },
});

function fmtDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '-';
  }
}

function courseToDraft(course) {
  if (!course) return emptyDraft;
  return {
    title: course.title || '',
    description: course.description || '',
    thumbnail: course.thumbnail || '',
    category: course.category || 'React',
    level: course.level || 'Beginner',
    language: course.language || 'English',
    price: String(Number(course.price) || 0),
    isPublished: Boolean(course.isPublished),
    tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
  };
}

function Field({ label, children, className }) {
  return (
    <label className={clsx('block', className)}>
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input({ dark, className, ...props }) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ring-emerald-500/25 focus:ring-2',
        dark ? 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900',
        className,
      )}
    />
  );
}

function Textarea({ dark, className, ...props }) {
  return (
    <textarea
      {...props}
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ring-emerald-500/25 focus:ring-2',
        dark ? 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900',
        className,
      )}
    />
  );
}

function Select({ dark, children, className, ...props }) {
  return (
    <select
      {...props}
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none ring-emerald-500/25 focus:ring-2',
        dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900',
        className,
      )}
    >
      {children}
    </select>
  );
}

function buildPayload(draft) {
  const price = Math.max(0, Number(draft.price) || 0);
  const title = draft.title.trim();
  const description = draft.description.trim();
  if (!title) throw new Error('Course title is required.');
  if (!description) throw new Error('Course description is required.');
  return {
    title,
    description,
    thumbnail: draft.thumbnail.trim(),
    category: draft.category,
    level: draft.level,
    language: draft.language.trim() || 'English',
    price,
    isFree: price <= 0,
    isPublished: Boolean(draft.isPublished),
    tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  };
}

function CourseForm({ dark, draft, setDraft, onCancel, onSubmit, loading, mode }) {
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  return (
    <motion.form
      {...fade(0)}
      onSubmit={onSubmit}
      className={clsx(
        'mb-5 rounded-2xl border p-4 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{mode === 'edit' ? 'Edit course' : 'New course'}</p>
          <h3 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>{mode === 'edit' ? 'Update course details' : 'Add a course'}</h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Close course form"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Title">
          <Input dark={dark} value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="React Job Ready Projects" />
        </Field>
        <Field label="Thumbnail URL">
          <Input dark={dark} value={draft.thumbnail} onChange={(e) => update({ thumbnail: e.target.value })} placeholder="https://..." />
        </Field>
        <Field label="Category">
          <Select dark={dark} value={draft.category} onChange={(e) => update({ category: e.target.value })}>
            {CATEGORY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Level">
          <Select dark={dark} value={draft.level} onChange={(e) => update({ level: e.target.value })}>
            {LEVEL_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Language">
          <Input dark={dark} value={draft.language} onChange={(e) => update({ language: e.target.value })} />
        </Field>
        <Field label="Price">
          <Input dark={dark} type="number" min="0" step="0.01" value={draft.price} onChange={(e) => update({ price: e.target.value })} />
        </Field>
        <Field label="Tags" className="md:col-span-2">
          <Input dark={dark} value={draft.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="react, project, certificate" />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <Textarea dark={dark} rows={4} value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="What students will build, practice, and prove by the end." />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className={clsx('inline-flex items-center gap-2 text-sm font-bold', dark ? 'text-slate-200' : 'text-slate-700')}>
          <input
            type="checkbox"
            checked={draft.isPublished}
            onChange={(e) => update({ isPublished: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Published
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {loading ? 'Saving...' : mode === 'edit' ? 'Update course' : 'Add course'}
          </button>
        </div>
      </div>
    </motion.form>
  );
}

export function CourseManagementList({ courses, dark, onCourseChanged }) {
  const list = Array.isArray(courses) ? courses : [];
  const [mode, setMode] = useState('closed');
  const [activeCourse, setActiveCourse] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });

  const sorted = useMemo(() => [...list].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)), [list]);

  const closeForm = () => {
    setMode('closed');
    setActiveCourse(null);
    setDraft(emptyDraft);
  };

  const startAdd = () => {
    setNotice({ type: '', text: '' });
    setActiveCourse(null);
    setDraft(emptyDraft);
    setMode('add');
  };

  const startEdit = (course) => {
    setNotice({ type: '', text: '' });
    setActiveCourse(course);
    setDraft(courseToDraft(course));
    setMode('edit');
  };

  const submitCourse = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice({ type: '', text: '' });
    try {
      const payload = buildPayload(draft);
      if (mode === 'edit' && activeCourse?._id) {
        await api.put(`/courses/${activeCourse._id}`, payload);
        setNotice({ type: 'success', text: 'Course updated.' });
      } else {
        await api.post('/courses', {
          ...payload,
          lessons: [
            { title: 'Welcome and setup', content: '', videoUrl: '', codeExample: '', duration: 15, order: 1, isPreview: true },
          ],
        });
        setNotice({ type: 'success', text: 'Course added.' });
      }
      closeForm();
      await onCourseChanged?.();
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || error.message || 'Could not save course.' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course) => {
    setSaving(true);
    setNotice({ type: '', text: '' });
    try {
      await api.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
      setNotice({ type: 'success', text: !course.isPublished ? 'Course published.' : 'Course moved to draft.' });
      await onCourseChanged?.();
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Could not update publish state.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (course) => {
    const ok = window.confirm(`Delete "${course.title}"? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(String(course._id));
    setNotice({ type: '', text: '' });
    try {
      await api.delete(`/courses/${course._id}`);
      setNotice({ type: 'success', text: 'Course deleted.' });
      await onCourseChanged?.();
    } catch (error) {
      setNotice({ type: 'error', text: error.response?.data?.message || 'Could not delete course.' });
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section id="instructor-my-courses" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>My courses</h2>
          <p className="text-xs text-slate-500">Add, edit, publish, update, and delete your courses</p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add course
        </button>
      </div>

      <AnimatePresence>
        {mode !== 'closed' && (
          <CourseForm
            dark={dark}
            draft={draft}
            setDraft={setDraft}
            onCancel={closeForm}
            onSubmit={submitCourse}
            loading={saving}
            mode={mode}
          />
        )}
      </AnimatePresence>

      {notice.text ? (
        <p
          className={clsx(
            'mb-4 rounded-xl border px-3 py-2 text-sm font-semibold',
            notice.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200',
          )}
        >
          {notice.text}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <div
          className={clsx(
            'rounded-2xl border border-dashed px-6 py-12 text-center',
            dark ? 'border-slate-600 bg-slate-900/50' : 'border-slate-200 bg-slate-50',
          )}
        >
          <p className="font-bold text-slate-700 dark:text-slate-200">No courses yet</p>
          <p className="mt-2 text-sm text-slate-500">Use Add course to create your first instructor course.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c, i) => (
            <motion.li
              key={String(c._id)}
              {...fade(i * 0.04)}
              className={clsx(
                'flex flex-col rounded-2xl border p-4 shadow-sm',
                dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Layers className="h-4 w-4" aria-hidden />
                </div>
                <button
                  type="button"
                  onClick={() => togglePublish(c)}
                  disabled={saving}
                  className={clsx(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase disabled:opacity-60',
                    c.isPublished
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                  )}
                >
                  {c.isPublished ? 'Published' : 'Draft'}
                </button>
              </div>
              <h3 className={clsx('line-clamp-2 text-sm font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{c.title}</h3>
              <p className="mt-2 line-clamp-2 min-h-[2rem] text-xs text-slate-500">{c.description || 'No description yet.'}</p>
              <p className="mt-2 text-xs text-slate-500">
                {c.studentCount ?? 0} students | {c.category || 'Other'} | Updated {fmtDate(c.updatedAt)}
              </p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Content built</span>
                  <span>{c.contentBuiltPct ?? 0}%</span>
                </div>
                <div className={clsx('h-2 overflow-hidden rounded-full', dark ? 'bg-slate-800' : 'bg-slate-100')}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, c.contentBuiltPct ?? 0)}%` }}
                    transition={{ duration: 0.7, delay: 0.05 + i * 0.04 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-xs font-black text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                  aria-label={`Open ${c.title} in course manager`}
                  title="Open in course manager"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-xs font-black text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                  aria-label={`Edit ${c.title}`}
                  title="Edit course"
                >
                  <Edit3 className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCourse(c)}
                  disabled={deletingId === String(c._id)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                  aria-label={`Delete ${c.title}`}
                  title="Delete course"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
