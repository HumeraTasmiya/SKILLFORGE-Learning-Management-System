import clsx from 'clsx';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export function AdminAnalytics({ chartData, range, onRangeChange, dark }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Platform analytics</p>
        <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Analytics</h1>
        <p className={clsx('mt-2 text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
          View platform usage and engagement metrics.
        </p>
      </div>

      <div className={clsx('rounded-2xl border p-6', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" aria-hidden />
            <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Revenue over time</h2>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange?.(r)}
                className={clsx(
                  'px-3 py-1 text-xs font-bold rounded transition',
                  range === r
                    ? 'bg-indigo-600 text-white'
                    : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
              >
                {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  borderRadius: 12,
                  border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
                  background: dark ? '#0f172a' : '#fff',
                }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
