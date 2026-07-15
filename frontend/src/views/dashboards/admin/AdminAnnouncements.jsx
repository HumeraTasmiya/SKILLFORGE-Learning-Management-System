import clsx from 'clsx';
import { Megaphone } from 'lucide-react';

export function AdminAnnouncements({ announceTitle, onAnnounceTitle, announceBody, onAnnounceBody, onPublish, dark }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Communication</p>
        <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Announcements</h1>
        <p className={clsx('mt-2 text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
          Broadcast announcements to all platform users.
        </p>
      </div>

      <form
        onSubmit={onPublish}
        className={clsx(
          'mx-auto grid max-w-3xl gap-4 rounded-2xl border p-6 shadow-sm',
          dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white',
        )}
      >
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-indigo-500" aria-hidden />
          <h3 className={clsx('text-lg font-extrabold', dark ? 'text-white' : 'text-slate-900')}>
            Broadcast to all users
          </h3>
        </div>
        <label className="text-xs font-bold uppercase text-slate-500">
          Title
          <input
            value={announceTitle}
            onChange={(e) => onAnnounceTitle?.(e.target.value)}
            className={clsx(
              'mt-1 w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40',
              dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900',
            )}
            placeholder="e.g. Scheduled maintenance · Sunday 2am UTC"
            required
          />
        </label>
        <label className="text-xs font-bold uppercase text-slate-500">
          Message
          <textarea
            value={announceBody}
            onChange={(e) => onAnnounceBody?.(e.target.value)}
            rows={5}
            className={clsx(
              'mt-1 w-full resize-y rounded-xl border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40',
              dark ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800',
            )}
            placeholder="Clear, concise copy — like W3Schools reference pages: short paragraphs, bold key times."
            required
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:brightness-110 active:scale-[0.99]"
        >
          <Megaphone className="h-4 w-4" />
          Publish announcement
        </button>
      </form>
    </div>
  );
}
