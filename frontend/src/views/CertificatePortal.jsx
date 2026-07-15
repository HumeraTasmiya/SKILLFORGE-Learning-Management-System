import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../lib/api.js';
import { useAuthUser } from '../lib/useAuthUser.js';
import { brand } from '../data/platform.js';

export function CertificatePortal() {
  const { user, ready } = useAuthUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const processedSession = useRef(null);

  const [config, setConfig] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutCourseId, setCheckoutCourseId] = useState(null);
  const [banner, setBanner] = useState(null);

  const refreshData = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      setCertificates([]);
      setPayments([]);
      return;
    }
    try {
      const [enrRes, certRes, payRes] = await Promise.all([
        api.get('/enrollments/my'),
        api.get('/certificates/my'),
        api.get('/payments/history'),
      ]);
      setEnrollments(enrRes.data.enrollments || []);
      setCertificates(certRes.data.certificates || []);
      setPayments(payRes.data.payments || []);
    } catch {
      setEnrollments([]);
      setCertificates([]);
      setPayments([]);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/payments/config');
        if (!cancelled) setConfig(data);
      } catch {
        if (!cancelled) setConfig({ certificatePrice: 2.49, currency: 'USD', stripeConfigured: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshData();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, refreshData]);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');
    if (!ready || !user || checkout !== 'success' || !sessionId) return;
    if (processedSession.current === sessionId) return;
    processedSession.current = sessionId;

    (async () => {
      try {
        const { data } = await api.post('/payments/stripe/complete', { sessionId });
        setBanner(
          data.alreadyCompleted
            ? 'Payment was already recorded. Your certificates are below.'
            : 'Payment confirmed — your certificate is ready.',
        );
        await refreshData();
      } catch (e) {
        setBanner(e.response?.data?.message || 'Could not confirm Stripe checkout.');
      } finally {
        setSearchParams({}, { replace: true });
      }
    })();
  }, [ready, user, searchParams, setSearchParams, refreshData]);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'cancel') {
      setBanner('Checkout canceled — you can try again when ready.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const paidCourseIds = useMemo(() => {
    const ids = new Set();
    for (const p of payments) {
      if (p.status !== 'paid') continue;
      const c = p.course;
      const id = typeof c === 'object' && c?._id ? c._id : c;
      if (id) ids.add(String(id));
    }
    return ids;
  }, [payments]);

  const eligible = useMemo(() => {
    const rows = [];
    for (const en of enrollments) {
      const c = en.course;
      if (!c || typeof c === 'string') continue;
      const cid = String(c._id);
      if (en.progress < 80) continue;
      if (paidCourseIds.has(cid)) continue;
      rows.push({ enrollment: en, course: c });
    }
    return rows;
  }, [enrollments, paidCourseIds]);

  const startCheckout = async (courseId) => {
    if (!user) return;
    setCheckoutCourseId(courseId);
    setBanner(null);
    try {
      const { data } = await api.post('/payments/certificate-checkout', {
        courseId,
        currency: 'usd',
      });
      const url = data.checkout?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      setBanner(
        data.checkout?.message ||
          'Stripe Checkout URL was not returned. Add STRIPE_SECRET_KEY on the server for live payments.',
      );
    } catch (e) {
      setBanner(e.response?.data?.message || 'Could not start checkout.');
    } finally {
      setCheckoutCourseId(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <p className="font-black uppercase tracking-wide text-indigo-500">Certificates</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Verified certificates
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
        Courses stay free to learn. After you reach <strong className="text-slate-800 dark:text-slate-200">80% progress</strong>, you can start verified certificate checkout (Stripe when configured). Certificates include a public verification ID.
      </p>

      {banner ? (
        <div
          className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-200"
          role="status"
        >
          {banner}
        </div>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {[
          ['Reach 80% progress', 'Mark lessons complete on each course page — progress syncs to your enrollment.', Award],
          [
            'Checkout with Stripe',
            config?.stripeConfigured
              ? 'Stripe Checkout (when configured)'
              : 'Stripe Checkout (enable STRIPE_SECRET_KEY on the server)',
            Receipt,
          ],
          ['Verify anytime', 'Share your certificate ID — others can validate against the verification endpoint.', QrCode],
        ].map(([title, text, Icon]) => (
          <div key={title} className="glass rounded-2xl p-6">
            <Icon className="h-8 w-8 text-cyan-500" aria-hidden />
            <p className="mt-5 text-lg font-black text-slate-900 dark:text-white">{title}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
          </div>
        ))}
      </div>

      {!ready || loading ? (
        <div className="mt-12 flex items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" aria-hidden />
          <span className="text-sm font-semibold">Loading…</span>
        </div>
      ) : !user ? (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
          <Lock className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <p className="mt-4 font-black text-slate-900 dark:text-white">Sign in to purchase or view certificates</p>
          <Link
            to="/login"
            state={{ from: '/certificates' }}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-black text-white hover:bg-indigo-500"
          >
            Sign in <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-12">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eligible for purchase</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Courses where you have at least 80% progress and no paid certificate checkout yet.
            </p>
            {eligible.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
                No courses qualify yet.{' '}
                <Link to="/courses" className="font-bold text-indigo-600 underline dark:text-indigo-400">
                  Continue learning
                </Link>
              </p>
            ) : (
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {eligible.map(({ course }) => (
                  <li
                    key={course._id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">{course.category}</p>
                      <p className="mt-1 font-black text-slate-900 dark:text-white">{course.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startCheckout(course._id)}
                      disabled={checkoutCourseId === course._id}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {checkoutCourseId === course._id ? (
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      ) : (
                        <Receipt className="h-5 w-5" aria-hidden />
                      )}
                      Download credential with Stripe
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Your certificates</h2>
            {certificates.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">None issued yet — complete a course and checkout above.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {certificates.map((cert) => (
                  <li
                    key={cert._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{cert.course?.title || 'Course'}</p>
                      <p className="text-xs text-slate-500">
                        ID · <span className="font-mono">{cert.certificateId}</span>
                      </p>
                    </div>
                    {cert.certificateUrl ? (
                      <a
                        href={cert.certificateUrl}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-black text-white hover:bg-indigo-500"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Open link
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <div className="mt-12 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 text-slate-950 shadow-inner dark:border-amber-900/40 dark:from-amber-950/40 dark:to-slate-950 dark:text-slate-100">
        <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400">
          Sample certificate preview
        </p>
        <h2 className="mt-6 text-center text-3xl font-black sm:text-4xl">{brand.name}</h2>
        <p className="mt-4 text-center text-sm text-slate-700 dark:text-slate-300">
          Live certificates use your course title, verification ID, and optional PDF delivery when wired to storage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-amber-200 pt-6 dark:border-amber-900/50">
          <span className="flex items-center gap-2 font-mono text-sm font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
            Verification-ready ID
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Not an official document until checkout completes</span>
        </div>
      </div>
    </main>
  );
}
