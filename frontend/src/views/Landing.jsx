import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Eye,
  Mail,
  Play,
  Rocket,
  Sparkles,
  Star,
  Target,
  X,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { brand, chartData, courses, features, landingFaqs, testimonials } from '../data/platform.js';
import logoMark from '../assets/logo.svg';
import { api } from '../lib/api.js';
import { useAuthUser } from '../lib/useAuthUser.js';

const DEMO_EMBED = 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&modestbranding=1';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Landing() {
  const { hash } = useLocation();
  const demoTitleId = useId();
  const legalTitleId = useId();
  const [demoOpen, setDemoOpen] = useState(false);
  const [legal, setLegal] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [trend, setTrend] = useState(chartData);
  const [landingStats, setLandingStats] = useState({
    activeLearners: '200K+',
    completionLift: '98%',
    aiMentor: '24/7',
  });
  const [liveTestimonials, setLiveTestimonials] = useState(testimonials);
  const [heroCourses, setHeroCourses] = useState(courses.slice(0, 4));
  const { user } = useAuthUser();

  useEffect(() => {
    if (hash === '#features') {
      requestAnimationFrame(() => scrollToId('features'));
    }
    if (hash === '#faq') {
      requestAnimationFrame(() => scrollToId('faq'));
    }
  }, [hash]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/analytics/progress-trend').catch(() => null),
      api.get('/analytics/landing').catch(() => null),
      api.get('/analytics/testimonials').catch(() => null),
      user ? api.get('/enrollments/my').catch(() => null) : Promise.resolve(null),
    ]).then(([trendRes, statsRes, testimonialRes, enrollmentRes]) => {
      if (!active) return;

      const trendRows = trendRes?.data?.trend;
      if (Array.isArray(trendRows) && trendRows.length > 0) setTrend(trendRows);

      const stats = statsRes?.data?.stats;
      if (stats) {
        const activeLabel = stats.activeLearners > 999 ? `${Math.round(stats.activeLearners / 1000)}K+` : String(stats.activeLearners);
        setLandingStats({
          activeLearners: activeLabel,
          completionLift: stats.completionLift || '98%',
          aiMentor: stats.aiMentor || '24/7',
        });
      }

      const reviews = testimonialRes?.data?.testimonials;
      if (Array.isArray(reviews) && reviews.length > 0) {
        setLiveTestimonials(reviews.map((item) => [item.quote, item.name, item.role]));
      }

      const enrollments = enrollmentRes?.data?.enrollments;
      if (Array.isArray(enrollments) && enrollments.length > 0) {
        setHeroCourses(
          enrollments.slice(0, 4).map((entry) => ({
            id: entry._id,
            _id: entry.course?._id,
            title: entry.course?.title || 'Untitled course',
            level: entry.course?.level || 'Beginner',
            enrolled: `${entry.course?.enrolledStudents?.length || 0}`,
            progress: entry.progress || 0,
          }))
        );
      }
    });

    return () => {
      active = false;
    };
  }, [user]);

  const closeDemo = useCallback(() => setDemoOpen(false), []);
  const closeLegal = useCallback(() => setLegal(null), []);

  useEffect(() => {
    if (!demoOpen && !legal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeDemo();
        closeLegal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [demoOpen, legal, closeDemo, closeLegal]);

  return (
    <main className="relative">
      {/* Hero */}
      <section className="hero-grid relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,.32),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,.25),transparent_30%),linear-gradient(135deg,rgba(79,70,229,.18),rgba(6,182,212,.12),rgba(168,85,247,.18))]" />
        <div className="relative mx-auto grid min-h-[min(100dvh,900px)] max-w-7xl items-center gap-10 px-4 py-12 sm:py-16 lg:min-h-[calc(100vh-69px)] lg:grid-cols-[1fr_.95fr] lg:py-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex rounded-full border border-indigo-400/30 bg-white/60 px-4 py-2 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-sm dark:bg-slate-950/50 dark:text-cyan-200 sm:text-sm"
            >
              AI-powered LMS for modern teams
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,.38),rgba(99,102,241,0)_72%)] blur-sm" />
              <img
                src={logoMark}
                alt=""
                width={80}
                height={80}
                className="h-14 w-14 shrink-0 rounded-2xl shadow-lg ring-1 ring-slate-200/80 dark:ring-white/10 sm:h-16 sm:w-16 md:h-20 md:w-20"
              />
              <h1 id="hero-heading" className="max-w-[min(100%,28rem)] text-4xl font-black leading-[1.16] tracking-tight text-slate-900 dark:text-white sm:max-w-none sm:text-5xl md:text-6xl lg:text-7xl">
                {brand.name}
              </h1>
            </motion.div>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-slate-700 dark:text-slate-200 sm:text-xl">{brand.tagline}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Structured programs, interactive labs, and dashboards for learners, instructors, and admins—without sacrificing clarity on mobile.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/signup"
                className="inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Rocket className="h-4 w-4 shrink-0" aria-hidden />
                Get started
              </Link>
              <Link
                to="/courses"
                className="inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 text-sm font-bold text-slate-900 backdrop-blur transition hover:border-indigo-400 hover:text-indigo-600 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/60 dark:text-white dark:hover:border-cyan-500/50"
              >
                Explore courses
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/60 px-6 text-sm font-bold text-slate-900 backdrop-blur transition hover:border-indigo-400 hover:text-indigo-600 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/40 dark:text-white"
                aria-haspopup="dialog"
                aria-expanded={demoOpen}
                aria-controls={demoTitleId}
              >
                <Play className="h-4 w-4 shrink-0" aria-hidden />
                Watch demo
              </button>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: landingStats.activeLearners, sub: 'Active learners' },
                { label: landingStats.completionLift, sub: 'Completion lift' },
                { label: landingStats.aiMentor, sub: 'AI mentor' },
              ].map((item) => (
                <div key={item.sub} className="glass rounded-2xl px-4 py-3 text-center sm:text-left">
                  <p className="text-lg font-black text-slate-900 dark:text-white sm:text-xl">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <button
                type="button"
                onClick={() => scrollToId('about')}
                className="text-indigo-600 underline-offset-4 transition hover:underline dark:text-cyan-300"
              >
                Vision &amp; mission
              </button>
              <span className="hidden text-slate-300 sm:inline" aria-hidden>
                ·
              </span>
              <button
                type="button"
                onClick={() => scrollToId('features')}
                className="text-indigo-600 underline-offset-4 transition hover:underline dark:text-cyan-300"
              >
                See features
              </button>
              <span className="hidden text-slate-300 sm:inline" aria-hidden>
                ·
              </span>
              <button
                type="button"
                onClick={() => scrollToId('faq')}
                className="text-indigo-600 underline-offset-4 transition hover:underline dark:text-cyan-300"
              >
                FAQ
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }} className="relative w-full min-w-0">
            <div className="glass rounded-[1.75rem] p-4 shadow-xl sm:rounded-[2rem] sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
                <div>
                  <p className="font-black text-slate-900 dark:text-white">Learning command center</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Live progress and AI insights</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
              <div className="h-44 w-full min-w-0 sm:h-52 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <Area type="monotone" dataKey="progress" stroke="#06b6d4" strokeWidth={2} fill="#4f46e5" fillOpacity={0.22} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {heroCourses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id || course._id}
                    to={course._id ? `/courses/${course._id}` : '/courses'}
                    className="block rounded-2xl bg-slate-100 p-3 text-left transition hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:ring-indigo-500/30"
                  >
                    <p className="line-clamp-2 font-bold text-slate-900 dark:text-white">{course.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {course.level} · {course.enrolled} enrolled
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                        style={{ width: `${Math.max(0, Math.min(100, course.progress || 0))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-cyan-300">{course.progress || 0}% complete</p>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/certificates"
              className="glass absolute -right-1 -top-4 hidden max-w-[11rem] rounded-2xl p-3 text-left shadow-lg transition hover:scale-[1.02] active:scale-[0.98] md:block lg:-right-4 lg:-top-6 lg:max-w-none lg:p-4"
            >
              <p className="text-xs font-black text-slate-900 dark:text-white sm:text-sm">Certificate unlocked</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Download credential</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-cyan-300">
                View flow <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="about" className="scroll-mt-28 border-y border-slate-200/80 bg-white py-14 dark:border-slate-800 dark:bg-slate-950 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Why we exist</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-center text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Vision &amp; mission</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50/90 to-white p-6 shadow-sm dark:border-slate-800 dark:from-indigo-950/40 dark:to-slate-900 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                <Eye className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">{brand.vision}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50/80 to-white p-6 shadow-sm dark:border-slate-800 dark:from-cyan-950/30 dark:to-slate-900 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md">
                <Target className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">{brand.mission}</p>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
          <div>
            <p className="font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">How it works</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">From first lesson to verified credential.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Pick a path, practice in the browser, get AI nudges when you stall, and prove mastery with quizzes and projects—then optionally add a certificate employers can trust.
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-indigo-600 transition hover:gap-3 dark:text-cyan-300"
            >
              Create free account <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: 'Discover',
                body: 'Browse programs, read outcomes, and preview lessons before you commit your time.',
              },
              {
                step: 'Practice',
                body: 'Sandboxes, autograded tasks, and hints that teach—not just tell—so concepts stick.',
              },
              {
                step: 'Certify',
                body: 'Optional paid PDFs with verification, plus dashboards for instructors and admins.',
              },
            ].map((item, index) => (
              <div key={item.step} className="glass rounded-2xl p-5 sm:p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-sm font-black text-white">{index + 1}</span>
                <p className="mt-4 font-black text-slate-900 dark:text-white">{item.step}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-28 bg-slate-100 py-14 dark:bg-slate-900/60 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">What SkillForge includes</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Capabilities available in this product today — authentic listing, with space to extend on your roadmap.
              </p>
            </div>
            <Link
              to="/playground"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-cyan-500/50 sm:self-auto"
            >
              <Sparkles className="h-4 w-4 text-cyan-500" aria-hidden />
              Try playground
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([label, Icon]) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={label}
                className="glass rounded-2xl p-5 transition-shadow hover:shadow-md sm:p-6"
              >
                <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" aria-hidden />
                <p className="mt-4 font-black text-slate-900 dark:text-white">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-950 py-14 text-white sm:py-20" aria-labelledby="social-proof-heading">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="social-proof-heading" className="text-center text-3xl font-black sm:text-4xl">
            Trusted by builders and learning teams
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {liveTestimonials.map(([quote, name, role]) => (
              <figure key={name} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=22d3ee&size=48`}
                    alt=""
                    className="h-9 w-9 rounded-full ring-1 ring-white/20"
                  />
                  <Star className="h-5 w-5 fill-cyan-400 text-cyan-400" aria-hidden />
                </div>
                <blockquote className="mt-5 text-base font-bold leading-snug text-white sm:text-lg">&ldquo;{quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-sm text-slate-400">
                  {name} · <span className="text-slate-500">{role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-28 border-t border-slate-200 bg-slate-50/80 py-14 dark:border-slate-800 dark:bg-slate-950/50 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Straight answers about pricing, certificates, and who SkillForge is for.</p>
          <ul className="mt-8 space-y-3">
            {landingFaqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <li key={item.q} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left text-sm font-black text-slate-900 transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 sm:px-5 sm:text-base"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-a-${i}`}
                        role="region"
                        aria-labelledby={`faq-q-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                      >
                        <p className="px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:px-5">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 py-14 text-white dark:border-slate-800 sm:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Ready to forge your next skill?</h2>
          <p className="max-w-xl text-sm text-indigo-100 sm:text-base">Join in minutes. No credit card required for the free tier.</p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-full bg-white px-8 text-sm font-black text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-[0.98]"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-full border-2 border-white/40 px-8 text-sm font-black text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-10 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-black text-slate-900 dark:text-white">{brand.name}</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">{brand.tagline}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-600 dark:text-slate-300" aria-label="Footer">
            <Link to="/courses" className="transition hover:text-indigo-600 dark:hover:text-cyan-300">
              Courses
            </Link>
            <Link to="/#features" className="transition hover:text-indigo-600 dark:hover:text-cyan-300">
              Features
            </Link>
            <Link to="/playground" className="transition hover:text-indigo-600 dark:hover:text-cyan-300">
              Playground
            </Link>
            <button type="button" onClick={() => setLegal('privacy')} className="text-left transition hover:text-indigo-600 dark:hover:text-cyan-300">
              Privacy
            </button>
            <button type="button" onClick={() => setLegal('terms')} className="text-left transition hover:text-indigo-600 dark:hover:text-cyan-300">
              Terms
            </button>
            <a href="mailto:hello@skillforge.ai" className="inline-flex items-center gap-1 transition hover:text-indigo-600 dark:hover:text-cyan-300">
              <Mail className="h-4 w-4" aria-hidden />
              Contact
            </a>
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-7xl border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
      </footer>

      {/* Scroll to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-24 right-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 sm:bottom-28 ${
          showScrollTop ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Back to top"
      >
        <ChevronDown className="h-5 w-5 rotate-180" aria-hidden />
      </button>

      {/* Demo modal */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-4 pb-8 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={closeDemo}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={demoTitleId}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
                <h2 id={demoTitleId} className="text-lg font-black text-slate-900 dark:text-white">
                  Product tour
                </h2>
                <button
                  type="button"
                  onClick={closeDemo}
                  className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close demo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="aspect-video w-full bg-black">
                <iframe
                  title="SkillForge product demo video"
                  src={DEMO_EMBED}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 sm:px-5">
                Replace this embed with your own walkthrough when your marketing clip is ready.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy / Terms */}
      <AnimatePresence>
        {legal && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={closeLegal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={legalTitleId}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 id={legalTitleId} className="text-xl font-black text-slate-900 dark:text-white">
                  {legal === 'privacy' ? 'Privacy policy' : 'Terms of service'}
                </h2>
                <button
                  type="button"
                  onClick={closeLegal}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {legal === 'privacy' ? (
                  <>
                    <p>
                      SkillForge collects account and usage data to run the service, improve recommendations, and meet legal obligations. You can export or delete
                      your account where applicable law requires.
                    </p>
                    <p>We do not sell personal data. Subprocessors and retention schedules are available to institutional customers under NDA.</p>
                  </>
                ) : (
                  <>
                    <p>
                      By using SkillForge you agree to follow community guidelines, respect intellectual property, and use AI features responsibly. Instructors and
                      organizations are responsible for content they publish within their workspace.
                    </p>
                    <p>Certificate purchases are subject to refund windows described at checkout. Institutional Access agreements may supersede these defaults.</p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={closeLegal}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-black text-white transition hover:bg-indigo-500"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
