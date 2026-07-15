import { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarClock,
  Captions,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Code2,
  DoorOpen,
  FileQuestion,
  FileText,
  GripVertical,
  Heading,
  ImageIcon,
  Link2,
  Megaphone,
  MessageSquare,
  Paperclip,
  Percent,
  PlaySquare,
  Plus,
  Radio,
  Repeat,
  Save,
  ShieldCheck,
  Shuffle,
  Sigma,
  Sparkles,
  Tag,
  Timer,
  UploadCloud,
  UsersRound,
  Wand2,
  X,
  Youtube,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../../../lib/api.js';

const LESSON_TYPES = [
  { id: 'video', label: 'Video', icon: PlaySquare },
  { id: 'article', label: 'Article', icon: FileText },
  { id: 'quiz', label: 'Quiz', icon: FileQuestion },
  { id: 'assignment', label: 'Assignment', icon: ClipboardCheck },
  { id: 'live', label: 'Live Session', icon: Radio },
  { id: 'resource', label: 'Resource file', icon: Paperclip },
];

const INITIAL_SECTIONS = [
  {
    id: 's1',
    title: 'Foundations',
    lessons: [
      { id: 'l1', title: 'Welcome and outcomes', type: 'video', duration: '08:12' },
      { id: 'l2', title: 'Core concepts reading', type: 'article', duration: '12 min' },
      { id: 'l3', title: 'Baseline quiz', type: 'quiz', duration: '10 q' },
    ],
  },
  {
    id: 's2',
    title: 'Build the first project',
    lessons: [
      { id: 'l4', title: 'Project walkthrough', type: 'video', duration: '24:30' },
      { id: 'l5', title: 'Submit milestone one', type: 'assignment', duration: '100 pts' },
      { id: 'l6', title: 'Office hours room', type: 'live', duration: 'Thu 6 PM' },
    ],
  },
];

const REVENUE = [
  { month: 'Jan', revenue: 4200, enrollments: 42 },
  { month: 'Feb', revenue: 5100, enrollments: 55 },
  { month: 'Mar', revenue: 6400, enrollments: 63 },
  { month: 'Apr', revenue: 7200, enrollments: 79 },
  { month: 'May', revenue: 8600, enrollments: 91 },
  { month: 'Jun', revenue: 9300, enrollments: 108 },
];

const FUNNEL = [
  { step: 'Enrolled', value: 1240 },
  { step: 'Started', value: 1015 },
  { step: '50%', value: 672 },
  { step: 'Completed', value: 388 },
];

const DROP_OFF = [
  { lesson: 'Welcome', rate: 8 },
  { lesson: 'Project', rate: 23 },
  { lesson: 'Quiz', rate: 14 },
  { lesson: 'Rubric', rate: 11 },
  { lesson: 'Live', rate: 19 },
];

const STUDENTS = [
  { name: 'Aisha Khan', progress: 92, active: 'Today', score: 88 },
  { name: 'Marcus Lee', progress: 64, active: 'Yesterday', score: 73 },
  { name: 'Priya Sharma', progress: 41, active: '3 days ago', score: 61 },
];

function typeMeta(type) {
  return LESSON_TYPES.find((item) => item.id === type) || LESSON_TYPES[0];
}

function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Panel({ dark, title, eyebrow, icon: Icon, children, className }) {
  return (
    <section
      className={clsx(
        'rounded-2xl border p-4 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{eyebrow}</p>
          <h3 className={clsx('truncate text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
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

function ToolbarButton({ icon: Icon, label, dark }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={clsx(
        'grid h-9 w-9 place-items-center rounded-lg border transition',
        dark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

const CATEGORY_OPTIONS = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Java', 'C', 'C++', 'TypeScript', 'Next.js', 'DevOps', 'Git', 'DSA', 'Other'];
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

function starterLesson(title, order, isPreview = false) {
  return {
    title,
    content: '',
    videoUrl: '',
    codeExample: '',
    duration: order === 1 ? 15 : 30,
    order,
    isPreview,
  };
}

export function CourseAnalyticsPanel({ dark }) {
  return (
    <section id="instructor-analytics" className="scroll-mt-24">
      <Panel dark={dark} title="Instructor analytics" eyebrow="Revenue, funnel, retention" icon={Percent}>
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="h-56 min-w-0 xl:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE}>
                <defs>
                  <linearGradient id="builderRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={dark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={dark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#builderRevenue)" strokeWidth={3} />
                <Line type="monotone" dataKey="enrollments" stroke="#06b6d4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUNNEL}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="step" stroke={dark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {FUNNEL.map((entry, index) => (
                    <Cell key={entry.step} fill={['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Bell, label: 'Real-time enrollments', value: '+18 today' },
            { icon: PlaySquare, label: 'Per-lesson drop-off', value: `${Math.max(...DROP_OFF.map((item) => item.rate))}% peak` },
            { icon: FileQuestion, label: 'Question difficulty', value: 'Q7 needs review' },
            { icon: MessageSquare, label: 'Review word cloud', value: 'clear, practical, fast' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={clsx('rounded-xl border p-3', dark ? 'border-slate-700' : 'border-slate-200')}>
                <Icon className="h-4 w-4 text-emerald-500" aria-hidden />
                <p className={clsx('mt-2 text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>{item.value}</p>
                <p className="text-[11px] font-bold text-slate-500">{item.label}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

export function CourseBuilderStudio({ courses, dark, onCourseSaved }) {
  const courseOptions = Array.isArray(courses) && courses.length ? courses : [{ _id: 'draft', title: 'Full Stack Masterclass' }];
  const [selectedCourse, setSelectedCourse] = useState(String(courseOptions[0]?._id || 'draft'));
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [activeLessonId, setActiveLessonId] = useState('l1');
  const [dragged, setDragged] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(68);
  const [drm, setDrm] = useState(true);
  const [peerReview, setPeerReview] = useState(true);
  const [showAllLessonTypes, setShowAllLessonTypes] = useState(false);
  const [saveState, setSaveState] = useState({ loading: false, message: '', error: '' });
  const [courseDraft, setCourseDraft] = useState({
    title: '',
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    category: 'React',
    level: 'Beginner',
    language: 'English',
    price: 0,
    isPublished: true,
    tags: 'hands-on, certificate, project',
    lessons: [
      starterLesson('Welcome, outcomes, and setup', 1, true),
      starterLesson('Core concept walkthrough', 2),
      starterLesson('Guided project lab', 3),
    ],
  });

  const activeLesson = useMemo(
    () => sections.flatMap((section) => section.lessons).find((lesson) => lesson.id === activeLessonId) || sections[0]?.lessons[0],
    [sections, activeLessonId],
  );

  const addSection = () => {
    const id = `s${Date.now()}`;
    setSections((current) => [...current, { id, title: `New section ${current.length + 1}`, lessons: [] }]);
  };

  const addLesson = (sectionId, type = 'video') => {
    const id = `l${Date.now()}`;
    const lesson = { id, title: `Untitled ${typeMeta(type).label}`, type, duration: 'Draft' };
    setSections((current) => current.map((section) => (section.id === sectionId ? { ...section, lessons: [...section.lessons, lesson] } : section)));
    setActiveLessonId(id);
  };

  const reorderSections = (fromId, toId) => {
    setSections((current) => {
      const from = current.findIndex((section) => section.id === fromId);
      const to = current.findIndex((section) => section.id === toId);
      if (from < 0 || to < 0 || from === to) return current;
      return moveItem(current, from, to);
    });
  };

  const reorderLessons = (sectionId, fromId, toId) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;
        const from = section.lessons.findIndex((lesson) => lesson.id === fromId);
        const to = section.lessons.findIndex((lesson) => lesson.id === toId);
        if (from < 0 || to < 0 || from === to) return section;
        return { ...section, lessons: moveItem(section.lessons, from, to) };
      }),
    );
  };

  const updateActiveLesson = (updates) => {
    setSections((current) =>
      current.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) => (lesson.id === activeLessonId ? { ...lesson, ...updates } : lesson)),
      })),
    );
  };

  const updateDraft = (updates) => {
    setCourseDraft((current) => ({ ...current, ...updates }));
  };

  const updateDraftLesson = (index, updates) => {
    setCourseDraft((current) => ({
      ...current,
      lessons: current.lessons.map((lesson, i) => (i === index ? { ...lesson, ...updates } : lesson)),
    }));
  };

  const addDraftLesson = () => {
    setCourseDraft((current) => ({
      ...current,
      lessons: [...current.lessons, starterLesson(`Lesson ${current.lessons.length + 1}`, current.lessons.length + 1)],
    }));
  };

  const removeDraftLesson = (index) => {
    setCourseDraft((current) => {
      const lessons = current.lessons
        .filter((_, i) => i !== index)
        .map((lesson, i) => ({ ...lesson, order: i + 1 }));
      return { ...current, lessons: lessons.length ? lessons : [starterLesson('Welcome and setup', 1, true)] };
    });
  };

  const saveCourse = async () => {
    setSaveState({ loading: true, message: '', error: '' });
    try {
      const lessons = courseDraft.lessons
        .map((lesson, index) => ({
          ...lesson,
          title: lesson.title.trim(),
          content: lesson.content.trim(),
          videoUrl: lesson.videoUrl.trim(),
          codeExample: lesson.codeExample.trim(),
          duration: Number(lesson.duration) || 0,
          order: index + 1,
          isPreview: Boolean(lesson.isPreview),
        }))
        .filter((lesson) => lesson.title);

      if (!courseDraft.title.trim()) throw new Error('Course title is required.');
      if (!courseDraft.description.trim()) throw new Error('Course description is required.');
      if (!lessons.length) throw new Error('Add at least one lesson.');

      const payload = {
        title: courseDraft.title.trim(),
        description: courseDraft.description.trim(),
        thumbnail: courseDraft.thumbnail.trim(),
        category: courseDraft.category,
        level: courseDraft.level,
        language: courseDraft.language.trim() || 'English',
        price: Number(courseDraft.price) || 0,
        isFree: Number(courseDraft.price) <= 0,
        isPublished: Boolean(courseDraft.isPublished),
        tags: courseDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        lessons,
        totalDuration: lessons.reduce((sum, lesson) => sum + (Number(lesson.duration) || 0), 0),
        quizzes: [
          {
            question: `What should you do first in ${courseDraft.title.trim()}?`,
            options: ['Skip setup', 'Review the outcomes', 'Ignore practice'],
            answer: 'Review the outcomes',
            explanation: 'Clear goals make the rest of the course easier to apply.',
          },
        ],
      };

      const { data } = await api.post('/courses', payload);
      setSaveState({ loading: false, message: `${data.course?.title || payload.title} was added to your courses.`, error: '' });
      setCourseDraft((current) => ({
        ...current,
        title: '',
        description: '',
        price: 0,
        lessons: [
          starterLesson('Welcome, outcomes, and setup', 1, true),
          starterLesson('Core concept walkthrough', 2),
          starterLesson('Guided project lab', 3),
        ],
      }));
      onCourseSaved?.(data.course);
    } catch (error) {
      setSaveState({ loading: false, message: '', error: error.response?.data?.message || error.message || 'Could not save course.' });
    }
  };

  const activeType = typeMeta(activeLesson?.type);
  const ActiveIcon = activeType.icon;
  const primaryLessonTypes = LESSON_TYPES.slice(0, 2);
  const collapsedLessonTypes = LESSON_TYPES.slice(2);
  const lessonTypeChoices = showAllLessonTypes ? LESSON_TYPES : primaryLessonTypes;
  const courseHealthScore = 78;

  return (
    <section id="instructor-builder" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Flagship authoring suite</p>
          <h2 className={clsx('mt-1 text-2xl font-black', dark ? 'text-white' : 'text-slate-900')}>Course builder</h2>
          <p className="mt-1 text-sm text-slate-500">Drag curriculum on the left, edit lesson content and publishing systems on the right.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select dark={dark} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="min-w-56">
            {courseOptions.map((course) => (
              <option key={String(course._id)} value={String(course._id)}>
                {course.title}
              </option>
            ))}
          </Select>
          <button type="button" onClick={saveCourse} disabled={saveState.loading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70">
            <Save className="h-4 w-4" aria-hidden />
            {saveState.loading ? 'Saving...' : 'Add course'}
          </button>
        </div>
      </div>

      <Panel dark={dark} title="Add a course with content" eyebrow="New course" icon={BookOpen} className="mb-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Course title">
              <Input dark={dark} value={courseDraft.title} onChange={(e) => updateDraft({ title: e.target.value })} placeholder="React Job Ready Projects" />
            </Field>
            <Field label="Thumbnail URL">
              <Input dark={dark} value={courseDraft.thumbnail} onChange={(e) => updateDraft({ thumbnail: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Category">
              <Select dark={dark} value={courseDraft.category} onChange={(e) => updateDraft({ category: e.target.value })}>
                {CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}
              </Select>
            </Field>
            <Field label="Level">
              <Select dark={dark} value={courseDraft.level} onChange={(e) => updateDraft({ level: e.target.value })}>
                {LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
              </Select>
            </Field>
            <Field label="Language">
              <Input dark={dark} value={courseDraft.language} onChange={(e) => updateDraft({ language: e.target.value })} />
            </Field>
            <Field label="Price">
              <Input dark={dark} type="number" min="0" value={courseDraft.price} onChange={(e) => updateDraft({ price: e.target.value })} />
            </Field>
            <Field label="Tags">
              <Input dark={dark} value={courseDraft.tags} onChange={(e) => updateDraft({ tags: e.target.value })} placeholder="react, project, certificate" />
            </Field>
            <Field label="Visibility">
              <Select dark={dark} value={courseDraft.isPublished ? 'published' : 'draft'} onChange={(e) => updateDraft({ isPublished: e.target.value === 'published' })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea dark={dark} rows={4} value={courseDraft.description} onChange={(e) => updateDraft({ description: e.target.value })} placeholder="What students will build, practice, and prove by the end." />
            </Field>
          </div>

          <div className={clsx('rounded-xl border p-3', dark ? 'border-slate-700 bg-slate-950' : 'border-slate-100 bg-slate-50')}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className={clsx('text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>Lessons</p>
              <button type="button" onClick={addDraftLesson} className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-500/15 px-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Lesson
              </button>
            </div>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {courseDraft.lessons.map((lesson, index) => (
                <div key={`${index}-${lesson.order}`} className={clsx('rounded-xl border p-3', dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white')}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-xs font-black text-emerald-700 dark:text-emerald-300">{index + 1}</span>
                    <Input dark={dark} value={lesson.title} onChange={(e) => updateDraftLesson(index, { title: e.target.value })} aria-label={`Lesson ${index + 1} title`} className="h-9" />
                    <button type="button" onClick={() => removeDraftLesson(index)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-300" aria-label={`Remove lesson ${index + 1}`}>
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <Textarea dark={dark} rows={3} value={lesson.content} onChange={(e) => updateDraftLesson(index, { content: e.target.value })} placeholder="Lesson reading notes, assignment instructions, or transcript summary." />
                  <div className="mt-2 grid grid-cols-[1fr_92px] gap-2">
                    <Input dark={dark} value={lesson.videoUrl} onChange={(e) => updateDraftLesson(index, { videoUrl: e.target.value })} placeholder="Video URL optional" />
                    <Input dark={dark} type="number" min="0" value={lesson.duration} onChange={(e) => updateDraftLesson(index, { duration: e.target.value })} aria-label={`Lesson ${index + 1} duration`} />
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <input type="checkbox" checked={lesson.isPreview} onChange={(e) => updateDraftLesson(index, { isPreview: e.target.checked })} className="rounded text-emerald-600" />
                    Preview lesson
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={saveCourse} disabled={saveState.loading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70">
            <Save className="h-4 w-4" aria-hidden />
            {saveState.loading ? 'Saving...' : 'Add course'}
          </button>
          {saveState.message ? <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{saveState.message}</p> : null}
          {saveState.error ? <p className="text-sm font-bold text-red-600 dark:text-red-300">{saveState.error}</p> : null}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className={clsx('rounded-2xl border p-4 shadow-sm', dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white')}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className={clsx('text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>Curriculum structure</h3>
              <p className="text-xs text-slate-500">Sections and lessons reorder by drag handle.</p>
            </div>
            <button type="button" onClick={addSection} className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" aria-label="Add section">
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDragged({ kind: 'section', id: section.id })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragged?.kind === 'section') reorderSections(dragged.id, section.id);
                  setDragged(null);
                }}
                className={clsx('rounded-xl border p-3', dark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-slate-50')}
              >
                <div className="mb-2 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-400" aria-hidden />
                  <Input
                    dark={dark}
                    value={section.title}
                    onChange={(e) =>
                      setSections((current) => current.map((item) => (item.id === section.id ? { ...item, title: e.target.value } : item)))
                    }
                    aria-label={`Section ${sectionIndex + 1} title`}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  {section.lessons.map((lesson) => {
                    const Meta = typeMeta(lesson.type);
                    const Icon = Meta.icon;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        draggable
                        onDragStart={() => setDragged({ kind: 'lesson', sectionId: section.id, id: lesson.id })}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragged?.kind === 'lesson' && dragged.sectionId === section.id) reorderLessons(section.id, dragged.id, lesson.id);
                          setDragged(null);
                        }}
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={clsx(
                          'flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition',
                          activeLessonId === lesson.id
                            ? 'border-emerald-300 bg-emerald-500/10'
                            : dark
                              ? 'border-slate-700 bg-slate-900 hover:border-slate-500'
                              : 'border-slate-200 bg-white hover:border-slate-300',
                        )}
                      >
                        <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-slate-400" aria-hidden />
                        <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className={clsx('block truncate text-xs font-black', dark ? 'text-slate-100' : 'text-slate-800')}>{lesson.title}</span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {Meta.label} - {lesson.duration}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {lessonTypeChoices.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => addLesson(section.id, type.id)}
                      className={clsx('rounded-lg border px-2 py-1.5 text-[10px] font-black transition', dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-white')}
                    >
                      {type.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAllLessonTypes((value) => !value)}
                    className={clsx('rounded-lg border px-2 py-1.5 text-[10px] font-black transition', dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-white')}
                  >
                    {showAllLessonTypes ? 'Less' : `+${collapsedLessonTypes.length} more`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <Panel dark={dark} title={`${activeType.label} lesson editor`} eyebrow="Content editing" icon={ActiveIcon}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-3">
                <Field label="Lesson title">
                  <Input dark={dark} value={activeLesson?.title || ''} onChange={(e) => updateActiveLesson({ title: e.target.value })} />
                </Field>
                <Field label="Lesson type">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {lessonTypeChoices.map((type) => {
                      const Icon = type.icon;
                      const selected = activeLesson?.type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateActiveLesson({ type: type.id })}
                          className={clsx(
                            'flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center text-[11px] font-black transition',
                            selected
                              ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : dark
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                          {type.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setShowAllLessonTypes((value) => !value)}
                      className={clsx(
                        'flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center text-[11px] font-black transition',
                        dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      <ChevronDown className={clsx('h-4 w-4 transition', showAllLessonTypes && 'rotate-180')} aria-hidden />
                      {showAllLessonTypes ? 'Show less' : `${collapsedLessonTypes.length} more`}
                    </button>
                  </div>
                </Field>
              </div>
              <div className={clsx('rounded-xl border p-3', dark ? 'border-slate-700 bg-slate-950' : 'border-slate-100 bg-slate-50')}>
                <p className={clsx('text-xs font-black', dark ? 'text-white' : 'text-slate-900')}>Course health</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className={clsx('text-4xl font-black tabular-nums', dark ? 'text-white' : 'text-slate-900')}>{courseHealthScore}</span>
                  <span className="pb-1 text-xs font-black text-slate-500">/100</span>
                </div>
                <div className={clsx('mt-3 h-2 overflow-hidden rounded-full', dark ? 'bg-slate-800' : 'bg-slate-200')}>
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${courseHealthScore}%` }} />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">Combines content, assessment, access, and certificate readiness.</p>
              </div>
            </div>
          </Panel>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel dark={dark} title="Video upload pipeline" eyebrow="Media" icon={UploadCloud}>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setUploadProgress(100);
                }}
                className={clsx('rounded-xl border border-dashed p-5 text-center', dark ? 'border-slate-600 bg-slate-950' : 'border-slate-200 bg-slate-50')}
              >
                <UploadCloud className="mx-auto h-8 w-8 text-emerald-500" aria-hidden />
                <p className={clsx('mt-2 text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>Drop video file here</p>
                <p className="text-xs text-slate-500">Uploads with progress, then transcodes 720p, 1080p, and 4K variants.</p>
                <div className={clsx('mt-4 h-2 overflow-hidden rounded-full', dark ? 'bg-slate-800' : 'bg-slate-200')}>
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-1 text-[11px] font-bold text-slate-500">{uploadProgress}% uploaded - background transcoding queued</p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: Captions, text: 'Whisper subtitles: English draft ready' },
                  { icon: Timer, text: 'Chapter markers: 00:00 intro, 08:42 demo' },
                  { icon: ImageIcon, text: 'Thumbnail: auto frame or custom upload' },
                  { icon: ShieldCheck, text: `DRM protection: ${drm ? 'enabled' : 'disabled'}` },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className={clsx('flex items-center gap-2 rounded-xl border p-3 text-xs font-bold', dark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700')}>
                      <Icon className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                      {item.text}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setDrm((value) => !value)}
                className={clsx('mt-3 inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black', dark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700')}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Toggle paid-course DRM
              </button>
            </Panel>

            <Panel dark={dark} title="Article rich text" eyebrow="Text lessons" icon={FileText}>
              <div className="mb-3 flex flex-wrap gap-2">
                {[Heading, Code2, Sigma, Youtube, ImageIcon, MessageSquare].map((Icon, index) => (
                  <ToolbarButton
                    key={String(index)}
                    icon={Icon}
                    label={['Headings', 'Code block', 'LaTeX math', 'YouTube or Loom embed', 'Embedded image', 'Callout box'][index]}
                    dark={dark}
                  />
                ))}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                className={clsx('min-h-44 rounded-xl border p-4 text-sm leading-relaxed outline-none ring-emerald-500/25 focus:ring-2', dark ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800')}
              >
                <h4 className="mb-2 text-base font-black">Explain the concept</h4>
                <p>Use headings, syntax-highlighted code blocks, math notation, media embeds, and callout boxes for instructor-authored reading lessons.</p>
                <pre className="mt-3 rounded-lg bg-slate-950 p-3 text-xs text-emerald-200">const progress = completedLessons / totalLessons;</pre>
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel dark={dark} title="Quiz builder" eyebrow="Assessment" icon={FileQuestion}>
              <div className="grid gap-2 sm:grid-cols-2">
                {['MCQ', 'Multi-select', 'Fill-blank', 'Code question', 'Essay', 'Question bank'].map((item) => (
                  <button key={item} type="button" className={clsx('rounded-xl border px-3 py-2 text-left text-xs font-black transition', dark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50')}>
                    <Plus className="mr-1 inline h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Input dark={dark} defaultValue="10 pts" aria-label="Point weight" />
                <Input dark={dark} defaultValue="90 sec" aria-label="Question time limit" />
                <Input dark={dark} defaultValue="80%" aria-label="Passing score" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { icon: Sparkles, label: 'Generate 10 MCQs from transcript' },
                  { icon: Shuffle, label: 'Randomize questions' },
                  { icon: Repeat, label: 'Max attempts: 3' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/15 px-3 py-2 text-xs font-black text-violet-700 dark:text-violet-300">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel dark={dark} title="Assignment builder" eyebrow="Projects" icon={ClipboardCheck}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={clsx('rounded-xl border p-3 text-sm font-bold', dark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700')}>
                  <input type="checkbox" defaultChecked className="mr-2 rounded text-emerald-600" />
                  File submission
                </label>
                <label className={clsx('rounded-xl border p-3 text-sm font-bold', dark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700')}>
                  <input type="checkbox" defaultChecked className="mr-2 rounded text-emerald-600" />
                  Text submission
                </label>
              </div>
              <div className="mt-3 space-y-2">
                {['Correctness: 0-40 pts', 'Code quality: 0-30 pts', 'Reflection: 0-20 pts', 'Polish: 0-10 pts'].map((item) => (
                  <div key={item} className={clsx('flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold', dark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700')}>
                    {item}
                    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPeerReview((value) => !value)} className="rounded-xl bg-cyan-500/15 px-3 py-2 text-xs font-black text-cyan-700 dark:text-cyan-300">
                  Peer review {peerReview ? 'on' : 'off'}
                </button>
                <button type="button" className="rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-black text-amber-700 dark:text-amber-300">Plagiarism check ready</button>
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Panel dark={dark} title="Course settings" eyebrow="Commerce and access" icon={Tag}>
              <div className="space-y-3">
                <Select dark={dark} defaultValue="one-time" aria-label="Pricing">
                  <option value="free">Free</option>
                  <option value="one-time">One-time</option>
                  <option value="subscription">Subscription</option>
                  <option value="cohort">Cohort fixed start date</option>
                </Select>
                <Input dark={dark} defaultValue="SAVE20 - 200 uses - expires May 31" aria-label="Coupon code" />
                <Input dark={dark} defaultValue="Certificate template: Modern emerald" aria-label="Certificate template" />
                <Input dark={dark} defaultValue="Prerequisite: JavaScript Foundations" aria-label="Prerequisite" />
                <Input dark={dark} defaultValue="Enrollment cap: 500" aria-label="Enrollment limit" />
                <Input dark={dark} defaultValue="Drip: lesson 2 unlocks after 3 days" aria-label="Drip schedule" />
                <Select dark={dark} defaultValue="draft" aria-label="Course visibility">
                  <option>Draft</option>
                  <option>Review</option>
                  <option>Published</option>
                  <option>Archived</option>
                </Select>
              </div>
            </Panel>

            <Panel dark={dark} title="Student management" eyebrow="Cohort operations" icon={UsersRound}>
              <div className="space-y-2">
                {STUDENTS.map((student) => (
                  <div key={student.name} className={clsx('rounded-xl border p-3', dark ? 'border-slate-700' : 'border-slate-200')}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={clsx('truncate text-xs font-black', dark ? 'text-white' : 'text-slate-900')}>{student.name}</p>
                      <span className="text-[10px] font-black text-slate-500">{student.score}% quiz</span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">{student.progress}% complete - last active {student.active}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[Megaphone, MessageSquare, Award, BadgeCheck].map((Icon, index) => (
                  <ToolbarButton key={String(index)} icon={Icon} label={['Bulk announcement', 'Individual message', 'Manual certificate', 'Mark complete'][index]} dark={dark} />
                ))}
              </div>
              <button type="button" className="mt-3 w-full rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-600 dark:border-red-900/50 dark:text-red-300">Refund queue: 2 pending</button>
            </Panel>

            <Panel dark={dark} title="Live session tool" eyebrow="Synchronous learning" icon={Radio}>
              <div className={clsx('rounded-xl border p-4', dark ? 'border-slate-700 bg-slate-950' : 'border-slate-100 bg-slate-50')}>
                <p className={clsx('text-sm font-black', dark ? 'text-white' : 'text-slate-900')}>React project clinic</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Thu, 6:00 PM - Zoom / Google Meet / WebRTC room</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {['02', '14', '36'].map((time, index) => (
                    <div key={time} className={clsx('rounded-xl border p-2', dark ? 'border-slate-700' : 'border-slate-200')}>
                      <p className={clsx('text-xl font-black tabular-nums', dark ? 'text-white' : 'text-slate-900')}>{time}</p>
                      <p className="text-[10px] font-black uppercase text-slate-500">{['days', 'hrs', 'min'][index]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { icon: DoorOpen, label: 'Waiting room countdown enabled' },
                  { icon: CheckCircle2, label: 'Attendance auto-recorded' },
                  { icon: PlaySquare, label: 'Recording saves to this lesson' },
                  { icon: CalendarClock, label: 'Calendar invites synced' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Icon className="h-4 w-4 text-emerald-500" aria-hidden />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

        </div>
      </div>
    </section>
  );
}
