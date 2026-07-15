import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Loader2, SlidersHorizontal, Star } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../lib/api.js';

const CATEGORIES = [
  '',
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'MongoDB',
  'Python',
  'Java',
  'TypeScript',
  'Next.js',
  'DevOps',
  'DSA',
  'Other',
];

const LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced'];

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';

export function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/courses', {
        params: {
          search: search || undefined,
          category: category || undefined,
          level: level || undefined,
          page,
          limit: 12,
        },
      });
      setCourses(data.courses || []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load courses. Is the API running?');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, level, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = window.setTimeout(() => {
      if (trimmed === search) return;
      setFilter('search', trimmed);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput, search]);

  const goPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p <= 1) next.delete('page');
    else next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-black uppercase tracking-wide text-indigo-500">Catalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Explore courses</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Learning paths are free to start; optional verified certificates unlock after you complete enough of a course. Use filters and search to find what fits your goals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          <span>{total} published</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[min(100%,240px)] flex-1 flex-col gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
          Search
          <input
            type="search"
            value={searchInput}
            placeholder="Title, topic, tag…"
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setFilter('search', e.currentTarget.value.trim());
              }
            }}
          />
        </label>
        <label className="flex min-w-[140px] flex-col gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
          Category
          <select
            value={category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c || 'all'} value={c}>
                {c || 'All'}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[140px] flex-col gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
          Level
          <select
            value={level}
            onChange={(e) => setFilter('level', e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {LEVELS.map((l) => (
              <option key={l || 'all'} value={l}>
                {l || 'All'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 grid place-items-center gap-3 py-16 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" aria-hidden />
          <p className="text-sm font-semibold">Loading catalog…</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" aria-hidden />
          <p className="text-lg font-black text-slate-900 dark:text-white">No courses match these filters</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Publish courses from the instructor dashboard or widen your search.</p>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-black text-white hover:bg-indigo-500"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-10 grid list-none gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const thumb = course.thumbnail || FALLBACK_IMG;
              const instructorName = course.instructor?.name || 'Instructor';
              const rating = course.rating > 0 ? course.rating.toFixed(1) : 'New';
              const enrolled = course.enrolledStudents?.length ?? 0;
              return (
                <li key={course._id}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <Link to={`/courses/${course._id}`} className="relative block shrink-0 overflow-hidden">
                      <img src={thumb} alt="" className="h-44 w-full object-cover transition duration-300 hover:scale-[1.03]" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black uppercase text-indigo-700 shadow-sm dark:bg-slate-950/90 dark:text-cyan-300">
                        {course.category}
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/courses/${course._id}`} className="text-lg font-black leading-snug text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-cyan-300">
                          {course.title}
                        </Link>
                        <span className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden />
                          {rating}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{course.description}</p>
                      <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-500">
                        {instructorName}
                        {enrolled > 0 ? ` · ${enrolled.toLocaleString()} enrolled` : ''}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">{course.level}</span>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {course.isFree !== false ? 'Free to learn' : `$${course.price ?? 0}`}
                        </span>
                      </div>
                      <Link
                        to={`/courses/${course._id}`}
                        className={clsx(
                          'mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-black',
                          'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
                        )}
                      >
                        View course <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {pages > 1 && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
                className="h-10 rounded-full border border-slate-200 px-4 text-sm font-bold disabled:opacity-40 dark:border-slate-700"
              >
                Previous
              </button>
              <span className="px-3 text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => goPage(page + 1)}
                className="h-10 rounded-full border border-slate-200 px-4 text-sm font-bold disabled:opacity-40 dark:border-slate-700"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
