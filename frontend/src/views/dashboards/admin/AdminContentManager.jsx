import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, FileText, Search } from 'lucide-react';
import clsx from 'clsx';
import { CourseManagementList } from '../instructor/CourseManagementList.jsx';

const statusOptions = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
];

const number = (value) => Number(value || 0).toLocaleString();

export function AdminContentManager({ courses, onCourseChanged, dark }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const list = Array.isArray(courses) ? courses : [];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return list.filter((course) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'published' && course.isPublished) ||
        (status === 'draft' && !course.isPublished);
      const haystack = `${course.title || ''} ${course.description || ''} ${course.category || ''} ${course.level || ''}`.toLowerCase();
      return matchesStatus && (!term || haystack.includes(term));
    });
  }, [list, query, status]);

  const stats = useMemo(() => {
    const published = list.filter((course) => course.isPublished).length;
    const lessons = list.reduce((sum, course) => sum + (Array.isArray(course.lessons) ? course.lessons.length : Number(course.lessonCount || 0)), 0);
    return [
      { label: 'Total content', value: number(list.length), icon: BookOpen, tone: 'indigo' },
      { label: 'Published', value: number(published), icon: CheckCircle2, tone: 'emerald' },
      { label: 'Drafts', value: number(list.length - published), icon: FileText, tone: 'amber' },
      { label: 'Lessons', value: number(lessons), icon: BookOpen, tone: 'cyan' },
    ];
  }, [list]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Content manager</p>
          <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Content pages</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-500">
            Add, edit, publish, draft, and delete course content from one admin page.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase text-slate-500">{label}</p>
              <span
                className={clsx(
                  'grid h-9 w-9 place-items-center rounded-xl',
                  tone === 'emerald' && 'bg-emerald-100 text-emerald-700',
                  tone === 'amber' && 'bg-amber-100 text-amber-700',
                  tone === 'cyan' && 'bg-cyan-100 text-cyan-700',
                  tone === 'indigo' && 'bg-indigo-100 text-indigo-700',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Search content by title, category, level, or description"
            />
          </label>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            {statusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={clsx(
                  'h-11 rounded-xl border px-4 text-xs font-black transition',
                  status === option.id
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <CourseManagementList courses={filtered} dark={dark} onCourseChanged={onCourseChanged} />
    </div>
  );
}
