import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Award, ExternalLink, ShoppingBag } from 'lucide-react';

function statusTone(status) {
  if (status === 'approved') return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
  if (status === 'pending') return 'bg-amber-500/15 text-amber-800 dark:text-amber-200';
  return 'bg-slate-500/15 text-slate-700 dark:text-slate-300';
}

export function CertificateWallet({ certificates, readyCourses, dark }) {
  const certs = Array.isArray(certificates) ? certificates : [];
  const ready = Array.isArray(readyCourses) ? readyCourses : [];

  return (
    <section
      aria-label="Certificate wallet"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-800' : 'border-slate-100 bg-white',
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300">
            <Award className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Certificates</h2>
            <p className="text-xs text-slate-500">Approved credentials and completed courses ready for checkout</p>
          </div>
        </div>
        <Link to="/certificates" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
          Portal
        </Link>
      </div>

      {ready.length > 0 ? (
        <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/30">
          <p className="text-xs font-black uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Ready to certify</p>
          <div className="mt-2 flex flex-col gap-2">
            {ready.slice(0, 3).map((course) => (
              <Link
                key={String(course.courseId)}
                to="/certificates"
                className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-300"
              >
                <span className="truncate">{course.title}</span>
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300">
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                  {course.progress}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {certs.length === 0 ? (
        <p className="text-sm text-slate-500">No certificates yet. Complete 100% of a course to unlock checkout.</p>
      ) : (
        <ul className="flex max-h-[280px] flex-col gap-3 overflow-y-auto pr-1">
          {certs.map((cert) => (
            <li
              key={String(cert._id)}
              className={clsx(
                'rounded-xl border px-3 py-3',
                dark ? 'border-white/5 bg-slate-900/50' : 'border-slate-100 bg-slate-50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={clsx('truncate text-sm font-bold', dark ? 'text-slate-100' : 'text-slate-900')}>{cert.courseTitle}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">{cert.certificateId}</p>
                </div>
                <span className={clsx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase', statusTone(cert.status))}>
                  {cert.status || 'issued'}
                </span>
              </div>
              {cert.certificateUrl ? (
                <a
                  href={cert.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Verify <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
