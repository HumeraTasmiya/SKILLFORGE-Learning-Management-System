import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bot,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserPlus,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { setChatbotOpen, toggleTheme } from '../store/store.js';
import { Chatbot } from './Chatbot.jsx';
import logoMark from '../assets/logo.svg';
import { brand } from '../data/platform.js';
import { dashboardPathForRole, useAuthUser } from '../lib/useAuthUser.js';
import { api } from '../lib/api.js';

const nav = [
  ['Courses', '/courses'],
  ['Playground', '/playground'],
  ['Features', '/#features'],
];

function userInitials(user) {
  if (!user) return '?';
  const name = user.name?.trim();
  if (name) {
    const p = name.split(/\s+/).filter(Boolean);
    if (p.length >= 2) return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  const e = user.email?.trim();
  return e ? e.slice(0, 2).toUpperCase() : '?';
}

export function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, chatbotOpen } = useSelector((state) => state.ui);
  const { user, ready, logout } = useAuthUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const accountRef = useRef(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onDoc = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [accountOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  const submitSearch = (e) => {
    e?.preventDefault();
    const q = searchQ.trim();
    if (q) navigate(`/courses?search=${encodeURIComponent(q)}`);
    else navigate('/courses');
    setSearchOpen(false);
    setSearchQ('');
    closeMobileMenu();
  };

  useEffect(() => {
    if (!searchOpen) return undefined;
    const q = searchQ.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get('/courses', {
          params: { search: q, limit: 5, page: 1 },
          signal: controller.signal,
        });
        setSearchResults(data.courses || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 320);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [searchQ, searchOpen]);

  const dashPath = user ? dashboardPathForRole(user.role) : '/dashboard/user';
  const hideFloatingBot = location.pathname.startsWith('/dashboard/instructor');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-500 dark:bg-brand-dark dark:text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur-2xl dark:bg-slate-950/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" onClick={closeMobileMenu} className="group flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 shadow-glow ring-1 ring-white/20"
            >
              <img src={logoMark} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
            </motion.span>
            <span className="text-lg font-black tracking-tight">{brand.name}</span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {nav.map(([label, href]) =>
              href.startsWith('/#') ? (
                <Link
                  key={href}
                  to={href}
                  className="group relative text-sm font-semibold text-slate-600 transition hover:text-indigo-500 dark:text-slate-300"
                >
                  {label}
                  <span className="absolute -bottom-2 left-0 h-0.5 w-0 rounded-full bg-cyan-400 transition-all group-hover:w-full" />
                </Link>
              ) : (
                <NavLink
                  key={href}
                  to={href}
                  className={({ isActive }) =>
                    `group relative text-sm font-semibold transition hover:text-indigo-500 ${isActive ? 'text-indigo-500' : 'text-slate-600 dark:text-slate-300'}`
                  }
                >
                  {label}
                  <span className="absolute -bottom-2 left-0 h-0.5 w-0 rounded-full bg-cyan-400 transition-all group-hover:w-full" />
                </NavLink>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm dark:border-slate-800"
              aria-label="Search courses"
            >
              <Search className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">Search</span>
            </button>
            <button aria-label="Toggle theme" onClick={() => dispatch(toggleTheme())} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 dark:border-slate-800">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {!ready ? (
              <span className="hidden h-10 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800 md:block" aria-hidden />
            ) : user ? (
              <div ref={accountRef} className="relative hidden items-center gap-2 md:flex">
                <Link
                  to={dashPath}
                  className="hidden h-10 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-bold dark:border-slate-800 lg:inline-flex"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex h-10 items-center gap-2 rounded-full border border-slate-200 px-2 pr-3 text-sm font-bold dark:border-slate-800"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 text-xs text-white">
                    {userInitials(user)}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="truncate px-4 pb-2 text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    <Link
                      role="menuitem"
                      to={dashPath}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link
                      role="menuitem"
                      to="/courses"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Courses
                    </Link>
                    <Link
                      role="menuitem"
                      to="/certificates"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Certificates
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-bold md:flex">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link to="/signup" className="hidden h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-slate-950 md:flex">
                  <UserPlus className="h-4 w-4" /> Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 dark:border-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <Search className="h-4 w-4" /> Search courses
              </button>
              {nav.map(([label, href]) =>
                href.startsWith('/#') ? (
                  <Link
                    key={href}
                    to={href}
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    {label}
                  </Link>
                ) : (
                  <NavLink
                    key={href}
                    to={href}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-3 text-sm font-bold transition ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'}`
                    }
                  >
                    {label}
                  </NavLink>
                ),
              )}
              {user && (
                <>
                  <Link
                    to={dashPath}
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/certificates"
                    onClick={closeMobileMenu}
                    className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    Certificates
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                      navigate('/');
                    }}
                    className="rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 dark:text-red-400"
                  >
                    Sign out
                  </button>
                </>
              )}
              {!user && (
                <div className="mt-2 grid gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:grid-cols-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black dark:border-slate-800"
                  >
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950"
                  >
                    <UserPlus className="h-4 w-4" /> Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <Outlet />

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[min(20vh,120px)]" role="dialog" aria-modal="true" aria-labelledby="search-heading">
          <button type="button" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" aria-label="Close search" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="search-heading" className="text-lg font-black">
                Find a course
              </h2>
              <button type="button" aria-label="Close" onClick={() => setSearchOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="flex gap-2">
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Try React, Python, DSA…"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <button type="submit" className="h-12 shrink-0 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white hover:bg-indigo-500">
                Go
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Search runs against live catalog titles and descriptions.</p>
            {(searchLoading || searchResults.length > 0) && (
              <div className="mt-3 space-y-1 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                {searchLoading && <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">Searching...</p>}
                {!searchLoading &&
                  searchResults.map((course) => (
                    <button
                      key={course._id}
                      type="button"
                      onClick={() => {
                        navigate(`/courses/${course._id}`);
                        setSearchOpen(false);
                        setSearchQ('');
                        closeMobileMenu();
                      }}
                      className="block w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {course.title}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!hideFloatingBot && (
        <>
          <button
            onClick={() => dispatch(setChatbotOpen(true))}
            className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-glow"
            aria-label="Open AI assistant"
          >
            <Bot className="h-6 w-6" />
          </button>
          {chatbotOpen && <Chatbot />}
        </>
      )}
    </div>
  );
}
