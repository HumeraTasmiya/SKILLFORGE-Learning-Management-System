import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';

export function AdminCertificates({ certificates, onApproveCertificate, dark }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Certificate management</p>
        <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Certificates</h1>
        <p className={clsx('mt-2 text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
          Review and approve student certificates.
        </p>
      </div>

      <div className={clsx('rounded-2xl border p-6', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
        {certificates.length === 0 ? (
          <p className="text-center text-sm font-semibold text-slate-500 py-8">No certificates to review.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div key={cert._id} className={clsx('rounded-xl border p-4', dark ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-slate-50')}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className={clsx('font-bold truncate', dark ? 'text-white' : 'text-slate-900')}>{cert.course?.title || 'Course'}</p>
                    <p className={clsx('text-xs', dark ? 'text-slate-400' : 'text-slate-600')}>{cert.student?.name || 'Student'}</p>
                  </div>
                  <span className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold whitespace-nowrap',
                    cert.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                  )}>
                    {cert.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                    {cert.status}
                  </span>
                </div>
                {cert.status !== 'approved' && (
                  <button
                    onClick={() => onApproveCertificate?.(cert._id)}
                    className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    Approve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
