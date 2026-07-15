import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  Lock,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../lib/api.js';
import { STORAGE } from '../lib/storageKeys.js';
import { dashboardPathForRole, useAuthUser } from '../lib/useAuthUser.js';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80';

function youtubeEmbedId(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('youtube.com/embed/')) {
    const m = url.match(/embed\/([^?&]+)/);
    return m?.[1] || null;
  }
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.replace(/^\//, '').split('/')[0];
  } catch {
    /* ignore */
  }
  return null;
}

function LessonMedia({ url, title }) {
  const yt = youtubeEmbedId(url);
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
        <iframe
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (url && /\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return (
      <video controls className="aspect-video w-full rounded-2xl bg-black shadow-lg" src={url}>
        <track kind="captions" />
      </video>
    );
  }
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500">
        <PlayCircle className="h-5 w-5" /> Open lesson media
      </a>
    );
  }
  return null;
}

export function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [markingLesson, setMarkingLesson] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionMsg(null);
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setPayload(data);
      const lessons = data?.course?.lessons || [];
      const q = searchParams.get('lesson');
      const match = q && lessons.find((l) => String(l._id) === String(q));
      if (match?._id) setActiveLessonId(match._id);
      else if (lessons[0]?._id) setActiveLessonId(lessons[0]._id);
    } catch (e) {
      setError(e.response?.data?.message || 'Course could not be loaded.');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const course = payload?.course;
  const isEnrolled = payload?.isEnrolled;
  const progress = payload?.progress ?? 0;
  const completedLessonIds = payload?.completedLessonIds ?? [];

  const completedSet = useMemo(
    () => new Set(completedLessonIds.map((id) => String(id))),
    [completedLessonIds],
  );

  const lessons = course?.lessons || [];
  const activeLesson =
    lessons.find((l) => String(l._id) === String(activeLessonId)) || lessons[0];

  const enroll = async () => {
    const token = localStorage.getItem(STORAGE.token);
    if (!token || !user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    setEnrolling(true);
    setActionMsg(null);
    try {
      await api.post(`/enrollments/${courseId}`);
      setActionMsg('You are enrolled — happy learning!');
      await load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Enrollment failed.';
      setActionMsg(msg);
      if (msg.toLowerCase().includes('already')) await load();
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-[calc(100vh-69px)] place-items-center px-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" aria-hidden />
          <p className="text-sm font-semibold">Loading course…</p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-black text-slate-900 dark:text-white">{error || 'Course not found'}</p>
        <Link to="/courses" className="mt-6 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-black text-white">
          Back to catalog
        </Link>
      </main>
    );
  }

  const thumb = course.thumbnail || FALLBACK_IMG;
  const instructor = course.instructor;
  const dash = user ? dashboardPathForRole(user.role) : '/dashboard/user';

  const canViewLessonContent = isEnrolled || activeLesson?.isPreview;

  const markLessonComplete = async () => {
    if (!activeLesson?._id || !isEnrolled || !canViewLessonContent) return;
    if (completedSet.has(String(activeLesson._id))) return;
    setMarkingLesson(true);
    setActionMsg(null);
    try {
      await api.put(`/enrollments/${courseId}/progress`, {
        lessonId: activeLesson._id,
      });
      await load();
      setActionMsg('Progress saved.');
    } catch (e) {
      setActionMsg(e.response?.data?.message || 'Could not update progress.');
    } finally {
      setMarkingLesson(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <Link to="/courses" className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-cyan-400">
          <ArrowLeft className="h-4 w-4" /> All courses
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-800 dark:text-slate-200">{course.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <img src={thumb} alt="" className="max-h-[320px] w-full object-cover sm:max-h-[400px]" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-black uppercase text-indigo-700 dark:text-cyan-300">{course.category}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">{course.level}</span>
                {course.language ? (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">{course.language}</span>
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">{course.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-slate-600 dark:text-slate-300">{course.description}</p>
              {instructor?.name ? (
                <p className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Instructor · <span className="text-slate-800 dark:text-slate-200">{instructor.name}</span>
                </p>
              ) : null}
            </div>
          </div>

          <section className="mt-10" aria-labelledby="curriculum-heading">
            <h2 id="curriculum-heading" className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
              <BookOpen className="h-6 w-6 text-indigo-500" aria-hidden />
              Curriculum
            </h2>
            <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {lessons.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-slate-500">Lessons will appear here once published.</li>
              ) : (
                lessons.map((lesson, idx) => {
                  const open = String(activeLessonId) === String(lesson._id);
                  const unlocked = isEnrolled || lesson.isPreview;
                  const done =
                    isEnrolled && unlocked && completedSet.has(String(lesson._id));
                  return (
                    <li key={lesson._id}>
                      <button
                        type="button"
                        onClick={() => setActiveLessonId(lesson._id)}
                        className={clsx(
                          'flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/80',
                          open && 'bg-indigo-50/80 dark:bg-indigo-950/40',
                        )}
                      >
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 dark:text-white">{lesson.title}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            {lesson.duration ? `${lesson.duration} min` : null}
                            {lesson.isPreview ? (
                              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 font-bold text-cyan-700 dark:text-cyan-400">Preview</span>
                            ) : null}
                            {!unlocked ? (
                              <span className="inline-flex items-center gap-0.5 font-bold text-amber-700 dark:text-amber-400">
                                <Lock className="h-3 w-3" /> Enroll to unlock
                              </span>
                            ) : null}
                            {done ? (
                              <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Done
                              </span>
                            ) : null}
                          </span>
                        </span>
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                        ) : open ? (
                          <PlayCircle className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {activeLesson && (
            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8" aria-live="polite">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{activeLesson.title}</h3>
              {!canViewLessonContent ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Lock className="h-4 w-4 shrink-0" /> Sign in and enroll to watch full lessons and access materials.
                </p>
              ) : (
                <>
                  {activeLesson.videoUrl ? (
                    <div className="mt-6">
                      <LessonMedia url={activeLesson.videoUrl} title={activeLesson.title} />
                    </div>
                  ) : null}
                  {activeLesson.content ? (
                    <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{activeLesson.content}</p>
                    </div>
                  ) : null}
                  {activeLesson.codeExample ? (
                    <pre className="mt-6 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{activeLesson.codeExample}</pre>
                  ) : null}
                  {isEnrolled ? (
                    <div className="mt-8 flex flex-wrap gap-3">
                      {completedSet.has(String(activeLesson._id)) ? (
                        <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" aria-hidden />
                          Lesson completed
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={markLessonComplete}
                          disabled={markingLesson}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white hover:bg-indigo-500 disabled:opacity-60"
                        >
                          {markingLesson ? (
                            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                          ) : (
                            <CheckCircle2 className="h-5 w-5" aria-hidden />
                          )}
                          Mark lesson complete
                        </button>
                      )}
                    </div>
                  ) : null}
                </>
              )}
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
              <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden />
              SkillForge course
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{course.isFree !== false ? 'Free' : `$${course.price ?? 0}`}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Certificates are optional and purchased only after you complete enough progress — pricing appears in your dashboard.
            </p>

            {isEnrolled ? (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0" /> Enrolled
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <Link
                  to={dash}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Open dashboard
                </Link>
                {progress >= 80 ? (
                  <Link
                    to="/certificates"
                    className="flex h-12 w-full items-center justify-center rounded-xl border border-indigo-200 text-sm font-black text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                  >
                    Get verified certificate
                  </Link>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={enroll}
                disabled={enrolling}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {enrolling ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enroll for free'}
              </button>
            )}

            {actionMsg ? (
              <p className={clsx('mt-4 text-sm font-semibold', actionMsg.includes('fail') || actionMsg.includes('Could') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')} role="status">
                {actionMsg}
              </p>
            ) : null}

            <ul className="mt-8 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
              <li className="flex justify-between"><span>Lessons</span><span className="font-bold text-slate-900 dark:text-white">{lessons.length}</span></li>
              <li className="flex justify-between"><span>Total time</span><span className="font-bold text-slate-900 dark:text-white">{course.totalDuration ? `${course.totalDuration} min` : '—'}</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
