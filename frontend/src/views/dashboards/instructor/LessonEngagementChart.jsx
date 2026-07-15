import clsx from 'clsx';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function LessonEngagementChart({ data, dark }) {
  const chartData = (Array.isArray(data) ? data : []).map((d) => ({
    ...d,
    shortLabel: d.label?.length > 42 ? `${d.label.slice(0, 42)}…` : d.label,
  }));

  return (
    <section
      aria-label="Lesson engagement"
      className={clsx(
        'rounded-2xl border p-5 shadow-sm',
        dark ? 'border-white/10 bg-slate-900' : 'border-slate-100 bg-white',
      )}
    >
      <h2 className={clsx('text-base font-black', dark ? 'text-white' : 'text-slate-900')}>Engagement by lesson</h2>
      <p className="mt-0.5 text-xs text-slate-500">Completion rate — lower bars may need clearer content or a re-record</p>
      {chartData.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Not enough enrollments yet to chart per-lesson completion.</p>
      ) : (
        <div className="mt-4 h-[min(420px,52vh)] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="shortLabel"
                width={168}
                tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Completed']}
                labelFormatter={(_, p) => p?.[0]?.payload?.label || ''}
                contentStyle={{
                  borderRadius: 12,
                  border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
                  background: dark ? '#0f172a' : '#fff',
                }}
              />
              <Bar dataKey="completionPct" fill="#10b981" radius={[0, 8, 8, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
