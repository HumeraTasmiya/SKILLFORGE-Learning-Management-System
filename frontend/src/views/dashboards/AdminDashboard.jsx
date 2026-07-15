import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  Award,
  Bell,
  BrainCircuit,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Menu,
  Megaphone,
  PanelLeftClose,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api.js';

const FILTER_DATA = {
  '7d': [
    { label: 'Mon', users: 120, sessions: 840, revenue: 2100 },
    { label: 'Tue', users: 132, sessions: 910, revenue: 2340 },
    { label: 'Wed', users: 118, sessions: 780, revenue: 1980 },
    { label: 'Thu', users: 156, sessions: 1020, revenue: 2680 },
    { label: 'Fri', users: 168, sessions: 1105, revenue: 2890 },
    { label: 'Sat', users: 142, sessions: 960, revenue: 2400 },
    { label: 'Sun', users: 130, sessions: 890, revenue: 2210 },
  ],
  '30d': [
    { label: 'W1', users: 820, sessions: 5400, revenue: 12400 },
    { label: 'W2', users: 910, sessions: 6020, revenue: 13800 },
    { label: 'W3', users: 780, sessions: 4980, revenue: 11200 },
    { label: 'W4', users: 960, sessions: 6400, revenue: 15200 },
  ],
  '90d': [
    { label: 'M1', users: 3200, sessions: 21000, revenue: 48000 },
    { label: 'M2', users: 3450, sessions: 22800, revenue: 52000 },
    { label: 'M3', users: 3680, sessions: 24100, revenue: 55100 },
  ],
};

const INITIAL_USERS = [
  { id: 'u1', name: 'Arjun Sharma', email: 'arjun@example.com', role: 'student', active: true },
  { id: 'u2', name: 'Dr. Mehta', email: 'mehta@example.com', role: 'instructor', active: true },
  { id: 'u3', name: 'Sara Ali', email: 'sara@example.com', role: 'admin', active: true },
  { id: 'u4', name: 'Leo Park', email: 'leo@example.com', role: 'student', active: false },
];

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

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'certificates', label: 'Certificates', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'broadcast', label: 'Announce', icon: Megaphone },
];

