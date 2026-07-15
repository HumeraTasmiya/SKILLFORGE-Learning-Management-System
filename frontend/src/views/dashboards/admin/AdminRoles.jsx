import clsx from 'clsx';
import { Shield } from 'lucide-react';

const ROLE_PERMS = [
  { role: 'student', label: 'Students', items: [
    { key: 'enroll', label: 'Self-enroll in open courses', on: true },
    { key: 'cert', label: 'Purchase certificates', on: true },
    { key: 'forum', label: 'Post in course forums', on: true },
    { key: 'code', label: 'Access code playground', on: false },
  ] },
  { role: 'instructor', label: 'Instructors', items: [
    { key: 'publish', label: 'Publish without review', on: false },
    { key: 'grade', label: 'Override grades', on: true },
    { key: 'live', label: 'Host live sessions', on: true },
    { key: 'rev', label: 'View revenue dashboards', on: false },
  ] },
  { role: 'admin', label: 'Admins', items: [
    { key: 'users', label: 'Manage all users', on: true },
    { key: 'billing', label: 'Billing & payouts', on: true },
    { key: 'sec', label: 'Security logs', on: true },
    { key: 'api', label: 'API keys', on: false },
  ] },
];

export function AdminRoles({ permissions, onTogglePermission, dark }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Permissions</p>
        <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Roles & permissions</h1>
        <p className={clsx('mt-2 text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
          Manage role-based permissions and access controls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROLE_PERMS.map((block) => (
          <div key={block.role} className={clsx('rounded-2xl border p-5 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-500" aria-hidden />
              <h3 className={clsx('font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{block.label}</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {block.items.map((it) => {
                const id = `${block.role}:${it.key}`;
                const on = permissions?.[id] ?? it.on;
                return (
                  <li key={it.key} className="flex items-center justify-between gap-3">
                    <span className={clsx('text-sm font-medium', dark ? 'text-slate-300' : 'text-slate-700')}>{it.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`${it.label} for ${block.label}`}
                      onClick={() => onTogglePermission?.(block.role, it.key)}
                      className={clsx(
                        'relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                        on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600',
                      )}
                    >
                      <span
                        className={clsx(
                          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                          on ? 'left-6' : 'left-0.5',
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
