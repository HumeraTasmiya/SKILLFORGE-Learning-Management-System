import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { chartData } from '../../data/platform.js';

const roleLinks = [
  ['Student', '/dashboard/student'],
  ['Instructor', '/dashboard/instructor'],
  ['Admin', '/dashboard/admin'],
];

const roleStyles = {
  student: {
    accent: 'text-cyan-500',
    button: 'bg-cyan-600 hover:bg-cyan-500',
    active: 'bg-cyan-600 text-white',
    chart: '#0891b2',
  },
  instructor: {
    accent: 'text-emerald-500',
    button: 'bg-emerald-600 hover:bg-emerald-500',
    active: 'bg-emerald-600 text-white',
    chart: '#059669',
  },
  admin: {
    accent: 'text-indigo-500',
    button: 'bg-indigo-600 hover:bg-indigo-500',
    active: 'bg-indigo-600 text-white',
    chart: '#4f46e5',
  },
};

export function DashboardFrame({
  role,
  eyebrow,
  title,
  action,
  cards,
  chartTitle,
  chartType = 'area',
  panelTitle,
  panels,
  activityTitle,
  activity,
}) {
  const styles = roleStyles[role];

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="self-start rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="px-3 text-sm font-black uppercase text-slate-500">Dashboards</p>
        {roleLinks.map(([label, href]) => {
          const active = href.endsWith(role);
          return (
            <Link
              key={href}
              to={href}
              className={`mt-2 block rounded-xl px-3 py-3 font-bold ${active ? styles.active : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              {label}
            </Link>
          );
        })}
      </aside>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={`font-black uppercase ${styles.accent}`}>{eyebrow}</p>
            <h1 className="mt-2 text-4xl font-black">{title}</h1>
          </div>
          <button className={`rounded-full px-5 py-3 font-bold text-white transition ${styles.button}`}>
            {action}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, delta, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-5">
              <Icon className={`h-6 w-6 ${styles.accent}`} />
              <p className="mt-5 text-sm text-slate-500">{label}</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-3xl font-black">{value}</p>
                <span className="text-sm font-bold text-emerald-500">{delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="font-black">{chartTitle}</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer>
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Bar dataKey="revenue" fill={styles.chart} radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Line type="monotone" dataKey="active" stroke={styles.chart} strokeWidth={3} dot={false} />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Area dataKey="progress" stroke={styles.chart} fill={styles.chart} fillOpacity={0.22} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="font-black">{activityTitle}</p>
            <div className="mt-4 grid gap-3">
              {activity.map((item) => (
                <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-900">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="font-black">{panelTitle}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {panels.map(({ title: panelTitleText, description, icon: Icon }) => (
              <div key={panelTitleText} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <Icon className={`h-5 w-5 ${styles.accent}`} />
                <p className="mt-4 font-black">{panelTitleText}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