const formatNumber = (value) => Number(value || 0).toLocaleString();
const money = (value) => `$${Number(value || 0).toLocaleString()}`;
const percent = (value) => `${Number(value || 0).toLocaleString()}%`;
const shortDate = (value) => (value ? new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now');
const userId = (user) => user?._id || user?.id;
const normalizeUser = (user) => ({
  ...user,
  id: user._id || user.id,
  active: user.isActive ?? user.active ?? true,
});

const permissionsFromRoles = (roles) => {
  const next = {};
  ROLE_PERMS.forEach((block) => {
    const liveRole = roles.find((role) => role.name === block.role);
    const livePerms = new Set(liveRole?.permissions || []);
    block.items.forEach((item) => {
      next[`${block.role}:${item.key}`] = liveRole ? livePerms.has(item.key) : item.on;
    });
  });
  return next;
};

export function AdminDashboard() {
  const dark = useSelector((s) => s.ui.theme) === 'dark';
  const [section, setSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [range, setRange] = useState('7d');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [permissions, setPermissions] = useState(() => {
    const o = {};
    ROLE_PERMS.forEach((block) => {
      block.items.forEach((it) => {
        o[`${block.role}:${it.key}`] = it.on;
      });
    });
    return o;
  });
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [toast, setToast] = useState('');
  const [chartData, setChartData] = useState(FILTER_DATA[range]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3500);
  }, []);

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardRes, usersRes, rolesRes, certsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users', { params: { limit: 50 } }),
        api.get('/admin/roles'),
        api.get('/admin/certificates'),
        api.get('/admin/analytics', { params: { range } }),
      ]);

      setStats(dashboardRes.data?.stats || null);
      setRecentActivities(dashboardRes.data?.recentActivities || []);
      setTopCourses(dashboardRes.data?.topCourses || []);
      setUsers((usersRes.data?.users || []).map(normalizeUser));
      const liveRoles = rolesRes.data?.roles || [];
      setRoles(liveRoles);
      setPermissions(permissionsFromRoles(liveRoles));
      setCertificates(certsRes.data?.certificates || []);
      setChartData(analyticsRes.data?.series?.length ? analyticsRes.data.series : FILTER_DATA[range]);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not load admin data from the backend.');
      setChartData(FILTER_DATA[range]);
    } finally {
      setLoading(false);
    }
  }, [range, showToast]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const togglePerm = async (role, key) => {
    const id = `${role}:${key}`;
    const previous = permissions;
    const next = { ...permissions, [id]: !permissions[id] };
    setPermissions(next);
    try {
      const permissionsForRole = ROLE_PERMS.find((block) => block.role === role).items
        .filter((item) => next[`${role}:${item.key}`])
        .map((item) => item.key);
      const { data } = await api.put(`/admin/roles/${role}`, { permissions: permissionsForRole });
      setRoles((list) => list.map((item) => (item.name === role ? data.role : item)));
      showToast('Role permissions saved.');
    } catch (error) {
      setPermissions(previous);
      showToast(error.response?.data?.message || 'Could not save role permissions.');
    }
  };

  const addUser = async () => {
    const name = window.prompt('Name for the new user?');
    if (!name?.trim()) return;
    const email = window.prompt('Email address?');
    if (!email?.trim()) return;
    const password = window.prompt('Temporary password (6+ characters)?');
    if (!password || password.length < 6) {
      showToast('Temporary password must be at least 6 characters.');
      return;
    }
    const roleInput = window.prompt('Role: student, instructor, or admin?', 'student') || 'student';
    const role = ['student', 'instructor', 'admin'].includes(roleInput.trim().toLowerCase())
      ? roleInput.trim().toLowerCase()
      : 'student';
    try {
      const { data } = await api.post('/admin/users', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setUsers((list) => [normalizeUser(data.user), ...list]);
      showToast('User created.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not create user.');
    }
  };

  const startEditUser = (user) => {
    setEditingUser(userId(user));
    setDraftName(user.name);
    setDraftEmail(user.email);
  };

  const saveUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}`, {
        name: draftName.trim(),
        email: draftEmail.trim(),
      });
      setUsers((list) => list.map((u) => (userId(u) === id ? normalizeUser(data.user) : u)));
      setEditingUser(null);
      showToast('User profile updated.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not update user.');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Remove this user from the platform?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((list) => list.filter((u) => userId(u) !== id));
      showToast('User removed.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not remove user.');
    }
  };

  const cycleRole = async (id) => {
    const order = ['student', 'instructor', 'admin'];
    const current = users.find((u) => userId(u) === id);
    if (!current) return;
    const i = order.indexOf(current.role);
    const role = order[(i + 1) % order.length];
    try {
      const { data } = await api.put(`/admin/users/${id}`, { role, isActive: current.active });
      setUsers((list) => list.map((u) => (userId(u) === id ? normalizeUser(data.user) : u)));
      showToast(`Role updated to ${role}.`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not update role.');
    }
  };

  const approveInstructor = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}`, { isActive: true, isVerified: true });
      setUsers((list) => list.map((u) => (userId(u) === id ? normalizeUser(data.user) : u)));
      setStats((current) => ({
        ...(current || {}),
        pendingInstructorApprovals: Math.max(0, Number(current?.pendingInstructorApprovals || 0) - 1),
      }));
      showToast('Instructor approved.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not approve instructor.');
    }
  };

  const approveCertificate = async (id) => {
    try {
      const { data } = await api.put(`/admin/certificates/${id}/approve`);
      setCertificates((list) => list.map((cert) => (cert._id === id ? data.certificate : cert)));
      showToast('Certificate approved.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not approve certificate.');
    }
  };

  const publishAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceBody.trim()) {
      showToast('Add a title and message before publishing.');
      return;
    }
    try {
      const { data } = await api.post('/admin/announcements', {
        title: announceTitle.trim(),
        message: announceBody.trim(),
      });
      showToast(`Published to ${data.sent || 0} users.`);
      setAnnounceTitle('');
      setAnnounceBody('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not publish announcement.');
    }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const go = (id) => {
    setSection(id);
    setMobileNav(false);
    if (id === 'users') scrollTo('admin-users');
    if (id === 'certificates') scrollTo('admin-certificates');
    if (id === 'analytics') scrollTo('admin-analytics');
    if (id === 'roles') scrollTo('admin-roles');
    if (id === 'broadcast') scrollTo('admin-broadcast');
  };

  const statCards = useMemo(
    () => [
      { label: 'Total students', value: formatNumber(stats?.totalStudents), delta: `${formatNumber(stats?.activeStudents)} active accounts`, tone: 'indigo', icon: GraduationCap },
      { label: 'Active learners', value: formatNumber(stats?.activeLearners), delta: 'last 30 days', tone: 'emerald', icon: UserCheck },
      { label: 'Revenue', value: money(stats?.revenue ?? stats?.certificateRevenue), delta: 'paid payments', tone: 'amber', icon: CircleDollarSign },
      { label: 'Course completion rate', value: percent(stats?.courseCompletionRate), delta: `${percent(stats?.averageProgress)} avg progress`, tone: 'cyan', icon: LineChart },
      { label: 'New enrollments', value: formatNumber(stats?.newEnrollments), delta: 'last 7 days', tone: 'indigo', icon: UserPlus },
      { label: 'AI usage stats', value: formatNumber(stats?.aiUsageTotal), delta: `${formatNumber(stats?.aiUsageWeek)} this week`, tone: 'violet', icon: BrainCircuit },
      { label: 'Live classes today', value: formatNumber(stats?.liveClassesToday), delta: 'scheduled sessions', tone: 'cyan', icon: CalendarDays },
      { label: 'Pending instructor approvals', value: formatNumber(stats?.pendingInstructorApprovals), delta: 'needs review', tone: 'amber', icon: UserCog },
      { label: 'Certificate purchases', value: formatNumber(stats?.certificatePurchases), delta: `${formatNumber(stats?.totalCertificates)} approved`, tone: 'emerald', icon: ShoppingBag },
      { label: 'Total enrollments', value: formatNumber(stats?.totalEnrollments), delta: `${formatNumber(stats?.totalCourses)} courses`, tone: 'indigo', icon: Users },
      { label: 'Pending certificates', value: formatNumber(stats?.pendingCertificates), delta: 'approval queue', tone: 'violet', icon: Award },
    ],
    [stats],
  );

  const pendingInstructors = useMemo(
    () => users.filter((u) => u.role === 'instructor' && (u.isVerified === false || u.active === false)).slice(0, 6),
    [users],
  );

  const aside = clsx(
    'fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r transition-all duration-300 lg:sticky lg:top-[69px] lg:z-30 lg:h-[calc(100vh-69px)]',
    dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white',
    'max-lg:shadow-2xl',
    collapsed && 'lg:w-[72px]',
    !mobileNav && 'max-lg:-translate-x-full',
    mobileNav && 'max-lg:translate-x-0',
  );

  return (
    <div className={clsx('flex min-h-[calc(100vh-69px)]', dark ? 'bg-slate-950' : 'bg-slate-50')}>
      <AnimatePresence>
        {mobileNav && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}
      </AnimatePresence>

      <aside className={aside} aria-label="Admin navigation">
        <div className={clsx('flex items-center gap-2 border-b p-3', dark ? 'border-slate-800' : 'border-slate-100')}>
          <div className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md', collapsed && 'lg:mx-auto')}>
            <UserCog className="h-5 w-5" aria-hidden />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-indigo-600 dark:text-indigo-400">Admin</p>
              <p className={clsx('truncate text-xs font-semibold', dark ? 'text-slate-400' : 'text-slate-500')}>Platform control</p>
            </div>
          )}
          <button
            type="button"
            className="ml-auto hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 dark:border-slate-700 lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition',
                section === id
                  ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                  : dark
                    ? 'text-slate-400 hover:bg-slate-900'
                    : 'text-slate-600 hover:bg-slate-100',
                collapsed && 'lg:justify-center lg:px-2',
              )}
              aria-current={section === id ? 'page' : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        <div className={clsx('border-t p-3', dark ? 'border-slate-800' : 'border-slate-100')}>
          <div className={clsx('flex items-center gap-2 rounded-xl bg-indigo-500/10 p-3', collapsed && 'lg:justify-center')}>
            <Bell className="h-4 w-4 shrink-0 text-indigo-600" />
            {!collapsed && <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">W3Schools clarity · GFG depth · enterprise-grade controls</p>}
          </div>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Open admin menu"
        onClick={() => setMobileNav(true)}
        className={clsx(
          'fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition active:scale-95 lg:hidden',
          dark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white',
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:pb-12">
        {toast && (
          <div
            role="status"
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-900 shadow-lg dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-100 lg:bottom-8"
          >
            {toast}
          </div>
        )}

        <header className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Admin dashboard</p>
          <h1 className={clsx('mt-1 text-3xl font-black', dark ? 'text-white' : 'text-slate-900')}>Platform control center</h1>
          <p className={clsx('mt-2 max-w-3xl text-sm', dark ? 'text-slate-400' : 'text-slate-600')}>
            Operate your LMS like a blended Coursera catalog, Great Learning analytics suite, and GeeksforGeeks practice hub — with unified roles and governance.
          </p>
          <p className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {loading ? 'Syncing admin APIs...' : `Live backend sync · ${roles.length || ROLE_PERMS.length} roles loaded`}
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                'rounded-2xl border p-5 shadow-sm transition hover:shadow-md',
                dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase text-slate-500">{s.label}</p>
                <span className={clsx(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                  s.tone === 'amber'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                    : s.tone === 'violet'
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200'
                      : s.tone === 'cyan'
                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
                )}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <p className={clsx('text-2xl font-black', dark ? 'text-white' : 'text-slate-900')}>{s.value}</p>
                <span
                  className={clsx(
                    'max-w-[56%] rounded-full px-2 py-0.5 text-right text-[11px] font-bold',
                    s.tone === 'amber'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      : s.tone === 'violet'
                        ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                        : s.tone === 'cyan'
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
                  )}
                >
                  {s.delta}
                </span>
              </div>
            </motion.div>
            );
          })}
        </section>

        <section className="mb-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className={clsx('rounded-2xl border p-5 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Recent activities</h2>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-black text-indigo-700 dark:text-indigo-300">
                {formatNumber(recentActivities.length)} latest
              </span>
            </div>
            <div className="grid gap-3">
              {recentActivities.length === 0 && (
                <p className="text-sm font-semibold text-slate-500">No recent platform activity yet.</p>
              )}
              {recentActivities.map((item) => (
                <div key={item.id} className={clsx('flex items-start justify-between gap-4 rounded-xl border px-3 py-3', dark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50')}>
                  <div className="min-w-0">
                    <p className={clsx('truncate text-sm font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-500">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-right text-[11px] font-bold text-slate-400">{shortDate(item.at)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={clsx('rounded-2xl border p-5 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Pending instructor approvals</h2>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-300">
                {formatNumber(stats?.pendingInstructorApprovals)} pending
              </span>
            </div>
            <div className="grid gap-3">
              {pendingInstructors.length === 0 && (
                <p className="text-sm font-semibold text-slate-500">No instructors are waiting for approval.</p>
              )}
              {pendingInstructors.map((instructor) => (
                <div key={userId(instructor)} className={clsx('grid gap-3 rounded-xl border px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center', dark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50')}>
                  <div className="min-w-0">
                    <p className={clsx('truncate text-sm font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{instructor.name}</p>
                    <p className="truncate text-xs text-slate-500">{instructor.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => approveInstructor(userId(instructor))}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white transition hover:bg-amber-500"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Top performing courses</h2>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
              enrollment, rating, completion
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {topCourses.length === 0 && (
              <p className="text-sm font-semibold text-slate-500">No published course performance data yet.</p>
            )}
            {topCourses.map((course) => (
              <div key={course._id} className={clsx('rounded-2xl border p-4 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
                <p className={clsx('line-clamp-2 min-h-[40px] text-sm font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{course.title}</p>
                <p className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">{course.category || 'Course'}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>{formatNumber(course.enrollmentCount ?? course.enrolledStudents?.length)}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Enroll</p>
                  </div>
                  <div>
                    <p className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>{Number(course.rating || 0).toFixed(1)}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Rating</p>
                  </div>
                  <div>
                    <p className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>{percent(course.completionRate)}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Done</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-users" className="mb-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>User management</h2>
            <button
              type="button"
              onClick={addUser}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
              aria-label="Add user"
            >
              <Plus className="h-4 w-4" />
              Add user
            </button>
          </div>

          <div className="grid gap-3 lg:hidden">
            {users.map((u) => (
              <div key={userId(u)} className={clsx('rounded-2xl border p-4 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
                {editingUser === userId(u) ? (
                  <div className="flex flex-col gap-2">
                    <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className={clsx('rounded-xl border px-3 py-2 text-sm font-bold', dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200')} aria-label="Name" />
                    <input value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} className={clsx('rounded-xl border px-3 py-2 text-sm', dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200')} aria-label="Email" />
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-bold text-white" onClick={() => saveUser(userId(u))}>Save</button>
                      <button type="button" className={clsx('flex-1 rounded-xl border py-2 text-sm font-bold', dark ? 'border-slate-600' : 'border-slate-200')} onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={clsx('font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-black uppercase', u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600')}>
                        {u.active ? 'active' : 'paused'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">Role: {u.role}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={clsx('rounded-xl border px-3 py-2 text-xs font-bold', dark ? 'border-slate-600' : 'border-slate-200')} onClick={() => startEditUser(u)} aria-label={`Edit ${u.name}`}>
                        <Pencil className="mr-1 inline h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button type="button" className="rounded-xl border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:text-indigo-300" onClick={() => cycleRole(userId(u))} aria-label={`Cycle role for ${u.name}`}>
                        Role
                      </button>
                      <button type="button" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" onClick={() => removeUser(userId(u))} aria-label={`Remove ${u.name}`}>
                        <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className={clsx('hidden overflow-hidden rounded-2xl border shadow-sm lg:block', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
            <table className="w-full text-left text-sm">
              <thead className={clsx('border-b text-xs font-black uppercase text-slate-500', dark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50')}>
                <tr>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={userId(u)} className={clsx('border-b last:border-0', dark ? 'border-slate-800' : 'border-slate-100')}>
                    <td className="px-4 py-3 font-bold">
                      {editingUser === userId(u) ? (
                        <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className={clsx('w-full rounded-lg border px-2 py-1 text-sm', dark ? 'border-slate-700 bg-slate-950' : 'border-slate-200')} aria-label="Name" />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {editingUser === userId(u) ? (
                        <input value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} className={clsx('w-full rounded-lg border px-2 py-1 text-sm', dark ? 'border-slate-700 bg-slate-950' : 'border-slate-200')} aria-label="Email" />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => cycleRole(userId(u))} aria-label={`Cycle role, currently ${u.role}`}>
                        {u.role}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-bold', u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600')}>
                        {u.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {editingUser === userId(u) ? (
                          <button type="button" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white" onClick={() => saveUser(userId(u))}>Save</button>
                        ) : (
                          <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-slate-600" onClick={() => startEditUser(u)} aria-label={`Edit ${u.name}`}>Edit</button>
                        )}
                        <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" onClick={() => removeUser(userId(u))} aria-label={`Remove ${u.name}`}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="admin-certificates" className="mb-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Certificate approvals</h2>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-700 dark:text-violet-300">
              {formatNumber(certificates.length)} records
            </span>
          </div>
          <div className={clsx('overflow-hidden rounded-2xl border shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
            <div className="grid gap-0 divide-y divide-slate-100 dark:divide-slate-800">
              {certificates.length === 0 && (
                <p className="px-4 py-5 text-sm font-semibold text-slate-500">No certificate records yet.</p>
              )}
              {certificates.map((cert) => (
                <div key={cert._id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                  <div>
                    <p className={clsx('font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{cert.course?.title || 'Untitled course'}</p>
                    <p className="text-xs text-slate-500">{cert.user?.name || cert.user?.email || 'Unknown learner'} · {cert.certificateId}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className={clsx('rounded-full px-2 py-1', cert.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                      {cert.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Score {cert.score || 0}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => approveCertificate(cert._id)}
                    disabled={cert.status === 'approved'}
                    className={clsx(
                      'rounded-lg px-3 py-2 text-xs font-black transition',
                      cert.status === 'approved'
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800'
                        : 'bg-violet-600 text-white hover:bg-violet-500',
                    )}
                  >
                    {cert.status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="admin-analytics" className="mb-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className={clsx('text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>System analytics</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="range-filter" className="sr-only">Time range</label>
              <select
                id="range-filter"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className={clsx(
                  'rounded-xl border px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40',
                  dark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900',
                )}
                aria-label="Filter analytics by time range"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className={clsx('rounded-2xl border p-5 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
              <p className={clsx('font-extrabold', dark ? 'text-white' : 'text-slate-900')}>Active users & sessions</p>
              <p className="text-xs text-slate-500">Responsive to filter</p>
              <div className="mt-4 h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="admU" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="admS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
                        background: dark ? '#0f172a' : '#fff',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="users" stroke="#4f46e5" fill="url(#admU)" name="Users" />
                    <Area type="monotone" dataKey="sessions" stroke="#0891b2" fill="url(#admS)" name="Sessions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={clsx('rounded-2xl border p-5 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
              <p className={clsx('font-extrabold', dark ? 'text-white' : 'text-slate-900')}>Revenue (USD)</p>
              <p className="text-xs text-slate-500">Certificate & course sales</p>
              <div className="mt-4 h-64 w-full min-w-0">
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
        </section>

        <section id="admin-roles" className="mb-8 scroll-mt-24">
          <h2 className={clsx('mb-4 text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Roles & permissions</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ROLE_PERMS.map((block) => (
              <div key={block.role} className={clsx('rounded-2xl border p-5 shadow-sm', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white')}>
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-violet-500" aria-hidden />
                  <h3 className={clsx('font-extrabold', dark ? 'text-white' : 'text-slate-900')}>{block.label}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {block.items.map((it) => {
                    const id = `${block.role}:${it.key}`;
                    const on = permissions[id];
                    return (
                      <li key={it.key} className="flex items-center justify-between gap-3">
                        <span className={clsx('text-sm font-medium', dark ? 'text-slate-300' : 'text-slate-700')}>{it.label}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-label={`${it.label} for ${block.label}`}
                          onClick={() => togglePerm(block.role, it.key)}
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
        </section>

        <section id="admin-broadcast" className="scroll-mt-24 pb-4">
          <h2 className={clsx('mb-4 text-lg font-black', dark ? 'text-white' : 'text-slate-900')}>Announcements</h2>
          <form
            onSubmit={publishAnnouncement}
            className={clsx(
              'mx-auto grid max-w-3xl gap-4 rounded-2xl border p-6 shadow-sm',
              dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white',
            )}
            aria-labelledby="announce-heading"
          >
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-indigo-500" aria-hidden />
              <h3 id="announce-heading" className={clsx('text-lg font-extrabold', dark ? 'text-white' : 'text-slate-900')}>
                Broadcast to all users
              </h3>
            </div>
            <label className="text-xs font-bold uppercase text-slate-500">
              Title
              <input
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                className={clsx(
                  'mt-1 w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/40',
                  dark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900',
                )}
                placeholder="e.g. Scheduled maintenance · Sunday 2am UTC"
                aria-required
              />
            </label>
            <label className="text-xs font-bold uppercase text-slate-500">
              Message
              <textarea
                value={announceBody}
                onChange={(e) => setAnnounceBody(e.target.value)}
                rows={5}
                className={clsx(
                  'mt-1 w-full resize-y rounded-xl border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/40',
                  dark ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800',
                )}
                placeholder="Clear, concise copy — like W3Schools reference pages: short paragraphs, bold key times."
                aria-required
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:brightness-110 active:scale-[0.99]"
              aria-label="Publish announcement"
            >
              <Megaphone className="h-4 w-4" />
              Publish announcement
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
